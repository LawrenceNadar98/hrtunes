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
} from "lucide-react";
import { COURSES } from "@/lib/mock";
import { useState } from "react";
import { toast } from "sonner";

export default function CourseDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const course = COURSES.find((c) => c.id === id);

    const [localCourse, setLocalCourse] = useState(course);
    const firstIncomplete = localCourse?.modules
        .flatMap((m) => m.lessons)
        .find((l) => !l.completed);

    const [activeLesson, setActiveLesson] = useState(
        firstIncomplete || localCourse?.modules?.[0]?.lessons?.[0]
    );

    if (!course) {
        return (
            <DashboardLayout title="Course not found">
                <Link to="/dashboard/courses" className="btn-outline">← Back to courses</Link>
            </DashboardLayout>
        );
    }

    const markComplete = () => {
        const updated = {
            ...localCourse,
            modules: localCourse.modules.map((m) => ({
                ...m,
                lessons: m.lessons.map((l) =>
                    l.id === activeLesson.id ? { ...l, completed: true } : l
                ),
            })),
        };
        setLocalCourse(updated);
        setActiveLesson({ ...activeLesson, completed: true });
        toast.success("Lesson marked complete!");
    };

    const totalLessons = localCourse.modules.reduce((s, m) => s + m.lessons.length, 0);
    const completedLessons = localCourse.modules.reduce(
        (s, m) => s + m.lessons.filter((l) => l.completed).length,
        0
    );
    const progress = Math.round((completedLessons / totalLessons) * 100);

    return (
        <DashboardLayout>
            <button
                onClick={() => navigate(-1)}
                className="eyebrow flex items-center gap-2 mb-6 hover:text-primary transition-colors"
                data-testid="course-back"
            >
                <ArrowLeft size={14} /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Player + details */}
                <div className="lg:col-span-8" data-testid="player-column">
                    <div className="aspect-video bg-black border border-white/10 overflow-hidden relative group">
                        <iframe
                            key={activeLesson.id}
                            src={`https://www.youtube.com/embed/${activeLesson.videoId}?rel=0&autoplay=0`}
                            className="w-full h-full"
                            title={activeLesson.title}
                            allowFullScreen
                            data-testid="lesson-video"
                        />
                    </div>

                    <div className="mt-6 flex flex-wrap items-start gap-2">
                        {localCourse.tags.map((t) => (
                            <span key={t} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-white/20">
                                {t}
                            </span>
                        ))}
                    </div>

                    <h1 className="text-display text-4xl md:text-5xl leading-none mt-4">
                        {activeLesson.title}
                    </h1>
                    <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Clock size={13} /> {activeLesson.duration}</span>
                        <span>·</span>
                        <span>{localCourse.title}</span>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={markComplete}
                            disabled={activeLesson.completed}
                            className={`inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                activeLesson.completed
                                    ? "bg-green-600/20 border border-green-500/40 text-green-400 cursor-not-allowed"
                                    : "bg-primary text-white hover:brightness-110"
                            }`}
                            data-testid="mark-complete-btn"
                        >
                            {activeLesson.completed ? (
                                <><CheckCircle2 size={16} /> Completed</>
                            ) : (
                                <><CheckCircle2 size={16} /> Mark Lesson Complete</>
                            )}
                        </button>
                        <button className="btn-outline" data-testid="ask-question-btn">
                            <MessageSquare size={14} /> Ask a question
                        </button>
                    </div>

                    {/* Notes & resources */}
                    <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 card-hr p-6" data-testid="lesson-notes">
                            <div className="eyebrow mb-4">Lesson Notes</div>
                            <p className="text-white/85 leading-relaxed">{activeLesson.notes}</p>
                        </div>
                        <div className="card-hr p-6" data-testid="lesson-resources">
                            <div className="eyebrow mb-4">Downloads</div>
                            {activeLesson.resources.length === 0 ? (
                                <p className="text-sm text-muted-foreground">No files for this lesson.</p>
                            ) : (
                                <ul className="space-y-2">
                                    {activeLesson.resources.map((r) => (
                                        <li key={r}>
                                            <button className="w-full flex items-center justify-between gap-3 p-3 border border-white/10 hover:border-primary/60 hover:bg-primary/5 transition-all group text-left">
                                                <div className="flex items-center gap-3">
                                                    <FileText size={15} className="text-primary" />
                                                    <span className="text-sm font-medium">{r}</span>
                                                </div>
                                                <Download size={14} className="text-muted-foreground group-hover:text-primary" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>

                {/* Curriculum */}
                <aside className="lg:col-span-4" data-testid="curriculum">
                    <div className="card-hr p-6">
                        <div className="flex items-baseline justify-between mb-4">
                            <div>
                                <div className="eyebrow">Curriculum</div>
                                <div className="text-heading font-bold text-lg mt-1">{localCourse.title}</div>
                            </div>
                            <div className="text-right">
                                <div className="text-heading font-black text-2xl">{progress}%</div>
                                <div className="text-[10px] text-muted-foreground uppercase tracking-widest">done</div>
                            </div>
                        </div>
                        <div className="h-1 bg-white/10 overflow-hidden mb-6">
                            <div className="h-full bg-primary transition-all" style={{ width: `${progress}%` }} />
                        </div>
                        <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
                            {localCourse.modules.map((m, mi) => (
                                <div key={m.id}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-mono text-primary">M{mi + 1}</span>
                                        <h4 className="font-bold text-sm uppercase tracking-wider">{m.title}</h4>
                                    </div>
                                    <ul className="space-y-1">
                                        {m.lessons.map((l) => (
                                            <li key={l.id}>
                                                <button
                                                    onClick={() => setActiveLesson(l)}
                                                    className={`w-full flex items-center gap-3 p-3 text-left transition-all ${
                                                        activeLesson.id === l.id
                                                            ? "bg-primary/10 border-l-2 border-primary"
                                                            : "border-l-2 border-transparent hover:bg-white/5"
                                                    }`}
                                                    data-testid={`lesson-${l.id}`}
                                                >
                                                    {l.completed ? (
                                                        <CheckCircle2 size={16} className="text-green-500 flex-shrink-0" />
                                                    ) : activeLesson.id === l.id ? (
                                                        <Play size={16} className="text-primary fill-primary flex-shrink-0" />
                                                    ) : (
                                                        <Circle size={16} className="text-muted-foreground flex-shrink-0" />
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-sm font-medium truncate">{l.title}</div>
                                                        <div className="text-[11px] text-muted-foreground">{l.duration}</div>
                                                    </div>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                </aside>
            </div>
        </DashboardLayout>
    );
}
