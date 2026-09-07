import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Star, ArrowRight, Filter, Lock, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { getCurriculums } from "@/services/curriculumService";
import { getPlans } from "@/services/courseService";
import { getUserEnrollments } from "@/services/enrollmentService";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";

const FILTERS = ["All", "Guitar", "Keyboard", "Beginner", "Intermediate", "Advanced"];

export default function MyCourses() {
    const { user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [plans, setPlans] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [filter, setFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userId = user?.id || user?.uid;
        Promise.all([
            getCurriculums(),
            getPlans(),
            userId ? getUserEnrollments(userId) : Promise.resolve([])
        ]).then(([currList, planList, enrList]) => {
            setPlans(planList || []);
            setEnrollments(enrList || []);

            if (currList && currList.length > 0) {
                // Map curriculum hierarchy into course card format
                const formatted = currList.map((c) => {
                    const totalLessons = c.levels?.reduce(
                        (sum, l) => sum + (l.modules?.reduce((mSum, m) => mSum + (m.sessions?.length || 0), 0) || 0),
                        0
                    ) || 24;
                    const primaryLevel = c.levels?.[0]?.title?.replace("Level 1: ", "") || "Beginner";

                    return {
                        id: c.id,
                        title: c.title,
                        subtitle: c.description,
                        level: primaryLevel,
                        instrument: c.instrument || "Guitar",
                        duration: c.levels?.[0]?.duration || "8 weeks",
                        lessons: totalLessons,
                        students: 1280,
                        rating: 4.9,
                        thumbnail: c.thumbnail || "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
                        progress: 0,
                        assignedPlanIds: c.assignedPlanIds || ["guitar-foundation-3m", "guitar-complete-6m"]
                    };
                });

                setCourses(formatted);
            } else {
                setCourses([]);
            }
            setLoading(false);
        }).catch((err) => {
            console.warn("MyCourses data load error:", err);
            setLoading(false);
        });
    }, [user]);

    const activeEnrollment = enrollments.find((e) => e.status === "active" && e.planId !== "free-trial" && e.planId !== "trial");
    const isPaidStudent = Boolean(
        activeEnrollment ||
        (user?.enrolledPlanId && user.enrolledPlanId !== "free-trial" && user.enrolledPlanId !== "trial" && user?.enrollmentStatus === "active")
    );

    const userPlanId = isPaidStudent
        ? (activeEnrollment?.planId || user?.enrolledPlanId || "guitar-foundation-3m")
        : "free-trial";
        
    const userPlanName = isPaidStudent
        ? (activeEnrollment?.planName || user?.enrolledPlanName || "3-Month Guitar Foundation")
        : "Free 1-on-1 Trial";

    const filtered = courses.filter((c) => {
        if (filter === "All") return true;
        if (filter === "Guitar" || filter === "Keyboard") return c.instrument === filter;
        return c.level?.toLowerCase().includes(filter.toLowerCase());
    });

    return (
        <DashboardLayout
            subtitle="Your Learning Library"
            title="My Courses"
            actions={
                <div className="flex items-center gap-2">
                    <span className="text-xs font-mono bg-primary/10 border border-primary/30 text-primary font-bold px-3 py-1.5 rounded flex items-center gap-1.5">
                        <ShieldCheck size={14} /> Active Plan: {userPlanName}
                    </span>
                    {!isPaidStudent && (
                        <Link to="/checkout" className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5" data-testid="courses-upgrade-btn">
                            <Sparkles size={13} /> Upgrade Plan
                        </Link>
                    )}
                </div>
            }
        >
            <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2" data-testid="courses-filters">
                <Filter size={14} className="text-muted-foreground flex-shrink-0" />
                {FILTERS.map((f) => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-all flex-shrink-0 ${
                            filter === f
                                ? "bg-primary text-white border-primary"
                                : "border-white/20 text-muted-foreground hover:text-white hover:border-white/40"
                        }`}
                        data-testid={`filter-${f.toLowerCase()}`}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                    {[1, 2].map((i) => (
                        <div key={i} className="card-hr h-80 bg-card border border-white/10 rounded-lg" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="card-hr p-12 text-center text-sm text-neutral-400">
                    No courses found matching this filter.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filtered.map((c) => {
                        // Check entitlement for current student
                        const isEntitled =
                            user?.role === "instructor" ||
                            (c.assignedPlanIds && c.assignedPlanIds.includes(userPlanId)) ||
                            (!isPaidStudent && (c.id === "curriculum-free-trial" || c.assignedPlanIds?.includes("free-trial")));

                        // Determine target upgrade link if locked
                        const targetPlanId = c.assignedPlanIds?.includes("guitar-foundation-3m")
                            ? "guitar-foundation-3m"
                            : "guitar-complete-6m";

                        const planPrice = targetPlanId === "guitar-complete-6m" ? "₹13,500" : "₹7,500";

                        return (
                            <article key={c.id} className="card-hr group overflow-hidden flex flex-col justify-between" data-testid={`my-course-${c.id}`}>
                                <div>
                                    <div className="relative aspect-video overflow-hidden">
                                        <img
                                            src={c.thumbnail}
                                            alt={c.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                        {c.comingSoon ? (
                                            <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                                Coming Soon
                                            </div>
                                        ) : !isEntitled ? (
                                            <div className="absolute top-4 right-4 bg-amber-500 text-black text-[10px] font-black px-2.5 py-1 uppercase tracking-widest rounded flex items-center gap-1 shadow-md">
                                                <Lock size={11} /> Locked Plan
                                            </div>
                                        ) : (
                                            <div className="absolute bottom-4 left-4 right-4">
                                                <div className="flex items-center justify-between text-xs mb-1.5">
                                                    <span className="font-mono text-white/80">{c.progress}% complete</span>
                                                    <span className="font-mono text-white/80">{c.lessons} lessons</span>
                                                </div>
                                                <div className="h-1 bg-white/20 overflow-hidden">
                                                    <div className="h-full bg-primary transition-all" style={{ width: `${c.progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                                            <span className="font-bold uppercase tracking-widest text-primary">{c.level}</span>
                                            <span>·</span>
                                            <span>{c.instrument}</span>
                                        </div>
                                        <h3 className="text-heading font-bold text-xl">{c.title}</h3>
                                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.subtitle}</p>

                                        <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
                                            <span className="flex items-center gap-1.5"><Clock size={12} /> {c.duration}</span>
                                            <span className="flex items-center gap-1.5"><BookOpen size={12} /> {c.lessons} sessions</span>
                                            {c.rating > 0 && <span className="flex items-center gap-1.5"><Star size={12} className="text-primary fill-primary" /> {c.rating}</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 pt-0">
                                    {c.comingSoon ? (
                                        <button disabled className="w-full text-center py-3 text-xs font-bold uppercase tracking-widest border border-white/10 text-muted-foreground cursor-not-allowed">
                                            Coming Soon
                                        </button>
                                    ) : isEntitled ? (
                                        <Link
                                            to={`/dashboard/courses/${c.id}`}
                                            className="btn-primary w-full text-center !py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2"
                                            data-testid={`open-course-${c.id}`}
                                        >
                                            <Play size={13} /> Continue Learning <ArrowRight size={13} />
                                        </Link>
                                    ) : (
                                        <Link
                                            to={`/checkout?plan=${targetPlanId}`}
                                            className="w-full text-center py-3 text-xs font-bold uppercase tracking-widest bg-amber-500/15 text-amber-300 hover:bg-amber-500 hover:text-black border border-amber-500/30 rounded flex items-center justify-center gap-2 transition-all font-semibold"
                                            data-testid={`upgrade-to-unlock-${c.id}`}
                                        >
                                            <Lock size={12} /> Unlock with Paid Plan ({planPrice})
                                        </Link>
                                    )}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}
        </DashboardLayout>
    );
}
