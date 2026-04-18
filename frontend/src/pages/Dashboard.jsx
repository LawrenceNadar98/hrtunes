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
} from "lucide-react";
import { COURSES, LIVE_CLASSES, RECENT_ACTIVITY } from "@/lib/mock";

export default function Dashboard() {
    const enrolled = COURSES.filter((c) => !c.comingSoon);
    const upcoming = LIVE_CLASSES.filter((l) => l.status === "upcoming").slice(0, 3);
    return (
        <DashboardLayout
            subtitle="Welcome back, Aarav"
            title="Let's play."
            actions={
                <Link to="/dashboard/live" className="btn-primary" data-testid="dashboard-join-live">
                    <Radio size={15} /> Join next live class
                </Link>
            }
        >
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10" data-testid="stats-grid">
                <StatCard icon={Flame} label="Practice streak" value="7 days" accent />
                <StatCard icon={Clock} label="Hours logged" value="42.5" />
                <StatCard icon={Trophy} label="Lessons done" value="18 / 54" />
                <StatCard icon={Music2} label="Songs learned" value="5" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Enrolled courses */}
                <section className="lg:col-span-2" data-testid="enrolled-courses">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-heading font-bold text-xl">Continue Learning</h2>
                        <Link to="/dashboard/courses" className="text-xs font-bold uppercase tracking-widest hover:text-primary">
                            View all →
                        </Link>
                    </div>
                    <div className="space-y-4">
                        {enrolled.map((c) => (
                            <Link
                                to={`/dashboard/courses/${c.id}`}
                                key={c.id}
                                className="card-hr flex flex-col sm:flex-row overflow-hidden group"
                                data-testid={`continue-card-${c.id}`}
                            >
                                <div className="sm:w-56 relative aspect-video sm:aspect-auto overflow-hidden">
                                    <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 bg-primary flex items-center justify-center">
                                            <Play size={18} className="fill-white text-white" />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex-1 p-5 flex flex-col">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary">{c.level}</span>
                                        <span className="text-muted-foreground text-xs">· {c.instrument}</span>
                                    </div>
                                    <h3 className="text-heading font-bold text-lg">{c.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1">{c.subtitle}</p>
                                    <div className="mt-auto pt-4">
                                        <div className="flex items-center justify-between text-xs mb-2">
                                            <span className="text-muted-foreground">Progress</span>
                                            <span className="font-bold">{c.progress}%</span>
                                        </div>
                                        <div className="h-1 bg-white/10 overflow-hidden">
                                            <div className="h-full bg-primary transition-all" style={{ width: `${c.progress}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Upcoming & activity */}
                <aside className="space-y-6">
                    <div className="card-hr p-6" data-testid="upcoming-live">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-heading font-bold text-lg">Upcoming Live</h3>
                            <Radio size={16} className="text-primary" />
                        </div>
                        <div className="space-y-4">
                            {upcoming.map((l) => (
                                <div key={l.id} className="border-l-2 border-primary pl-4">
                                    <div className="text-xs font-mono text-primary">
                                        {new Date(l.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · {l.time}
                                    </div>
                                    <div className="font-bold text-sm mt-1">{l.title}</div>
                                    <div className="text-xs text-muted-foreground">{l.course} · {l.duration} min</div>
                                </div>
                            ))}
                        </div>
                        <Link to="/dashboard/live" className="mt-5 w-full text-center block text-xs font-bold uppercase tracking-widest py-3 border border-white/20 hover:bg-white hover:text-black transition-colors">
                            View schedule
                        </Link>
                    </div>

                    <div className="card-hr p-6" data-testid="recent-activity">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-heading font-bold text-lg">Recent Activity</h3>
                            <ClipboardList size={16} className="text-primary" />
                        </div>
                        <ul className="space-y-4">
                            {RECENT_ACTIVITY.map((a) => (
                                <li key={a.id} className="flex items-start gap-3">
                                    <div className="w-1.5 h-1.5 bg-primary mt-2" />
                                    <div className="flex-1">
                                        <div className="text-sm">{a.text}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">{a.time}</div>
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
