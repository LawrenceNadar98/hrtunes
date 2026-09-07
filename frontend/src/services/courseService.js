import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    query,
    orderBy
} from "firebase/firestore";
import { COURSES as defaultCourses, PRICING as defaultPlans, INSTRUMENTS as defaultInstruments } from "@/lib/mock";
import { seedInitialGuitarCurriculum } from "./curriculumService";

const PLANS_KEY = "hrtunes_plans";
const COURSES_KEY = "hrtunes_courses";
const INSTRUMENTS_KEY = "hrtunes_instruments";

// Initialize local store with production plans, courses, and instruments
function initLocalStore() {
    try {
        const storedPlans = localStorage.getItem(PLANS_KEY);
        if (!storedPlans) {
            localStorage.setItem(PLANS_KEY, JSON.stringify(defaultPlans));
        }

        const storedCourses = localStorage.getItem(COURSES_KEY);
        if (!storedCourses) {
            localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
        }

        const storedInstruments = localStorage.getItem(INSTRUMENTS_KEY);
        if (!storedInstruments) {
            localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(defaultInstruments || []));
        }
    } catch {
        localStorage.setItem(PLANS_KEY, JSON.stringify(defaultPlans));
        localStorage.setItem(COURSES_KEY, JSON.stringify(defaultCourses));
        localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(defaultInstruments || []));
    }
}
initLocalStore();

/**
 * Seeds default production plans, courses, and curriculum into Firebase Firestore idempotently
 */
export async function seedDatabaseToFirebase(force = false) {
    if (!isFirebaseConfigured || !db) {
        console.info("Firebase not configured. Production plans and curriculum active in local storage.");
        await seedInitialGuitarCurriculum(force);
        return { success: true, mode: "local", message: "Data active in local storage." };
    }

    try {
        console.log("💳 Seeding production Plans into Firestore...");
        for (const plan of defaultPlans) {
            await setDoc(doc(db, "plans", plan.id), plan, { merge: true });
        }

        console.log("📚 Seeding Courses into Firestore...");
        for (const course of defaultCourses) {
            await setDoc(doc(db, "courses", course.id), course, { merge: true });
        }

        console.log("🎸 Seeding Instruments into Firestore...");
        for (const inst of defaultInstruments) {
            await setDoc(doc(db, "instruments", inst.id), inst, { merge: true });
        }

        await seedInitialGuitarCurriculum(force);

        return { success: true, mode: "firestore", message: "Cloud database seeded successfully with production plans & curriculum!" };
    } catch (err) {
        console.error("Failed to seed database to Firestore:", err);
        return { success: false, error: err.message };
    }
}

// Auto seed in background if connected
if (isFirebaseConfigured) {
    seedDatabaseToFirebase(false).catch((e) => console.warn("Auto-seed background note:", e));
}

/* ==================== PLANS ==================== */
export async function getPlans() {
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDocs(collection(db, "plans"));
            if (!snap.empty) {
                const plans = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
                return plans;
            }
        } catch (err) {
            console.warn("Firestore getPlans failed, using local fallback:", err);
        }
    }
    try {
        const stored = localStorage.getItem(PLANS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return defaultPlans;
}

export async function savePlan(plan) {
    const planId = plan.id || "plan-" + Date.now();
    const updatedPlan = { ...plan, id: planId };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "plans", planId), updatedPlan, { merge: true });
        } catch (err) {
            console.warn("Firestore savePlan failed, saving to local store:", err);
        }
    }

    const plans = await getPlans();
    const idx = plans.findIndex((p) => p.id === planId);
    if (idx >= 0) {
        plans[idx] = updatedPlan;
    } else {
        plans.push(updatedPlan);
    }
    localStorage.setItem(PLANS_KEY, JSON.stringify(plans));
    return updatedPlan;
}

export async function deletePlan(planId) {
    if (isFirebaseConfigured && db) {
        try {
            await deleteDoc(doc(db, "plans", planId));
        } catch (err) {
            console.warn("Firestore deletePlan failed:", err);
        }
    }

    const plans = await getPlans();
    const filtered = plans.filter((p) => p.id !== planId);
    localStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
    return true;
}

/* ==================== INSTRUMENTS ==================== */
export async function getInstruments() {
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDocs(collection(db, "instruments"));
            if (!snap.empty) {
                const insts = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(insts));
                return insts;
            }
        } catch (err) {
            console.warn("Firestore getInstruments failed, using local fallback:", err);
        }
    }
    try {
        const stored = localStorage.getItem(INSTRUMENTS_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    return defaultInstruments || [];
}

export async function saveInstrument(instrument) {
    const instId = instrument.id || (instrument.name ? instrument.name.toLowerCase().replace(/\s+/g, "-") : "inst-" + Date.now());
    const updated = { ...instrument, id: instId };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "instruments", instId), updated, { merge: true });
        } catch (err) {
            console.warn("Firestore saveInstrument failed:", err);
        }
    }

    const insts = await getInstruments();
    const idx = insts.findIndex((i) => i.id === instId || i.name?.toLowerCase() === updated.name?.toLowerCase());
    if (idx >= 0) {
        insts[idx] = updated;
    } else {
        insts.push(updated);
    }
    localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(insts));
    return updated;
}

export async function deleteInstrument(instrumentId) {
    if (isFirebaseConfigured && db) {
        try {
            await deleteDoc(doc(db, "instruments", instrumentId));
        } catch (err) {
            console.warn("Firestore deleteInstrument failed:", err);
        }
    }

    const insts = await getInstruments();
    const filtered = insts.filter((i) => i.id !== instrumentId);
    localStorage.setItem(INSTRUMENTS_KEY, JSON.stringify(filtered));
    return true;
}

/* ==================== COURSES ==================== */
export async function getCourses() {
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDocs(collection(db, "courses"));
            if (!snap.empty) {
                const courses = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
                return courses;
            }
        } catch (err) {
            console.warn("Firestore getCourses failed, using local fallback:", err);
        }
    }
    try {
        const stored = localStorage.getItem(COURSES_KEY);
        if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
        return defaultCourses;
    } catch {
        return defaultCourses;
    }
}

export async function getCourseById(courseId) {
    const courses = await getCourses();
    return courses.find((c) => c.id === courseId) || null;
}

export async function saveCourse(course) {
    const courseId = course.id || "course-" + Date.now();
    const updatedCourse = { ...course, id: courseId };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "courses", courseId), updatedCourse, { merge: true });
        } catch (err) {
            console.warn("Firestore saveCourse failed, saving to local store:", err);
        }
    }

    const courses = await getCourses();
    const idx = courses.findIndex((c) => c.id === courseId);
    if (idx >= 0) {
        courses[idx] = updatedCourse;
    } else {
        courses.push(updatedCourse);
    }
    localStorage.setItem(COURSES_KEY, JSON.stringify(courses));
    return updatedCourse;
}

export async function deleteCourse(courseId) {
    if (isFirebaseConfigured && db) {
        try {
            await deleteDoc(doc(db, "courses", courseId));
        } catch (err) {
            console.warn("Firestore deleteCourse failed:", err);
        }
    }

    const courses = await getCourses();
    const filtered = courses.filter((c) => c.id !== courseId);
    localStorage.setItem(COURSES_KEY, JSON.stringify(filtered));
    return true;
}
