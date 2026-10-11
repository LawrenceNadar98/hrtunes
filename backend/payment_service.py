import hmac
import hashlib
import uuid
import logging
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Dict, Any, Optional
from fastapi import HTTPException

try:
    import razorpay
except ImportError:
    razorpay = None

try:
    from .config import (
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET,
        RAZORPAY_WEBHOOK_SECRET,
        PLANS_CATALOG,
        is_razorpay_configured,
        is_webhook_configured,
        FIREBASE_SERVICE_ACCOUNT_KEY_PATH
    )
except ImportError:
    from config import (
        RAZORPAY_KEY_ID,
        RAZORPAY_KEY_SECRET,
        RAZORPAY_WEBHOOK_SECRET,
        PLANS_CATALOG,
        is_razorpay_configured,
        is_webhook_configured,
        FIREBASE_SERVICE_ACCOUNT_KEY_PATH
    )

logger = logging.getLogger(__name__)

# Initialize Razorpay Client if credentials exist
razorpay_client = None
if is_razorpay_configured() and razorpay is not None:
    try:
        razorpay_client = razorpay.Client(auth=(RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET))
        logger.info("Razorpay client successfully initialized.")
    except Exception as e:
        logger.warning(f"Failed to initialize Razorpay client: {e}")

# Optional Firebase Admin SDK initialization for trusted server operations
firestore_db = None
try:
    import firebase_admin
    from firebase_admin import credentials, firestore, auth as fb_auth

    if not firebase_admin._apps:
        if FIREBASE_SERVICE_ACCOUNT_KEY_PATH and Path(FIREBASE_SERVICE_ACCOUNT_KEY_PATH).exists():
            cred = credentials.Certificate(FIREBASE_SERVICE_ACCOUNT_KEY_PATH)
            firebase_admin.initialize_app(cred)
            firestore_db = firestore.client()
            logger.info("Firebase Admin SDK initialized with service account.")
        else:
            logger.info("Firebase Admin service account not configured. Local fallback mode active.")
except Exception as fb_err:
    logger.info(f"Firebase Admin SDK not loaded (will rely on application data bridge): {fb_err}")


def get_plan_details(plan_id: str) -> Dict[str, Any]:
    """Retrieves authoritative plan details from server catalog."""
    if plan_id not in PLANS_CATALOG:
        raise HTTPException(
            status_code=400, 
            detail=f"Invalid plan ID '{plan_id}'. Allowed plans: {list(PLANS_CATALOG.keys())}"
        )
    return PLANS_CATALOG[plan_id]


def verify_payment_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str, secret: Optional[str] = None) -> bool:
    """
    Verifies the payment signature returned by the Razorpay Checkout modal.
    Uses official SDK utility if available, with mathematical HMAC-SHA256 fallback.
    Algorithm: hmac_sha256(order_id + "|" + payment_id, secret) == signature
    """
    key_secret = secret or RAZORPAY_KEY_SECRET
    if not key_secret:
        raise HTTPException(status_code=503, detail="RAZORPAY_KEY_SECRET is not configured on server.")

    # 1. Primary verification via official Razorpay SDK if client is initialized
    if razorpay_client is not None and not secret:
        try:
            razorpay_client.utility.verify_payment_signature({
                "razorpay_order_id": razorpay_order_id,
                "razorpay_payment_id": razorpay_payment_id,
                "razorpay_signature": razorpay_signature
            })
            return True
        except Exception:
            # Continue to constant-time direct verification
            pass

    # 2. Direct HMAC-SHA256 verification (constant-time comparison)
    msg = f"{razorpay_order_id}|{razorpay_payment_id}".encode("utf-8")
    generated = hmac.new(key_secret.encode("utf-8"), msg, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated, razorpay_signature)


def verify_webhook_signature(raw_body: bytes, signature: str, secret: Optional[str] = None) -> bool:
    """
    Verifies Razorpay Webhook signature using the raw unparsed request body.
    Header: X-Razorpay-Signature
    """
    webhook_secret = secret or RAZORPAY_WEBHOOK_SECRET
    if not webhook_secret:
        raise HTTPException(status_code=503, detail="RAZORPAY_WEBHOOK_SECRET is not configured on server.")

    if not signature:
        return False

    # 1. Official SDK verification
    if razorpay_client is not None and not secret:
        try:
            razorpay_client.utility.verify_webhook_signature(
                raw_body.decode("utf-8"), 
                signature, 
                webhook_secret
            )
            return True
        except Exception:
            pass

    # 2. Direct HMAC-SHA256 comparison with raw byte stream
    generated = hmac.new(webhook_secret.encode("utf-8"), raw_body, hashlib.sha256).hexdigest()
    return hmac.compare_digest(generated, signature)


def create_razorpay_order(
    plan_id: str, 
    user_id: str, 
    user_name: str, 
    user_email: str, 
    phone: Optional[str] = None
) -> Dict[str, Any]:
    """
    Creates an authoritative Razorpay order on the server.
    Ensures amount and currency are determined exclusively from trusted data.
    """
    if not is_razorpay_configured():
        raise HTTPException(
            status_code=503,
            detail="Razorpay credentials (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET) are not configured in backend/.env. Please configure test API keys to create orders."
        )

    plan = get_plan_details(plan_id)
    receipt_id = f"rcpt_{uuid.uuid4().hex[:10]}"

    order_payload = {
        "amount": plan["amount_paise"],
        "currency": plan["currency"],
        "receipt": receipt_id,
        "notes": {
            "plan_id": plan["id"],
            "plan_name": plan["name"],
            "user_id": user_id,
            "user_email": user_email.lower().strip(),
            "user_name": user_name.strip()
        }
    }

    try:
        rzp_order = razorpay_client.order.create(data=order_payload)
        return {
            "order_id": rzp_order["id"],
            "amount": rzp_order["amount"],
            "currency": rzp_order["currency"],
            "key_id": RAZORPAY_KEY_ID,
            "plan_id": plan["id"],
            "plan_name": plan["name"],
            "receipt": receipt_id
        }
    except Exception as e:
        logger.error(f"Razorpay API order creation failed: {e}")
        raise HTTPException(status_code=502, detail=f"Failed to communicate with Razorpay API: {str(e)}")
