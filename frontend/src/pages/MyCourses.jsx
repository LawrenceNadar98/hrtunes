import DashboardLayout from "@/components/layout/DashboardLayout";
import { Link } from "react-router-dom";
import { Play, Clock, Users, Star, ArrowRight, Filter } from "lucide-react";
import { COURSES } from "@/lib/mock";
import { useState } from "react";

const FILTERS = ["All", "Guitar", "Keyboard", "Beginner", "Intermediate"];

export default function MyCourses() {
    const [filter, setFilter] = useState("All");
    const filtered = COURSES.filter((c) => {
        if (filter === "All") return true;
        if (filter === "Guitar" || filter === "Keyboard") return c.instrument === filter;
        return c.level === filter;
    });

    return (
        <DashboardLayout subtitle="Your library" title="My Courses">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filtered.map((c) => (
                    <article key={c.id} className="card-hr group overflow-hidden" data-testid={`my-course-${c.id}`}>
                        <div className="relative aspect-video overflow-hidden">
                            <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                            {c.comingSoon ? (
                                <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                                    Coming Soon
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
                            <p className="text-sm text-muted-foreground mt-1">{c.subtitle}</p>
                            <div className="flex items-center gap-4 mt-4 text-xs text-white/60">
                                <span className="flex items-center gap-1.5"><Clock size={12} /> {c.duration}</span>
                                <span className="flex items-center gap-1.5"><Users size={12} /> {c.students}</span>
                                {c.rating > 0 && <span className="flex items-center gap-1.5"><Star size={12} className="text-primary fill-primary" /> {c.rating}</span>}
                            </div>
                            <Link
                                to={c.comingSoon ? "#" : `/dashboard/courses/${c.id}`}
                                className={`mt-6 w-full text-center py-3 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                                    c.comingSoon
                                        ? "border border-white/10 text-muted-foreground cursor-not-allowed"
                                        : "btn-primary"
                                }`}
                                data-testid={`open-course-${c.id}`}
                            >
                                {c.comingSoon ? "Notify me" : (<><Play size={13} /> Continue <ArrowRight size={13} /></>)}
                            </Link>
                        </div>
                    </article>
                ))}
            </div>
        </DashboardLayout>
    );
}
