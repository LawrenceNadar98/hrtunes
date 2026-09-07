import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { COURSES, PRICING } from "@/lib/mock";
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
    CheckCircle2,
    XCircle,
    Clock,
    MessageCircle,
    ShieldCheck,
    CreditCard,
    Sparkles,
    Edit3,
    Trash2,
    RefreshCw
} from "lucide-react";
import { getAllPayments, approvePayment, rejectPayment } from "@/services/paymentService";
import { getAllEnrollments } from "@/services/enrollmentService";
import { getAllTrialBookings } from "@/services/trialService";
import { getPlans, savePlan, deletePlan, getCourses, saveCourse, seedDatabaseToFirebase } from "@/services/courseService";
import CurriculumManager from "@/components/admin/CurriculumManager";
import StudentManager from "@/components/admin/StudentManager";
import CoursesAndInstrumentsManager from "@/components/admin/CoursesAndInstrumentsManager";
import { toast } from "sonner";

const SECTIONS = [
    { id: "payments", label: "UPI Payments", badge: true },
    { id: "plans", label: "Plans Manager" },
    { id: "courses_instruments", label: "Instruments & Courses" },
    { id: "curriculum", label: "Curriculum Builder" },
    { id: "students", label: "Students" },
    { id: "overview", label: "Overview & Earnings" },
    { id: "schedule", label: "Schedule" },
    { id: "uploads", label: "Uploads" },
];

export default function Instructor() {
    const [section, setSection] = useState("payments");
    const [payments, setPayments] = useState([]);
    const [loadingPayments, setLoadingPayments] = useState(true);
    const [seeding, setSeeding] = useState(false);

    const refreshPayments = async () => {
        setLoadingPayments(true);
        const data = await getAllPayments();
        setPayments(data || []);
        setLoadingPayments(false);
    };

    const handleSeedDatabase = async () => {
        setSeeding(true);
        try {
            const res = await seedDatabaseToFirebase(true);
            if (res.success) {
                toast.success("Database seeded and synced successfully!");
                await refreshPayments();
            } else {
                toast.error("Failed to seed database: " + res.error);
            }
        } catch (e) {
            toast.error("Seeding failed: " + e.message);
        } finally {
            setSeeding(false);
        }
    };

    useEffect(() => {
        refreshPayments();
    }, []);

    const pendingCount = payments.filter((p) => p.status === "pending").length;

    return (
        <DashboardLayout
            portal="admin"
            subtitle="Instructor & Admin Control Center"
            title="Admin Studio"
            activeAdminSection={section}
            onSelectAdminSection={setSection}
            pendingPaymentsCount={pendingCount}
            actions={
                <div className="flex items-center gap-2">
                    <button
                        className="btn-outline !py-2 !px-3 text-xs flex items-center gap-1.5"
                        onClick={handleSeedDatabase}
                        disabled={seeding}
                        data-testid="admin-seed"
                        title="Seed default plans and courses to Firebase Firestore"
                    >
                        <Sparkles size={14} className="text-primary" /> {seeding ? "Seeding..." : "Seed / Sync DB"}
                    </button>
                    <button
                        className="btn-primary !py-2 !px-3 text-xs flex items-center gap-1.5"
                        onClick={() => {
                            refreshPayments();
                            toast.success("Payments & data refreshed!");
                        }}
                        data-testid="admin-refresh"
                    >
                        <RefreshCw size={14} /> Refresh Data
                    </button>
                </div>
            }
        >
            <div className="flex items-center gap-0 mb-8 border-b border-white/10 overflow-x-auto" data-testid="admin-sections">
                {SECTIONS.map((s) => (
                    <button
                        key={s.id}
                        onClick={() => setSection(s.id)}
                        className={`px-5 py-3 text-xs md:text-sm font-bold uppercase tracking-wider border-b-2 transition-all flex-shrink-0 flex items-center gap-2 ${
                            section === s.id
                                ? "border-primary text-white bg-white/5"
                                : "border-transparent text-muted-foreground hover:text-white"
                        }`}
                        data-testid={`admin-tab-${s.id}`}
                    >
                        {s.label}
                        {s.badge && pendingCount > 0 && (
                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-black rounded-full">
                                {pendingCount}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {section === "payments" && (
                <UpiPaymentsAdmin
                    payments={payments}
                    loading={loadingPayments}
                    onRefresh={refreshPayments}
                />
            )}
            {section === "plans" && <PlansAdmin />}
            {section === "courses_instruments" && <CoursesAndInstrumentsManager />}
            {section === "curriculum" && <CurriculumManager />}
            {section === "overview" && <Overview />}
            {section === "students" && <StudentManager />}
            {section === "schedule" && <ScheduleAdmin />}
            {section === "uploads" && <UploadsAdmin />}
        </DashboardLayout>
    );
}

/* ---------- 1. UPI Payments Admin ---------- */
function UpiPaymentsAdmin({ payments, loading, onRefresh }) {
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const [actionLoading, setActionLoading] = useState(null);

    const filtered = payments.filter((p) => {
        const matchesFilter = filter === "all" ? true : p.status === filter;
        const matchesSearch =
            p.studentName?.toLowerCase().includes(search.toLowerCase()) ||
            p.email?.toLowerCase().includes(search.toLowerCase()) ||
            p.utrNumber?.toLowerCase().includes(search.toLowerCase()) ||
            p.phone?.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const handleApprove = async (id, name) => {
        setActionLoading(id);
        try {
            await approvePayment(id);
            toast.success(`Payment verified for ${name}! Student account registration is unlocked.`);
            await onRefresh();
        } catch (e) {
            toast.error("Failed to verify payment");
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id, name) => {
        const reason = window.prompt("Enter rejection reason (e.g., UTR not found, invalid amount):", "UTR reference mismatch");
        if (reason === null) return;
        setActionLoading(id);
        try {
            await rejectPayment(id, reason || "Verification failed");
            toast.info(`Payment rejected for ${name}`);
            await onRefresh();
        } catch (e) {
            toast.error("Failed to reject payment");
        } finally {
            setActionLoading(null);
        }
    };

    const openWhatsApp = (phone, name, utr) => {
        const cleanPhone = phone.replace(/[^0-9]/g, "");
        const text = `Hi ${name}, this is Harsh from HR Tunes. I am reviewing your UPI payment (UTR: ${utr}).`;
        window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, "_blank");
    };

    return (
        <div className="space-y-6" data-testid="admin-payments-section">
            {/* Top Toolbar */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {["all", "pending", "verified", "rejected"].map((st) => (
                        <button
                            key={st}
                            onClick={() => setFilter(st)}
                            className={`px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider rounded-md transition ${
                                filter === st
                                    ? "bg-primary text-white"
                                    : "bg-white/5 text-neutral-400 hover:text-white border border-white/10"
                            }`}
                        >
                            {st === "all" ? "All Submissions" : st}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-2 bg-card border border-white/15 px-3 py-2 rounded-lg flex-1 max-w-sm">
                    <Search size={14} className="text-muted-foreground" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search student, UTR, email…"
                        className="bg-transparent text-xs text-white outline-none flex-1"
                    />
                </div>
            </div>

            {/* Payments Table Card */}
            <div className="card-hr overflow-hidden">
                {loading ? (
                    <div className="p-12 text-center text-neutral-400 text-sm flex items-center justify-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading payment records...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground text-sm">
                        <CreditCard className="w-10 h-10 text-neutral-600 mx-auto mb-3" />
                        No UPI payment submissions found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-xs">
                            <thead>
                                <tr className="border-b border-white/10 bg-white/5 text-neutral-400 uppercase font-mono tracking-wider">
                                    <th className="p-4">Student</th>
                                    <th className="p-4">Plan & Amount</th>
                                    <th className="p-4">Submitted UTR</th>
                                    <th className="p-4">Date / Time</th>
                                    <th className="p-4">Status</th>
                                    <th className="p-4 text-right">Verification Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {filtered.map((p) => {
                                    const isPending = p.status === "pending";
                                    const isVerified = p.status === "verified";
                                    const isRejected = p.status === "rejected";

                                    return (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            {/* Student info */}
                                            <td className="p-4">
                                                <div className="font-bold text-white text-sm">{p.studentName}</div>
                                                <div className="text-neutral-400">{p.email}</div>
                                                <div className="text-neutral-500 font-mono mt-0.5">{p.phone}</div>
                                            </td>

                                            {/* Plan & Amount */}
                                            <td className="p-4">
                                                <div className="font-semibold text-neutral-200">{p.planName}</div>
                                                <div className="font-mono font-bold text-sm text-primary">₹{p.amount}</div>
                                            </td>

                                            {/* UTR */}
                                            <td className="p-4">
                                                <span className="font-mono font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded border border-amber-400/20 text-xs tracking-wider">
                                                    {p.utrNumber}
                                                </span>
                                                <div className="text-[10px] text-neutral-500 mt-1 font-mono">{p.id}</div>
                                            </td>

                                            {/* Date */}
                                            <td className="p-4 text-neutral-400">
                                                {p.createdAt ? new Date(p.createdAt).toLocaleString() : "Recently"}
                                            </td>

                                            {/* Status Badge */}
                                            <td className="p-4">
                                                {isPending && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
                                                        <Clock size={10} /> Pending
                                                    </span>
                                                )}
                                                {isVerified && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </span>
                                                )}
                                                {isRejected && (
                                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded bg-red-500/15 text-red-400 border border-red-500/30">
                                                        <XCircle size={10} /> Rejected
                                                    </span>
                                                )}
                                            </td>

                                            {/* Actions */}
                                            <td className="p-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {isPending && (
                                                        <>
                                                            <button
                                                                type="button"
                                                                disabled={actionLoading === p.id}
                                                                onClick={() => handleApprove(p.id, p.studentName)}
                                                                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded text-xs transition flex items-center gap-1 shadow-sm shadow-emerald-600/20"
                                                            >
                                                                <CheckCircle2 size={12} /> Approve
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={actionLoading === p.id}
                                                                onClick={() => handleReject(p.id, p.studentName)}
                                                                className="px-2.5 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded text-xs transition"
                                                            >
                                                                Reject
                                                            </button>
                                                        </>
                                                    )}

                                                    {isVerified && (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(p.id, p.studentName)}
                                                            className="text-[11px] text-neutral-500 hover:text-red-400 underline"
                                                        >
                                                            Revoke
                                                        </button>
                                                    )}

                                                    {p.phone && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openWhatsApp(p.phone, p.studentName, p.utrNumber)}
                                                            className="p-1.5 bg-white/5 hover:bg-white/10 text-emerald-400 rounded border border-white/10 transition"
                                                            title="Chat on WhatsApp"
                                                        >
                                                            <MessageCircle size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

/* ---------- 2. Plans Manager Admin ---------- */
function PlansAdmin() {
    const [plans, setPlans] = useState([]);
    const [editingPlan, setEditingPlan] = useState(null);
    const [isNew, setIsNew] = useState(false);

    useEffect(() => {
        getPlans().then((data) => setPlans(data || []));
    }, []);

    const handleSave = async (e) => {
        e.preventDefault();
        await savePlan(editingPlan);
        toast.success(`Plan "${editingPlan.name}" saved!`);
        const updated = await getPlans();
        setPlans(updated);
        setEditingPlan(null);
        setIsNew(false);
    };

    const handleDelete = async (planId, planName) => {
        if (!window.confirm(`Are you sure you want to delete the plan "${planName}"?`)) return;
        await deletePlan(planId);
        toast.info(`Plan "${planName}" removed.`);
        const updated = await getPlans();
        setPlans(updated);
        if (editingPlan?.id === planId) setEditingPlan(null);
    };

    return (
        <div className="space-y-6" data-testid="admin-plans-section">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h3 className="text-heading font-bold text-xl text-white">Course Plans & Pricing Manager</h3>
                    <p className="text-xs text-muted-foreground">Manage your subscription tiers, rates, features, and call-to-action buttons. Edits sync live to the Landing page and Checkout.</p>
                </div>
                <button
                    className="btn-primary !py-2 text-xs flex items-center gap-1.5 self-start sm:self-auto"
                    onClick={() => {
                        setIsNew(true);
                        setEditingPlan({
                            id: "plan-" + Date.now(),
                            name: "New Plan",
                            tagline: "Custom track",
                            price: 2999,
                            cadence: "/month",
                            featured: false,
                            cta: "Enroll Now",
                            features: [
                                "4 live 1:1 sessions / month",
                                "All recorded modules unlocked",
                                "Weekly practice feedback",
                                "Community discord access"
                            ]
                        });
                    }}
                >
                    <Plus size={14} /> Create New Plan
                </button>
            </div>

            {/* Editing Modal/Form */}
            {editingPlan && (
                <div className="card-hr p-6 border-primary/40 bg-card/95 mb-6 shadow-2xl">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
                        <h4 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                            <Sparkles size={14} />
                            {isNew ? "Create New Pricing Plan" : `Edit Plan: ${editingPlan.name}`}
                        </h4>
                        <button onClick={() => setEditingPlan(null)} className="text-muted-foreground hover:text-white">
                            <X size={16} />
                        </button>
                    </div>
                    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="eyebrow block mb-1">Plan Name</label>
                            <input
                                required
                                value={editingPlan.name}
                                onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                                placeholder="e.g. Monthly or Free Trial"
                                className="form-input text-xs"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Price (₹ INR) - Set 0 for Free</label>
                            <input
                                required
                                type="number"
                                min="0"
                                value={editingPlan.price}
                                onChange={(e) => setEditingPlan({ ...editingPlan, price: Number(e.target.value) })}
                                className="form-input text-xs font-mono"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Billing Cadence</label>
                            <input
                                value={editingPlan.cadence || ""}
                                onChange={(e) => setEditingPlan({ ...editingPlan, cadence: e.target.value })}
                                placeholder="/month, /3 months, or /one session"
                                className="form-input text-xs"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">Tagline (Header Eyebrow)</label>
                            <input
                                value={editingPlan.tagline || ""}
                                onChange={(e) => setEditingPlan({ ...editingPlan, tagline: e.target.value })}
                                placeholder="e.g. Stay in rhythm or Best value"
                                className="form-input text-xs"
                            />
                        </div>
                        <div>
                            <label className="eyebrow block mb-1">CTA Button Text</label>
                            <input
                                value={editingPlan.cta || ""}
                                onChange={(e) => setEditingPlan({ ...editingPlan, cta: e.target.value })}
                                placeholder="e.g. Start Monthly or Book Free Trial"
                                className="form-input text-xs"
                            />
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-white">
                                <input
                                    type="checkbox"
                                    checked={Boolean(editingPlan.featured)}
                                    onChange={(e) => setEditingPlan({ ...editingPlan, featured: e.target.checked })}
                                    className="w-4 h-4 accent-red-600 rounded"
                                />
                                Highlight as "Most Popular" (Red Card Accent)
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="eyebrow block mb-1">Features Included (One feature per line)</label>
                            <textarea
                                rows={4}
                                value={editingPlan.features?.join("\n") || ""}
                                onChange={(e) => setEditingPlan({ ...editingPlan, features: e.target.value.split("\n").filter((f) => f.trim().length > 0) })}
                                placeholder="4 live 1:1 classes / month&#10;All recorded courses unlocked&#10;Weekly assignments + feedback"
                                className="form-input text-xs"
                            />
                        </div>
                        <div className="md:col-span-2 flex items-center justify-between mt-2 pt-3 border-t border-white/10">
                            {!isNew ? (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(editingPlan.id, editingPlan.name)}
                                    className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 rounded text-xs transition flex items-center gap-1.5"
                                >
                                    <Trash2 size={12} /> Delete Plan
                                </button>
                            ) : <div />}
                            <div className="flex gap-2">
                                <button type="button" onClick={() => setEditingPlan(null)} className="btn-outline !py-2 !text-xs">
                                    Cancel
                                </button>
                                <button type="submit" className="btn-primary !py-2 !text-xs">
                                    Save Plan to DB
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            )}

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {plans.map((p) => (
                    <div
                        key={p.id}
                        className={`card-hr p-6 flex flex-col justify-between relative transition-all ${
                            p.featured ? "border-primary bg-primary/5" : ""
                        }`}
                    >
                        {p.featured && (
                            <div className="absolute -top-3 left-4 bg-primary text-white text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-sm">
                                Most Popular
                            </div>
                        )}
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="text-[10px] font-mono uppercase text-muted-foreground">{p.tagline}</div>
                                    <h4 className="text-heading font-bold text-lg text-white">{p.name}</h4>
                                </div>
                                <span className="font-mono font-black text-primary text-xl">
                                    {p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}
                                </span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mt-0.5">{p.cadence}</div>

                            <ul className="mt-4 space-y-2 text-xs text-neutral-300">
                                {p.features?.map((f, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <CheckCircle2 size={12} className="text-primary shrink-0" />
                                        <span>{f}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between">
                            <span className="text-[10px] font-mono text-neutral-500 uppercase">{p.id}</span>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleDelete(p.id, p.name)}
                                    className="p-1.5 text-neutral-500 hover:text-red-400 transition"
                                    title="Delete plan"
                                >
                                    <Trash2 size={13} />
                                </button>
                                <button
                                    onClick={() => {
                                        setIsNew(false);
                                        setEditingPlan(p);
                                    }}
                                    className="btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1"
                                >
                                    <Edit3 size={12} /> Edit
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------- 4. Overview & Stats ---------- */
function Overview() {
    const [payments, setPayments] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [trials, setTrials] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            try {
                const [pmts, enrs, trls] = await Promise.all([
                    getAllPayments(),
                    getAllEnrollments(),
                    getAllTrialBookings()
                ]);
                setPayments(pmts || []);
                setEnrollments(enrs || []);
                setTrials(trls || []);
            } catch (err) {
                console.warn("Failed to load overview data:", err);
            } finally {
                setLoading(false);
            }
        }
        loadData();
    }, []);

    const verifiedPayments = payments.filter((p) => p.status === "verified");
    const totalEarnings = verifiedPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const activeStudentsCount = new Set([
        ...verifiedPayments.map((p) => p.userId || p.email),
        ...enrollments.filter((e) => e.status === "active").map((e) => e.userId || e.userEmail)
    ]).size;
    const activeTrialsCount = trials.filter((t) => t.status === "confirmed" || t.status === "pending").length;

    // Monthly breakdown for last 6 months
    const months = ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"];
    const monthlyData = months.map((m) => {
        return { m, v: Math.max(0, Math.round(totalEarnings / 6)) };
    });
    const max = Math.max(...monthlyData.map((m) => m.v), 1);

    if (loading) {
        return (
            <div className="p-12 text-center text-sm text-neutral-400 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-primary" /> Loading overview metrics...
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4" data-testid="admin-stats">
                <StatCard
                    icon={DollarSign}
                    label="Total earnings"
                    value={`₹${totalEarnings.toLocaleString("en-IN")}`}
                    trend={`${verifiedPayments.length} verified`}
                />
                <StatCard
                    icon={TrendingUp}
                    label="Active Subscriptions"
                    value={activeStudentsCount}
                    trend="Paid Students"
                    accent
                />
                <StatCard
                    icon={Users}
                    label="Free Trial Bookings"
                    value={activeTrialsCount}
                    trend="1-on-1 Sessions"
                />
                <StatCard
                    icon={Star}
                    label="Student Satisfaction"
                    value="5.0★"
                    trend="100% Rating"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card-hr p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="eyebrow">Verified Revenue</div>
                            <div className="text-heading font-bold text-xl">Revenue Overview</div>
                        </div>
                        <div className="text-2xl text-heading font-black text-primary">
                            ₹{totalEarnings.toLocaleString("en-IN")}
                        </div>
                    </div>
                    <div className="flex items-end gap-3 h-56">
                        {monthlyData.map((m, i) => (
                            <div key={m.m} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full flex items-end justify-center h-full">
                                    <div
                                        className={`w-full transition-all hover:brightness-125 ${
                                            i === monthlyData.length - 1 ? "bg-primary" : "bg-white/20"
                                        }`}
                                        style={{ height: `${Math.max(15, (m.v / max) * 100)}%` }}
                                        title={`₹${m.v}`}
                                    />
                                </div>
                                <div className="text-[10px] font-mono text-muted-foreground">{m.m}</div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card-hr p-6">
                    <div className="eyebrow mb-3">Core Programs</div>
                    <div className="text-heading font-bold text-lg">3-Month Guitar Foundation</div>
                    <div className="text-sm text-muted-foreground mt-0.5">₹7,500 · 2x Weekly Live Sessions</div>
                    <div className="divider-dashed my-5" />
                    <div className="eyebrow mb-3">Next Live Class</div>
                    <div className="text-sm font-bold">Weekly Live Batch Masterclass</div>
                    <div className="text-xs text-muted-foreground mt-1">Tuesday & Thursday · 7:00 PM IST</div>
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
                <div className="text-heading font-black text-2xl lg:text-3xl leading-none">{value}</div>
                <span className="text-[10px] text-green-400 font-bold">{trend}</span>
            </div>
        </div>
    );
}

/* ---------- 5. Schedule Admin ---------- */
function ScheduleAdmin() {
    const today = new Date();
    const upcomingSchedule = [
        {
            id: "sched-1",
            title: "Live Rhythm & Strumming Mechanics Lab",
            date: new Date(Date.now() + 86400000).toISOString(),
            time: "07:00 PM IST",
            duration: 60,
            attendees: 14
        },
        {
            id: "sched-2",
            title: "Fretboard Navigation & Lead Technique Masterclass",
            date: new Date(Date.now() + 3 * 86400000).toISOString(),
            time: "07:00 PM IST",
            duration: 60,
            attendees: 18
        }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-testid="admin-schedule">
            <div className="lg:col-span-2 space-y-3">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-heading font-bold text-lg">Upcoming Live Sessions</h3>
                    <button className="btn-primary !py-2 !text-xs" onClick={() => toast.info("Live batch class scheduled")}>
                        <Calendar size={13} /> Add Schedule
                    </button>
                </div>
                {upcomingSchedule.map((lc) => (
                    <div key={lc.id} className="card-hr p-5 flex items-center gap-4" data-testid={`admin-class-${lc.id}`}>
                        <div className="flex-shrink-0 bg-primary/10 border border-primary/40 p-3 text-center min-w-[70px] rounded">
                            <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                {new Date(lc.date).toLocaleDateString("en-IN", { month: "short" })}
                            </div>
                            <div className="text-heading font-black text-xl leading-none">
                                {new Date(lc.date).getDate()}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="font-bold text-sm text-white">{lc.title}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                                {lc.time} · {lc.duration} min · {lc.attendees} students enrolled
                            </div>
                        </div>
                        <button className="text-muted-foreground hover:text-white p-2">
                            <MoreHorizontal size={16} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="card-hr p-6 h-fit">
                <div className="eyebrow mb-4">Quick Schedule Batch</div>
                <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); toast.success("Live class scheduled"); }}>
                    <label className="block">
                        <span className="eyebrow block mb-2">Title</span>
                        <input type="text" defaultValue="Weekly Live Masterclass" className="w-full bg-card border border-white/15 px-3 py-2.5 text-xs outline-none focus:border-primary text-white" />
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        <label className="block">
                            <span className="eyebrow block mb-2">Date</span>
                            <input type="date" defaultValue={new Date().toISOString().split("T")[0]} className="w-full bg-card border border-white/15 px-3 py-2.5 text-xs outline-none focus:border-primary text-white" />
                        </label>
                        <label className="block">
                            <span className="eyebrow block mb-2">Time</span>
                            <input type="time" defaultValue="19:00" className="w-full bg-card border border-white/15 px-3 py-2.5 text-xs outline-none focus:border-primary text-white" />
                        </label>
                    </div>
                    <button type="submit" className="btn-primary w-full !text-xs !py-2.5">Schedule Live Class</button>
                </form>
            </div>
        </div>
    );
}

/* ---------- 7. Uploads Admin ---------- */
function UploadsAdmin() {
    const [files, setFiles] = useState([]);
    const [dragOver, setDragOver] = useState(false);

    const onDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const newFiles = Array.from(e.dataTransfer.files).map((f) => ({
            id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            type: f.type || "unknown",
        }));
        setFiles([...files, ...newFiles]);
        toast.success(`${newFiles.length} file(s) added`);
    };

    const onSelect = (e) => {
        const newFiles = Array.from(e.target.files).map((f) => ({
            id: `${f.name}-${f.size}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: f.name,
            size: (f.size / 1024).toFixed(1) + " KB",
            type: f.type || "unknown",
        }));
        setFiles([...files, ...newFiles]);
    };

    const remove = (id) => setFiles(files.filter((f) => f.id !== id));

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
                            {files.map((f) => (
                                <li key={f.id} className="flex items-center gap-3 p-3 border border-white/10 hover:border-primary/40 transition-colors">
                                    <div className="w-8 h-8 bg-primary/10 border border-primary/30 flex items-center justify-center">
                                        <Music2 size={13} className="text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">{f.name}</div>
                                        <div className="text-xs text-muted-foreground">{f.size}</div>
                                    </div>
                                    <button onClick={() => remove(f.id)} className="text-muted-foreground hover:text-primary p-1">
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
