import DashboardLayout from "@/components/layout/DashboardLayout";
import { TIMEZONES } from "@/lib/mock";
import { useState, useEffect } from "react";
import { Calendar, Clock, Users, Globe, Video, Play, Lock, Sparkles, CheckCircle2, ShieldCheck, ExternalLink, X } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { getUserEnrollments } from "@/services/enrollmentService";
import { getUserTrialBookings } from "@/services/trialService";
import { Link } from "react-router-dom";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Foundational video lectures for trial students
const FOUNDATIONAL_LECTURES = [
    {
        id: "lec-1",
        title: "Guitar Anatomy, Frets & Ergonomic Posture",
        instructor: "Harsh Patel",
        duration: "12 min",
        category: "Fundamentals",
        thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/bb9Tf6_FqSg"
    },
    {
        id: "lec-2",
        title: "Proper Pick Holding & Alternate Strumming Basics",
        instructor: "Harsh Patel",
        duration: "16 min",
        category: "Technique",
        thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/bb9Tf6_FqSg"
    },
    {
        id: "lec-3",
        title: "Standard Tuning (E A D G B E) & Tuner App Setup",
        instructor: "Harsh Patel",
        duration: "09 min",
        category: "Ear & Pitch",
        thumbnail: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/bb9Tf6_FqSg"
    },
    {
        id: "lec-4",
        title: "Your First 3 Clean Open Chords (Em, C, G)",
        instructor: "Harsh Patel",
        duration: "18 min",
        category: "Chords",
        thumbnail: "https://images.unsplash.com/photo-1462965326201-d02e4f455804?auto=format&fit=crop&w=800&q=80",
        videoUrl: "https://www.youtube.com/embed/bb9Tf6_FqSg"
    }
];

function buildCalendar(year, month) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = first.getDay();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

// Generate dynamic batch sessions for paid students
function generatePaidBatchClasses(year, month) {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const classes = [];
    let idCounter = 1;

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dayOfWeek = dateObj.getDay(); // 2 is Tue, 4 is Thu

        if (dayOfWeek === 2 || dayOfWeek === 4) {
            const isTue = dayOfWeek === 2;
            classes.push({
                id: `batch-${idCounter++}`,
                date: `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
                dayNumber: d,
                title: isTue ? "Live Rhythm & Strumming Mechanics Lab" : "Fretboard Navigation & Lead Technique Masterclass",
                course: "Weekly Batch Masterclass",
                instructor: "Harsh Patel",
                time: "07:00 PM IST",
                duration: 60,
                attendees: isTue ? 14 : 18,
                timezone: "IST",
                meetingLink: "https://meet.google.com/hrt-tune-live"
            });
        }
    }
    return classes;
}

export default function LiveClasses() {
    const { user } = useAuth();
    const [tz, setTz] = useState("Asia/Kolkata");
    const [enrollments, setEnrollments] = useState([]);
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeVideo, setActiveVideo] = useState(null);

    const today = new Date();
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [selectedDay, setSelectedDay] = useState(today.getDate());

    useEffect(() => {
        async function load() {
            if (!user) return;
            const userId = user.id || user.uid;
            try {
                const [enrs, trls] = await Promise.all([
                    getUserEnrollments(userId),
                    getUserTrialBookings(userId)
                ]);
                setEnrollments(enrs);
                setTrials(trls);

                const trial = trls.find((t) => t.status === "confirmed" || t.status === "pending");
                if (trial && trial.scheduledDate) {
                    const parts = trial.scheduledDate.split("-");
                    if (parts.length === 3) {
                        const y = parseInt(parts[0], 10);
                        const m = parseInt(parts[1], 10) - 1;
                        const d = parseInt(parts[2], 10);
                        setCurrentYear(y);
                        setCurrentMonth(m);
                        setSelectedDay(d);
                    }
                }
            } catch (err) {
                console.warn("LiveClasses data load failed:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    const activeEnrollment = enrollments.find((e) => e.status === "active" && e.planId !== "free-trial" && e.planId !== "trial");
    const isPaidStudent = Boolean(
        activeEnrollment ||
        (user?.enrolledPlanId && user.enrolledPlanId !== "free-trial" && user.enrolledPlanId !== "trial" && user?.enrollmentStatus === "active")
    );

    const upcomingTrial = trials.find((t) => t.status === "confirmed" || t.status === "pending");

    // Compute trial day number if within visible month
    let trialDayNumber = null;
    if (upcomingTrial && upcomingTrial.scheduledDate) {
        const parts = upcomingTrial.scheduledDate.split("-");
        if (parts.length === 3) {
            const y = parseInt(parts[0], 10);
            const m = parseInt(parts[1], 10) - 1;
            const d = parseInt(parts[2], 10);
            if (y === currentYear && m === currentMonth) {
                trialDayNumber = d;
            }
        }
    }

    const dynamicBatchClasses = generatePaidBatchClasses(currentYear, currentMonth);
    const paidBatchDays = new Set(dynamicBatchClasses.map((c) => c.dayNumber));

    const cells = buildCalendar(currentYear, currentMonth);
    const monthLabel = new Date(currentYear, currentMonth, 1).toLocaleDateString("en-IN", {
        month: "long",
        year: "numeric"
    });

    if (loading) {
        return (
            <DashboardLayout subtitle="Loading sessions..." title="Live Classes">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-5 card-hr p-6 animate-pulse space-y-4">
                        <div className="h-6 bg-white/10 rounded w-1/3" />
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: 35 }).map((_, i) => (
                                <div key={i} className="aspect-square bg-white/5 rounded" />
                            ))}
                        </div>
                    </div>
                    <div className="lg:col-span-7 space-y-4">
                        <div className="card-hr p-6 animate-pulse space-y-3">
                            <div className="h-6 bg-white/10 rounded w-1/2" />
                            <div className="h-4 bg-white/5 rounded w-3/4" />
                            <div className="h-10 bg-white/10 rounded w-1/3" />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="card-hr p-4 animate-pulse space-y-3">
                                    <div className="aspect-video bg-white/5 rounded" />
                                    <div className="h-4 bg-white/10 rounded w-3/4" />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            subtitle={isPaidStudent ? "Weekly Live Batch Masterclasses" : "1-on-1 Free Live Trial Hub"}
            title="Live Classes"
            actions={
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 border border-white/10 bg-card px-3 py-1.5 rounded">
                        <Globe size={14} className="text-muted-foreground" />
                        <select
                            value={tz}
                            onChange={(e) => setTz(e.target.value)}
                            className="bg-transparent text-xs font-mono outline-none cursor-pointer text-white"
                            data-testid="timezone-select"
                        >
                            {TIMEZONES.map((t) => (
                                <option key={t} value={t} className="bg-neutral-900 text-white">
                                    {t}
                                </option>
                            ))}
                        </select>
                    </div>
                    {!isPaidStudent && (
                        <Link to="/checkout" className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1.5">
                            <Sparkles size={13} /> Upgrade to Paid Plan
                        </Link>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calendar Card */}
                <div className="lg:col-span-5 card-hr p-6" data-testid="calendar-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="eyebrow">Session Calendar</div>
                            <div className="text-heading font-bold text-xl">{monthLabel}</div>
                        </div>
                        <Calendar size={18} className="text-primary" />
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((d) => (
                            <div key={d} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-1.5">
                                {d}
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((d, i) => {
                            const isTrialDay = !isPaidStudent && d === trialDayNumber;
                            const isPaidBatchDay = isPaidStudent && d && paidBatchDays.has(d);
                            const isSelected = d === selectedDay;
                            const cellKey = d ? `day-${d}` : `blank-${i}`;

                            return (
                                <button
                                    key={cellKey}
                                    disabled={!d}
                                    onClick={() => d && setSelectedDay(d)}
                                    className={`aspect-square flex flex-col items-center justify-center text-sm font-medium border transition-all relative rounded ${
                                        !d
                                            ? "border-transparent"
                                            : isTrialDay
                                            ? "bg-primary text-white border-primary shadow-lg shadow-primary/30 font-bold"
                                            : isSelected
                                            ? "bg-white text-black border-white font-bold"
                                            : isPaidBatchDay
                                            ? "border-primary/50 text-white bg-primary/10 hover:bg-primary/20"
                                            : "border-white/10 hover:border-primary/60 hover:bg-primary/5 text-neutral-300"
                                    }`}
                                    data-testid={d ? `cal-day-${d}` : undefined}
                                >
                                    {d && (
                                        <>
                                            <span>{d}</span>
                                            {isTrialDay && (
                                                <span className="text-[8px] uppercase tracking-tighter font-black bg-black/40 px-1 rounded mt-0.5">
                                                    Trial
                                                </span>
                                            )}
                                            {isPaidBatchDay && !isTrialDay && !isSelected && (
                                                <span className="w-1.5 h-1.5 bg-primary rounded-full mt-0.5" />
                                            )}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="divider-dashed my-6" />

                    <div className="space-y-2 text-xs text-muted-foreground">
                        {!isPaidStudent ? (
                            <>
                                <div className="flex items-center gap-2 font-medium text-white">
                                    <span className="w-2.5 h-2.5 bg-primary rounded" />
                                    <span>Your Scheduled Free Trial ({upcomingTrial?.scheduledDate || "None"})</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-white/30 rounded" />
                                    <span>Weekly live batch masterclasses (Paid students)</span>
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="flex items-center gap-2 font-medium text-white">
                                    <span className="w-2.5 h-2.5 bg-primary rounded-full" />
                                    <span>Weekly Batch Masterclass (Tue / Thu 7:00 PM IST)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-white/40 rounded-full" />
                                    <span>Personal Q&A Support</span>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Right Column: Sessions */}
                <div className="lg:col-span-7 space-y-8">
                    {/* Free Trial Student Live Section */}
                    {!isPaidStudent ? (
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-heading font-bold text-xl mb-1">Your 1-on-1 Free Live Session</h2>
                                <p className="text-xs text-neutral-400">
                                    Personal interactive assessment & technique evaluation with Harsh Patel.
                                </p>
                            </div>

                            {upcomingTrial ? (
                                <div className="card-hr p-6 border-primary/40 bg-gradient-to-br from-primary/10 via-card to-card relative overflow-hidden" data-testid="trial-live-session-card">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex items-start gap-4">
                                            <div className="flex-shrink-0 bg-primary/20 border border-primary/40 p-4 text-center min-w-[90px] rounded-lg">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                                    {new Date(upcomingTrial.scheduledDate).toLocaleDateString("en-IN", { month: "short" })}
                                                </div>
                                                <div className="text-heading font-black text-3xl leading-none text-white mt-0.5">
                                                    {new Date(upcomingTrial.scheduledDate).getDate()}
                                                </div>
                                                <div className="text-[9px] text-neutral-400 font-mono mt-1">
                                                    {new Date(upcomingTrial.scheduledDate).toLocaleDateString("en-IN", { weekday: "short" })}
                                                </div>
                                            </div>

                                            <div className="space-y-1">
                                                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase tracking-wider rounded mb-1">
                                                    <CheckCircle2 size={11} /> 1-on-1 Free Assessment Confirmed
                                                </div>
                                                <h3 className="text-heading font-bold text-lg text-white">
                                                    Live Trial Session with Harsh Patel
                                                </h3>
                                                <p className="text-xs text-neutral-400">
                                                    Lead Instructor · 60 Minutes Interactive Google Meet
                                                </p>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/70">
                                                    <span className="flex items-center gap-1.5"><Clock size={12} className="text-primary" /> {upcomingTrial.timeSlot}</span>
                                                    <span className="flex items-center gap-1.5"><Globe size={12} className="text-primary" /> {tz}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 shrink-0">
                                            <a
                                                href={upcomingTrial.meetingLink || "https://meet.google.com/hrt-tune-live"}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-primary !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
                                                data-testid="join-trial-google-meet"
                                            >
                                                <Video size={14} /> Join Google Meet
                                            </a>
                                            <Link
                                                to="/plans/guitar-foundation-3m"
                                                className="btn-outline !py-2 !px-4 text-xs text-center"
                                            >
                                                Upgrade to Paid Plan
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="p-8 card-hr text-center space-y-3">
                                    <p className="text-sm text-neutral-300">You do not have an active Free Trial session booked yet.</p>
                                    <Link to="/book-trial" className="btn-primary !py-2.5 !px-6 text-xs">
                                        Book Your Free 1-on-1 Trial
                                    </Link>
                                </div>
                            )}

                            {/* Weekly Live Masterclasses Locked Teaser */}
                            <div className="p-5 bg-card border border-white/10 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-y-1">
                                    <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                                        <Lock size={12} /> Weekly Live Batch Masterclasses (Paid Feature)
                                    </div>
                                    <h4 className="text-heading font-bold text-sm text-white">
                                        2x Weekly Live Group Masterclasses with Harsh Patel
                                    </h4>
                                    <p className="text-xs text-neutral-400">
                                        Held every Tuesday & Thursday at 7:00 PM IST with live student interaction, jam sessions, and tab breakdowns.
                                    </p>
                                </div>
                                <Link
                                    to="/checkout"
                                    className="btn-outline !py-2 !px-4 text-xs font-bold uppercase tracking-wider shrink-0 text-amber-300 border-amber-500/30 hover:bg-amber-500 hover:text-black"
                                >
                                    Upgrade to Access
                                </Link>
                            </div>

                            {/* Foundational Video Lectures (For trial students - no past batch recordings) */}
                            <div>
                                <div className="mb-4">
                                    <h3 className="text-heading font-bold text-xl">Foundational Video Lectures</h3>
                                    <p className="text-xs text-neutral-400 mt-0.5">
                                        Watch these essential concept lectures to prepare for your live session.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {FOUNDATIONAL_LECTURES.map((lec) => (
                                        <div
                                            key={lec.id}
                                            className="card-hr overflow-hidden group cursor-pointer border-white/10 hover:border-primary/50 transition-all"
                                            onClick={() => setActiveVideo(lec)}
                                            data-testid={`lecture-${lec.id}`}
                                        >
                                            <div className="relative aspect-video bg-black overflow-hidden">
                                                <img
                                                    src={lec.thumbnail}
                                                    alt={lec.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg">
                                                        <Play size={16} className="fill-white text-white ml-0.5" />
                                                    </div>
                                                </div>
                                                <div className="absolute top-2 right-2 bg-black/70 text-white text-[10px] font-mono px-2 py-0.5 rounded">
                                                    {lec.duration}
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary mb-1">
                                                    {lec.category}
                                                </div>
                                                <div className="text-sm font-bold text-white line-clamp-1">{lec.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Instructor: {lec.instructor}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* Paid Student Live Section */
                        <div className="space-y-6">
                            <div>
                                <h2 className="text-heading font-bold text-xl mb-1">Upcoming Batch Masterclasses</h2>
                                <p className="text-xs text-neutral-400">
                                    Dynamic interactive live classes included with your active subscription plan.
                                </p>
                            </div>

                            <div className="space-y-3">
                                {dynamicBatchClasses.slice(0, 4).map((lc) => (
                                    <div
                                        key={lc.id}
                                        className="card-hr p-5 flex flex-col md:flex-row md:items-center gap-5"
                                        data-testid={`upcoming-${lc.id}`}
                                    >
                                        <div className="flex-shrink-0 bg-primary/10 border border-primary/40 p-4 text-center min-w-[80px] rounded">
                                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                                {new Date(lc.date).toLocaleDateString("en-IN", { month: "short" })}
                                            </div>
                                            <div className="text-heading font-black text-2xl leading-none text-white mt-0.5">
                                                {new Date(lc.date).getDate()}
                                            </div>
                                            <div className="text-[9px] text-neutral-400 font-mono mt-0.5">
                                                {new Date(lc.date).toLocaleDateString("en-IN", { weekday: "short" })}
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-heading font-bold text-base text-white">{lc.title}</div>
                                            <div className="text-xs text-muted-foreground mt-0.5">{lc.course} · {lc.instructor}</div>
                                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/60">
                                                <span className="flex items-center gap-1.5"><Clock size={12} /> {lc.time} · {lc.duration} min</span>
                                                <span className="flex items-center gap-1.5"><Users size={12} /> {lc.attendees} attending</span>
                                                <span className="flex items-center gap-1.5"><Globe size={12} /> {tz}</span>
                                            </div>
                                        </div>
                                        <a
                                            href={lc.meetingLink}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="btn-primary flex-shrink-0 !py-2.5 !px-4 text-xs font-bold uppercase flex items-center gap-2"
                                            data-testid={`join-${lc.id}`}
                                        >
                                            <Video size={14} /> Join Live
                                        </a>
                                    </div>
                                ))}
                            </div>

                            {/* Past Lecture Recordings for Paid Students */}
                            <div className="pt-4">
                                <h3 className="text-heading font-bold text-xl mb-4">Past Lecture Archives</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {FOUNDATIONAL_LECTURES.map((lec) => (
                                        <div
                                            key={lec.id}
                                            className="card-hr overflow-hidden group cursor-pointer"
                                            onClick={() => setActiveVideo(lec)}
                                            data-testid={`paid-past-${lec.id}`}
                                        >
                                            <div className="relative aspect-video bg-black">
                                                <img
                                                    src={lec.thumbnail}
                                                    alt={lec.title}
                                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                                />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                                                        <Play size={16} className="fill-white text-white ml-0.5" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-4">
                                                <div className="text-heading font-bold text-sm text-white">{lec.title}</div>
                                                <div className="text-xs text-muted-foreground mt-1">Instructor: {lec.instructor} · {lec.duration}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Video Player Modal */}
            {activeVideo && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-white/20 rounded-xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="p-4 border-b border-white/10 flex items-center justify-between">
                            <div>
                                <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                    {activeVideo.category || "Video Lecture"}
                                </div>
                                <h3 className="text-heading font-bold text-base text-white">{activeVideo.title}</h3>
                            </div>
                            <button
                                onClick={() => setActiveVideo(null)}
                                className="p-1.5 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <div className="relative aspect-video bg-black">
                            <iframe
                                src={activeVideo.videoUrl}
                                className="w-full h-full"
                                title={activeVideo.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
