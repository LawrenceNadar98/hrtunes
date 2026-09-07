import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import {
    Play,
    ArrowRight,
    Flame,
    Clock,
    Trophy,
    Radio,
    ClipboardList,
    Music2,
    Sparkles,
    AlertCircle,
    Calendar,
    Video,
    CheckCircle2,
    CreditCard
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserEnrollments } from "@/services/enrollmentService";
import { getUserTrialBookings } from "@/services/trialService";
import { getCurriculums } from "@/services/curriculumService";

export default function Dashboard() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [trials, setTrials] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);

    const studentName = user?.name || "Student";

    useEffect(() => {
        async function loadData() {
            if (!user) return;
            try {
                const userId = user.id || user.uid;
                const [enrs, trls, currs] = await Promise.all([
                    getUserEnrollments(userId),
                    getUserTrialBookings(userId),
                    getCurriculums()
                ]);
                setEnrollments(enrs || []);
                setTrials(trls || []);
                setCurriculums(currs || []);
            } catch (err) {
                console.warn("Dashboard data load error:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, [user]);

    const activeEnrollment = enrollments.find((e) => e.status === "active" && e.planId !== "free-trial" && e.planId !== "trial");
    const pendingEnrollment = enrollments.find((e) => e.status === "pending_payment");
    const upcomingTrial = trials.find((t) => t.status === "confirmed" || t.status === "pending");

    const isPaidStudent = Boolean(
        activeEnrollment ||
        (user?.enrolledPlanId && user.enrolledPlanId !== "free-trial" && user.enrolledPlanId !== "trial" && user?.enrollmentStatus === "active")
    );

    const planTitle = isPaidStudent
        ? (activeEnrollment?.planName || user?.enrolledPlanName || "Guitar Foundations Pro")
        : (pendingEnrollment ? `${pendingEnrollment.planName} (Pending)` : "Free Trial Account");

    // Filter curriculums for display
    const visibleCurriculums = curriculums.filter((c) => {
        if (!isPaidStudent) {
            return c.id === "curriculum-free-trial" || (c.assignedPlanIds && c.assignedPlanIds.includes("free-trial"));
        }
        const userPlan = activeEnrollment?.planId || user?.enrolledPlanId || "guitar-foundation-3m";
        return !c.assignedPlanIds || c.assignedPlanIds.includes(userPlan);
    });

    const displayCurriculums = visibleCurriculums.length > 0 ? visibleCurriculums : curriculums.slice(0, 1);

    // Compute real dynamic activities
    const recentActivities = [];
    if (upcomingTrial) {
        recentActivities.push({
            id: "act-trial",
            text: `1-on-1 Free Trial Assessment scheduled for ${upcomingTrial.scheduledDate}`,
            time: upcomingTrial.timeSlot || "Scheduled"
        });
    }
    if (activeEnrollment) {
        recentActivities.push({
            id: "act-enr",
            text: `Active subscription to ${activeEnrollment.planName}`,
            time: "Active"
        });
    }
    if (pendingEnrollment && !activeEnrollment) {
        recentActivities.push({
            id: "act-pend",
            text: `Payment pending for ${pendingEnrollment.planName}`,
            time: "Awaiting approval"
        });
    }
    if (recentActivities.length === 0) {
        recentActivities.push({
            id: "act-welcome",
            text: "Welcome to HR Tunes Guitar Portal",
            time: "Just now"
        });
    }

    if (loading) {
        return (
            <DashboardLayout subtitle="Loading..." title="Let's play.">
                <div className="space-y-6 animate-pulse">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="h-24 bg-card border border-white/10 rounded" />
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 h-64 bg-card border border-white/10 rounded" />
                        <div className="h-64 bg-card border border-white/10 rounded" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            subtitle={`Welcome back, ${studentName}`}
            title="Let's play."
            actions={
                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/30 rounded text-xs font-mono text-primary font-bold">
                        <Sparkles size={13} /> {planTitle}
                    </div>
                    {isPaidStudent ? (
                        <Link to="/dashboard/live" className="btn-primary" data-testid="dashboard-join-live">
                            <Radio size={15} /> Next live class
                        </Link>
                    ) : (
                        <Link to="/checkout" className="btn-primary" data-testid="dashboard-upgrade-plan">
                            <Sparkles size={15} /> Upgrade to Paid Plan
                        </Link>
                    )}
                </div>
            }
        >
            {/* Abandoned Checkout Recovery Banner */}
            {pendingEnrollment && !isPaidStudent && (
                <div className="mb-8 p-5 bg-gradient-to-r from-amber-500/20 via-card to-card border border-amber-500/40 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg" data-testid="abandoned-checkout-banner">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-heading font-bold text-base text-amber-200">
                                Complete your enrollment
                            </h3>
                            <p className="text-xs text-neutral-300 mt-0.5">
                                You have a pending subscription for <strong className="text-white">{pendingEnrollment.planName}</strong> (₹{pendingEnrollment.planPrice?.toLocaleString("en-IN")}). Complete your payment to unlock the full curriculum.
                            </p>
                        </div>
                    </div>
                    <Link
                        to={`/checkout?plan=${pendingEnrollment.planId}&enrollmentId=${pendingEnrollment.id}`}
                        className="btn-primary !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider shrink-0 flex items-center gap-2"
                        data-testid="continue-payment-btn"
                    >
                        <CreditCard size={14} /> Continue Payment
                    </Link>
                </div>
            )}

            {/* Free Trial Status Banner */}
            {!isPaidStudent && upcomingTrial && (
                <div className="mb-8 p-6 bg-gradient-to-r from-primary/15 via-card to-card border border-primary/30 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6" data-testid="trial-status-banner">
                    <div className="space-y-1">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded">
                            <CheckCircle2 size={12} /> Scheduled Free 1-on-1 Trial
                        </div>
                        <h3 className="text-heading font-bold text-xl text-white">
                            Your Live Trial Session is Set!
                        </h3>
                        <p className="text-xs text-muted-foreground flex items-center gap-3">
                            <span className="flex items-center gap-1"><Calendar size={13} className="text-primary" /> {upcomingTrial.scheduledDate}</span>
                            <span className="flex items-center gap-1"><Clock size={13} className="text-primary" /> {upcomingTrial.timeSlot}</span>
                            <span className="text-neutral-400">· Instructor: Harsh Patel</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                        <a
                            href={upcomingTrial.meetingLink || "https://meet.google.com/hrt-tune-live"}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-primary !py-2.5 !px-4 text-xs font-bold flex items-center gap-2"
                        >
                            <Video size={14} /> Join Google Meet
                        </a>
                        <Link to="/plans/guitar-foundation-3m" className="btn-outline !py-2.5 !px-4 text-xs">
                            Upgrade to Paid Plan
                        </Link>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="stats-grid">
                <StatCard icon={Flame} label="Practice streak" value={user?.stats?.streak ? `${user.stats.streak} days` : "0 days"} accent />
                <StatCard icon={Clock} label="Hours logged" value={user?.stats?.hours ? `${user.stats.hours}` : "0.0"} />
                <StatCard
                    icon={Trophy}
                    label="Lessons done"
                    value={user?.stats?.lessonsDone ?? (isPaidStudent ? (activeEnrollment?.planId === "guitar-complete-6m" ? "0 / 24" : "0 / 12") : "0 / 1")}
                />
                <StatCard icon={Music2} label="Songs learned" value={user?.stats?.songsLearned ?? 0} />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enrolled courses / Curricula */}
                <section className="lg:col-span-2" data-testid="enrolled-courses">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-heading font-bold text-xl">Continue Learning ({planTitle})</h2>
                        <Link to="/dashboard/courses" className="text-xs font-bold uppercase tracking-widest hover:text-primary">
                            View all →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {displayCurriculums.map((c) => (
                            <Link
                                to={`/dashboard/courses/${c.id}`}
                                key={c.id}
                                className="card-hr flex flex-col sm:flex-row overflow-hidden group"
                                data-testid={`continue-card-${c.id}`}
                            >
                                <div className="sm:w-56 relative aspect-video sm:aspect-auto overflow-hidden">
                                    <img
                                        src={c.thumbnail || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80"}
                                        alt={c.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 bg-primary flex items-center justify-center">
                                            <Play size={18} className="fill-white text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                            {c.category || "Trial Assessment"}
                                        </span>
                                        <span className="text-muted-foreground text-xs">· {c.levels?.length || 1} Level</span>
                                    </div>
                                    <h3 className="text-heading font-bold text-lg">{c.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                                    <div className="mt-auto pt-4">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-muted-foreground">Level 1 Progress</span>
                                            <span className="font-bold font-mono">0%</span>
                                        </div>
                                        <div className="h-1 bg-white/10 overflow-hidden">
                                            <div className="h-full bg-primary transition-all" style={{ width: `0%` }} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Upgrade Teaser Card for Free Trial Students */}
                        {!isPaidStudent && (
                            <div className="p-5 bg-gradient-to-r from-card to-primary/10 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div>
                                    <div className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1.5">
                                        <Sparkles size={13} /> Full Curriculum Available
                                    </div>
                                    <h4 className="text-heading font-bold text-base text-white">Unlock 3-Month & 6-Month Structured Courses</h4>
                                    <p className="text-xs text-neutral-400 mt-0.5">Get 24+ structured video lessons, assignments, tabs, and weekly batch classes.</p>
                                </div>
                                <Link to="/dashboard/courses" className="btn-outline !py-2 !px-4 text-xs font-bold shrink-0">
                                    Explore Courses →
                                </Link>
                            </div>
                        )}
                    </div>
                </section>

                {/* Upcoming & Activity */}
                <aside className="space-y-6">
                    <div className="card-hr p-6" data-testid="upcoming-live">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-heading font-bold text-lg">
                                {isPaidStudent ? "Upcoming Live Batches" : "Your Free Trial Session"}
                            </h3>
                            <Radio size={16} className="text-primary" />
                        </div>
                        
                        {!isPaidStudent ? (
                            upcomingTrial ? (
                                <div className="space-y-4">
                                    <div className="border-l-2 border-primary pl-4 bg-primary/5 p-3 rounded-r">
                                        <div className="text-xs font-mono text-primary font-bold">
                                            {upcomingTrial.scheduledDate} · {upcomingTrial.timeSlot}
                                        </div>
                                        <div className="font-bold text-sm mt-1 text-white">1-on-1 Free Live Trial Assessment</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">Instructor: Harsh Patel · 60 min</div>
                                        <a
                                            href={upcomingTrial.meetingLink || "https://meet.google.com/hrt-tune-live"}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
                                        >
                                            <Video size={13} /> Open Google Meet
                                        </a>
                                    </div>
                                    <div className="p-3 bg-white/5 border border-white/10 rounded text-xs text-neutral-400">
                                        <strong className="text-neutral-200 block mb-1">Weekly Batch Classes:</strong>
                                        Weekly group masterclasses are exclusive to paid students. Upgrade anytime to join live batches!
                                    </div>
                                    <Link to="/dashboard/live" className="w-full text-center block text-xs font-bold uppercase tracking-widest py-2.5 border border-white/20 hover:bg-white hover:text-black transition-colors">
                                        View Live Class Hub
                                    </Link>
                                </div>
                            ) : (
                                <div className="text-center py-4 space-y-3">
                                    <p className="text-xs text-neutral-400">You haven't scheduled your 1-on-1 free trial session yet.</p>
                                    <Link to="/book-trial" className="btn-primary !py-2 text-xs">
                                        Book Free Trial
                                    </Link>
                                </div>
                            )
                        ) : (
                            <div className="space-y-4">
                                <div className="border-l-2 border-primary pl-4 bg-primary/5 p-3 rounded-r">
                                    <div className="text-xs font-mono text-primary font-bold">
                                        Tuesday & Thursday · 07:00 PM IST
                                    </div>
                                    <div className="font-bold text-sm mt-1 text-white">Weekly Interactive Batch Masterclass</div>
                                    <div className="text-xs text-muted-foreground mt-0.5">Instructor: Harsh Patel · 60 min</div>
                                    <Link to="/dashboard/live" className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
                                        View Live Schedule →
                                    </Link>
                                </div>
                                <Link to="/dashboard/live" className="mt-5 w-full text-center block text-xs font-bold uppercase tracking-widest py-3 border border-white/20 hover:bg-white hover:text-black transition-colors">
                                    View Full Schedule
                                </Link>
                            </div>
                        )}
                    </div>

                    <div className="card-hr p-6" data-testid="recent-activity">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-heading font-bold text-lg">Recent Activity</h3>
                            <ClipboardList size={16} className="text-primary" />
                        </div>
                        <ul className="space-y-4">
                            {recentActivities.map((a) => (
                                <li key={a.id} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary mt-2 shrink-0 rounded-full" />
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-white">{a.text}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5 font-mono">{a.time}</div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}

function StatCard({ icon: Icon, label, value, accent }) {
    return (
        <div className={`p-5 border ${accent ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={accent ? "text-primary" : "text-muted-foreground"} />
                <span className="eyebrow">{label}</span>
            </div>
            <div className="text-heading font-black text-3xl leading-none">{value}</div>
        </div>
    );
}
