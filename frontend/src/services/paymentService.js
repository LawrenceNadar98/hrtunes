import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp
} from "firebase/firestore";
import { activateEnrollment, updateEnrollmentStatus } from "./enrollmentService";

const PAYMENTS_KEY = "hrtunes_upi_payments";
const EVENT_PAYMENTS_CHANGED = "hrtunes_payments_updated";

function getLocalPayments() {
    try {
        const data = localStorage.getItem(PAYMENTS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            const realOnly = parsed.filter(
                (p) => !p.id?.startsWith("PAY-DEMO") && !p.userId?.startsWith("usr-aarav") && !p.userId?.startsWith("usr-priya")
            );
            if (realOnly.length !== parsed.length) {
                localStorage.setItem(PAYMENTS_KEY, JSON.stringify(realOnly));
            }
            return realOnly;
        }
    } catch {
        // ignore
    }
    return [];
}

function saveLocalPayments(payments) {
    try {
        localStorage.setItem(PAYMENTS_KEY, JSON.stringify(payments));
        window.dispatchEvent(new CustomEvent(EVENT_PAYMENTS_CHANGED, { detail: payments }));
    } catch (e) {
        console.error("Failed to save local payments", e);
    }
}

/**
 * Creates a new UPI payment submission linked to an Enrollment
 */
export async function createUpiPaymentSubmission({
    userId,
    enrollmentId,
    planId,
    planName,
    amount,
    studentName,
    email,
    phone,
    utrNumber,
    notes = ""
}) {
    const paymentId = "PAY-" + Date.now().toString(36).toUpperCase() + "-" + Math.random().toString(36).substring(2, 6).toUpperCase();
    const paymentDoc = {
        id: paymentId,
        userId: userId || "",
        enrollmentId: enrollmentId || "",
        planId: planId || "guitar-foundation-3m",
        planName: planName || "3-Month Guitar Foundation",
        amount: Number(amount) || 7500,
        studentName: studentName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        utrNumber: utrNumber.trim(),
        gateway: "upi_manual",
        notes: notes.trim(),
        status: "pending", // 'pending' | 'verified' | 'rejected' | 'failed'
        createdAt: new Date().toISOString(),
        verifiedAt: null,
        rejectionReason: null
    };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "payments", paymentId), {
                ...paymentDoc,
                createdAt: serverTimestamp()
            });
            console.log("💳 Payment recorded in Firestore:", paymentId);
        } catch (err) {
            console.warn("Error saving payment to Firestore, falling back to local storage:", err);
        }
    }

    // Always mirror to local storage for instant reactivity across tabs
    const localList = getLocalPayments();
    localList.unshift(paymentDoc);
    saveLocalPayments(localList);

    return paymentDoc;
}

/**
 * Gets a payment record by ID
 */
export async function getPaymentById(paymentId) {
    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "payments", paymentId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                return {
                    id: docSnap.id,
                    ...data,
                    createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
                };
            }
        } catch (err) {
            console.warn("Firestore getDoc failed, trying local fallback:", err);
        }
    }

    const localList = getLocalPayments();
    return localList.find((p) => p.id === paymentId) || null;
}

/**
 * Real-time listener for payment status
 */
export function listenToPaymentStatus(paymentId, onUpdate) {
    let unsubscribeFirestore = null;

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "payments", paymentId);
            unsubscribeFirestore = onSnapshot(docRef, (docSnap) => {
                if (docSnap.exists()) {
                    const data = docSnap.data();
                    onUpdate({
                        id: docSnap.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
                    });
                }
            });
        } catch (err) {
            console.warn("Firestore subscription failed, using local event listener:", err);
        }
    }

    // Also listen to local events / storage changes across browser tabs
    const handleLocalUpdate = () => {
        const list = getLocalPayments();
        const found = list.find((p) => p.id === paymentId);
        if (found) {
            onUpdate(found);
        }
    };

    window.addEventListener(EVENT_PAYMENTS_CHANGED, handleLocalUpdate);
    window.addEventListener("storage", handleLocalUpdate);

    // Initial check
    getPaymentById(paymentId).then((res) => {
        if (res) onUpdate(res);
    });

    return () => {
        if (unsubscribeFirestore) unsubscribeFirestore();
        window.removeEventListener(EVENT_PAYMENTS_CHANGED, handleLocalUpdate);
        window.removeEventListener("storage", handleLocalUpdate);
    };
}

/**
 * Fetches payments for a specific user
 */
export async function getUserPayments(userId) {
    if (!userId) return [];
    const cleanUserId = userId.toString().trim();

    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "payments"), where("userId", "==", cleanUserId));
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
            console.warn("Firestore getUserPayments failed, loading local payments:", err);
        }
    }

    const localList = getLocalPayments();
    return localList.filter((p) => p.userId === cleanUserId || (p.email && p.email.toLowerCase() === cleanUserId.toLowerCase()));
}

/**
 * Fetches all payments for Admin/Instructor
 */
export async function getAllPayments() {
    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "payments"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            if (!snap.empty) {
                const firestorePayments = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
                    };
                });
                if (firestorePayments.length > 0) return firestorePayments;
            }
        } catch (err) {
            console.warn("Firestore getAllPayments failed, loading local payments:", err);
        }
    }

    return getLocalPayments();
}

/**
 * Approve / Verify a payment and automatically ACTIVATE the associated Enrollment
 */
export async function approvePayment(paymentId) {
    const verifiedAt = new Date().toISOString();
    const payment = await getPaymentById(paymentId);

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "payments", paymentId);
            await updateDoc(docRef, {
                status: "verified",
                verifiedAt: serverTimestamp(),
                rejectionReason: null
            });
        } catch (err) {
            console.warn("Firestore approvePayment error, updating local storage:", err);
        }
    }

    const localList = getLocalPayments();
    const updated = localList.map((p) =>
        p.id === paymentId ? { ...p, status: "verified", verifiedAt, rejectionReason: null } : p
    );
    saveLocalPayments(updated);

    // ACTIVATE ENROLLMENT
    if (payment && payment.enrollmentId) {
        await activateEnrollment(payment.enrollmentId, paymentId);
    }

    return true;
}

/**
 * Reject a payment (keeps enrollment in pending_payment status)
 */
export async function rejectPayment(paymentId, reason = "UTR verification failed or amount mismatch") {
    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "payments", paymentId);
            await updateDoc(docRef, {
                status: "rejected",
                rejectionReason: reason
            });
        } catch (err) {
            console.warn("Firestore rejectPayment error, updating local storage:", err);
        }
    }

    const localList = getLocalPayments();
    const updated = localList.map((p) =>
        p.id === paymentId ? { ...p, status: "rejected", rejectionReason: reason } : p
    );
    saveLocalPayments(updated);
    return true;
}
