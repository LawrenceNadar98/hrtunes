import DashboardLayout from "@/components/layout/DashboardLayout";
import { ASSIGNMENTS } from "@/lib/mock";
import { ClipboardList, Calendar, Upload, CheckCircle2, Clock, Award } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TABS = [
    { id: "pending", label: "Pending" },
    { id: "submitted", label: "Submitted" },
    { id: "graded", label: "Graded" },
];

export default function Assignments() {
    const [tab, setTab] = useState("pending");
    const filtered = ASSIGNMENTS.filter((a) => a.status === tab);

    return (
        <DashboardLayout
            subtitle="Practice log"
            title="Assignments"
        >
            <div className="flex items-center gap-0 mb-8 border-b border-white/10" data-testid="assignment-tabs">
                {TABS.map((t) => {
                    const count = ASSIGNMENTS.filter((a) => a.status === t.id).length;
                    return (
                        <button
                            key={t.id}
                            onClick={() => setTab(t.id)}
                            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                                tab === t.id
                                    ? "border-primary text-white"
                                    : "border-transparent text-muted-foreground hover:text-white"
                            }`}
                            data-testid={`tab-${t.id}`}
                        >
                            {t.label} <span className="ml-2 text-xs opacity-60">{count}</span>
                        </button>
                    );
                })}
            </div>

            {filtered.length === 0 ? (
                <div className="card-hr p-16 text-center">
                    <ClipboardList size={32} className="text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Nothing here yet.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map((a) => (
                        <div key={a.id} className="card-hr p-6" data-testid={`assignment-${a.id}`}>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className={`w-10 h-10 flex items-center justify-center border ${
                                    a.status === "pending" ? "bg-primary/10 border-primary/40 text-primary" :
                                    a.status === "submitted" ? "bg-amber-500/10 border-amber-500/40 text-amber-400" :
                                    "bg-green-500/10 border-green-500/40 text-green-400"
                                }`}>
                                    {a.status === "pending" && <Clock size={16} />}
                                    {a.status === "submitted" && <CheckCircle2 size={16} />}
                                    {a.status === "graded" && <Award size={16} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-heading font-bold text-lg">{a.title}</div>
                                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                                        <span>{a.course}</span>
                                        <span className="flex items-center gap-1.5"><Calendar size={12} /> Due {new Date(a.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}</span>
                                        {a.grade && <span className="font-bold text-primary">Grade: {a.grade}</span>}
                                    </div>
                                    {a.feedback && (
                                        <div className="mt-3 p-3 bg-white/5 border-l-2 border-primary text-sm text-white/80">
                                            <span className="eyebrow block mb-1">Instructor feedback</span>
                                            {a.feedback}
                                        </div>
                                    )}
                                </div>
                                {a.status === "pending" && (
                                    <button
                                        className="btn-primary flex-shrink-0"
                                        onClick={() => toast.success("Upload started (demo)")}
                                        data-testid={`submit-${a.id}`}
                                    >
                                        <Upload size={14} /> Submit
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
