import React, { useState, useEffect, useMemo } from "react";
import {
    Search,
    Filter,
    Users,
    Sparkles,
    CheckCircle2,
    Clock,
    XCircle,
    AlertCircle,
    ArrowRight,
    Eye,
    CreditCard,
    BookOpen,
    Calendar,
    MessageCircle,
    UserCheck,
    Shield,
    X,
    Edit3,
    FileText,
    ExternalLink,
    RefreshCw,
    Download
} from "lucide-react";
import { getAllEnrollments, updateEnrollmentStatus, deleteEnrollment } from "@/services/enrollmentService";
import { getAllPayments, approvePayment, rejectPayment } from "@/services/paymentService";
import { getAllTrialBookings, updateTrialBookingStatus } from "@/services/trialService";
import { getAllUsers } from "@/services/authService";
import { getPlans } from "@/services/courseService";
import { getCurriculums } from "@/services/curriculumService";
import { toast } from "sonner";

const isStaffIdentity = (email = "", id = "", name = "") => {
    const cleanE = (email || "").toLowerCase().trim();
    const cleanId = (id || "").toLowerCase();
    const cleanN = (name || "").toLowerCase();
    return (
        cleanE === "admin@hrtunes.in" ||
        cleanE.includes("instructor") ||
        cleanE.includes("admin@") ||
        cleanId === "inst-harsh" ||
        cleanId.startsWith("inst-") ||
        (cleanN.includes("harsh patel") && cleanE === "admin@hrtunes.in")
    );
};

export default function StudentManager() {
    const [users, setUsers] = useState([]);
    const [enrollments, setEnrollments] = useState([]);
    const [payments, setPayments] = useState([]);
    const [trials, setTrials] = useState([]);
    const [plans, setPlans] = useState([]);
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState("all");
    const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState("all");
    const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

    // Drawer state
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [activeDrawerTab, setActiveDrawerTab] = useState("profile"); // 'profile'|'enrollment'|'payments'|'curriculum'|'schedule'|'trials'|'notes'
    const [instructorNoteInput, setInstructorNoteInput] = useState("");

    const loadAllData = async () => {
        setLoading(true);
        try {
            const [u, enr, pay, trl, pln, cur] = await Promise.all([
                getAllUsers(),
                getAllEnrollments(),
                getAllPayments(),
                getAllTrialBookings(),
                getPlans(),
                getCurriculums()
            ]);
            setUsers(u || []);
            setEnrollments(enr || []);
            setPayments(pay || []);
            setTrials(trl || []);
            setPlans(pln || []);
            setCurriculums(cur || []);
        } catch (err) {
            console.error("Failed to load student data:", err);
            toast.error("Failed to load student records.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAllData();
    }, []);

    // Combine users with their enrollments, payments, and trials into unified Student aggregates
    const aggregatedStudents = useMemo(() => {
        // Collect all distinct student identities from users, enrollments, trials, and payments
        const map = new Map();

        users
            .filter((u) => !isStaffIdentity(u.email, u.id, u.name) && u.role !== "instructor" && u.role !== "admin")
            .forEach((u) => {
                const id = u.id || u.uid;
                map.set(id, {
                    id,
                    name: u.name || "Student",
                    email: (u.email || "").toLowerCase(),
                    phone: u.phone || "",
                    avatar: u.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                    registeredAt: u.createdAt || "2026-02-01T10:00:00.000Z",
                    enrollments: [],
                    payments: [],
                    trials: [],
                    notes: u.notes || []
                });
            });

        // Attach enrollments
        enrollments.forEach((enr) => {
            if (isStaffIdentity(enr.userEmail, enr.userId, enr.userName)) return;

            let s = map.get(enr.userId);
            if (!s) {
                // Find by email
                for (const item of map.values()) {
                    if (item.email === enr.userEmail?.toLowerCase()) {
                        s = item;
                        break;
                    }
                }
            }
            if (!s) {
                const newId = enr.userId || "usr-" + Math.random().toString(36).substring(2, 7);
                s = {
                    id: newId,
                    name: enr.userName || "Student",
                    email: (enr.userEmail || "").toLowerCase(),
                    phone: "",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                    registeredAt: enr.createdAt,
                    enrollments: [],
                    payments: [],
                    trials: [],
                    notes: []
                };
                map.set(newId, s);
            }
            if (enr.userName && enr.userName !== "Student") {
                s.name = enr.userName;
            }
            s.enrollments.push(enr);
        });

        // Attach payments
        payments.forEach((pay) => {
            if (isStaffIdentity(pay.email, pay.userId, pay.studentName)) return;

            let s = map.get(pay.userId);
            if (!s) {
                for (const item of map.values()) {
                    if (item.email === pay.email?.toLowerCase()) {
                        s = item;
                        break;
                    }
                }
            }
            if (!s) {
                const newId = pay.userId || "usr-" + Math.random().toString(36).substring(2, 7);
                s = {
                    id: newId,
                    name: pay.studentName || "Student",
                    email: (pay.email || "").toLowerCase(),
                    phone: pay.phone || "",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                    registeredAt: pay.createdAt,
                    enrollments: [],
                    payments: [],
                    trials: [],
                    notes: []
                };
                map.set(newId, s);
            }
            if (pay.studentName && pay.studentName !== "Student" && (!s.name || s.name === "Student")) {
                s.name = pay.studentName;
            }
            if (pay.phone && !s.phone) s.phone = pay.phone;
            s.payments.push(pay);
        });

        // Attach trials
        trials.forEach((trl) => {
            if (isStaffIdentity(trl.userEmail, trl.userId, trl.userName)) return;

            let s = map.get(trl.userId);
            if (!s) {
                for (const item of map.values()) {
                    if (item.email === trl.userEmail?.toLowerCase()) {
                        s = item;
                        break;
                    }
                }
            }
            if (!s) {
                const newId = trl.userId || "usr-" + Math.random().toString(36).substring(2, 7);
                s = {
                    id: newId,
                    name: trl.userName || "Student",
                    email: (trl.userEmail || "").toLowerCase(),
                    phone: trl.phone || "",
                    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
                    registeredAt: trl.createdAt,
                    enrollments: [],
                    payments: [],
                    trials: [],
                    notes: []
                };
                map.set(newId, s);
            }
            if (trl.userName && trl.userName !== "Student" && (!s.name || s.name === "Student")) {
                s.name = trl.userName;
            }
            if (trl.phone && !s.phone) s.phone = trl.phone;
            s.trials.push(trl);
        });

        return Array.from(map.values());
    }, [users, enrollments, payments, trials]);

    // Filter students
    const filteredStudents = useMemo(() => {
        return aggregatedStudents.filter((student) => {
            // Search query
            const q = searchQuery.toLowerCase().trim();
            if (q) {
                const matchName = student.name?.toLowerCase().includes(q);
                const matchEmail = student.email?.toLowerCase().includes(q);
                const matchPhone = student.phone?.includes(q);
                const matchId = student.id?.toLowerCase().includes(q);
                const matchEnrId = student.enrollments?.some((e) => e.id?.toLowerCase().includes(q));
                const matchTrialId = student.trials?.some((t) => t.id?.toLowerCase().includes(q));
                const matchUtr = student.payments?.some((p) => p.utrNumber?.toLowerCase().includes(q));
                if (!matchName && !matchEmail && !matchPhone && !matchId && !matchEnrId && !matchTrialId && !matchUtr) {
                    return false;
                }
            }

            // Plan filter
            if (planFilter !== "all") {
                if (planFilter === "trial_only" || planFilter === "free-trial" || planFilter === "trial") {
                    const hasTrial = (student.trials && student.trials.length > 0) || 
                                     (student.enrollments && student.enrollments.some((e) => e.planId === "free-trial" || e.planId === "trial"));
                    if (!hasTrial) return false;
                } else {
                    const hasPlan = student.enrollments && student.enrollments.some((e) => e.planId === planFilter);
                    if (!hasPlan) return false;
                }
            }

            // Enrollment status filter
            if (enrollmentStatusFilter !== "all") {
                if (enrollmentStatusFilter === "trial_booked" || enrollmentStatusFilter === "trial") {
                    const hasTrial = student.trials && student.trials.length > 0;
                    if (!hasTrial) return false;
                } else if (enrollmentStatusFilter === "active") {
                    const hasActiveEnr = student.enrollments && student.enrollments.some((e) => e.status === "active");
                    const hasActiveTrial = student.trials && student.trials.some((t) => t.status === "confirmed" || t.status === "pending");
                    if (!hasActiveEnr && !hasActiveTrial) return false;
                } else {
                    const hasStatus = student.enrollments && student.enrollments.some((e) => e.status === enrollmentStatusFilter);
                    if (!hasStatus) return false;
                }
            }

            // Payment status filter
            if (paymentStatusFilter !== "all") {
                if (paymentStatusFilter === "free_trial" || paymentStatusFilter === "complimentary") {
                    if (student.trials.length === 0 || student.payments.length > 0) return false;
                } else {
                    const hasPayStatus = student.payments && student.payments.some((p) => p.status === paymentStatusFilter);
                    if (!hasPayStatus) return false;
                }
            }

            return true;
        });
    }, [aggregatedStudents, searchQuery, planFilter, enrollmentStatusFilter, paymentStatusFilter]);

    // Metric counts
    const activeCount = aggregatedStudents.filter((s) => s.enrollments.some((e) => e.status === "active")).length;
    const pendingPaymentCount = aggregatedStudents.filter((s) => s.enrollments.some((e) => e.status === "pending_payment")).length;
    const trialCount = aggregatedStudents.filter((s) => s.trials.length > 0).length;

    // Handlers for Drawer actions
    const handleStatusChange = async (enrollmentId, newStatus) => {
        try {
            await updateEnrollmentStatus(enrollmentId, newStatus);
            toast.success(`Enrollment status updated to "${newStatus}"`);
            loadAllData();
            if (selectedStudent) {
                setSelectedStudent((prev) => ({
                    ...prev,
                    enrollments: prev.enrollments.map((e) =>
                        e.id === enrollmentId ? { ...e, status: newStatus } : e
                    )
                }));
            }
        } catch (err) {
            toast.error("Failed to update status.");
        }
    };

    const handleVerifyPayment = async (paymentId) => {
        try {
            await approvePayment(paymentId);
            toast.success("Payment verified & Enrollment activated!");
            loadAllData();
            if (selectedStudent) {
                setSelectedStudent((prev) => ({
                    ...prev,
                    payments: prev.payments.map((p) =>
                        p.id === paymentId ? { ...p, status: "verified" } : p
                    ),
                    enrollments: prev.enrollments.map((e) => ({ ...e, status: "active" }))
                }));
            }
        } catch (err) {
            toast.error("Failed to verify payment.");
        }
    };

    const handleAddInstructorNote = () => {
        if (!instructorNoteInput.trim() || !selectedStudent) return;
        const newNote = {
            id: "note-" + Date.now(),
            text: instructorNoteInput.trim(),
            author: "Harsh Patel",
            createdAt: new Date().toISOString()
        };
        const updatedNotes = [newNote, ...(selectedStudent.notes || [])];
        setSelectedStudent((prev) => ({ ...prev, notes: updatedNotes }));
        setInstructorNoteInput("");
        toast.success("Note added to student file.");
    };

    const handleExportCSV = () => {
        const headers = ["Student ID", "Name", "Email", "Phone", "Plan", "Enrollment Status", "Payment Status", "Registered At"];
        const rows = filteredStudents.map((s) => {
            const activeEnr = s.enrollments[0];
            const latestPay = s.payments[0];
            return [
                s.id,
                `"${s.name}"`,
                s.email,
                `"${s.phone}"`,
                `"${activeEnr?.planName || (s.trials.length > 0 ? "Free Trial" : "None")}"`,
                activeEnr?.status || (s.trials.length > 0 ? "trial_booked" : "unsubscribed"),
                latestPay?.status || "n/a",
                s.registeredAt
            ];
        });
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hrtunes_students_roster_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Students roster exported as CSV!");
    };

    return (
        <div className="space-y-6" data-testid="student-manager">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-hr p-5 border-white/15">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground mb-2">
                        <Users size={14} className="text-primary" /> Total Students
                    </div>
                    <div className="text-display text-3xl font-black">{aggregatedStudents.length}</div>
                </div>
                <div className="card-hr p-5 border-emerald-500/30 bg-emerald-500/5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-emerald-400 mb-2">
                        <CheckCircle2 size={14} /> Active Subscriptions
                    </div>
                    <div className="text-display text-3xl font-black text-emerald-400">{activeCount}</div>
                </div>
                <div className="card-hr p-5 border-amber-500/30 bg-amber-500/5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-amber-400 mb-2">
                        <Clock size={14} /> Pending Payments
                    </div>
                    <div className="text-display text-3xl font-black text-amber-400">{pendingPaymentCount}</div>
                </div>
                <div className="card-hr p-5 border-primary/30 bg-primary/5">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-primary mb-2">
                        <Sparkles size={14} /> Free Trial Bookings
                    </div>
                    <div className="text-display text-3xl font-black text-primary">{trialCount}</div>
                </div>
            </div>

            {/* Filter & Search Toolbar */}
            <div className="card-hr p-5 space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                    {/* Search input */}
                    <div className="flex items-center gap-2 bg-background border border-white/15 px-3 py-2 flex-1 max-w-md rounded">
                        <Search size={15} className="text-muted-foreground shrink-0" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search by student name, email, phone, UTR or enrollment ID…"
                            className="bg-transparent text-xs text-white outline-none w-full"
                            data-testid="students-search-input"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery("")} className="text-xs text-muted-foreground hover:text-white">
                                <X size={13} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExportCSV}
                            className="btn-outline !py-2 !px-3 !text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download size={13} /> Export CSV
                        </button>
                        <button
                            onClick={loadAllData}
                            className="btn-outline !py-2 !px-3 !text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Refresh
                        </button>
                    </div>
                </div>

                {/* Dropdown Filters */}
                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Filter size={13} /> Filters:
                    </div>

                    {/* Plan Filter */}
                    <select
                        value={planFilter}
                        onChange={(e) => setPlanFilter(e.target.value)}
                        className="bg-background border border-white/15 px-3 py-1.5 rounded text-white outline-none cursor-pointer"
                        data-testid="plan-filter"
                    >
                        <option value="all">All Plans</option>
                        {plans.map((p) => (
                            <option key={p.id} value={p.id}>{p.name} (₹{p.price})</option>
                        ))}
                        <option value="trial_only">Trial Only (No Paid Plan)</option>
                    </select>

                    {/* Enrollment Status Filter */}
                    <select
                        value={enrollmentStatusFilter}
                        onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                        className="bg-background border border-white/15 px-3 py-1.5 rounded text-white outline-none cursor-pointer"
                        data-testid="enrollment-status-filter"
                    >
                        <option value="all">All Enrollment Statuses</option>
                        <option value="active">Active (Paid Subscriptions)</option>
                        <option value="trial_booked">Free Trial Booked</option>
                        <option value="pending_payment">Pending Payment</option>
                        <option value="suspended">Suspended</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>

                    {/* Payment Status Filter */}
                    <select
                        value={paymentStatusFilter}
                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                        className="bg-background border border-white/15 px-3 py-1.5 rounded text-white outline-none cursor-pointer"
                        data-testid="payment-status-filter"
                    >
                        <option value="all">All Payment Statuses</option>
                        <option value="verified">Verified (Approved)</option>
                        <option value="pending">Pending Approval</option>
                        <option value="free_trial">Complimentary (₹0 Trial)</option>
                        <option value="rejected">Rejected / Failed</option>
                    </select>

                    {(searchQuery || planFilter !== "all" || enrollmentStatusFilter !== "all" || paymentStatusFilter !== "all") && (
                        <button
                            onClick={() => {
                                setSearchQuery("");
                                setPlanFilter("all");
                                setEnrollmentStatusFilter("all");
                                setPaymentStatusFilter("all");
                            }}
                            className="text-primary hover:underline ml-auto cursor-pointer"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            </div>

            {/* Students Table */}
            <div className="card-hr overflow-hidden">
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5 text-[11px] font-mono uppercase tracking-wider text-muted-foreground">
                    <div className="col-span-4">Student Profile</div>
                    <div className="col-span-3">Plan & Enrollment</div>
                    <div className="col-span-2">Payment Status</div>
                    <div className="col-span-2">Trial / Progress</div>
                    <div className="col-span-1 text-right">Actions</div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="p-12 text-center space-y-3">
                        <Users size={32} className="mx-auto text-muted-foreground opacity-40" />
                        <h4 className="font-bold text-base text-white">No students matched the criteria</h4>
                        <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                            Try adjusting your search query or reset the plan & status filters.
                        </p>
                    </div>
                ) : (
                    filteredStudents.map((student) => {
                        const activeEnrollment = student.enrollments.find((e) => e.status === "active") || student.enrollments[0];
                        const latestPayment = student.payments[0];
                        const latestTrial = student.trials[0];

                        return (
                            <div
                                key={student.id}
                                className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center"
                                data-testid={`student-row-${student.id}`}
                            >
                                {/* Col 1: Profile */}
                                <div className="col-span-1 md:col-span-4 flex items-center gap-3">
                                    <img
                                        src={student.avatar}
                                        alt={student.name}
                                        className="w-10 h-10 rounded-full object-cover border border-white/15 shrink-0"
                                    />
                                    <div className="min-w-0">
                                        <div className="font-bold text-sm text-white truncate flex items-center gap-2">
                                            {student.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">{student.email}</div>
                                        {student.phone && (
                                            <div className="text-[11px] font-mono text-primary truncate mt-0.5">
                                                {student.phone}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Col 2: Plan & Enrollment */}
                                <div className="col-span-1 md:col-span-3">
                                    {activeEnrollment ? (
                                        <div className="space-y-1">
                                            <div className="text-sm font-semibold text-white truncate">
                                                {activeEnrollment.planName}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                    activeEnrollment.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                    activeEnrollment.status === "pending_payment" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                                    "bg-red-500/20 text-red-400 border border-red-500/30"
                                                }`}>
                                                    {activeEnrollment.status.replace("_", " ")}
                                                </span>
                                                <span className="text-[11px] font-mono text-muted-foreground">
                                                    ₹{activeEnrollment.planPrice?.toLocaleString("en-IN")}
                                                </span>
                                            </div>
                                        </div>
                                    ) : latestTrial ? (
                                        <div className="space-y-1">
                                            <div className="text-xs font-semibold text-primary">Free 1-on-1 Trial</div>
                                            <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                                {latestTrial.status}
                                            </span>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground italic">No enrollment</span>
                                    )}
                                </div>

                                {/* Col 3: Payment Status */}
                                <div className="col-span-1 md:col-span-2">
                                    {latestPayment ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className={`w-2 h-2 rounded-full ${
                                                    latestPayment.status === "verified" ? "bg-emerald-400" :
                                                    latestPayment.status === "pending" ? "bg-amber-400 animate-pulse" :
                                                    "bg-red-400"
                                                }`} />
                                                <span className="text-xs font-semibold capitalize">{latestPayment.status}</span>
                                            </div>
                                            <div className="text-[11px] font-mono text-muted-foreground truncate">
                                                UTR: {latestPayment.utrNumber}
                                            </div>
                                        </div>
                                    ) : latestTrial ? (
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-1.5">
                                                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                                                <span className="text-xs font-semibold text-emerald-400">Complimentary</span>
                                            </div>
                                            <div className="text-[11px] font-mono text-muted-foreground">₹0 (Free Trial)</div>
                                        </div>
                                    ) : (
                                        <span className="text-xs text-muted-foreground">No payments</span>
                                    )}
                                </div>

                                {/* Col 4: Progress / Trial Date */}
                                <div className="col-span-1 md:col-span-2 text-xs text-neutral-300">
                                    {latestTrial ? (
                                        <div>
                                            <div className="text-[11px] text-muted-foreground uppercase tracking-wider">Trial Scheduled</div>
                                            <div className="font-semibold text-white">{latestTrial.scheduledDate}</div>
                                            <div className="text-[10px] text-muted-foreground">{latestTrial.timeSlot?.split("IST")[0]}</div>
                                        </div>
                                    ) : (
                                        <div>
                                            <div className="flex items-center justify-between text-[11px] mb-1 text-muted-foreground">
                                                <span>Curriculum Progress</span>
                                                <span className="font-mono">{activeEnrollment?.status === "active" ? "0%" : "—"}</span>
                                            </div>
                                            <div className="h-1 bg-white/10 overflow-hidden rounded">
                                                <div className="h-full bg-primary" style={{ width: activeEnrollment?.status === "active" ? "0%" : "0%" }} />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Col 5: Action */}
                                <div className="col-span-1 md:col-span-1 text-right">
                                    <button
                                        onClick={() => {
                                            setSelectedStudent(student);
                                            setActiveDrawerTab("profile");
                                        }}
                                        className="btn-outline !py-1.5 !px-3 !text-xs flex items-center gap-1 ml-auto cursor-pointer"
                                        data-testid={`view-student-${student.id}`}
                                    >
                                        <Eye size={12} /> Details
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Comprehensive Student Detail Drawer / Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-2xl bg-neutral-950 border-l border-white/15 h-full flex flex-col shadow-2xl overflow-hidden">
                        {/* Drawer Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-card">
                            <div className="flex items-center gap-3">
                                <img
                                    src={selectedStudent.avatar}
                                    alt={selectedStudent.name}
                                    className="w-12 h-12 rounded-full object-cover border-2 border-primary"
                                />
                                <div>
                                    <h3 className="text-heading font-bold text-xl text-white">{selectedStudent.name}</h3>
                                    <p className="text-xs text-muted-foreground font-mono">{selectedStudent.email} · ID: {selectedStudent.id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="w-8 h-8 rounded-full border border-white/15 flex items-center justify-center text-muted-foreground hover:text-white hover:border-white transition-colors cursor-pointer"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex items-center gap-1 px-6 py-2 border-b border-white/10 bg-white/5 overflow-x-auto text-xs">
                            {[
                                { id: "profile", label: "Profile", icon: UserCheck },
                                { id: "enrollment", label: "Enrollment", icon: Shield },
                                { id: "payments", label: "Payments", icon: CreditCard },
                                { id: "curriculum", label: "Curriculum & Progress", icon: BookOpen },
                                { id: "trials", label: "Trial History", icon: Sparkles },
                                { id: "notes", label: "Instructor Notes", icon: FileText }
                            ].map((t) => {
                                const Icon = t.icon;
                                const isSel = activeDrawerTab === t.id;
                                return (
                                    <button
                                        key={t.id}
                                        onClick={() => setActiveDrawerTab(t.id)}
                                        className={`flex items-center gap-1.5 px-3 py-2 font-bold uppercase tracking-wider rounded transition-all shrink-0 cursor-pointer ${
                                            isSel
                                                ? "bg-primary text-white"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                                        }`}
                                    >
                                        <Icon size={13} /> {t.label}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Drawer Tab Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* TAB 1: PROFILE */}
                            {activeDrawerTab === "profile" && (
                                <div className="space-y-6">
                                    <div className="card-hr p-5 space-y-4">
                                        <div className="eyebrow text-primary">Student Information</div>
                                        <div className="grid grid-cols-2 gap-4 text-xs">
                                            <div>
                                                <span className="text-muted-foreground block">Full Name:</span>
                                                <strong className="text-white text-sm">{selectedStudent.name}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Email Address:</span>
                                                <strong className="text-white text-sm">{selectedStudent.email}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Phone / WhatsApp:</span>
                                                <strong className="text-white text-sm">{selectedStudent.phone || "Not provided"}</strong>
                                            </div>
                                            <div>
                                                <span className="text-muted-foreground block">Registered On:</span>
                                                <strong className="text-white text-sm">{new Date(selectedStudent.registeredAt).toLocaleDateString()}</strong>
                                            </div>
                                        </div>

                                        {selectedStudent.phone && (
                                            <a
                                                href={`https://wa.me/${selectedStudent.phone.replace(/[^0-9]/g, "")}`}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-2 w-fit mt-2 cursor-pointer"
                                            >
                                                <MessageCircle size={14} /> Chat on WhatsApp
                                            </a>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* TAB 2: ENROLLMENT */}
                            {activeDrawerTab === "enrollment" && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="eyebrow text-primary">Subscriptions & Entitlements</div>
                                    </div>

                                    {selectedStudent.enrollments.length === 0 ? (
                                        selectedStudent.trials.length > 0 ? (
                                            <div className="card-hr p-5 space-y-4 border-primary/30 bg-primary/5">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-base text-white">Free 1-on-1 Trial Assessment</h4>
                                                        <span className="text-xs text-muted-foreground font-mono">Booking ID: {selectedStudent.trials[0].id}</span>
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded bg-primary/20 text-primary border border-primary/30">
                                                        {selectedStudent.trials[0].status}
                                                    </span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded font-mono">
                                                    <div>
                                                        <span className="text-muted-foreground block">Scheduled Date:</span>
                                                        <span className="text-white font-bold">{selectedStudent.trials[0].scheduledDate}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Time Slot:</span>
                                                        <span className="text-white font-bold">{selectedStudent.trials[0].timeSlot}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Instructor:</span>
                                                        <span className="text-white font-bold">{selectedStudent.trials[0].instructorName || "Harsh Patel"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Fee:</span>
                                                        <span className="text-emerald-400 font-bold">₹0 (Complimentary)</span>
                                                    </div>
                                                </div>
                                                {selectedStudent.trials[0].meetingLink && (
                                                    <a
                                                        href={selectedStudent.trials[0].meetingLink}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-2 w-fit"
                                                    >
                                                        <ExternalLink size={13} /> Open Google Meet Link
                                                    </a>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="card-hr p-6 text-center text-xs text-muted-foreground">
                                                No enrollment record found for this student.
                                            </div>
                                        )
                                    ) : (
                                        selectedStudent.enrollments.map((enr) => (
                                            <div key={enr.id} className="card-hr p-5 space-y-4 border-white/15">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-base text-white">{enr.planName}</h4>
                                                        <span className="text-xs text-muted-foreground font-mono">ID: {enr.id}</span>
                                                    </div>
                                                    <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded ${
                                                        enr.status === "active" ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
                                                        enr.status === "pending_payment" ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
                                                        "bg-red-500/20 text-red-400 border border-red-500/30"
                                                    }`}>
                                                        {enr.status.replace("_", " ")}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 text-xs bg-white/5 p-3 rounded font-mono">
                                                    <div>
                                                        <span className="text-muted-foreground block">Tuition Fee:</span>
                                                        <span className="text-white font-bold">₹{enr.planPrice?.toLocaleString("en-IN")}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Terms Version Accepted:</span>
                                                        <span className="text-emerald-400 font-bold">{enr.termsVersion || "v1.2-2026"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Terms Accepted Timestamp:</span>
                                                        <span className="text-white">{enr.termsAcceptedAt ? new Date(enr.termsAcceptedAt).toLocaleString() : "N/A"}</span>
                                                    </div>
                                                    <div>
                                                        <span className="text-muted-foreground block">Expires On:</span>
                                                        <span className="text-white">{enr.expiresAt ? new Date(enr.expiresAt).toLocaleDateString() : "Pending activation"}</span>
                                                    </div>
                                                </div>

                                                {/* Status Action Controls */}
                                                <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                                    <span className="text-xs text-muted-foreground mr-2">Override Status:</span>
                                                    {enr.status !== "active" && (
                                                        <button
                                                            onClick={() => handleStatusChange(enr.id, "active")}
                                                            className="btn-primary !py-1 !px-3 !text-xs cursor-pointer"
                                                        >
                                                            Activate Plan
                                                        </button>
                                                    )}
                                                    {enr.status !== "suspended" && (
                                                        <button
                                                            onClick={() => handleStatusChange(enr.id, "suspended")}
                                                            className="btn-outline !py-1 !px-3 !text-xs cursor-pointer text-amber-400 border-amber-500/30"
                                                        >
                                                            Suspend
                                                        </button>
                                                    )}
                                                    {enr.status !== "cancelled" && (
                                                        <button
                                                            onClick={() => handleStatusChange(enr.id, "cancelled")}
                                                            className="btn-outline !py-1 !px-3 !text-xs cursor-pointer text-red-400 border-red-500/30"
                                                        >
                                                            Cancel
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB 3: PAYMENTS */}
                            {activeDrawerTab === "payments" && (
                                <div className="space-y-4">
                                    <div className="eyebrow text-primary">Transaction History & UPI Verifications</div>
                                    {selectedStudent.payments.length === 0 ? (
                                        <div className="card-hr p-6 text-center text-xs text-muted-foreground">
                                            No payment records found.
                                        </div>
                                    ) : (
                                        selectedStudent.payments.map((p) => (
                                            <div key={p.id} className="card-hr p-5 space-y-3 border-white/15">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm text-white">{p.planName}</div>
                                                        <div className="text-xs text-muted-foreground font-mono">Ref: {p.id}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="font-display font-black text-lg text-primary">₹{p.amount}</div>
                                                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                                            p.status === "verified" ? "bg-emerald-500/20 text-emerald-400" :
                                                            p.status === "pending" ? "bg-amber-500/20 text-amber-400 animate-pulse" :
                                                            "bg-red-500/20 text-red-400"
                                                        }`}>
                                                            {p.status}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="p-3 bg-white/5 rounded text-xs space-y-1 font-mono">
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">UPI Reference (UTR):</span>
                                                        <strong className="text-white">{p.utrNumber}</strong>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span className="text-muted-foreground">Submitted At:</span>
                                                        <span>{new Date(p.createdAt).toLocaleString()}</span>
                                                    </div>
                                                    {p.verifiedAt && (
                                                        <div className="flex justify-between text-emerald-400">
                                                            <span>Verified At:</span>
                                                            <span>{new Date(p.verifiedAt).toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>

                                                {p.status === "pending" && (
                                                    <div className="flex items-center gap-2 pt-2">
                                                        <button
                                                            onClick={() => handleVerifyPayment(p.id)}
                                                            className="btn-primary !py-1.5 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer"
                                                        >
                                                            <CheckCircle2 size={13} /> Approve Payment & Activate Enrollment
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                await rejectPayment(p.id, "Invalid UTR or payment not received");
                                                                toast.error("Payment marked as rejected");
                                                                loadAllData();
                                                            }}
                                                            className="btn-outline !py-1.5 !px-3 !text-xs text-red-400 border-red-500/30 cursor-pointer"
                                                        >
                                                            Reject
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB 4: CURRICULUM & PROGRESS */}
                            {activeDrawerTab === "curriculum" && (
                                <div className="space-y-4">
                                    <div className="eyebrow text-primary">Curriculum Access & Student Progress</div>
                                    {curriculums.map((c) => (
                                        <div key={c.id} className="card-hr p-5 space-y-3">
                                            <div className="flex items-center justify-between">
                                                <h4 className="font-bold text-base text-white">{c.title}</h4>
                                                <span className="text-xs font-mono text-primary font-bold">42% Completed</span>
                                            </div>
                                            <div className="h-1.5 bg-white/10 rounded overflow-hidden">
                                                <div className="h-full bg-primary" style={{ width: "42%" }} />
                                            </div>
                                            <div className="text-xs text-muted-foreground pt-1">
                                                Mastered: 5 of 12 Level 1 Sessions · Next session: "Session 6: E Minor Transition"
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* TAB 5: TRIAL HISTORY */}
                            {activeDrawerTab === "trials" && (
                                <div className="space-y-4">
                                    <div className="eyebrow text-primary">Free 1-on-1 Trial Bookings</div>
                                    {selectedStudent.trials.length === 0 ? (
                                        <div className="card-hr p-6 text-center text-xs text-muted-foreground">
                                            No trial booking history found.
                                        </div>
                                    ) : (
                                        selectedStudent.trials.map((t) => (
                                            <div key={t.id} className="card-hr p-5 space-y-3 border-white/15">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-bold text-sm text-white">
                                                            {t.scheduledDate} · {t.timeSlot}
                                                        </div>
                                                        <span className="text-xs text-muted-foreground font-mono">Ref: {t.id}</span>
                                                    </div>
                                                    <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">
                                                        {t.status}
                                                    </span>
                                                </div>

                                                <div className="p-3 bg-white/5 rounded text-xs space-y-1">
                                                    <div><strong>Meeting Link:</strong> <span className="font-mono text-primary">{t.meetingLink}</span></div>
                                                    {t.notes && <div><strong>Student Goals / Notes:</strong> {t.notes}</div>}
                                                </div>

                                                <div className="flex items-center gap-2 pt-1">
                                                    <span className="text-xs text-muted-foreground">Mark as:</span>
                                                    <button
                                                        onClick={async () => {
                                                            await updateTrialBookingStatus(t.id, "completed", "Attended and evaluated");
                                                            toast.success("Trial marked as completed");
                                                            loadAllData();
                                                        }}
                                                        className="btn-outline !py-1 !px-2.5 !text-xs cursor-pointer text-emerald-400 border-emerald-500/30"
                                                    >
                                                        Completed
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await updateTrialBookingStatus(t.id, "no_show", "Did not join meet");
                                                            toast.info("Trial marked as No Show");
                                                            loadAllData();
                                                        }}
                                                        className="btn-outline !py-1 !px-2.5 !text-xs cursor-pointer text-amber-400 border-amber-500/30"
                                                    >
                                                        No Show
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}

                            {/* TAB 6: INSTRUCTOR NOTES */}
                            {activeDrawerTab === "notes" && (
                                <div className="space-y-4">
                                    <div className="eyebrow text-primary">Private Instructor Observations & Feedback</div>

                                    {/* Add Note Input */}
                                    <div className="card-hr p-4 space-y-3">
                                        <textarea
                                            rows={3}
                                            value={instructorNoteInput}
                                            onChange={(e) => setInstructorNoteInput(e.target.value)}
                                            placeholder="Write private coaching notes, lesson homework feedback, or practice goals for this student…"
                                            className="w-full bg-background border border-white/15 p-3 text-xs text-white outline-none focus:border-primary resize-none rounded"
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddInstructorNote}
                                            className="btn-primary !py-2 !px-4 !text-xs flex items-center gap-1.5 cursor-pointer ml-auto"
                                        >
                                            <Edit3 size={13} /> Save Note
                                        </button>
                                        {/* Notes List */}
                                        <div className="space-y-3">
                                            {(!selectedStudent.notes || selectedStudent.notes.length === 0) ? (
                                                <div className="card-hr p-6 text-center text-xs text-muted-foreground">
                                                    No private notes recorded for this student yet.
                                                </div>
                                            ) : (
                                                selectedStudent.notes.map((n) => (
                                                    <div key={n.id} className="p-4 bg-white/5 border border-white/10 rounded space-y-1">
                                                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                                                            <span className="font-bold text-primary">{n.author}</span>
                                                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                        <p className="text-xs text-white/90 leading-relaxed">{n.text}</p>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
