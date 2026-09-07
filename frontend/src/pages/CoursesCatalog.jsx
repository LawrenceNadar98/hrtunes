import { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { getCourses, getInstruments } from "@/services/courseService";
import { Clock, Users, Star, ArrowRight, Search, Sparkles, Filter, Music, ArrowLeft } from "lucide-react";

export default function CoursesCatalog() {
    const [searchParams, setSearchParams] = useSearchParams();
    const activeInstrumentParam = searchParams.get("instrument") || "all";

    const [courses, setCourses] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInstrument, setSelectedInstrument] = useState(activeInstrumentParam);
    const [searchQuery, setSearchQuery] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (activeInstrumentParam) {
            setSelectedInstrument(activeInstrumentParam);
        }
    }, [activeInstrumentParam]);

    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const [cList, iList] = await Promise.all([
                    getCourses(),
                    getInstruments()
                ]);
                setCourses(cList || []);
                setInstruments(iList || []);
            } catch (err) {
                console.warn("Failed to load courses catalog:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const handleSelectInstrument = (instName) => {
        setSelectedInstrument(instName);
        if (instName === "all") {
            searchParams.delete("instrument");
            setSearchParams(searchParams);
        } else {
            setSearchParams({ instrument: instName });
        }
    };

    const filteredCourses = useMemo(() => {
        return courses.filter((c) => {
            const matchesInstrument =
                selectedInstrument === "all" ||
                c.instrument?.toLowerCase() === selectedInstrument.toLowerCase();

            const matchesSearch =
                !searchQuery ||
                c.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                c.tags?.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
                c.level?.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesInstrument && matchesSearch;
        });
    }, [courses, selectedInstrument, searchQuery]);

    // Unique list of instruments
    const instrumentTabs = useMemo(() => {
        const uniqueFromCourses = Array.from(new Set(courses.map((c) => c.instrument).filter(Boolean)));
        const fromStore = instruments.map((i) => i.name).filter(Boolean);
        const combined = Array.from(new Set(["all", ...fromStore, ...uniqueFromCourses]));
        return combined;
    }, [courses, instruments]);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col" data-testid="courses-catalog-page">
            <SiteHeader />

            <main className="flex-1 py-16 md:py-24">
                <div className="container-hr">
                    {/* Breadcrumbs & Header */}
                    <div className="mb-10">
                        <Link to="/" className="eyebrow inline-flex items-center gap-2 mb-4 hover:text-primary transition-colors">
                            <ArrowLeft size={13} /> Back to Home
                        </Link>
                        <div className="eyebrow mb-2">Curriculum & Courses</div>
                        <h1 className="text-display text-5xl md:text-6xl font-black">
                            Explore <span className="text-primary">Our Courses</span>.
                        </h1>
                        <p className="mt-3 text-white/70 max-w-2xl text-sm md:text-base leading-relaxed">
                            Discover structured learning roadmaps for guitar, keyboard, and performance mastery with step-by-step video lessons and live mentor feedback.
                        </p>
                    </div>

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-10 pb-6 border-b border-white/10">
                        {/* Instrument Tabs */}
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0" data-testid="instrument-filter-tabs">
                            {instrumentTabs.map((inst) => {
                                const isSelected = selectedInstrument.toLowerCase() === inst.toLowerCase();
                                return (
                                    <button
                                        key={inst}
                                        onClick={() => handleSelectInstrument(inst)}
                                        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded-md flex-shrink-0 cursor-pointer ${
                                            isSelected
                                                ? "bg-primary text-white shadow-lg shadow-red-900/30 font-black"
                                                : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                                        }`}
                                        data-testid={`tab-${inst.toLowerCase()}`}
                                    >
                                        {inst === "all" ? "All Instruments" : inst}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Search Input */}
                        <div className="flex items-center gap-2 bg-card border border-white/15 px-3.5 py-2.5 rounded-lg w-full md:w-80">
                            <Search size={15} className="text-muted-foreground" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search courses, tags, level…"
                                className="bg-transparent text-xs text-white outline-none flex-1"
                                data-testid="course-search-input"
                            />
                        </div>
                    </div>

                    {/* Courses Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-pulse">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div key={i} className="card-hr overflow-hidden space-y-4 p-6">
                                    <div className="aspect-video bg-white/5 rounded" />
                                    <div className="h-6 bg-white/10 rounded w-2/3" />
                                    <div className="h-4 bg-white/5 rounded w-1/2" />
                                </div>
                            ))}
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="card-hr p-16 text-center space-y-4">
                            <Music className="w-12 h-12 text-neutral-600 mx-auto" />
                            <h3 className="text-heading font-bold text-xl text-white">No courses found</h3>
                            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
                                No courses match your current instrument selection or search query.
                            </p>
                            <button
                                onClick={() => { setSelectedInstrument("all"); setSearchQuery(""); }}
                                className="btn-primary !py-2 !px-4 text-xs"
                            >
                                Clear Filters
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {filteredCourses.map((course) => (
                                <CourseCatalogCard key={course.id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}

function CourseCatalogCard({ course }) {
    const isComingSoon = Boolean(course.comingSoon);

    return (
        <article
            className="card-hr group relative overflow-hidden flex flex-col justify-between hover:border-primary/50 transition-all duration-300 shadow-xl"
            data-testid={`catalog-card-${course.id}`}
        >
            <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video overflow-hidden bg-black/80">
                    <img
                        src={course.thumbnail || "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {isComingSoon && (
                        <div className="absolute top-3 left-3 bg-primary text-white text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-widest rounded-sm">
                            Coming Soon
                        </div>
                    )}

                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/80 backdrop-blur px-2.5 py-1 border border-white/20 rounded text-[11px] font-bold uppercase tracking-wider text-white">
                        <Music size={12} className="text-primary" />
                        <span>{course.instrument || "Guitar"}</span>
                    </div>
                </div>

                {/* Content Details matching Pic 1 format */}
                <div className="p-6 space-y-4">
                    {/* Tags Box */}
                    <div className="flex flex-wrap gap-1.5">
                        {course.tags && course.tags.length > 0 ? (
                            course.tags.map((t) => (
                                <span
                                    key={t}
                                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-white/20 text-white/90 bg-white/5 rounded-sm"
                                >
                                    {t}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 border border-white/20 text-white/90 bg-white/5 rounded-sm">
                                {course.level || "BEGINNER"}
                            </span>
                        )}
                    </div>

                    <div>
                        <h3 className="text-heading font-black text-2xl text-white group-hover:text-primary transition-colors leading-tight">
                            {course.title}
                        </h3>
                        <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                            {course.subtitle || course.description}
                        </p>
                    </div>

                    {/* Meta information row */}
                    <div className="flex items-center gap-5 text-xs text-white/70 pt-2 border-t border-white/10 font-mono">
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-primary" /> {course.duration || "8 weeks"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={13} className="text-primary" /> {course.students || 0}
                        </span>
                        {(course.rating > 0 || !course.comingSoon) && (
                            <span className="flex items-center gap-1.5">
                                <Star size={13} className="text-primary fill-primary" /> {course.rating || 5.0}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-6 pt-0 flex items-center justify-between gap-3 mt-4">
                <Link
                    to={isComingSoon ? "/signup" : `/dashboard/courses/${course.id}`}
                    className="btn-outline !py-2 !px-3 text-xs font-bold uppercase tracking-wider flex items-center gap-1 hover:border-primary flex-1 justify-center"
                    data-testid={`show-details-${course.id}`}
                >
                    Show More Details
                </Link>
                <Link
                    to={course.price === 0 ? "/book-trial" : `/checkout?plan=${course.id}`}
                    className="btn-primary !py-2 !px-4 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5"
                    data-testid={`enroll-btn-${course.id}`}
                >
                    {course.price === 0 ? "Book Trial" : "Enroll"} <ArrowRight size={13} />
                </Link>
            </div>
        </article>
    );
}
