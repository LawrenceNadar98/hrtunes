import { useState, useEffect } from "react";
import {
    Plus,
    Music,
    BookOpen,
    Edit3,
    Trash2,
    CheckCircle2,
    Sparkles,
    Star,
    Clock,
    Users,
    X,
    ExternalLink,
    Guitar,
    Piano
} from "lucide-react";
import { getCourses, saveCourse, deleteCourse, getInstruments, saveInstrument, deleteInstrument } from "@/services/courseService";
import { getCurriculums } from "@/services/curriculumService";
import { toast } from "sonner";

export default function CoursesAndInstrumentsManager() {
    const [courses, setCourses] = useState([]);
    const [instruments, setInstruments] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);

    const [activeTab, setActiveTab] = useState("courses"); // "courses" | "instruments"

    // Course Edit State
    const [editingCourse, setEditingCourse] = useState(null);
    const [isNewCourse, setIsNewCourse] = useState(false);

    // Instrument Edit State
    const [editingInstrument, setEditingInstrument] = useState(null);
    const [isNewInstrument, setIsNewInstrument] = useState(false);

    const refreshData = async () => {
        setLoading(true);
        try {
            const [cList, iList, currs] = await Promise.all([
                getCourses(),
                getInstruments(),
                getCurriculums()
            ]);
            setCourses(cList || []);
            setInstruments(iList || []);
            setCurriculums(currs || []);
        } catch (err) {
            console.warn("Failed to load course & instrument data:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshData();
    }, []);

    /* ---------- Course Handlers ---------- */
    const handleSaveCourse = async (e) => {
        e.preventDefault();
        try {
            // If featured is true for this course, unfeature other courses with same instrument
            const updated = {
                ...editingCourse,
                tags: typeof editingCourse.tags === "string"
                    ? editingCourse.tags.split(",").map((t) => t.trim().toUpperCase()).filter(Boolean)
                    : editingCourse.tags || []
            };

            await saveCourse(updated);
            toast.success(`Course "${updated.title}" saved successfully!`);
            setEditingCourse(null);
            setIsNewCourse(false);
            await refreshData();
        } catch (err) {
            toast.error("Failed to save course: " + err.message);
        }
    };

    const handleDeleteCourse = async (id, title) => {
        if (!window.confirm(`Delete course "${title}"?`)) return;
        try {
            await deleteCourse(id);
            toast.info(`Course "${title}" removed.`);
            await refreshData();
        } catch (err) {
            toast.error("Failed to delete course: " + err.message);
        }
    };

    /* ---------- Instrument Handlers ---------- */
    const handleSaveInstrument = async (e) => {
        e.preventDefault();
        try {
            await saveInstrument(editingInstrument);
            toast.success(`Instrument "${editingInstrument.name}" saved!`);
            setEditingInstrument(null);
            setIsNewInstrument(false);
            await refreshData();
        } catch (err) {
            toast.error("Failed to save instrument: " + err.message);
        }
    };

    const handleDeleteInstrument = async (id, name) => {
        if (!window.confirm(`Delete instrument "${name}"? Courses under this instrument will remain.`)) return;
        try {
            await deleteInstrument(id);
            toast.info(`Instrument "${name}" deleted.`);
            await refreshData();
        } catch (err) {
            toast.error("Failed to delete instrument: " + err.message);
        }
    };

    return (
        <div className="space-y-6" data-testid="courses-and-instruments-manager">
            {/* Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-heading font-bold text-xl text-white">Courses & Instruments Manager</h3>
                    <p className="text-xs text-muted-foreground">
                        Create instruments and courses. Exactly 1 featured course per instrument will be presented on the landing page's <strong>"Pick your instrument"</strong> section.
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    {activeTab === "courses" ? (
                        <button
                            className="btn-primary !py-2 text-xs flex items-center gap-1.5"
                            onClick={() => {
                                setIsNewCourse(true);
                                setEditingCourse({
                                    id: "course-" + Date.now(),
                                    title: "New Course",
                                    subtitle: "Strum your first song in 14 days",
                                    instrument: instruments[0]?.name || "Guitar",
                                    level: "Beginner",
                                    duration: "8 weeks",
                                    lessons: 24,
                                    students: 0,
                                    rating: 4.9,
                                    price: 7500,
                                    thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
                                    tags: ["BEGINNER", "ACOUSTIC", "HINDI / ENGLISH"],
                                    featured: true,
                                    comingSoon: false,
                                    description: "Structured progressive learning with hands-on practice."
                                });
                            }}
                            data-testid="create-course-btn"
                        >
                            <Plus size={14} /> Create Course
                        </button>
                    ) : (
                        <button
                            className="btn-primary !py-2 text-xs flex items-center gap-1.5"
                            onClick={() => {
                                setIsNewInstrument(true);
                                setEditingInstrument({
                                    id: "inst-" + Date.now(),
                                    name: "Drums",
                                    icon: "Music",
                                    description: "Rhythm, rudiments, and drum kit coordination.",
                                    coverImage: "https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?auto=format&fit=crop&w=1200&q=80"
                                });
                            }}
                            data-testid="create-instrument-btn"
                        >
                            <Plus size={14} /> Add New Instrument
                        </button>
                    )}
                </div>
            </div>

            {/* Manager Tabs */}
            <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <button
                    onClick={() => setActiveTab("courses")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition ${
                        activeTab === "courses" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
                    }`}
                    data-testid="tab-manager-courses"
                >
                    Courses List ({courses.length})
                </button>
                <button
                    onClick={() => setActiveTab("instruments")}
                    className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition ${
                        activeTab === "instruments" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
                    }`}
                    data-testid="tab-manager-instruments"
                >
                    Instruments ({instruments.length})
                </button>
            </div>

            {/* EDIT COURSE MODAL/DRAWER */}
            {editingCourse && (
                <div className="card-hr p-6 border-primary/50 bg-card/95 shadow-2xl mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <Sparkles size={16} />
                            <span>{isNewCourse ? "Create New Course" : `Edit Course: ${editingCourse.title}`}</span>
                        </div>
                        <button onClick={() => setEditingCourse(null)} className="text-muted-foreground hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveCourse} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="eyebrow block mb-1">Course Title</label>
                            <input
                                required
                                value={editingCourse.title}
                                onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                placeholder="e.g. Guitar Foundations"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Subtitle / Tagline (Pic 1 Style)</label>
                            <input
                                required
                                value={editingCourse.subtitle || ""}
                                onChange={(e) => setEditingCourse({ ...editingCourse, subtitle: e.target.value })}
                                placeholder="e.g. Strum your first song in 14 days"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Instrument</label>
                            <select
                                value={editingCourse.instrument || "Guitar"}
                                onChange={(e) => setEditingCourse({ ...editingCourse, instrument: e.target.value })}
                                className="form-input bg-card text-white"
                            >
                                {instruments.map((i) => (
                                    <option key={i.id} value={i.name} className="bg-neutral-900 text-white">
                                        {i.name}
                                    </option>
                                ))}
                                {!instruments.some((i) => i.name === editingCourse.instrument) && (
                                    <option value={editingCourse.instrument} className="bg-neutral-900 text-white">
                                        {editingCourse.instrument}
                                    </option>
                                )}
                            </select>
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Level</label>
                            <input
                                value={editingCourse.level || "Beginner"}
                                onChange={(e) => setEditingCourse({ ...editingCourse, level: e.target.value })}
                                placeholder="e.g. Beginner, Intermediate"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Tags (Comma Separated - e.g. BEGINNER, ACOUSTIC, HINDI / ENGLISH)</label>
                            <input
                                value={Array.isArray(editingCourse.tags) ? editingCourse.tags.join(", ") : editingCourse.tags || ""}
                                onChange={(e) => setEditingCourse({ ...editingCourse, tags: e.target.value })}
                                placeholder="BEGINNER, ACOUSTIC, HINDI / ENGLISH"
                                className="form-input font-mono"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Duration</label>
                            <input
                                value={editingCourse.duration || "8 weeks"}
                                onChange={(e) => setEditingCourse({ ...editingCourse, duration: e.target.value })}
                                placeholder="e.g. 8 weeks, 12 weeks"
                                className="form-input font-mono"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Star Rating</label>
                            <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={editingCourse.rating ?? 4.9}
                                onChange={(e) => setEditingCourse({ ...editingCourse, rating: Number(e.target.value) })}
                                className="form-input font-mono"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Enrolled Students (Display Number)</label>
                            <input
                                type="number"
                                min="0"
                                value={editingCourse.students ?? 0}
                                onChange={(e) => setEditingCourse({ ...editingCourse, students: Number(e.target.value) })}
                                className="form-input font-mono"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="eyebrow block mb-1">Cover Image / Thumbnail URL</label>
                            <input
                                value={editingCourse.thumbnail || ""}
                                onChange={(e) => setEditingCourse({ ...editingCourse, thumbnail: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="form-input font-mono text-[11px]"
                            />
                        </div>

                        <div className="flex items-center gap-6 pt-2 md:col-span-2">
                            <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(editingCourse.featured)}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, featured: e.target.checked })}
                                    className="accent-red-600 w-4 h-4"
                                />
                                Featured on "Pick Your Instrument" (1 per instrument)
                            </label>

                            <label className="flex items-center gap-2 text-white font-bold cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={Boolean(editingCourse.comingSoon)}
                                    onChange={(e) => setEditingCourse({ ...editingCourse, comingSoon: e.target.checked })}
                                    className="accent-red-600 w-4 h-4"
                                />
                                Mark as "Coming Soon"
                            </label>
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                            {!isNewCourse ? (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteCourse(editingCourse.id, editingCourse.title)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setEditingCourse(null)} className="btn-outline !py-2 !text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary !py-2 !text-xs">
                                    Save Course to DB
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* EDIT INSTRUMENT MODAL */}
            {editingInstrument && (
                <div className="card-hr p-6 border-primary/50 bg-card/95 shadow-2xl mb-6">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                            <Music size={16} />
                            <span>{isNewInstrument ? "Add New Instrument" : `Edit Instrument: ${editingInstrument.name}`}</span>
                        </div>
                        <button onClick={() => setEditingInstrument(null)} className="text-muted-foreground hover:text-white">
                            <X size={16} />
                        </button>
                    </div>

                    <form onSubmit={handleSaveInstrument} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                            <label className="eyebrow block mb-1">Instrument Name</label>
                            <input
                                required
                                value={editingInstrument.name}
                                onChange={(e) => setEditingInstrument({ ...editingInstrument, name: e.target.value })}
                                placeholder="e.g. Drums, Vocals, Bass"
                                className="form-input"
                            />
                        </div>

                        <div>
                            <label className="eyebrow block mb-1">Icon Keyword (Guitar, Piano, Music)</label>
                            <input
                                value={editingInstrument.icon || "Music"}
                                onChange={(e) => setEditingInstrument({ ...editingInstrument, icon: e.target.value })}
                                placeholder="Guitar, Piano, or Music"
                                className="form-input"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="eyebrow block mb-1">Short Description</label>
                            <input
                                value={editingInstrument.description || ""}
                                onChange={(e) => setEditingInstrument({ ...editingInstrument, description: e.target.value })}
                                placeholder="Brief summary of learning roadmaps for this instrument"
                                className="form-input"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="eyebrow block mb-1">Cover Image URL</label>
                            <input
                                value={editingInstrument.coverImage || ""}
                                onChange={(e) => setEditingInstrument({ ...editingInstrument, coverImage: e.target.value })}
                                placeholder="https://images.unsplash.com/..."
                                className="form-input font-mono text-[11px]"
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center justify-between pt-4 border-t border-white/10 mt-2">
                            {!isNewInstrument ? (
                                <button
                                    type="button"
                                    onClick={() => handleDeleteInstrument(editingInstrument.id, editingInstrument.name)}
                                    className="px-3 py-1.5 bg-red-600/20 text-red-400 border border-red-500/30 rounded flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} /> Delete
                                </button>
                            ) : <div />}

                            <div className="flex items-center gap-2">
                                <button type="button" onClick={() => setEditingInstrument(null)} className="btn-outline !py-2 !text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary !py-2 !text-xs">
                                    Save Instrument
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* TAB CONTENT 1: COURSES */}
            {activeTab === "courses" && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map((c) => {
                        return (
                            <div
                                key={c.id}
                                className={`card-hr p-6 flex flex-col justify-between relative transition-all border ${
                                    c.featured ? "border-primary bg-primary/5" : "border-white/10 hover:border-white/30"
                                }`}
                                data-testid={`admin-course-${c.id}`}
                            >
                                <div>
                                    {/* Top Tag & Instrument */}
                                    <div className="flex items-center justify-between gap-2 mb-3">
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/5 border border-white/15 text-primary rounded">
                                            {c.instrument || "Guitar"}
                                        </span>
                                        {c.featured && (
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-primary text-white rounded">
                                                Featured in Pick Instrument
                                            </span>
                                        )}
                                    </div>

                                    {/* Tags Row */}
                                    <div className="flex flex-wrap gap-1 mb-2">
                                        {c.tags?.map((t) => (
                                            <span key={t} className="text-[9px] font-mono uppercase px-1.5 py-0.5 border border-white/15 text-neutral-300 rounded-sm">
                                                {t}
                                            </span>
                                        ))}
                                    </div>

                                    <h4 className="text-heading font-black text-xl text-white mt-1">{c.title}</h4>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.subtitle}</p>

                                    {/* Meta Row */}
                                    <div className="flex items-center gap-4 text-xs text-white/60 mt-4 pt-3 border-t border-white/10 font-mono">
                                        <span className="flex items-center gap-1"><Clock size={12} className="text-primary" /> {c.duration || "8 weeks"}</span>
                                        <span className="flex items-center gap-1"><Users size={12} className="text-primary" /> {c.students || 0}</span>
                                        <span className="flex items-center gap-1"><Star size={12} className="text-primary fill-primary" /> {c.rating || 5.0}</span>
                                    </div>
                                </div>

                                <div className="mt-6 pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase truncate max-w-[120px]">{c.id}</span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleDeleteCourse(c.id, c.title)}
                                            className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                                            title="Delete Course"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsNewCourse(false);
                                                setEditingCourse(c);
                                            }}
                                            className="btn-outline !py-1 !px-3 !text-xs flex items-center gap-1"
                                        >
                                            <Edit3 size={12} /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* TAB CONTENT 2: INSTRUMENTS */}
            {activeTab === "instruments" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {instruments.map((inst) => {
                        const count = courses.filter((c) => c.instrument?.toLowerCase() === inst.name?.toLowerCase()).length;
                        return (
                            <div key={inst.id} className="card-hr p-6 flex flex-col justify-between space-y-4">
                                <div>
                                    <div className="flex items-center justify-between">
                                        <div className="w-10 h-10 bg-primary/15 border border-primary/30 rounded flex items-center justify-center text-primary">
                                            {inst.name === "Guitar" ? <Guitar size={20} /> : inst.name === "Keyboard" ? <Piano size={20} /> : <Music size={20} />}
                                        </div>
                                        <span className="text-xs font-mono text-neutral-400 bg-white/5 px-2 py-1 rounded">
                                            {count} {count === 1 ? "course" : "courses"}
                                        </span>
                                    </div>

                                    <h4 className="text-heading font-black text-xl text-white mt-3">{inst.name}</h4>
                                    <p className="text-xs text-muted-foreground mt-1">{inst.description}</p>
                                </div>

                                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                                    <span className="text-[10px] font-mono text-neutral-500 uppercase">{inst.id}</span>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => handleDeleteInstrument(inst.id, inst.name)}
                                            className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                                        >
                                            <Trash2 size={13} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                setIsNewInstrument(false);
                                                setEditingInstrument(inst);
                                            }}
                                            className="btn-outline !py-1 !px-3 !text-xs flex items-center gap-1"
                                        >
                                            <Edit3 size={12} /> Edit
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
