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
import { getCurriculums } from "./curriculumService";
import { getPlans } from "./courseService";

const ENROLLMENTS_KEY = "hrtunes_enrollments_db";
const EVENT_ENROLLMENTS_CHANGED = "hrtunes_enrollments_updated";

function getLocalEnrollments() {
    try {
        const data = localStorage.getItem(ENROLLMENTS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Purge dummy demo records and instructor/admin test enrollments
            const realOnly = parsed.filter(
                (e) =>
                    !e.id?.startsWith("enr-aarav") &&
                    !e.id?.startsWith("enr-priya") &&
                    !e.id?.startsWith("enr-rohit") &&
                    e.userEmail !== "admin@hrtunes.in" &&
                    e.userId !== "inst-harsh" &&
                    !e.userEmail?.includes("instructor")
            );
            if (realOnly.length !== parsed.length) {
                localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(realOnly));
            }
            return realOnly;
        }
    } catch {
        // ignore
    }
    return [];
}

function saveLocalEnrollments(enrollments) {
    try {
        localStorage.setItem(ENROLLMENTS_KEY, JSON.stringify(enrollments));
        window.dispatchEvent(new CustomEvent(EVENT_ENROLLMENTS_CHANGED, { detail: enrollments }));
    } catch (e) {
        console.error("Failed to save local enrollments", e);
    }
}

/**
 * Delete an enrollment record
 */
export async function deleteEnrollment(enrollmentId) {
    if (isFirebaseConfigured && db) {
        try {
            const { deleteDoc, doc: fDoc } = await import("firebase/firestore");
            await deleteDoc(fDoc(db, "enrollments", enrollmentId));
        } catch (e) {
            console.warn("Firestore deleteEnrollment failed:", e);
        }
    }
    const local = getLocalEnrollments().filter((e) => e.id !== enrollmentId);
    saveLocalEnrollments(local);
    return true;
}

/**
 * Creates or retrieves an existing pending enrollment for a student.
 * Ensures no duplicate pending enrollments for the same user and plan.
 */
export async function createOrGetPendingEnrollment({
    userId,
    userName,
    userEmail,
    planId,
    planName,
    planPrice,
    termsVersion = "v1.2-2026"
}) {
    if (!userId || !planId) {
        throw new Error("userId and planId are required to create enrollment.");
    }

    const cleanEmail = userEmail ? userEmail.toLowerCase().trim() : "";
    const cleanUserId = userId.toString().trim();

    // Check if there is already an active or pending enrollment
    const existing = await getUserEnrollments(cleanUserId);
    const existingActive = existing.find((e) => e.planId === planId && e.status === "active");
    if (existingActive) {
        return existingActive;
    }

    const existingPending = existing.find((e) => e.planId === planId && e.status === "pending_payment");
    if (existingPending) {
        return existingPending;
    }

    const enrollmentId = "enr-" + Date.now().toString(36) + "-" + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const enrollmentDoc = {
        id: enrollmentId,
        userId: cleanUserId,
        userName: userName || "Student",
        userEmail: cleanEmail,
        planId,
        planName: planName || "Guitar Course Plan",
        planPrice: Number(planPrice) || 0,
        status: "pending_payment", // 'pending_payment' | 'active' | 'expired' | 'cancelled' | 'suspended'
        termsAcceptedAt: now,
        termsVersion,
        paymentId: null,
        startedAt: null,
        expiresAt: null,
        createdAt: now,
        updatedAt: now
    };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "enrollments", enrollmentId), {
                ...enrollmentDoc,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log("📝 Enrollment created in Firestore:", enrollmentId);
        } catch (err) {
            console.warn("Error saving enrollment to Firestore, using local store:", err);
        }
    }

    const localList = getLocalEnrollments();
    localList.unshift(enrollmentDoc);
    saveLocalEnrollments(localList);

    return enrollmentDoc;
}

/**
 * Activates an enrollment when payment is verified
 */
export async function activateEnrollment(enrollmentId, paymentId, durationDays = 30) {
    const now = new Date();
    const expires = new Date(now.getTime() + durationDays * 24 * 60 * 60 * 1000);

    const startedAt = now.toISOString();
    const expiresAt = expires.toISOString();

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "enrollments", enrollmentId);
            await updateDoc(docRef, {
                status: "active",
                paymentId: paymentId || null,
                startedAt: serverTimestamp(),
                expiresAt,
                updatedAt: serverTimestamp()
            });
            console.log("✅ Enrollment activated in Firestore:", enrollmentId);
        } catch (err) {
            console.warn("Firestore activateEnrollment failed:", err);
        }
    }

    const localList = getLocalEnrollments();
    const updated = localList.map((e) =>
        e.id === enrollmentId
            ? {
                  ...e,
                  status: "active",
                  paymentId: paymentId || e.paymentId,
                  startedAt,
                  expiresAt,
                  updatedAt: startedAt
              }
            : e
    );
    saveLocalEnrollments(updated);
    return true;
}

/**
 * Update enrollment status (e.g. suspend, cancel, expire)
 */
export async function updateEnrollmentStatus(enrollmentId, newStatus) {
    const now = new Date().toISOString();

    if (isFirebaseConfigured && db) {
        try {
            const docRef = doc(db, "enrollments", enrollmentId);
            await updateDoc(docRef, {
                status: newStatus,
                updatedAt: serverTimestamp()
            });
        } catch (err) {
            console.warn("Firestore updateEnrollmentStatus failed:", err);
        }
    }

    const localList = getLocalEnrollments();
    const updated = localList.map((e) =>
        e.id === enrollmentId ? { ...e, status: newStatus, updatedAt: now } : e
    );
    saveLocalEnrollments(updated);
    return true;
}

/**
 * Gets all enrollments for a specific user
 */
export async function getUserEnrollments(userId) {
    if (!userId) return [];
    const cleanUserId = userId.toString().trim();

    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "enrollments"), where("userId", "==", cleanUserId));
            const snap = await getDocs(q);
            if (!snap.empty) {
                return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
            }
        } catch (err) {
            console.warn("Firestore getUserEnrollments failed, using local store:", err);
        }
    }

    const localList = getLocalEnrollments();
    return localList.filter((e) => e.userId === cleanUserId || (e.userEmail && e.userEmail.toLowerCase() === cleanUserId.toLowerCase()));
}

/**
 * Gets the single active enrollment for a user (or most recent pending if none active)
 */
export async function getActiveEnrollment(userId) {
    const enrollments = await getUserEnrollments(userId);
    const active = enrollments.find((e) => e.status === "active");
    if (active) return active;
    const pending = enrollments.find((e) => e.status === "pending_payment");
    return pending || null;
}

/**
 * Gets all enrollments (Admin view)
 */
export async function getAllEnrollments() {
    let list = [];
    if (isFirebaseConfigured && db) {
        try {
            const q = query(collection(db, "enrollments"), orderBy("createdAt", "desc"));
            const snap = await getDocs(q);
            if (!snap.empty) {
                list = snap.docs.map((d) => {
                    const data = d.data();
                    return {
                        id: d.id,
                        ...data,
                        createdAt: data.createdAt?.toDate?.() ? data.createdAt.toDate().toISOString() : data.createdAt
                    };
                });
            }
        } catch (err) {
            console.warn("Firestore getAllEnrollments failed, loading local enrollments:", err);
        }
    }

    if (!list || list.length === 0) {
        list = getLocalEnrollments();
    }

    return list.filter(
        (e) =>
            e.userEmail !== "admin@hrtunes.in" &&
            e.userId !== "inst-harsh" &&
            !e.userEmail?.includes("instructor") &&
            !e.id?.startsWith("enr-aarav") &&
            !e.id?.startsWith("enr-priya") &&
            !e.id?.startsWith("enr-rohit")
    );
}

/**
 * ACCESS CONTROL: Backend / Service verification of curriculum access.
 * Checks whether user has an active enrollment that grants access to the specified curriculum.
 */
export async function checkUserCurriculumAccess(userId, curriculumId) {
    if (!userId) return { hasAccess: false, reason: "Authentication required" };

    // Get all curriculums to inspect assignedPlanIds
    const curriculums = await getCurriculums();
    const targetCurriculum = curriculums.find((c) => c.id === curriculumId);

    if (!targetCurriculum) {
        return { hasAccess: false, reason: "Curriculum not found" };
    }

    // Free tier curriculums or preview content
    if (!targetCurriculum.assignedPlanIds || targetCurriculum.assignedPlanIds.length === 0) {
        return { hasAccess: true, isFreePreview: true };
    }

    // Get user active enrollments
    const userEnrollments = await getUserEnrollments(userId);
    const activeEnrollments = userEnrollments.filter((e) => e.status === "active");

    const matchedEnrollment = activeEnrollments.find((e) =>
        targetCurriculum.assignedPlanIds.includes(e.planId)
    );

    if (matchedEnrollment) {
        return {
            hasAccess: true,
            enrollmentId: matchedEnrollment.id,
            planId: matchedEnrollment.planId,
            planName: matchedEnrollment.planName
        };
    }

    // Check if user has a pending enrollment
    const pendingEnrollment = userEnrollments.find((e) =>
        targetCurriculum.assignedPlanIds.includes(e.planId) && e.status === "pending_payment"
    );

    return {
        hasAccess: false,
        isPending: Boolean(pendingEnrollment),
        pendingEnrollment: pendingEnrollment || null,
        requiredPlans: targetCurriculum.assignedPlanIds,
        reason: pendingEnrollment
            ? "Payment verification pending for plan"
            : "Active plan subscription required"
    };
}
