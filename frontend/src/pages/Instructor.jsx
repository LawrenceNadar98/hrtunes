import { useState } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { STUDENTS, EARNINGS, COURSES, LIVE_CLASSES } from "@/lib/mock";
import {
    Users,
    DollarSign,
    Star,
    TrendingUp,
    Plus,
    UploadCloud,
    Calendar,
    Search,
    MoreHorizontal,
    Music2,
    X,
} from "lucide-react";
import { toast } from "sonner";

const SECTIONS = [
    { id: "overview", label: "Overview" },
    { id: "courses", label: "Courses" },
    { id: "schedule", label: "Schedule" },
    { id: "students", label: "Students" },
    { id: "uploads", label: "Uploads" },
];

export default function Instructor() {
    const [section, setSection] = useState("overview");

    return (
        <DashboardLayout
            subtitle="Instructor"
            title="Admin Studio"
            actions={
                <button className="btn-primary" onClick={() => toast.info("New course draft created")}  data-testid="admin-new-course">
                    <Plus size={14} /> New course
                </button>
            }
        >
            <div className="flex items-center gap-0 mb-10 border-b border-white/10 overflow-x-auto" data-testid="admin-sections">
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSection(s.id)}
                        className={`px-5 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 ${
                            section === s.id ? "border-primary text-white" : "border-transparent text-muted-foreground hover:text-white"
                        }`}
                        data-testid={`admin-tab-${s.id}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>

            {section === "overview" && <Overview />}
            {section === "courses" && <CoursesAdmin />}
            {section === "schedule" && <ScheduleAdmin />}
            {section === "students" && <StudentsAdmin />}
            {section === "uploads" && <UploadsAdmin />}
        </DashboardLayout>
    );
}

/* ---------- Overview ---------- */
function Overview() {
    const max = Math.max(...EARNINGS.monthly.map((m) => m.v));
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-stats">
                <StatCard icon={DollarSign} label="Total earnings" value={`₹${(EARNINGS.total / 1000).toFixed(0)}k`} trend="+12%" />
                <StatCard icon={TrendingUp} label="This month" value={`₹${(EARNINGS.thisMonth / 1000).toFixed(0)}k`} trend="+8%" accent />
                <StatCard icon={Users} label="Active students" value={EARNINGS.students} trend="+14" />
                <StatCard icon={Star} label="Avg rating" value={`${EARNINGS.avgRating}★`} trend="+0.1" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-hr p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="eyebrow">Earnings</div>
                            <div className="text-heading font-bold text-xl">Last 6 months</div>
                        </div>
                        <div className="text-2xl text-heading font-black text-primary">
                            ₹{EARNINGS.thisMonth.toLocaleString("en-IN")}
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-56">
                        {EARNINGS.monthly.map((m, i) => (
                            <div key={m.m} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center h-full">
                                    <div
                                        className={`w-full transition-all hover:brightness-125 ${
                                            i === EARNINGS.monthly.length - 1 ? "bg-primary" : "bg-white/20"
                                        }`}
                                        style={{ height: `${(m.v / max) * 100}%` }}
                                        title={`₹${m.v}`}
                                    />
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">{m.m}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-hr p-6">
                    <div className="eyebrow mb-3">Top course</div>
                    <div className="text-heading font-bold text-lg">Guitar Foundations</div>
                    <div className="text-sm text-muted-foreground">1,284 students enrolled</div>
                    <div className="divider-dashed my-5" />
                    <div className="eyebrow mb-3">Next live class</div>
                    <div className="text-sm font-bold">Fingerpicking Fundamentals</div>
                    <div className="text-xs text-muted-foreground mt-1">Feb 18, 6:00 PM · 12 attending</div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, trend, accent }) {
    return (
        <div className={`p-5 border ${accent ? "bg-primary/10 border-primary/40" : "bg-card border-border"}`}>
            <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={accent ? "text-primary" : "text-muted-foreground"} />
                <span className="eyebrow">{label}</span>
            </div>
            <div className="flex items-end justify-between">
                <div className="text-heading font-black text-3xl leading-none">{value}</div>
                <span className="text-[10px] text-green-400 font-bold">{trend}</span>
            </div>
        </div>
    );
}

/* ---------- Courses ---------- */
function CoursesAdmin() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5" data-testid="admin-courses">
            {COURSES.map((c) => (
                <div key={c.id} className="card-hr overflow-hidden">
                    <div className="relative aspect-video">
                        <img src={c.thumbnail} alt={c.title} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                        <div className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-widest bg-primary text-white px-2 py-1">
                            {c.comingSoon ? "Draft" : "Published"}
                        </div>
                    </div>
                    <div className="p-5">
                        <div className="text-heading font-bold text-lg">{c.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">{c.lessons} lessons · {c.students} students</div>
                        <div className="flex items-center gap-2 mt-4">
                            <button className="flex-1 btn-outline !py-2 !text-xs">Edit</button>
                            <button className="flex-1 btn-primary !py-2 !text-xs" onClick={() => toast.info("Analytics opened")}>
                                Analytics
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            <button
                className="border-2 border-dashed border-white/20 bg-card/30 aspect-[4/3] flex flex-col items-center justify-center gap-3 hover:border-primary hover:bg-primary/5 transition-all group"
                onClick={() => toast.info("New course builder (demo)")}
                data-testid="admin-add-course"
            >
                <div className="w-14 h-14 border border-white/20 group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center">
                    <Plus size={24} className="group-hover:text-primary" />
                </div>
                <span className="text-sm font-bold uppercase tracking-wider group-hover:text-primary">Create new course</span>
            </button>
        </div>
    );
}

/* ---------- Schedule ---------- */
function ScheduleAdmin() {
    const upcoming = LIVE_CLASSES.filter((l) => l.status === "upcoming");
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="admin-schedule">
            <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-heading font-bold text-lg">Upcoming Classes</h3>
                    <button className="btn-primary !py-2" onClick={() => toast.info("Class scheduler (demo)")}>
                        <Calendar size={13} /> Schedule class
                    </button>
                </div>
                {upcoming.map((lc) => (
                    <div key={lc.id} className="card-hr p-5 flex items-center gap-4" data-testid={`admin-class-${lc.id}`}>
                        <div className="flex-shrink-0 bg-primary/10 border border-primary/40 p-3 text-center min-w-[70px]">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                {new Date(lc.date).toLocaleDateString("en-IN", { month: "short" })}
                            </div>
                            <div className="text-heading font-black text-xl leading-none">
                                {new Date(lc.date).getDate()}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm">{lc.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {lc.time} · {lc.duration} min · {lc.attendees} attending
                            </div>
                        </div>
                        <button className="text-muted-foreground hover:text-white p-2">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="card-hr p-6 h-fit">
                <div className="eyebrow mb-4">Quick schedule</div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Class scheduled (demo)"); }}>
                    <label className="block">
                        <span className="eyebrow block mb-2">Title</span>
                        <input type="text" placeholder="Class title" className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="eyebrow block mb-2">Date</span>
                            <input type="date" className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                        </label>
                        <label className="block">
                            <span className="eyebrow block mb-2">Time</span>
                            <input type="time" className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary" />
                        </label>
                    </div>
                    <label className="block">
                        <span className="eyebrow block mb-2">Course</span>
                        <select className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary">
                            {COURSES.map((c) => <option key={c.id} className="bg-card">{c.title}</option>)}
                        </select>
                    </label>
                    <button type="submit" className="btn-primary w-full">Schedule class</button>
                </form>
            </div>
        </div>
    );
}

/* ---------- Students ---------- */
function StudentsAdmin() {
    const [q, setQ] = useState("");
    const filtered = STUDENTS.filter(
        (s) => s.name.toLowerCase().includes(q.toLowerCase()) || s.email.toLowerCase().includes(q.toLowerCase())
    );
    return (
        <div data-testid="admin-students">
            <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center gap-2 bg-card border border-white/10 px-3 py-2 flex-1 max-w-sm">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                        value={q}
                        onChange={(e) => setQ(e.target.value)}
                        placeholder="Search students…"
                        className="bg-transparent text-sm outline-none flex-1"
                        data-testid="students-search"
                    />
                </div>
                <button className="btn-outline !py-2 !text-xs">Export CSV</button>
            </div>

            <div className="card-hr overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5">
                    <div className="col-span-4 eyebrow">Student</div>
                    <div className="col-span-3 eyebrow">Course</div>
                    <div className="col-span-2 eyebrow">Progress</div>
                    <div className="col-span-2 eyebrow">Last active</div>
                    <div className="col-span-1 eyebrow text-right">Status</div>
                </div>
                {filtered.map((s) => (
                    <div
                        key={s.id}
                        className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                        data-testid={`student-${s.id}`}
                    >
                        <div className="col-span-2 md:col-span-4 flex items-center gap-3">
                            <div className="w-9 h-9 bg-primary/20 border border-primary/40 flex items-center justify-center text-xs font-bold">
                                {s.name.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div className="min-w-0">
                                <div className="font-bold text-sm truncate">{s.name}</div>
                                <div className="text-xs text-muted-foreground truncate">{s.email}</div>
                            </div>
                        </div>
                        <div className="col-span-1 md:col-span-3 text-sm text-white/80 flex items-center">{s.course}</div>
                        <div className="col-span-1 md:col-span-2 flex items-center gap-2">
                            <div className="flex-1 h-1 bg-white/10">
                                <div className="h-full bg-primary" style={{ width: `${s.progress}%` }} />
                            </div>
                            <span className="text-xs font-mono">{s.progress}%</span>
                        </div>
                        <div className="col-span-1 md:col-span-2 text-xs text-muted-foreground flex items-center">{s.lastActive}</div>
                        <div className="col-span-1 md:col-span-1 md:text-right">
                            <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-2 py-1 ${
                                s.status === "active" ? "bg-green-500/15 text-green-400" :
                                s.status === "at-risk" ? "bg-amber-500/15 text-amber-400" :
                                "bg-white/10 text-muted-foreground"
                            }`}>
                                {s.status}
                            </span>
                        </div>
                    </div>
                ))}
                {filtered.length === 0 && (
                    <div className="p-10 text-center text-muted-foreground text-sm">No students match your search.</div>
                )}
            </div>
        </div>
    );
}

/* ---------- Uploads ---------- */
function UploadsAdmin() {
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            type: f.type || "unknown",
        }));
        setFiles([...files, ...newFiles]);
        toast.success(`${newFiles.length} file(s) added`);
    };

    const onSelect = (e) => {
        const newFiles = Array.from(e.target.files).map((f) => ({
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            type: f.type || "unknown",
        }));
        setFiles([...files, ...newFiles]);
    };

    const remove = (i) => setFiles(files.filter((_, idx) => idx !== i));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="admin-uploads">
            <div className="lg:col-span-2">
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={onDrop}
                    className={`border-2 border-dashed p-16 text-center transition-all ${
                        dragOver ? "border-primary bg-primary/10" : "border-white/20 bg-card/30 hover:border-white/40"
                    }`}
                    data-testid="upload-dropzone"
                >
                    <UploadCloud size={40} className={`mx-auto mb-4 ${dragOver ? "text-primary" : "text-muted-foreground"}`} />
                    <h3 className="text-heading font-bold text-xl mb-2">
                        {dragOver ? "Drop files here" : "Drag & drop lesson materials"}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-6">
                        PDFs, MP3 backing tracks, tab sheets, video references — up to 500MB
                    </p>
                    <label className="btn-primary cursor-pointer inline-flex">
                        <UploadCloud size={14} /> Browse files
                        <input type="file" multiple className="hidden" onChange={onSelect} data-testid="upload-input" />
                    </label>
                </div>

                {files.length > 0 && (
                    <div className="mt-6 card-hr p-6">
                        <div className="eyebrow mb-4">Queue ({files.length})</div>
                        <ul className="space-y-2">
                            {files.map((f, i) => (
                                <li key={i} className="flex items-center gap-3 p-3 border border-white/10 hover:border-primary/40 transition-colors">
                                    <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center">
                                        <Music2 size={13} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{f.name}</div>
                                        <div className="text-xs text-muted-foreground">{f.size}</div>
                                    </div>
                                    <button onClick={() => remove(i)} className="text-muted-foreground hover:text-primary p-1">
                                        <X size={14} />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="card-hr p-6">
                <div className="eyebrow mb-3">Attach to lesson</div>
                <select className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary mb-4">
                    <option className="bg-card">Guitar Foundations › M2 › Lesson 5</option>
                    <option className="bg-card">Lead Guitar › M1 › Lesson 1</option>
                </select>
                <label className="block mb-4">
                    <span className="eyebrow block mb-2">Notes (optional)</span>
                    <textarea rows={4} className="w-full bg-card border border-white/15 px-3 py-2.5 text-sm outline-none focus:border-primary resize-none" placeholder="Add context for students…" />
                </label>
                <button className="btn-primary w-full" onClick={() => toast.success("Materials published (demo)")}>Publish materials</button>
            </div>
        </div>
    );
}
