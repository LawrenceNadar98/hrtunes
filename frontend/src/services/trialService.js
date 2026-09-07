import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    serverTimestamp
} from "firebase/firestore";

const TRIALS_KEY = "hrtunes_trials_db";
const EVENT_TRIALS_CHANGED = "hrtunes_trials_updated";

function getLocalTrials() {
    try {
        const data = localStorage.getItem(TRIALS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const realOnly = parsed.filter(
                (t) => !t.id?.startsWith("TRL-FEB") && !t.userId?.startsWith("usr-aarav") && !t.userId?.startsWith("usr-karan")
            );
            if (realOnly.length !== parsed.length) {
                localStorage.setItem(TRIALS_KEY, JSON.stringify(realOnly));
            }
            return realOnly;
        }
    } catch {
        // ignore
    }
    return [];
}

function saveLocalTrials(trials) {
    try {
        localStorage.setItem(TRIALS_KEY, JSON.stringify(trials));
        window.dispatchEvent(new CustomEvent(EVENT_TRIALS_CHANGED, { detail: trials }));
    } catch (e) {
        console.error("Failed to save local trials", e);
    }
}

/**
 * Generates available dynamic trial dates (next 7 days) and slots
 */
export function getAvailableTrialSlots() {
    const slots = [];
    const today = new Date();

    const timeSlots = [
        "11:00 AM - 12:00 PM IST",
        "03:00 PM - 04:00 PM IST",
        "05:00 PM - 06:00 PM IST",
        "07:00 PM - 08:00 PM IST"
    ];

    for (let i = 1; i <= 7; i++) {
        const nextDay = new Date(today);
        nextDay.setDate(today.getDate() + i);

        const dateStr = nextDay.toISOString().split("T")[0];
        const dayName = nextDay.toLocaleDateString("en-IN", { weekday: "short" });
        const monthName = nextDay.toLocaleDateString("en-IN", { month: "short" });
        const dayNum = nextDay.getDate();

        slots.push({
            date: dateStr,
            displayDate: `${dayName}, ${monthName} ${dayNum}`,
            slots: timeSlots
        });
    }

    return slots;
}

/**
 * Books a free trial session
 */
export async function createTrialBooking({
    userId,
    userName,
    userEmail,
    phone,
    scheduledDate,
    timeSlot,
    notes = ""
}) {
    if (!userId || !scheduledDate || !timeSlot) {
        throw new Error("Missing required fields for trial booking.");
    }

    const bookingId = "TRL-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 5).toUpperCase();
    const now = new Date().toISOString();

    const trialDoc = {
        id: bookingId,
        userId: userId.toString().trim(),
        userName: userName.trim(),
        userEmail: userEmail.trim().toLowerCase(),
        phone: (phone || "").trim(),
        instructorId: "inst-harsh",
        instructorName: "Harsh Patel",
        scheduledDate,
        timeSlot,
        duration: 60,
        status: "confirmed", // 'confirmed' | 'pending' | 'completed' | 'cancelled' | 'no_show'
        meetingLink: "https://meet.google.com/hrt-tune-live",
        notes: notes.trim(),
        termsAcceptedAt: now,
        createdAt: now,
        updatedAt: now
    };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "trial_bookings", bookingId), {
                ...trialDoc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log("🎸 Free trial booked in Firestore:", bookingId);
        } catch (err) {
            console.warn("Firestore trial booking save error:", err);
        }
    }

    const localList = getLocalTrials();
    localList.unshift(trialDoc);
    saveLocalTrials(localList);

    return trialDoc;
}

/**
 * Gets all trial bookings for a user
 */
export async function getUserTrialBookings(userId) {
    if (!userId) return [];
    const cleanUserId = userId.toString().trim();

    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "trial_bookings"), where("userId", "==", cleanUserId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
        } catch (err) {
            console.warn("Firestore getUserTrialBookings failed:", err);
        }
    }

    const localList = getLocalTrials();
    return localList.filter((t) => t.userId === cleanUserId || (t.userEmail && t.userEmail.toLowerCase() === cleanUserId.toLowerCase()));
}

/**
 * Gets all trial bookings (Admin view)
 */
export async function getAllTrialBookings() {
    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "trial_bookings"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            if (!snap.empty) {
                return snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
                    };
                });
            }
        } catch (err) {
            console.warn("Firestore getAllTrialBookings failed:", err);
        }
    }

    return getLocalTrials();
}

/**
 * Updates status of a trial booking (e.g. completed, no_show, cancelled)
 */
export async function updateTrialBookingStatus(bookingId, status, instructorNotes = "") {
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "trial_bookings", bookingId);
            const updates = { status, updatedAt: serverTimestamp() };
            if (instructorNotes) updates.notes = instructorNotes;
            await updateDoc(docRef, updates);
        } catch (err) {
            console.warn("Firestore updateTrialBookingStatus failed:", err);
        }
    }

    const localList = getLocalTrials();
    const updated = localList.map((t) =>
        t.id === bookingId ? { ...t, status, notes: instructorNotes || t.notes, updatedAt: now } : t
    );
    saveLocalTrials(updated);
    return true;
}
