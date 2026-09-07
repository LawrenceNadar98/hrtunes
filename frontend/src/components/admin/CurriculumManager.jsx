import { useState, useEffect } from "react";
import {
    Plus,
    BookOpen,
    Layers,
    ChevronDown,
    ChevronUp,
    ChevronRight,
    ArrowLeft,
    Check,
    FileText,
    Video,
    Trash2,
    Edit3,
    ArrowUp,
    ArrowDown,
    Sparkles,
    Shield,
    X,
    CheckCircle2,
    Clock,
    Search,
    ExternalLink,
    Music2
} from "lucide-react";
import {
    getCurriculums,
    getCurriculumById,
    saveCurriculum,
    deleteCurriculum,
    assignCurriculumToPlans
} from "@/services/curriculumService";
import { getPlans } from "@/services/courseService";
import { toast } from "sonner";

export default function CurriculumManager() {
    const [curriculums, setCurriculums] = useState([]);
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCurriculum, setSelectedCurriculum] = useState(null); // When inside Builder mode
    const [builderTab, setBuilderTab] = useState("tree"); // "tree" | "plans" | "settings"
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");

    // Tree accordion state (Levels & Modules expanded)
    const [expandedLevels, setExpandedLevels] = useState({});
    const [expandedModules, setExpandedModules] = useState({});

    // Modals
    const [isCreateCurriculumOpen, setIsCreateCurriculumOpen] = useState(false);
    const [editingLevel, setEditingLevel] = useState(null); // null or { level, isNew }
    const [editingModule, setEditingModule] = useState(null); // null or { levelId, module, isNew }
    const [editingSession, setEditingSession] = useState(null); // null or { levelId, moduleId, session, isNew }
    const [planAccessModalCurriculum, setPlanAccessModalCurriculum] = useState(null);

    const refreshData = async () => {
        setLoading(true);
        const [cList, pList] = await Promise.all([getCurriculums(), getPlans()]);
        setCurriculums(cList || []);
        setPlans(pList || []);
        if (selectedCurriculum) {
            const updated = cList.find((c) => c.id === selectedCurriculum.id);
            if (updated) setSelectedCurriculum(updated);
        }
        setLoading(false);
    };

    useEffect(() => {
        refreshData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Expand all levels and modules by default when opening a curriculum
    const openCurriculumBuilder = (curr) => {
        setSelectedCurriculum(curr);
        const lExp = {};
        const mExp = {};
        curr.levels?.forEach((lvl, li) => {
            lExp[lvl.id] = true;
            lvl.modules?.forEach((mod) => {
                mExp[mod.id] = true;
            });
        });
        setExpandedLevels(lExp);
        setExpandedModules(mExp);
        setBuilderTab("tree");
    };

    const toggleLevel = (lvlId) => {
        setExpandedLevels((prev) => ({ ...prev, [lvlId]: !prev[lvlId] }));
    };

    const toggleModule = (modId) => {
        setExpandedModules((prev) => ({ ...prev, [modId]: !prev[modId] }));
    };

    // Helper: Save active curriculum tree
    const updateActiveCurriculum = async (updatedCurr) => {
        setSelectedCurriculum(updatedCurr);
        await saveCurriculum(updatedCurr);
        const all = await getCurriculums();
        setCurriculums(all);
    };

    // Level Operations
    const handleSaveLevel = async (levelData, isNew) => {
        const curr = { ...selectedCurriculum };
        curr.levels = curr.levels || [];
        if (isNew) {
            const newLvl = {
                id: "lvl-" + Date.now(),
                levelNumber: curr.levels.length + 1,
                title: levelData.title,
                duration: levelData.duration || "Months 1–3",
                description: levelData.description || "",
                learningObjectives: levelData.learningObjectives || "",
                status: levelData.status || "active",
                modules: []
            };
            curr.levels.push(newLvl);
            setExpandedLevels((prev) => ({ ...prev, [newLvl.id]: true }));
            toast.success(`Level "${newLvl.title}" created!`);
        } else {
            const idx = curr.levels.findIndex((l) => l.id === levelData.id);
            if (idx >= 0) {
                curr.levels[idx] = { ...curr.levels[idx], ...levelData };
                toast.success(`Level updated!`);
            }
        }
        await updateActiveCurriculum(curr);
        setEditingLevel(null);
    };

    const handleDeleteLevel = async (levelId) => {
        if (!window.confirm("Are you sure you want to delete this level and all its modules and sessions?")) return;
        const curr = { ...selectedCurriculum };
        curr.levels = curr.levels.filter((l) => l.id !== levelId);
        // Re-number
        curr.levels.forEach((l, i) => { l.levelNumber = i + 1; });
        await updateActiveCurriculum(curr);
        toast.info("Level deleted.");
    };

    const handleMoveLevel = async (index, direction) => {
        const curr = { ...selectedCurriculum };
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= curr.levels.length) return;
        const temp = curr.levels[index];
        curr.levels[index] = curr.levels[targetIndex];
        curr.levels[targetIndex] = temp;
        curr.levels.forEach((l, i) => { l.levelNumber = i + 1; });
        await updateActiveCurriculum(curr);
    };

    // Module Operations
    const handleSaveModule = async (levelId, moduleData, isNew) => {
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        lvl.modules = lvl.modules || [];

        if (isNew) {
            const newMod = {
                id: "mod-" + Date.now(),
                moduleNumber: lvl.modules.length + 1,
                title: moduleData.title,
                description: moduleData.description || "",
                learningGoal: moduleData.learningGoal || "",
                status: moduleData.status || "active",
                sessions: []
            };
            lvl.modules.push(newMod);
            setExpandedModules((prev) => ({ ...prev, [newMod.id]: true }));
            toast.success(`Module "${newMod.title}" added!`);
        } else {
            const idx = lvl.modules.findIndex((m) => m.id === moduleData.id);
            if (idx >= 0) {
                lvl.modules[idx] = { ...lvl.modules[idx], ...moduleData };
                toast.success("Module updated!");
            }
        }
        await updateActiveCurriculum(curr);
        setEditingModule(null);
    };

    const handleDeleteModule = async (levelId, moduleId) => {
        if (!window.confirm("Delete this module and all its sessions?")) return;
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        lvl.modules = lvl.modules.filter((m) => m.id !== moduleId);
        lvl.modules.forEach((m, i) => { m.moduleNumber = i + 1; });
        await updateActiveCurriculum(curr);
        toast.info("Module deleted.");
    };

    const handleMoveModule = async (levelId, index, direction) => {
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= lvl.modules.length) return;
        const temp = lvl.modules[index];
        lvl.modules[index] = lvl.modules[targetIndex];
        lvl.modules[targetIndex] = temp;
        lvl.modules.forEach((m, i) => { m.moduleNumber = i + 1; });
        await updateActiveCurriculum(curr);
    };

    // Session Operations
    const handleSaveSession = async (levelId, moduleId, sessionData, isNew) => {
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        const mod = lvl.modules.find((m) => m.id === moduleId);
        if (!mod) return;
        mod.sessions = mod.sessions || [];

        if (isNew) {
            const newSes = {
                id: "ses-" + Date.now(),
                sessionNumber: mod.sessions.length + 1,
                title: sessionData.title,
                duration: sessionData.duration || "60 minutes",
                topics: sessionData.topics || [],
                learningObjective: sessionData.learningObjective || "",
                practiceHomework: sessionData.practiceHomework || "",
                videoId: sessionData.videoId || "jNQXAC9IVRw",
                resources: sessionData.resources || [],
                sessionStructure: sessionData.sessionStructure || {
                    warmup: "Tuning and stretches (5 min)",
                    review: "Review previous session drills (10 min)",
                    newConcept: "Core lesson concept & technique (20 min)",
                    songPractice: "Practical song application (15 min)",
                    feedback: "Live assessment & Q&A (10 min)"
                },
                status: sessionData.status || "published"
            };
            mod.sessions.push(newSes);
            toast.success(`Session "${newSes.title}" created!`);
        } else {
            const idx = mod.sessions.findIndex((s) => s.id === sessionData.id);
            if (idx >= 0) {
                mod.sessions[idx] = { ...mod.sessions[idx], ...sessionData };
                toast.success(`Session updated!`);
            }
        }
        await updateActiveCurriculum(curr);
        setEditingSession(null);
    };

    const handleDeleteSession = async (levelId, moduleId, sessionId) => {
        if (!window.confirm("Delete this session?")) return;
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        const mod = lvl.modules.find((m) => m.id === moduleId);
        if (!mod) return;
        mod.sessions = mod.sessions.filter((s) => s.id !== sessionId);
        mod.sessions.forEach((s, i) => { s.sessionNumber = i + 1; });
        await updateActiveCurriculum(curr);
        toast.info("Session deleted.");
    };

    const handleMoveSession = async (levelId, moduleId, index, direction) => {
        const curr = { ...selectedCurriculum };
        const lvl = curr.levels.find((l) => l.id === levelId);
        if (!lvl) return;
        const mod = lvl.modules.find((m) => m.id === moduleId);
        if (!mod) return;
        const targetIndex = index + direction;
        if (targetIndex < 0 || targetIndex >= mod.sessions.length) return;
        const temp = mod.sessions[index];
        mod.sessions[index] = mod.sessions[targetIndex];
        mod.sessions[targetIndex] = temp;
        mod.sessions.forEach((s, i) => { s.sessionNumber = i + 1; });
        await updateActiveCurriculum(curr);
    };

    // Plan Access Assignment
    const handleTogglePlanAccess = async (curriculumId, planId) => {
        const curr = curriculums.find((c) => c.id === curriculumId);
        if (!curr) return;
        let assigned = curr.assignedPlanIds ? [...curr.assignedPlanIds] : [];
        if (assigned.includes(planId)) {
            assigned = assigned.filter((id) => id !== planId);
        } else {
            assigned.push(planId);
        }
        await assignCurriculumToPlans(curriculumId, assigned);
        toast.success("Plan access updated!");
        await refreshData();
    };

    const filteredCurriculums = curriculums.filter((c) => {
        const matchFilter = filter === "all" ? true : c.status === filter;
        const matchSearch =
            c.title?.toLowerCase().includes(search.toLowerCase()) ||
            c.description?.toLowerCase().includes(search.toLowerCase());
        return matchFilter && matchSearch;
    });

    return (
        <div className="space-y-6" data-testid="admin-curriculum-manager">
            {/* VIEW 1: CURRICULUM LIST VIEW */}
            {!selectedCurriculum ? (
                <>
                    {/* Header Controls */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h3 className="text-heading font-bold text-xl text-white">Curriculum & Courses</h3>
                            <p className="text-xs text-muted-foreground">
                                Manage your guitar courses, multi-level curriculum (Levels &rarr; Modules &rarr; Sessions), and subscription plan entitlements.
                            </p>
                        </div>
                        <button
                            className="btn-primary !py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                            onClick={() => setIsCreateCurriculumOpen(true)}
                            data-testid="create-curriculum-btn"
                        >
                            <Plus size={14} /> Create Curriculum
                        </button>
                    </div>

                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
                            {["all", "published", "draft"].map((st) => (
                                <button
                                    key={st}
                                    onClick={() => setFilter(st)}
                                    className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition ${
                                        filter === st
                                            ? "bg-primary text-white"
                                            : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                                    }`}
                                >
                                    {st === "all" ? "All Curricula" : st}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 bg-card border border-white/15 px-3 py-2 rounded-lg flex-1 max-w-sm">
                            <Search size={14} className="text-muted-foreground" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search curriculum title or topic…"
                                className="bg-transparent text-xs text-white outline-none flex-1"
                            />
                        </div>
                    </div>

                    {/* Curricula Cards */}
                    {loading ? (
                        <div className="p-12 text-center text-muted-foreground text-sm flex items-center justify-center gap-2">
                            <Sparkles className="w-4 h-4 animate-spin text-primary" /> Loading curricula...
                        </div>
                    ) : filteredCurriculums.length === 0 ? (
                        <div className="card-hr p-12 text-center text-muted-foreground text-sm">
                            <BookOpen className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                            No curricula found. Click <strong>"Create Curriculum"</strong> to start building.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {filteredCurriculums.map((c) => {
                                const totalLevels = c.levels?.length || 0;
                                const totalModules = c.levels?.reduce((sum, l) => sum + (l.modules?.length || 0), 0) || 0;
                                const totalSessions = c.levels?.reduce(
                                    (sum, l) => sum + (l.modules?.reduce((mSum, m) => mSum + (m.sessions?.length || 0), 0) || 0),
                                    0
                                ) || 0;

                                return (
                                    <div key={c.id} className="card-hr p-6 flex flex-col justify-between hover:border-white/20 transition-all group">
                                        <div className="space-y-4">
                                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-9 h-9 bg-primary/10 border border-primary/30 flex items-center justify-center text-primary font-bold text-sm">
                                                        <Music2 size={18} />
                                                    </span>
                                                    <div>
                                                        <h4 className="text-heading font-bold text-xl text-white group-hover:text-primary transition-colors">
                                                            {c.title}
                                                        </h4>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                                            <span className="font-mono text-primary font-bold">{c.instrument || "Guitar"}</span>
                                                            <span>·</span>
                                                            <span>Updated {c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : "Recently"}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <span className={`self-start md:self-auto text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${
                                                    c.status === "published"
                                                        ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                                                        : "bg-amber-500/15 text-amber-400 border-amber-500/30"
                                                }`}>
                                                    {c.status || "published"}
                                                </span>
                                            </div>

                                            <p className="text-xs text-neutral-300 leading-relaxed max-w-4xl">
                                                {c.description}
                                            </p>

                                            {/* Metrics Bar */}
                                            <div className="flex flex-wrap items-center gap-4 py-3 px-4 bg-white/5 border border-white/10 rounded-lg text-xs">
                                                <div className="flex items-center gap-1.5 text-neutral-300">
                                                    <Layers size={14} className="text-primary" />
                                                    <span><strong>{totalLevels}</strong> Levels</span>
                                                </div>
                                                <span className="text-neutral-600">•</span>
                                                <div className="flex items-center gap-1.5 text-neutral-300">
                                                    <BookOpen size={14} className="text-primary" />
                                                    <span><strong>{totalModules}</strong> Modules</span>
                                                </div>
                                                <span className="text-neutral-600">•</span>
                                                <div className="flex items-center gap-1.5 text-neutral-300">
                                                    <Clock size={14} className="text-primary" />
                                                    <span><strong>{totalSessions}</strong> Sessions / Lessons</span>
                                                </div>
                                            </div>

                                            {/* Assigned Plans Badges */}
                                            <div className="flex flex-wrap items-center gap-2 pt-1">
                                                <span className="text-[11px] text-muted-foreground uppercase font-mono tracking-wider flex items-center gap-1">
                                                    <Shield size={12} className="text-primary" /> Plan Access:
                                                </span>
                                                {c.assignedPlanIds && c.assignedPlanIds.length > 0 ? (
                                                    c.assignedPlanIds.map((pId) => {
                                                        const pObj = plans.find((p) => p.id === pId);
                                                        return (
                                                            <span
                                                                key={pId}
                                                                className="text-[10px] font-bold px-2.5 py-0.5 bg-primary/15 text-primary border border-primary/30 rounded-full"
                                                            >
                                                                {pObj?.name || pId}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
                                                        No plans assigned (Restricted)
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-6 pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
                                            <span className="text-[10px] font-mono text-neutral-500 uppercase">{c.id}</span>
                                            <div className="flex flex-wrap items-center gap-2">
                                                <button
                                                    onClick={() => setPlanAccessModalCurriculum(c)}
                                                    className="btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1.5 text-neutral-300 hover:text-white"
                                                    data-testid={`plan-access-btn-${c.id}`}
                                                >
                                                    <Shield size={13} className="text-primary" /> Assign Plans
                                                </button>
                                                <button
                                                    onClick={() => openCurriculumBuilder(c)}
                                                    className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1.5"
                                                    data-testid={`manage-curriculum-btn-${c.id}`}
                                                >
                                                    <Edit3 size={13} /> Manage Content & Tree
                                                </button>
                                                <button
                                                    onClick={async () => {
                                                        if (window.confirm(`Delete curriculum "${c.title}"?`)) {
                                                            await deleteCurriculum(c.id);
                                                            toast.info(`Curriculum deleted.`);
                                                            await refreshData();
                                                        }
                                                    }}
                                                    className="p-1.5 text-neutral-500 hover:text-red-400 rounded transition"
                                                    title="Delete Curriculum"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </>
            ) : (
                /* VIEW 2: INTERACTIVE CURRICULUM BUILDER */
                <div className="space-y-6" data-testid="curriculum-builder">
                    {/* Top Navigation Bar */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSelectedCurriculum(null)}
                                className="p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-neutral-400 hover:text-white transition"
                                title="Back to Curricula"
                                data-testid="builder-back-btn"
                            >
                                <ArrowLeft size={16} />
                            </button>
                            <div>
                                <div className="eyebrow flex items-center gap-1.5 text-primary">
                                    <BookOpen size={12} /> Curriculum Builder
                                </div>
                                <h3 className="text-heading font-bold text-2xl text-white">{selectedCurriculum.title}</h3>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex items-center gap-2 bg-white/5 p-1 border border-white/10 rounded-lg">
                            <button
                                onClick={() => setBuilderTab("tree")}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition ${
                                    builderTab === "tree" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
                                }`}
                            >
                                1. Levels & Lessons Tree
                            </button>
                            <button
                                onClick={() => setBuilderTab("plans")}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition ${
                                    builderTab === "plans" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
                                }`}
                            >
                                2. Plan Entitlements
                            </button>
                            <button
                                onClick={() => setBuilderTab("settings")}
                                className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition ${
                                    builderTab === "settings" ? "bg-primary text-white" : "text-neutral-400 hover:text-white"
                                }`}
                            >
                                3. Overview & Settings
                            </button>
                        </div>
                    </div>

                    {/* TAB 1: TREE BUILDER */}
                    {builderTab === "tree" && (
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <p className="text-xs text-muted-foreground">
                                    Organize your curriculum progression: <strong>Levels</strong> &rarr; <strong>Modules</strong> &rarr; <strong>Sessions / Lessons</strong>.
                                </p>
                                <button
                                    onClick={() => setEditingLevel({ isNew: true, level: { title: `Level ${(selectedCurriculum.levels?.length || 0) + 1}: `, duration: "Months 1–3", description: "", learningObjectives: "" } })}
                                    className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1.5"
                                    data-testid="add-level-btn"
                                >
                                    <Plus size={14} /> Add New Level
                                </button>
                            </div>

                            {/* Levels Accordion List */}
                            {(!selectedCurriculum.levels || selectedCurriculum.levels.length === 0) ? (
                                <div className="card-hr p-12 text-center text-muted-foreground text-sm">
                                    <Layers className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                                    No levels added yet. Click <strong>"+ Add New Level"</strong> to begin structuring your course.
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {selectedCurriculum.levels.map((lvl, lIndex) => {
                                        const isLvlExpanded = Boolean(expandedLevels[lvl.id]);
                                        const totalMod = lvl.modules?.length || 0;
                                        const totalSes = lvl.modules?.reduce((s, m) => s + (m.sessions?.length || 0), 0) || 0;

                                        return (
                                            <div key={lvl.id} className="card-hr border border-white/15 overflow-hidden transition-all shadow-lg">
                                                {/* Level Header */}
                                                <div className="p-4 md:p-5 bg-white/5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                                        <button
                                                            onClick={() => toggleLevel(lvl.id)}
                                                            className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition mt-0.5"
                                                        >
                                                            {isLvlExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                                        </button>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2 flex-wrap">
                                                                <span className="font-mono text-[11px] font-bold uppercase text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                                                                    Level {lvl.levelNumber || lIndex + 1}
                                                                </span>
                                                                <h4 className="text-heading font-bold text-lg text-white truncate">
                                                                    {lvl.title}
                                                                </h4>
                                                                <span className="text-xs text-muted-foreground">({lvl.duration})</span>
                                                            </div>
                                                            {lvl.description && (
                                                                <p className="text-xs text-neutral-300 mt-1 line-clamp-1">{lvl.description}</p>
                                                            )}
                                                            {lvl.learningObjectives && (
                                                                <div className="text-[11px] text-primary/90 mt-1 font-medium flex items-center gap-1">
                                                                    <Sparkles size={11} /> Goal: {lvl.learningObjectives}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Level Action Controls */}
                                                    <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                                                        <span className="text-xs text-muted-foreground mr-2 font-mono">
                                                            {totalMod} modules · {totalSes} sessions
                                                        </span>
                                                        <button
                                                            onClick={() => handleMoveLevel(lIndex, -1)}
                                                            disabled={lIndex === 0}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded border border-white/10 text-neutral-300 transition"
                                                            title="Move Level Up"
                                                        >
                                                            <ArrowUp size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleMoveLevel(lIndex, 1)}
                                                            disabled={lIndex === selectedCurriculum.levels.length - 1}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded border border-white/10 text-neutral-300 transition"
                                                            title="Move Level Down"
                                                        >
                                                            <ArrowDown size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingLevel({ isNew: false, level: lvl })}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 rounded border border-white/10 text-neutral-300 hover:text-white transition"
                                                            title="Edit Level"
                                                        >
                                                            <Edit3 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteLevel(lvl.id)}
                                                            className="p-1.5 bg-red-600/10 hover:bg-red-600/20 rounded border border-red-500/20 text-red-400 transition"
                                                            title="Delete Level"
                                                        >
                                                            <Trash2 size={13} />
                                                        </button>
                                                        <button
                                                            onClick={() => setEditingModule({ levelId: lvl.id, isNew: true, module: { title: `Module ${(lvl.modules?.length || 0) + 1}: `, description: "", learningGoal: "" } })}
                                                            className="btn-outline !py-1 !px-2.5 !text-[11px] flex items-center gap-1 ml-2 text-primary border-primary/40 hover:bg-primary hover:text-white"
                                                            data-testid={`add-module-btn-${lvl.id}`}
                                                        >
                                                            <Plus size={12} /> Add Module
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Level Content (Modules List) */}
                                                {isLvlExpanded && (
                                                    <div className="p-4 md:p-6 space-y-5 bg-black/40">
                                                        {(!lvl.modules || lvl.modules.length === 0) ? (
                                                            <div className="p-6 text-center text-xs text-muted-foreground border border-dashed border-white/15 rounded-lg">
                                                                No modules in this level. Click <strong>"+ Add Module"</strong> above.
                                                            </div>
                                                        ) : (
                                                            lvl.modules.map((mod, mIndex) => {
                                                                const isModExpanded = Boolean(expandedModules[mod.id]);
                                                                return (
                                                                    <div key={mod.id} className="border border-white/10 rounded-lg overflow-hidden bg-card/60">
                                                                        {/* Module Header */}
                                                                        <div className="p-3.5 bg-white/5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                                                            <div className="flex items-start gap-2.5 flex-1 min-w-0">
                                                                                <button
                                                                                    onClick={() => toggleModule(mod.id)}
                                                                                    className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white transition mt-0.5"
                                                                                >
                                                                                    {isModExpanded ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                                                                </button>
                                                                                <div className="min-w-0">
                                                                                    <div className="flex items-center gap-2">
                                                                                        <span className="text-[10px] font-mono uppercase text-primary font-bold">
                                                                                            M{mod.moduleNumber || mIndex + 1}
                                                                                        </span>
                                                                                        <h5 className="font-bold text-sm text-white truncate">
                                                                                            {mod.title}
                                                                                        </h5>
                                                                                    </div>
                                                                                    {mod.description && (
                                                                                        <p className="text-[11px] text-neutral-400 mt-0.5">{mod.description}</p>
                                                                                    )}
                                                                                    {mod.learningGoal && (
                                                                                        <div className="text-[10px] text-neutral-300 mt-0.5">
                                                                                            <span className="text-primary font-bold">Goal:</span> {mod.learningGoal}
                                                                                        </div>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Module Action Controls */}
                                                                            <div className="flex items-center gap-1.5 self-end sm:self-auto shrink-0">
                                                                                <span className="text-[11px] text-muted-foreground mr-1">
                                                                                    {mod.sessions?.length || 0} sessions
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => handleMoveModule(lvl.id, mIndex, -1)}
                                                                                    disabled={mIndex === 0}
                                                                                    className="p-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-neutral-400 hover:text-white"
                                                                                    title="Move Module Up"
                                                                                >
                                                                                    <ArrowUp size={12} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleMoveModule(lvl.id, mIndex, 1)}
                                                                                    disabled={mIndex === lvl.modules.length - 1}
                                                                                    className="p-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-neutral-400 hover:text-white"
                                                                                    title="Move Module Down"
                                                                                >
                                                                                    <ArrowDown size={12} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingModule({ levelId: lvl.id, isNew: false, module: mod })}
                                                                                    className="p-1 bg-white/5 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                                                                                    title="Edit Module"
                                                                                >
                                                                                    <Edit3 size={12} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => handleDeleteModule(lvl.id, mod.id)}
                                                                                    className="p-1 bg-red-600/10 hover:bg-red-600/20 rounded text-red-400"
                                                                                    title="Delete Module"
                                                                                >
                                                                                    <Trash2 size={12} />
                                                                                </button>
                                                                                <button
                                                                                    onClick={() => setEditingSession({
                                                                                        levelId: lvl.id,
                                                                                        moduleId: mod.id,
                                                                                        isNew: true,
                                                                                        session: {
                                                                                            title: `Session ${(mod.sessions?.length || 0) + 1}`,
                                                                                            duration: "60 minutes",
                                                                                            topics: ["Core technique & exercise", "Hands-on practice"],
                                                                                            learningObjective: "Master new fretboard concept and rhythm drill.",
                                                                                            practiceHomework: "Practice 15 minutes daily with metronome.",
                                                                                            videoId: "jNQXAC9IVRw",
                                                                                            resources: ["lesson-worksheet.pdf"],
                                                                                            sessionStructure: {
                                                                                                warmup: "Tuning & stretches (5 min)",
                                                                                                review: "Review previous session (10 min)",
                                                                                                newConcept: "New technique/chords (20 min)",
                                                                                                songPractice: "Song application (15 min)",
                                                                                                feedback: "Live Q&A & feedback (10 min)"
                                                                                            },
                                                                                            status: "published"
                                                                                        }
                                                                                    })}
                                                                                    className="btn-primary !py-1 !px-2.5 !text-[10px] flex items-center gap-1 ml-1"
                                                                                    data-testid={`add-session-btn-${mod.id}`}
                                                                                >
                                                                                    <Plus size={11} /> Add Session
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Sessions List */}
                                                                        {isModExpanded && (
                                                                            <div className="p-3.5 space-y-2.5 bg-black/30">
                                                                                {(!mod.sessions || mod.sessions.length === 0) ? (
                                                                                    <div className="p-4 text-center text-[11px] text-neutral-500 border border-dashed border-white/10 rounded">
                                                                                        No sessions yet. Click <strong>"+ Add Session"</strong> to add lesson content.
                                                                                    </div>
                                                                                ) : (
                                                                                    mod.sessions.map((ses, sIndex) => (
                                                                                        <div
                                                                                            key={ses.id}
                                                                                            className="p-3.5 bg-white/5 border border-white/10 hover:border-white/25 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors"
                                                                                            data-testid={`session-row-${ses.id}`}
                                                                                        >
                                                                                            <div className="space-y-1.5 flex-1 min-w-0">
                                                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                                                    <span className="font-mono text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                                                                                                        Session {ses.sessionNumber || sIndex + 1}
                                                                                                    </span>
                                                                                                    <h6 className="font-bold text-xs text-white">
                                                                                                        {ses.title}
                                                                                                    </h6>
                                                                                                    <span className="text-[10px] text-muted-foreground font-mono">
                                                                                                        ({ses.duration || "60 min"})
                                                                                                    </span>
                                                                                                    {ses.videoId && (
                                                                                                        <span className="text-[10px] text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded flex items-center gap-1 font-mono">
                                                                                                            <Video size={10} /> Video Ready
                                                                                                        </span>
                                                                                                    )}
                                                                                                </div>

                                                                                                {ses.learningObjective && (
                                                                                                    <p className="text-[11px] text-neutral-300 line-clamp-1">
                                                                                                        <strong>Objective:</strong> {ses.learningObjective}
                                                                                                    </p>
                                                                                                )}

                                                                                                {/* Topics Chips */}
                                                                                                {ses.topics && ses.topics.length > 0 && (
                                                                                                    <div className="flex flex-wrap gap-1 pt-1">
                                                                                                        {ses.topics.map((top, tIdx) => (
                                                                                                            <span
                                                                                                                key={tIdx}
                                                                                                                className="text-[9px] bg-white/10 text-neutral-300 px-1.5 py-0.5 rounded"
                                                                                                            >
                                                                                                                • {top}
                                                                                                            </span>
                                                                                                        ))}
                                                                                                    </div>
                                                                                                )}
                                                                                            </div>

                                                                                            {/* Session Controls */}
                                                                                            <div className="flex items-center gap-1.5 self-end md:self-auto shrink-0">
                                                                                                <button
                                                                                                    onClick={() => handleMoveSession(lvl.id, mod.id, sIndex, -1)}
                                                                                                    disabled={sIndex === 0}
                                                                                                    className="p-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-neutral-400 hover:text-white"
                                                                                                    title="Move Session Up"
                                                                                                >
                                                                                                    <ArrowUp size={11} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleMoveSession(lvl.id, mod.id, sIndex, 1)}
                                                                                                    disabled={sIndex === mod.sessions.length - 1}
                                                                                                    className="p-1 bg-white/5 hover:bg-white/10 disabled:opacity-30 rounded text-neutral-400 hover:text-white"
                                                                                                    title="Move Session Down"
                                                                                                >
                                                                                                    <ArrowDown size={11} />
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => setEditingSession({ levelId: lvl.id, moduleId: mod.id, isNew: false, session: ses })}
                                                                                                    className="btn-outline !py-1 !px-2.5 !text-[11px] flex items-center gap-1 text-white hover:border-primary"
                                                                                                >
                                                                                                    <Edit3 size={11} /> Edit Lesson Data
                                                                                                </button>
                                                                                                <button
                                                                                                    onClick={() => handleDeleteSession(lvl.id, mod.id, ses.id)}
                                                                                                    className="p-1 text-neutral-500 hover:text-red-400 rounded"
                                                                                                    title="Delete Session"
                                                                                                >
                                                                                                    <Trash2 size={12} />
                                                                                                </button>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                )}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: PLAN ACCESS & ENTITLEMENTS */}
                    {builderTab === "plans" && (
                        <div className="card-hr p-6 space-y-6">
                            <div className="border-b border-white/10 pb-4">
                                <h4 className="text-heading font-bold text-lg text-white">Subscription Plan Entitlements</h4>
                                <p className="text-xs text-muted-foreground mt-1">
                                    Select which subscription tiers grant students access to <strong>{selectedCurriculum.title}</strong>. When students subscribe to checked plans, this curriculum automatically unlocks on their dashboard.
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {plans.map((p) => {
                                    const isAssigned = selectedCurriculum.assignedPlanIds?.includes(p.id);
                                    return (
                                        <div
                                            key={p.id}
                                            onClick={() => handleTogglePlanAccess(selectedCurriculum.id, p.id)}
                                            className={`p-5 border rounded-xl cursor-pointer transition-all flex flex-col justify-between ${
                                                isAssigned
                                                    ? "bg-primary/10 border-primary shadow-lg shadow-red-900/20"
                                                    : "bg-card border-white/10 hover:border-white/20 opacity-70"
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm text-white">{p.name}</span>
                                                    <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                                        isAssigned ? "bg-primary border-primary text-white" : "border-white/30"
                                                    }`}>
                                                        {isAssigned && <Check size={13} />}
                                                    </div>
                                                </div>
                                                <div className="font-mono font-bold text-primary text-base mt-2">
                                                    {p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}
                                                    <span className="text-[10px] text-muted-foreground ml-1">{p.cadence}</span>
                                                </div>
                                                <p className="text-xs text-muted-foreground mt-1">{p.tagline}</p>
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-white/10 text-[11px] font-mono">
                                                {isAssigned ? (
                                                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> Access Granted
                                                    </span>
                                                ) : (
                                                    <span className="text-neutral-500">Access Restricted</span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TAB 3: OVERVIEW & SETTINGS */}
                    {builderTab === "settings" && (
                        <div className="card-hr p-6 space-y-6 max-w-2xl">
                            <h4 className="text-heading font-bold text-lg text-white border-b border-white/10 pb-4">
                                Curriculum Metadata & Overview
                            </h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="eyebrow block mb-1">Curriculum Title</label>
                                    <input
                                        value={selectedCurriculum.title}
                                        onChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, title: e.target.value })}
                                        className="form-input text-xs"
                                    />
                                </div>
                                <div>
                                    <label className="eyebrow block mb-1">Description</label>
                                    <textarea
                                        rows={3}
                                        value={selectedCurriculum.description}
                                        onChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, description: e.target.value })}
                                        className="form-input text-xs"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="eyebrow block mb-1">Instrument</label>
                                        <select
                                            value={selectedCurriculum.instrument || "Guitar"}
                                            onChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, instrument: e.target.value })}
                                            className="form-input text-xs bg-card"
                                        >
                                            <option value="Guitar">Guitar</option>
                                            <option value="Keyboard">Keyboard / Piano</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="eyebrow block mb-1">Publication Status</label>
                                        <select
                                            value={selectedCurriculum.status || "published"}
                                            onChange={(e) => setSelectedCurriculum({ ...selectedCurriculum, status: e.target.value })}
                                            className="form-input text-xs bg-card"
                                        >
                                            <option value="published">Published</option>
                                            <option value="draft">Draft</option>
                                            <option value="archived">Archived</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="pt-4 flex justify-end">
                                    <button
                                        onClick={async () => {
                                            await updateActiveCurriculum(selectedCurriculum);
                                            toast.success("Curriculum settings saved!");
                                        }}
                                        className="btn-primary !py-2 !text-xs"
                                    >
                                        Save Changes
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* MODAL 1: CREATE CURRICULUM */}
            {isCreateCurriculumOpen && (
                <CreateCurriculumModal
                    onClose={() => setIsCreateCurriculumOpen(false)}
                    onCreated={(newCurr) => {
                        setIsCreateCurriculumOpen(false);
                        openCurriculumBuilder(newCurr);
                        refreshData();
                    }}
                />
            )}

            {/* MODAL 2: EDIT LEVEL */}
            {editingLevel && (
                <LevelModal
                    level={editingLevel.level}
                    isNew={editingLevel.isNew}
                    onClose={() => setEditingLevel(null)}
                    onSave={(data) => handleSaveLevel(data, editingLevel.isNew)}
                />
            )}

            {/* MODAL 3: EDIT MODULE */}
            {editingModule && (
                <ModuleModal
                    module={editingModule.module}
                    isNew={editingModule.isNew}
                    onClose={() => setEditingModule(null)}
                    onSave={(data) => handleSaveModule(editingModule.levelId, data, editingModule.isNew)}
                />
            )}

            {/* MODAL 4: FULL SESSION DRAWER / MODAL */}
            {editingSession && (
                <SessionEditorModal
                    session={editingSession.session}
                    isNew={editingSession.isNew}
                    onClose={() => setEditingSession(null)}
                    onSave={(data) => handleSaveSession(editingSession.levelId, editingSession.moduleId, data, editingSession.isNew)}
                />
            )}

            {/* MODAL 5: PLAN ACCESS FROM LIST VIEW */}
            {planAccessModalCurriculum && (
                <PlanAccessModal
                    curriculum={planAccessModalCurriculum}
                    plans={plans}
                    onClose={() => setPlanAccessModalCurriculum(null)}
                    onTogglePlan={(planId) => handleTogglePlanAccess(planAccessModalCurriculum.id, planId)}
                />
            )}
        </div>
    );
}

/* =========================================================================
   SUB-MODALS
   ========================================================================= */

function CreateCurriculumModal({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instrument, setInstrument] = useState("Guitar");
    const [status, setStatus] = useState("published");

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newCurr = {
            id: "curriculum-" + Date.now(),
            title: title.trim(),
            description: description.trim(),
            instrument,
            status,
            assignedPlanIds: ["guitar-foundation-3m", "guitar-complete-6m"],
            levels: [
                {
                    id: "lvl-1",
                    levelNumber: 1,
                    title: "Level 1: Beginner Fundamentals",
                    duration: "Months 1–3",
                    description: "Foundational posture, chords, and simple song breakdown.",
                    learningObjectives: "Play first 5 chords and clean strumming rhythm.",
                    status: "active",
                    modules: []
                }
            ],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        await saveCurriculum(newCurr);
        toast.success(`Curriculum "${newCurr.title}" created!`);
        onCreated(newCurr);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-hr p-6 max-w-lg w-full bg-card/95 border-primary/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Plus size={16} /> Create New Curriculum
                    </h4>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="eyebrow block mb-1">Curriculum Name</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Acoustic Fingerstyle Mastery"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Description</label>
                        <textarea
                            required
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Overview of the learning journey and target outcome..."
                            className="form-input text-xs"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="eyebrow block mb-1">Instrument</label>
                            <select value={instrument} onChange={(e) => setInstrument(e.target.value)} className="form-input text-xs bg-card">
                                <option value="Guitar">Guitar</option>
                                <option value="Keyboard">Keyboard / Piano</option>
                            </select>
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Status</label>
                            <select value={status} onChange={(e) => setStatus(e.target.value)} className="form-input text-xs bg-card">
                                <option value="published">Published</option>
                                <option value="draft">Draft</option>
                            </select>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                        <button type="button" onClick={onClose} className="btn-outline !py-2 !text-xs">Cancel</button>
                        <button type="submit" className="btn-primary !py-2 !text-xs">Create & Open Builder</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function LevelModal({ level, isNew, onClose, onSave }) {
    const [title, setTitle] = useState(level.title || "");
    const [duration, setDuration] = useState(level.duration || "Months 1–3");
    const [description, setDescription] = useState(level.description || "");
    const [learningObjectives, setLearningObjectives] = useState(level.learningObjectives || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...level, title, duration, description, learningObjectives });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-hr p-6 max-w-md w-full bg-card/95 border-primary/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                        {isNew ? "Add New Level" : `Edit Level: ${level.title}`}
                    </h4>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="eyebrow block mb-1">Level Title</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Level 1: Beginner Fundamentals"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Estimated Duration</label>
                        <input
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="e.g. Months 1–3 or 8 weeks"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What does this level encompass?"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Learning Objectives / Goal</label>
                        <textarea
                            rows={2}
                            value={learningObjectives}
                            onChange={(e) => setLearningObjectives(e.target.value)}
                            placeholder="e.g. Student plays 5-7 open chords and 3-4 songs."
                            className="form-input text-xs"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                        <button type="button" onClick={onClose} className="btn-outline !py-2 !text-xs">Cancel</button>
                        <button type="submit" className="btn-primary !py-2 !text-xs">Save Level</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function ModuleModal({ module, isNew, onClose, onSave }) {
    const [title, setTitle] = useState(module.title || "");
    const [description, setDescription] = useState(module.description || "");
    const [learningGoal, setLearningGoal] = useState(module.learningGoal || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...module, title, description, learningGoal });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-hr p-6 max-w-md w-full bg-card/95 border-primary/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h4 className="text-sm font-bold uppercase tracking-wider text-primary">
                        {isNew ? "Add Module" : `Edit Module: ${module.title}`}
                    </h4>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={16} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="eyebrow block mb-1">Module Title</label>
                        <input
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Module 1: Basics & Right Hand"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Description</label>
                        <textarea
                            rows={2}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What technical concepts are covered?"
                            className="form-input text-xs"
                        />
                    </div>
                    <div>
                        <label className="eyebrow block mb-1">Module Learning Goal</label>
                        <input
                            value={learningGoal}
                            onChange={(e) => setLearningGoal(e.target.value)}
                            placeholder="e.g. Master proper grip, posture, and right-hand control."
                            className="form-input text-xs"
                        />
                    </div>
                    <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                        <button type="button" onClick={onClose} className="btn-outline !py-2 !text-xs">Cancel</button>
                        <button type="submit" className="btn-primary !py-2 !text-xs">Save Module</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function SessionEditorModal({ session, isNew, onClose, onSave }) {
    const [title, setTitle] = useState(session.title || "");
    const [duration, setDuration] = useState(session.duration || "60 minutes");
    const [learningObjective, setLearningObjective] = useState(session.learningObjective || "");
    const [practiceHomework, setPracticeHomework] = useState(session.practiceHomework || "");
    const [videoId, setVideoId] = useState(session.videoId || "jNQXAC9IVRw");
    const [topicsText, setTopicsText] = useState(session.topics?.join("\n") || "");
    const [resourcesText, setResourcesText] = useState(session.resources?.join("\n") || "");

    // Structure
    const [warmup, setWarmup] = useState(session.sessionStructure?.warmup || "Tuning, posture check, and stretching (5 min)");
    const [review, setReview] = useState(session.sessionStructure?.review || "Review previous session techniques (10 min)");
    const [newConcept, setNewConcept] = useState(session.sessionStructure?.newConcept || "Core lesson concept & mechanics (20 min)");
    const [songPractice, setSongPractice] = useState(session.sessionStructure?.songPractice || "Song/Riff practical application (15 min)");
    const [feedback, setFeedback] = useState(session.sessionStructure?.feedback || "Live correction & Q&A (10 min)");

    const handleSubmit = (e) => {
        e.preventDefault();
        const parsedTopics = topicsText.split("\n").map((t) => t.trim()).filter(Boolean);
        const parsedResources = resourcesText.split("\n").map((r) => r.trim()).filter(Boolean);

        onSave({
            ...session,
            title,
            duration,
            learningObjective,
            practiceHomework,
            videoId,
            topics: parsedTopics,
            resources: parsedResources,
            sessionStructure: {
                warmup,
                review,
                newConcept,
                songPractice,
                feedback
            }
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <div className="card-hr p-6 md:p-8 max-w-2xl w-full bg-card/95 border-primary/40 shadow-2xl space-y-5 my-8 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                    <div>
                        <span className="eyebrow text-primary font-bold">Session / Lesson Educational Details</span>
                        <h4 className="text-heading font-bold text-xl text-white">
                            {isNew ? "Create New Lesson" : `Edit: ${session.title}`}
                        </h4>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={18} /></button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="eyebrow block mb-1">Session Title</label>
                            <input
                                required
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. How to Hold the Guitar"
                                className="form-input text-xs"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Estimated Duration</label>
                            <input
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                placeholder="e.g. 60 minutes"
                                className="form-input text-xs"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="eyebrow block mb-1">Learning Objective / Goal</label>
                        <textarea
                            rows={2}
                            value={learningObjective}
                            onChange={(e) => setLearningObjective(e.target.value)}
                            placeholder="e.g. Master correct posture and thumb position."
                            className="form-input text-xs"
                        />
                    </div>

                    <div>
                        <label className="eyebrow block mb-1">Topics Covered (One topic per line)</label>
                        <textarea
                            rows={4}
                            value={topicsText}
                            onChange={(e) => setTopicsText(e.target.value)}
                            placeholder="Sitting vs standing posture&#10;Guitar parts and tuning&#10;Plectrum grip"
                            className="form-input text-xs font-mono"
                        />
                    </div>

                    <div className="p-4 bg-white/5 border border-white/10 rounded-lg space-y-3">
                        <div className="eyebrow text-primary">Standard 45–60 Min Session Breakdown</div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                            <div>
                                <label className="text-[10px] text-neutral-400 block mb-0.5 font-mono">1. Warm-up (5 min)</label>
                                <input value={warmup} onChange={(e) => setWarmup(e.target.value)} className="form-input text-[11px]" />
                            </div>
                            <div>
                                <label className="text-[10px] text-neutral-400 block mb-0.5 font-mono">2. Review (10 min)</label>
                                <input value={review} onChange={(e) => setReview(e.target.value)} className="form-input text-[11px]" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="text-[10px] text-neutral-400 block mb-0.5 font-mono">3. New Concept (20 min)</label>
                                <input value={newConcept} onChange={(e) => setNewConcept(e.target.value)} className="form-input text-[11px]" />
                            </div>
                            <div>
                                <label className="text-[10px] text-neutral-400 block mb-0.5 font-mono">4. Song Practice (15 min)</label>
                                <input value={songPractice} onChange={(e) => setSongPractice(e.target.value)} className="form-input text-[11px]" />
                            </div>
                            <div>
                                <label className="text-[10px] text-neutral-400 block mb-0.5 font-mono">5. Feedback & Q&A (10 min)</label>
                                <input value={feedback} onChange={(e) => setFeedback(e.target.value)} className="form-input text-[11px]" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="eyebrow block mb-1">Practice / Homework Instructions</label>
                        <textarea
                            rows={2}
                            value={practiceHomework}
                            onChange={(e) => setPracticeHomework(e.target.value)}
                            placeholder="e.g. Practice downstrokes 10 min daily at 60 BPM."
                            className="form-input text-xs"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="eyebrow block mb-1">YouTube Video ID / Preview Key</label>
                            <input
                                value={videoId}
                                onChange={(e) => setVideoId(e.target.value)}
                                placeholder="e.g. jNQXAC9IVRw"
                                className="form-input text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Resources / Attachments (One per line)</label>
                            <textarea
                                rows={2}
                                value={resourcesText}
                                onChange={(e) => setResourcesText(e.target.value)}
                                placeholder="worksheet-01.pdf&#10;chord-chart.pdf"
                                className="form-input text-xs font-mono"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                        <button type="button" onClick={onClose} className="btn-outline !py-2 !text-xs">Cancel</button>
                        <button type="submit" className="btn-primary !py-2 !text-xs">Save Session Data</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function PlanAccessModal({ curriculum, plans, onClose, onTogglePlan }) {
    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="card-hr p-6 max-w-lg w-full bg-card/95 border-primary/40 shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <div>
                        <span className="eyebrow text-primary">Access Entitlements</span>
                        <h4 className="text-heading font-bold text-lg text-white">
                            Assign Plans to "{curriculum.title}"
                        </h4>
                    </div>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white"><X size={16} /></button>
                </div>
                <p className="text-xs text-muted-foreground">
                    Check the plans below that should grant access to this curriculum. Changes take effect immediately.
                </p>
                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                    {plans.map((p) => {
                        const isAssigned = curriculum.assignedPlanIds?.includes(p.id);
                        return (
                            <div
                                key={p.id}
                                onClick={() => onTogglePlan(p.id)}
                                className={`p-3.5 border rounded-lg cursor-pointer transition flex items-center justify-between ${
                                    isAssigned ? "bg-primary/10 border-primary" : "bg-white/5 border-white/10 hover:border-white/20"
                                }`}
                            >
                                <div>
                                    <div className="font-bold text-xs text-white">{p.name}</div>
                                    <div className="text-[10px] text-neutral-400 mt-0.5">
                                        ₹{p.price.toLocaleString("en-IN")} {p.cadence} · {p.tagline}
                                    </div>
                                </div>
                                <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                                    isAssigned ? "bg-primary border-primary text-white" : "border-white/30"
                                }`}>
                                    {isAssigned && <Check size={12} />}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-end pt-2 border-t border-white/10">
                    <button onClick={onClose} className="btn-primary !py-2 !text-xs">Done</button>
                </div>
            </div>
        </div>
    );
}
