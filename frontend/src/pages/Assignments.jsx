import DashboardLayout from "@/components/layout/DashboardLayout";
import { ASSIGNMENTS } from "@/lib/mock";
import { ClipboardList, Calendar, Upload, CheckCircle2, Clock, Award } from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";

const TABS = [
    { id: "pending", label: "Pending" },
    { id: "submitted", label: "Submitted" },
    { id: "graded", label: "Graded" },
];

const STATUS_STYLES = {
    pending: { bg: "bg-primary/10 border-primary/40 text-primary", Icon: Clock },
    submitted: { bg: "bg-amber-500/10 border-amber-500/40 text-amber-400", Icon: CheckCircle2 },
    graded: { bg: "bg-green-500/10 border-green-500/40 text-green-400", Icon: Award },
};

function StatusBadge({ status }) {
    const { bg, Icon } = STATUS_STYLES[status] || STATUS_STYLES.pending;
    return (
        <div className={`w-10 h-10 flex items-center justify-center border ${bg}`}>
            <Icon size={16} />
        </div>
    );
}

function TabButton({ id, label, count, active, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wider border-b-2 transition-all ${
                active ? "border-primary text-white" : "border-transparent text-muted-foreground hover:text-white"
            }`}
            data-testid={`tab-${id}`}
        >
            {label} <span className="ml-2 text-xs opacity-60">{count}</span>
        </button>
    );
}

function AssignmentCard({ assignment }) {
    const dueLabel = new Date(assignment.dueDate).toLocaleDateString("en-IN", {
        month: "short",
        day: "numeric",
    });
    return (
        <div className="card-hr p-6" data-testid={`assignment-${assignment.id}`}>
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <StatusBadge status={assignment.status} />
                <div className="flex-1 min-w-0">
                    <div className="text-heading font-bold text-lg">{assignment.title}</div>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{assignment.course}</span>
                        <span className="flex items-center gap-1.5">
                            <Calendar size={12} /> Due {dueLabel}
                        </span>
                        {assignment.grade && (
                            <span className="font-bold text-primary">Grade: {assignment.grade}</span>
                        )}
                    </div>
                    {assignment.feedback && (
                        <div className="mt-3 p-3 bg-white/5 border-l-2 border-primary text-sm text-white/80">
                            <span className="eyebrow block mb-1">Instructor feedback</span>
                            {assignment.feedback}
                        </div>
                    )}
                </div>
                {assignment.status === "pending" && (
                    <button
                        className="btn-primary flex-shrink-0"
                        onClick={() => toast.success("Upload started (demo)")}
                        data-testid={`submit-${assignment.id}`}
                    >
                        <Upload size={14} /> Submit
                    </button>
                )}
            </div>
        </div>
    );
}

function EmptyState() {
    return (
        <div className="card-hr p-16 text-center">
            <ClipboardList size={32} className="text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nothing here yet.</p>
        </div>
    );
}

export default function Assignments() {
    const [tab, setTab] = useState("pending");
    const countsByStatus = useMemo(() => {
        return ASSIGNMENTS.reduce((acc, a) => {
            acc[a.status] = (acc[a.status] || 0) + 1;
            return acc;
        }, {});
    }, []);
    const filtered = useMemo(
        () => ASSIGNMENTS.filter((a) => a.status === tab),
        [tab]
    );

    return (
        <DashboardLayout subtitle="Practice log" title="Assignments">
            <div
                className="flex items-center gap-0 mb-8 border-b border-white/10"
                data-testid="assignment-tabs"
            >
                {TABS.map((t) => (
                    <TabButton
                        key={t.id}
                        id={t.id}
                        label={t.label}
                        count={countsByStatus[t.id] || 0}
                        active={tab === t.id}
                        onClick={() => setTab(t.id)}
                    />
                ))}
            </div>

            {filtered.length === 0 ? (
                <EmptyState />
            ) : (
                <div className="space-y-4">
                    {filtered.map((a) => (
                        <AssignmentCard key={a.id} assignment={a} />
                    ))}
                </div>
            )}
        </DashboardLayout>
    );
}
