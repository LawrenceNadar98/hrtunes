import DashboardLayout from "@/components/layout/DashboardLayout";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
    ArrowLeft,
    Play,
    CheckCircle2,
    Circle,
    FileText,
    Download,
    Clock,
    MessageSquare,
    BookOpen,
    Layers,
    Sparkles,
    ChevronDown,
    ChevronRight,
    Lock,
    Shield
} from "lucide-react";
import { COURSES as DEFAULT_COURSES } from "@/lib/mock";
import { getCurriculumById, getCurriculums } from "@/services/curriculumService";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [curriculum, setCurriculum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeSession, setActiveSession] = useState(null);
    const [completedSessions, setCompletedSessions] = useState({});
    const [expandedLevels, setExpandedLevels] = useState({});

    const userPlanId = user?.enrolledPlanId || "guitar-foundation-3m";

    useEffect(() => {
        const loadCurriculum = async () => {
            setLoading(true);
            let found = await getCurriculumById(id);

            if (!found) {
                // Check if it matches a default mock course
                const mock = DEFAULT_COURSES.find((c) => c.id === id);
                if (mock) {
                    found = {
                        id: mock.id,
                        title: mock.title,
                        description: mock.description,
                        assignedPlanIds: ["free-trial", "guitar-foundation-3m", "guitar-complete-6m"],
                        levels: [
                            {
                                id: "lvl-mock",
                                levelNumber: 1,
                                title: mock.level || "Beginner",
                                duration: mock.duration,
                                modules: mock.modules.map((m, mIdx) => ({
                                    id: m.id || `mod-${mIdx}`,
                                    moduleNumber: mIdx + 1,
                                    title: m.title,
                                    sessions: m.lessons.map((l, lIdx) => ({
                                        id: l.id || `ses-${lIdx}`,
                                        sessionNumber: lIdx + 1,
                                        title: l.title,
                                        duration: l.duration,
                                        videoId: l.videoId || "jNQXAC9IVRw",
                                        learningObjective: l.notes || "Master this core guitar concept.",
                                        topics: [l.title, "Technique & Rhythm drills"],
                                        practiceHomework: "Practice 15 minutes daily.",
                                        resources: l.resources || [],
                                        sessionStructure: {
                                            warmup: "Tuning & warm-up (5 min)",
                                            review: "Review previous session (10 min)",
                                            newConcept: "Core lesson concept (20 min)",
                                            songPractice: "Practical song application (15 min)",
                                            feedback: "Live Q&A & feedback (10 min)"
                                        }
                                    }))
                                }))
                            }
                        ]
                    };
                }
            }

            if (found) {
                setCurriculum(found);

                // Expand first level by default
                const exp = {};
                found.levels?.forEach((l) => { exp[l.id] = true; });
                setExpandedLevels(exp);

                // Set first session as active
                const firstSession = found.levels?.[0]?.modules?.[0]?.sessions?.[0];
                if (firstSession) {
                    setActiveSession(firstSession);
                }
            }
            setLoading(false);
        };

        loadCurriculum();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout title="Loading Lesson...">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-pulse">
                    <div className="lg:col-span-8 space-y-6">
                        <div className="aspect-video bg-white/5 rounded-lg border border-white/10" />
                        <div className="space-y-3">
                            <div className="h-6 bg-white/10 rounded w-1/3" />
                            <div className="h-10 bg-white/10 rounded w-2/3" />
                        </div>
                    </div>
                    <div className="lg:col-span-4 card-hr p-6 space-y-4">
                        <div className="h-6 bg-white/10 rounded w-1/2" />
                        <div className="space-y-2">
                            {Array.from({ length: 6 }).map((_, i) => (
                                <div key={i} className="h-10 bg-white/5 rounded" />
                            ))}
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!curriculum) {
        return (
            <DashboardLayout title="Course not found">
                <Link to="/dashboard/courses" className="btn-outline">← Back to courses</Link>
            </DashboardLayout>
        );
    }

    // Check Plan Entitlement
    const isEntitled =
        user?.role === "instructor" ||
        !curriculum.assignedPlanIds ||
        curriculum.assignedPlanIds.length === 0 ||
        curriculum.assignedPlanIds.includes(userPlanId);

    if (!isEntitled) {
        return (
            <DashboardLayout title="Access Restricted">
                <div className="card-hr p-8 max-w-xl mx-auto text-center space-y-4">
                    <div className="w-12 h-12 bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full flex items-center justify-center mx-auto">
                        <Lock size={24} />
                    </div>
                    <h2 className="text-heading font-bold text-2xl text-white">This Curriculum Requires a Plan Upgrade</h2>
                    <p className="text-xs text-neutral-300">
                        <strong>{curriculum.title}</strong> is exclusive to higher subscription tiers. Please upgrade your membership to unlock all sessions.
                    </p>
                    <div className="pt-4 flex justify-center gap-3">
                        <Link to="/dashboard/courses" className="btn-outline !py-2 !text-xs">Browse My Courses</Link>
                        <Link to="/checkout" className="btn-primary !py-2 !text-xs flex items-center gap-1.5">
                            <Sparkles size={13} /> Upgrade Plan
                        </Link>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    // Calculate progress
    const allSessions = [];
    curriculum.levels?.forEach((lvl) => {
        lvl.modules?.forEach((mod) => {
            mod.sessions?.forEach((ses) => {
                allSessions.push(ses);
            });
        });
    });

    const totalCount = allSessions.length || 1;
    const completedCount = Object.keys(completedSessions).filter((k) => completedSessions[k]).length;
    const progressPercent = Math.round((completedCount / totalCount) * 100);

    const markSessionComplete = () => {
        if (!activeSession) return;
        setCompletedSessions((prev) => ({ ...prev, [activeSession.id]: true }));
        toast.success(`Session "${activeSession.title}" marked as complete!`);
    };

    return (
        <DashboardLayout>
            <div className="flex items-center justify-between mb-6">
                <button
                    onClick={() => navigate("/dashboard/courses")}
                    className="eyebrow flex items-center gap-2 hover:text-primary transition-colors"
                    data-testid="course-back"
                >
                    <ArrowLeft size={14} /> Back to My Courses
                </button>
                <div className="text-xs font-mono text-neutral-400">
                    Progress: <strong className="text-primary">{progressPercent}%</strong> ({completedCount}/{totalCount} sessions)
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Video Player & Educational Details */}
                <div className="lg:col-span-8 space-y-6" data-testid="player-column">
                    {/* Video Player */}
                    <div className="aspect-video bg-black border border-white/10 overflow-hidden relative group rounded-lg shadow-2xl">
                        {activeSession ? (
                            <iframe
                                key={activeSession.id}
                                src={`https://www.youtube.com/embed/${activeSession.videoId || "jNQXAC9IVRw"}?rel=0&autoplay=0`}
                                className="w-full h-full"
                                title={activeSession.title}
                                allowFullScreen
                                data-testid="lesson-video"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-sm text-neutral-500">
                                Select a session from the curriculum sidebar
                            </div>
                        )}
                    </div>

                    {/* Active Session Info */}
                    {activeSession && (
                        <div className="space-y-6">
                            <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-primary/15 text-primary border border-primary/30 rounded">
                                        Session {activeSession.sessionNumber || 1}
                                    </span>
                                    <span className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                                        <Clock size={12} /> {activeSession.duration || "60 min"}
                                    </span>
                                    <span>·</span>
                                    <span className="text-xs text-neutral-400">{curriculum.title}</span>
                                </div>

                                <h1 className="text-display text-4xl md:text-5xl leading-none mt-3">
                                    {activeSession.title}
                                </h1>
                            </div>

                            {/* Mark Complete & Q&A Action Bar */}
                            <div className="flex flex-wrap items-center gap-3">
                                <button
                                    onClick={markSessionComplete}
                                    disabled={completedSessions[activeSession.id]}
                                    className={`inline-flex items-center gap-2 px-6 py-3 text-xs font-bold uppercase tracking-wider transition-all rounded ${
                                        completedSessions[activeSession.id]
                                            ? "bg-green-600/20 border border-green-500/40 text-green-400 cursor-not-allowed"
                                            : "btn-primary shadow-lg shadow-red-900/30"
                                    }`}
                                    data-testid="mark-complete-btn"
                                >
                                    <CheckCircle2 size={15} />
                                    {completedSessions[activeSession.id] ? "Completed" : "Mark Session Complete"}
                                </button>
                                <button
                                    onClick={() => toast.info("Instructor Q&A support channel is open!")}
                                    className="btn-outline !py-3 !text-xs flex items-center gap-1.5"
                                    data-testid="ask-question-btn"
                                >
                                    <MessageSquare size={14} /> Ask Instructor
                                </button>
                            </div>

                            {/* Learning Objective & Topics */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card-hr p-6 space-y-3">
                                    <div className="eyebrow text-primary font-bold flex items-center gap-1.5">
                                        <Sparkles size={13} /> Learning Goal / Objective
                                    </div>
                                    <p className="text-xs text-white/90 leading-relaxed">
                                        {activeSession.learningObjective || "Master the hand posture and pick attack discipline."}
                                    </p>
                                </div>

                                <div className="card-hr p-6 space-y-3">
                                    <div className="eyebrow text-primary font-bold flex items-center gap-1.5">
                                        <BookOpen size={13} /> Key Topics Covered
                                    </div>
                                    <ul className="space-y-1.5 text-xs text-neutral-300">
                                        {activeSession.topics && activeSession.topics.length > 0 ? (
                                            activeSession.topics.map((t, idx) => (
                                                <li key={idx} className="flex items-start gap-2">
                                                    <span className="text-primary font-bold">•</span>
                                                    <span>{t}</span>
                                                </li>
                                            ))
                                        ) : (
                                            <li>Core exercise breakdowns and rhythm drills.</li>
                                        )}
                                    </ul>
                                </div>
                            </div>

                            {/* Standard 45–60 min Lesson Breakdown */}
                            {activeSession.sessionStructure && (
                                <div className="card-hr p-6 space-y-4">
                                    <div className="eyebrow text-primary font-bold">Standard Session Flow & Practice Breakdown</div>
                                    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="font-bold text-primary text-[10px] uppercase font-mono">1. Warm-up (5m)</div>
                                            <p className="text-[11px] text-neutral-300 mt-1">{activeSession.sessionStructure.warmup}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="font-bold text-primary text-[10px] uppercase font-mono">2. Review (10m)</div>
                                            <p className="text-[11px] text-neutral-300 mt-1">{activeSession.sessionStructure.review}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="font-bold text-primary text-[10px] uppercase font-mono">3. New Concept (20m)</div>
                                            <p className="text-[11px] text-neutral-300 mt-1">{activeSession.sessionStructure.newConcept}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="font-bold text-primary text-[10px] uppercase font-mono">4. Song Practice (15m)</div>
                                            <p className="text-[11px] text-neutral-300 mt-1">{activeSession.sessionStructure.songPractice}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg">
                                            <div className="font-bold text-primary text-[10px] uppercase font-mono">5. Feedback (10m)</div>
                                            <p className="text-[11px] text-neutral-300 mt-1">{activeSession.sessionStructure.feedback}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Practice Homework & Resources */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="card-hr p-6 space-y-3" data-testid="lesson-homework">
                                    <div className="eyebrow text-primary font-bold">Daily Practice & Homework</div>
                                    <p className="text-xs text-white/90 leading-relaxed">
                                        {activeSession.practiceHomework || "Practice 15 minutes daily with metronome to build muscle memory."}
                                    </p>
                                </div>

                                <div className="card-hr p-6 space-y-3" data-testid="lesson-resources">
                                    <div className="eyebrow text-primary font-bold">Downloads & Sheet Music</div>
                                    {(!activeSession.resources || activeSession.resources.length === 0) ? (
                                        <p className="text-xs text-muted-foreground">No attachments for this session.</p>
                                    ) : (
                                        <ul className="space-y-2">
                                            {activeSession.resources.map((r, rIdx) => (
                                                <li key={rIdx}>
                                                    <button
                                                        onClick={() => toast.success(`Downloading ${r}...`)}
                                                        className="w-full flex items-center justify-between gap-3 p-2.5 border border-white/10 hover:border-primary/60 hover:bg-primary/5 transition-all text-left rounded"
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <FileText size={14} className="text-primary" />
                                                            <span className="text-xs font-medium text-white">{r}</span>
                                                        </div>
                                                        <Download size={13} className="text-muted-foreground hover:text-primary" />
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Full Curriculum Hierarchy Sidebar (Level -> Module -> Session) */}
                <aside className="lg:col-span-4 space-y-4" data-testid="curriculum-sidebar">
                    <div className="card-hr p-6 space-y-4">
                        <div className="border-b border-white/10 pb-4">
                            <div className="eyebrow text-primary font-bold">Curriculum Syllabus</div>
                            <h3 className="text-heading font-bold text-lg text-white mt-0.5">{curriculum.title}</h3>
                            <div className="h-1 bg-white/10 rounded-full overflow-hidden mt-3">
                                <div className="h-full bg-primary transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                            </div>
                        </div>

                        {/* Levels List */}
                        <div className="space-y-4 max-h-[650px] overflow-y-auto pr-1">
                            {curriculum.levels?.map((lvl) => {
                                const isLvlExp = Boolean(expandedLevels[lvl.id]);
                                return (
                                    <div key={lvl.id} className="border border-white/10 rounded-lg overflow-hidden bg-black/40">
                                        <button
                                            onClick={() => setExpandedLevels((p) => ({ ...p, [lvl.id]: !p[lvl.id] }))}
                                            className="w-full p-3 bg-white/5 hover:bg-white/10 flex items-center justify-between text-left transition"
                                        >
                                            <div>
                                                <div className="text-[10px] font-mono text-primary font-bold uppercase">
                                                    Level {lvl.levelNumber} · {lvl.duration}
                                                </div>
                                                <div className="font-bold text-xs text-white mt-0.5">{lvl.title}</div>
                                            </div>
                                            {isLvlExp ? <ChevronDown size={14} className="text-neutral-400" /> : <ChevronRight size={14} className="text-neutral-400" />}
                                        </button>

                                        {isLvlExp && (
                                            <div className="p-3 space-y-3">
                                                {lvl.modules?.map((mod) => (
                                                    <div key={mod.id} className="space-y-1.5">
                                                        <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 pt-1 font-mono">
                                                            M{mod.moduleNumber}: {mod.title}
                                                        </div>
                                                        <div className="space-y-1">
                                                            {mod.sessions?.map((ses) => {
                                                                const isSelected = activeSession?.id === ses.id;
                                                                const isDone = completedSessions[ses.id];

                                                                return (
                                                                    <button
                                                                        key={ses.id}
                                                                        onClick={() => setActiveSession(ses)}
                                                                        className={`w-full flex items-center gap-2.5 p-2 rounded text-left text-xs transition ${
                                                                            isSelected
                                                                                ? "bg-primary text-white font-bold shadow-md shadow-red-900/30"
                                                                                : "hover:bg-white/5 text-neutral-300"
                                                                        }`}
                                                                    >
                                                                        {isDone ? (
                                                                            <CheckCircle2 size={14} className={isSelected ? "text-white" : "text-green-500 shrink-0"} />
                                                                        ) : isSelected ? (
                                                                            <Play size={14} className="text-white fill-white shrink-0" />
                                                                        ) : (
                                                                            <Circle size={14} className="text-neutral-500 shrink-0" />
                                                                        )}
                                                                        <span className="truncate flex-1">
                                                                            {ses.title}
                                                                        </span>
                                                                        <span className="text-[10px] opacity-70 font-mono shrink-0">
                                                                            {ses.duration}
                                                                        </span>
                                                                    </button>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
