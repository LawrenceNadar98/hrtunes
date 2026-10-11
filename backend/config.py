import os
from pathlib import Path
from dotenv import load_dotenv
from typing import Dict, Any, Optional

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

# Razorpay Configuration
RAZORPAY_KEY_ID: str = os.environ.get("RAZORPAY_KEY_ID", "").strip()
RAZORPAY_KEY_SECRET: str = os.environ.get("RAZORPAY_KEY_SECRET", "").strip()
RAZORPAY_WEBHOOK_SECRET: str = os.environ.get("RAZORPAY_WEBHOOK_SECRET", "").strip()

# Database & CORS
MONGO_URL: str = os.environ.get("MONGO_URL", "mongodb://localhost:27017")
DB_NAME: str = os.environ.get("DB_NAME", "hrtunes_db")
CORS_ORIGINS: str = os.environ.get("CORS_ORIGINS", "*")

# Firebase Admin Configuration
FIREBASE_SERVICE_ACCOUNT_KEY_PATH: Optional[str] = os.environ.get("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
FIREBASE_PROJECT_ID: Optional[str] = os.environ.get("FIREBASE_PROJECT_ID")

def is_razorpay_configured() -> bool:
    """Returns True if valid Razorpay API keys are configured."""
    return bool(
        RAZORPAY_KEY_ID 
        and RAZORPAY_KEY_SECRET 
        and not RAZORPAY_KEY_ID.startswith("rzp_test_placeholder")
        and not RAZORPAY_KEY_ID.startswith("your_")
    )

def is_webhook_configured() -> bool:
    """Returns True if a Razorpay webhook secret is configured."""
    return bool(
        RAZORPAY_WEBHOOK_SECRET 
        and not RAZORPAY_WEBHOOK_SECRET.startswith("your_")
    )

# Authoritative Server-Side Plan Catalog
# Prices are defined in INR and converted to currency subunits (paise) per Razorpay requirements
PLANS_CATALOG: Dict[str, Dict[str, Any]] = {
    "guitar-foundation-3m": {
        "id": "guitar-foundation-3m",
        "name": "3-Month Guitar Foundation",
        "base_price": 7500,
        "gst_rate": 0.18,
        "total_amount_inr": 8850,       # Math.round(7500 * 1.18)
        "amount_paise": 885000,          # 8850 * 100 paise
        "duration_days": 90,
        "currency": "INR"
    },
    "guitar-complete-6m": {
        "id": "guitar-complete-6m",
        "name": "6-Month Guitar Complete",
        "base_price": 13500,
        "gst_rate": 0.18,
        "total_amount_inr": 15930,      # Math.round(13500 * 1.18)
        "amount_paise": 1593000,         # 15930 * 100 paise
        "duration_days": 180,
        "currency": "INR"
    }
}
