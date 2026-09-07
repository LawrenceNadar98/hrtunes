from fastapi import FastAPI, APIRouter, HTTPException, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection with safe local fallback
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'hrtunes_db')

client = None
db = None
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
async def activate_enrollment(enrollment_id: str, payment_id: Optional[str] = None):
    now = datetime.now(timezone.utc)
    expires = now + timedelta(days=30)
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