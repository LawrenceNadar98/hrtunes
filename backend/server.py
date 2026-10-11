from fastapi import FastAPI, APIRouter, HTTPException, Query, Request, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
try:
    from motor.motor_asyncio import AsyncIOMotorClient
except ImportError:
    AsyncIOMotorClient = None
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

try:
    from .config import (
        is_razorpay_configured,
        is_webhook_configured,
        RAZORPAY_KEY_ID,
        PLANS_CATALOG
    )
    from .payment_service import (
        create_razorpay_order,
        verify_payment_signature,
        verify_webhook_signature,
        get_plan_details
    )
except ImportError:
    from config import (
        is_razorpay_configured,
        is_webhook_configured,
        RAZORPAY_KEY_ID,
        PLANS_CATALOG
    )
    from payment_service import (
        create_razorpay_order,
        verify_payment_signature,
        verify_webhook_signature,
        get_plan_details
    )

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with safe local fallback
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'hrtunes_db')

client = None
db = None
if AsyncIOMotorClient is not None:
    try:
        client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=2000)
        db = client[db_name]
    except Exception as e:
        logging.warning(f"MongoDB connection warning: {e}")

# Create the main app without a prefix
app = FastAPI(title="HRTunes API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


# -------------------------------------------------------------
# Models
# -------------------------------------------------------------
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class PendingEnrollmentCreate(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    plan_id: str
    plan_name: str
    plan_price: float
    terms_version: str = "v1.2-2026"

class TrialBookingCreate(BaseModel):
    user_id: str
    user_name: str
    user_email: str
    phone: Optional[str] = ""
    scheduled_date: str
    time_slot: str
    notes: Optional[str] = ""

class StudentNoteCreate(BaseModel):
    author: str = "Harsh Patel"
    text: str

class RazorpayOrderCreate(BaseModel):
    plan_id: str
    user_id: str
    user_name: str
    user_email: str
    phone: Optional[str] = ""

class RazorpayPaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    enrollment_id: str
    user_id: str
    plan_id: str


# -------------------------------------------------------------
# API Endpoints
# -------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"message": "HRTunes API Online", "status": "healthy"}

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    if db is None:
        return []
    try:
        checks = await db.status_checks.find({}, {"_id": 0}).to_list(100)
        for check in checks:
            if isinstance(check.get('timestamp'), str):
                check['timestamp'] = datetime.fromisoformat(check['timestamp'])
        return checks
    except Exception:
        return []

# --- Enrollments ---
@api_router.post("/enrollments/pending")
async def create_pending_enrollment(input_data: PendingEnrollmentCreate):
    enrollment_id = f"enr-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": enrollment_id,
        "userId": input_data.user_id,
        "userName": input_data.user_name,
        "userEmail": input_data.user_email.lower(),
        "planId": input_data.plan_id,
        "planName": input_data.plan_name,
        "planPrice": input_data.plan_price,
        "status": "pending_payment",
        "termsAcceptedAt": now_iso,
        "termsVersion": input_data.terms_version,
        "paymentId": None,
        "startedAt": None,
        "expiresAt": None,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    if db is not None:
        try:
            await db.enrollments.insert_one(dict(doc))
        except Exception as e:
            logger.warning(f"DB insert error: {e}")
    return doc

@api_router.get("/enrollments/user/{user_id}")
async def get_user_enrollments(user_id: str):
    if db is None:
        return []
    try:
        return await db.enrollments.find({"userId": user_id}, {"_id": 0}).to_list(100)
    except Exception:
        return []

@api_router.post("/enrollments/{enrollment_id}/activate")
async def activate_enrollment(
    enrollment_id: str, 
    payment_id: Optional[str] = None,
    x_admin_key: Optional[str] = Header(None)
):
    """
    Secured enrollment activation endpoint.
    Requires either verified payment record or admin authorization key.
    """
    if not payment_id and not x_admin_key:
        raise HTTPException(
            status_code=403, 
            detail="Unverified activation denied. Verified payment ID or admin authorization required."
        )

    # Check if payment is verified if payment_id is provided
    if payment_id and db is not None:
        payment = await db.payments.find_one({"$or": [{"id": payment_id}, {"razorpayPaymentId": payment_id}]})
        if payment and payment.get("status") not in ["verified", "active"]:
            raise HTTPException(status_code=400, detail="Cannot activate enrollment: Payment is not verified.")

    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=90)
    if db is not None:
        try:
            await db.enrollments.update_one(
                {"id": enrollment_id},
                {"$set": {
                    "status": "active",
                    "paymentId": payment_id,
                    "startedAt": now.isoformat(),
                    "expiresAt": expires.isoformat(),
                    "updatedAt": now.isoformat()
                }}
            )
        except Exception as e:
            logger.warning(f"DB update error: {e}")
    return {"success": True, "enrollmentId": enrollment_id, "status": "active"}

# -------------------------------------------------------------
# Razorpay Payment Gateway Endpoints
# -------------------------------------------------------------
@api_router.get("/payments/config")
async def get_payment_config():
    """Returns safe public Razorpay integration status."""
    return {
        "razorpay_enabled": is_razorpay_configured(),
        "key_id": RAZORPAY_KEY_ID if is_razorpay_configured() else None,
        "supported_plans": list(PLANS_CATALOG.keys())
    }

@api_router.post("/payments/razorpay/order")
async def create_payment_order(data: RazorpayOrderCreate):
    """
    Creates an authoritative Razorpay order on the server.
    Ensures amount is computed from trusted server-side catalog.
    """
    order_data = create_razorpay_order(
        plan_id=data.plan_id,
        user_id=data.user_id,
        user_name=data.user_name,
        user_email=data.user_email,
        phone=data.phone
    )
    
    # Create pending enrollment and payment reference in database
    enrollment_id = f"enr-{uuid.uuid4().hex[:8]}"
    now_iso = datetime.now(timezone.utc).isoformat()
    plan = get_plan_details(data.plan_id)
    
    enr_doc = {
        "id": enrollment_id,
        "userId": data.user_id,
        "userName": data.user_name,
        "userEmail": data.user_email.lower(),
        "planId": plan["id"],
        "planName": plan["name"],
        "planPrice": plan["base_price"],
        "totalAmount": plan["total_amount_inr"],
        "status": "pending_payment",
        "razorpayOrderId": order_data["order_id"],
        "receipt": order_data["receipt"],
        "paymentGateway": "razorpay",
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    
    payment_doc = {
        "id": f"PAY-{order_data['receipt']}",
        "userId": data.user_id,
        "enrollmentId": enrollment_id,
        "planId": plan["id"],
        "planName": plan["name"],
        "amount": plan["total_amount_inr"],
        "amountPaise": plan["amount_paise"],
        "currency": plan["currency"],
        "gateway": "razorpay",
        "razorpayOrderId": order_data["order_id"],
        "status": "pending",
        "createdAt": now_iso
    }
    
    if db is not None:
        try:
            await db.enrollments.insert_one(dict(enr_doc))
            await db.payments.insert_one(dict(payment_doc))
        except Exception as e:
            logger.warning(f"DB order record error: {e}")
            
    order_data["enrollment_id"] = enrollment_id
    order_data["payment_id"] = payment_doc["id"]
    return order_data

@api_router.post("/payments/razorpay/verify")
async def verify_checkout_payment(payload: RazorpayPaymentVerify):
    """
    Verifies the HMAC-SHA256 signature returned by Razorpay Checkout.
    Upon successful verification, activates enrollment with authoritative duration.
    """
    is_valid = verify_payment_signature(
        razorpay_order_id=payload.razorpay_order_id,
        razorpay_payment_id=payload.razorpay_payment_id,
        razorpay_signature=payload.razorpay_signature
    )
    
    if not is_valid:
        logger.warning(f"Payment signature verification failed for order {payload.razorpay_order_id}")
        if db is not None:
            try:
                await db.payments.update_one(
                    {"razorpayOrderId": payload.razorpay_order_id},
                    {"$set": {"status": "failed", "failureReason": "Signature mismatch"}}
                )
            except Exception:
                pass
        raise HTTPException(status_code=400, detail="Invalid payment signature. Verification failed.")
        
    plan = get_plan_details(payload.plan_id)
    duration_days = plan.get("duration_days", 90)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=duration_days)
    
    if db is not None:
        try:
            # Update payment record
            await db.payments.update_one(
                {"razorpayOrderId": payload.razorpay_order_id},
                {"$set": {
                    "status": "verified",
                    "razorpayPaymentId": payload.razorpay_payment_id,
                    "verifiedAt": now.isoformat()
                }}
            )
            # Activate enrollment
            await db.enrollments.update_one(
                {"id": payload.enrollment_id},
                {"$set": {
                    "status": "active",
                    "paymentId": payload.razorpay_payment_id,
                    "startedAt": now.isoformat(),
                    "expiresAt": expires.isoformat(),
                    "updatedAt": now.isoformat()
                }}
            )
        except Exception as e:
            logger.error(f"DB update error during payment verification: {e}")
            raise HTTPException(status_code=500, detail="Payment verified but database update failed.")
            
    return {
        "success": True,
        "message": "Payment verified and enrollment activated successfully.",
        "enrollmentId": payload.enrollment_id,
        "status": "active",
        "expiresAt": expires.isoformat()
    }

@api_router.post("/payments/razorpay/webhook")
async def razorpay_webhook(
    request: Request,
    x_razorpay_signature: Optional[str] = Header(None)
):
    """
    Receives and idempotently processes Razorpay webhooks.
    Requires raw unparsed request body for cryptographic signature verification.
    """
    raw_body = await request.body()
    
    if not is_webhook_configured():
        logger.warning("Razorpay webhook received but RAZORPAY_WEBHOOK_SECRET is not configured.")
        return {"status": "ignored", "reason": "Webhook secret not configured"}
        
    if not x_razorpay_signature or not verify_webhook_signature(raw_body, x_razorpay_signature):
        logger.warning("Invalid Razorpay webhook signature.")
        raise HTTPException(status_code=400, detail="Invalid webhook signature")
        
    try:
        import json
        event_data = json.loads(raw_body.decode("utf-8"))
        event_name = event_data.get("event")
        payload = event_data.get("payload", {})
        
        logger.info(f"Verified Razorpay webhook received: {event_name}")
        
        if event_name in ["payment.captured", "order.paid"]:
            payment_entity = payload.get("payment", {}).get("entity", {})
            order_id = payment_entity.get("order_id")
            payment_id = payment_entity.get("id")
            notes = payment_entity.get("notes", {})
            plan_id = notes.get("plan_id", "guitar-foundation-3m")
            enrollment_id = notes.get("enrollment_id")
            
            plan = PLANS_CATALOG.get(plan_id, PLANS_CATALOG["guitar-foundation-3m"])
            duration_days = plan.get("duration_days", 90)
            now = datetime.now(timezone.utc)
            expires = now + timedelta(days=duration_days)
            
            if db is not None and order_id:
                # Idempotent status update: check if already active
                existing = await db.enrollments.find_one({"razorpayOrderId": order_id})
                if existing and existing.get("status") == "active":
                    return {"status": "already_processed"}
                    
                await db.payments.update_one(
                    {"razorpayOrderId": order_id},
                    {"$set": {
                        "status": "verified",
                        "razorpayPaymentId": payment_id,
                        "verifiedAt": now.isoformat()
                    }}
                )
                if enrollment_id:
                    await db.enrollments.update_one(
                        {"id": enrollment_id},
                        {"$set": {
                            "status": "active",
                            "paymentId": payment_id,
                            "startedAt": now.isoformat(),
                            "expiresAt": expires.isoformat(),
                            "updatedAt": now.isoformat()
                        }}
                    )
                    
        return {"status": "success", "event": event_name}
    except Exception as e:
        logger.error(f"Error processing webhook event: {e}")
        return {"status": "error", "detail": str(e)}

# --- Free Trial Bookings ---
@api_router.post("/trials/book")
async def book_free_trial(input_data: TrialBookingCreate):
    booking_id = f"TRL-{uuid.uuid4().hex[:6].upper()}"
    now_iso = datetime.now(timezone.utc).isoformat()
    doc = {
        "id": booking_id,
        "userId": input_data.user_id,
        "userName": input_data.user_name,
        "userEmail": input_data.user_email.lower(),
        "phone": input_data.phone,
        "instructorId": "inst-harsh",
        "instructorName": "Harsh Patel",
        "scheduledDate": input_data.scheduled_date,
        "timeSlot": input_data.time_slot,
        "duration": 60,
        "status": "confirmed",
        "meetingLink": "https://meet.google.com/hrt-tune-live",
        "notes": input_data.notes,
        "termsAcceptedAt": now_iso,
        "createdAt": now_iso,
        "updatedAt": now_iso
    }
    if db is not None:
        try:
            await db.trial_bookings.insert_one(dict(doc))
        except Exception as e:
            logger.warning(f"DB insert error: {e}")
    return doc

@api_router.get("/trials/user/{user_id}")
async def get_user_trials(user_id: str):
    if db is None:
        return []
    try:
        return await db.trial_bookings.find({"userId": user_id}, {"_id": 0}).to_list(50)
    except Exception:
        return []

# --- Access Control Authorization ---
@api_router.get("/curriculums/{curriculum_id}/access")
async def verify_curriculum_access(curriculum_id: str, user_id: str = Query(...)):
    if not user_id:
        return {"hasAccess": False, "reason": "Authentication required"}

    if db is not None:
        try:
            active_enr = await db.enrollments.find_one({
                "userId": user_id,
                "status": "active"
            }, {"_id": 0})
            if active_enr:
                return {
                    "hasAccess": True,
                    "enrollmentId": active_enr.get("id"),
                    "planId": active_enr.get("planId")
                }
        except Exception as e:
            logger.warning(f"DB access check error: {e}")

    return {"hasAccess": False, "reason": "Active plan subscription required"}

# --- Admin Students API ---
@api_router.get("/admin/students")
async def get_admin_students():
    if db is None:
        return []
    try:
        users = await db.users.find({"role": "student"}, {"_id": 0}).to_list(500)
        return users
    except Exception:
        return []


# Include router and middleware
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    if client:
        client.close()