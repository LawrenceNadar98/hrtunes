import { useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { CreditCard, Download, Calendar, CheckCircle2, Zap, Sparkles, ShieldCheck, Lock, FileText, X } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { getUserEnrollments } from "@/services/enrollmentService";
import { getUserTrialBookings } from "@/services/trialService";
import { getUserPayments } from "@/services/paymentService";
import { toast } from "sonner";

export default function Payments() {
    const { user } = useAuth();
    const [enrollments, setEnrollments] = useState([]);
    const [trials, setTrials] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedInvoice, setSelectedInvoice] = useState(null);

    useEffect(() => {
        async function load() {
            if (!user) return;
            const userId = user.id || user.uid;
            try {
                const [enrs, trls, pmts] = await Promise.all([
                    getUserEnrollments(userId),
                    getUserTrialBookings(userId),
                    getUserPayments(userId)
                ]);
                setEnrollments(enrs);
                setTrials(trls);
                setPayments(pmts);
            } catch (err) {
                console.warn("Payments load error:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [user]);

    const activeEnrollment = enrollments.find((e) => e.status === "active" && e.planId !== "free-trial" && e.planId !== "trial");
    const upcomingTrial = trials.find((t) => t.status === "confirmed" || t.status === "pending");

    const isPaidStudent = Boolean(
        activeEnrollment ||
        (user?.enrolledPlanId && user.enrolledPlanId !== "free-trial" && user.enrolledPlanId !== "trial" && user?.enrollmentStatus === "active")
    );

    const activePlan = activeEnrollment || {
        planId: user?.enrolledPlanId || "free-trial",
        planName: user?.enrolledPlanName || "Free 1-on-1 Trial",
        planPrice: 0
    };

    const latestPayment = payments[0] || null;

    if (loading) {
        return (
            <DashboardLayout subtitle="Loading billing details..." title="Payments">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                    <div className="lg:col-span-2 card-hr p-8 animate-pulse space-y-4">
                        <div className="h-4 bg-white/10 rounded w-1/4" />
                        <div className="h-10 bg-white/10 rounded w-1/2" />
                        <div className="h-4 bg-white/5 rounded w-3/4" />
                    </div>
                    <div className="card-hr p-8 animate-pulse space-y-4">
                        <div className="h-4 bg-white/10 rounded w-1/3" />
                        <div className="h-16 bg-white/5 rounded w-full" />
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            subtitle="Billing & Subscription"
            title="Payments"
            actions={
                <div className="flex items-center gap-2">
                    {!isPaidStudent ? (
                        <Link to="/checkout" className="btn-primary" data-testid="payments-upgrade">
                            <Zap size={14} /> Upgrade to Paid Plan
                        </Link>
                    ) : (
                        <span className="text-xs font-mono bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold px-3 py-1.5 rounded flex items-center gap-1.5">
                            <ShieldCheck size={14} /> Subscription Active
                        </span>
                    )}
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
                {/* Current Plan Box */}
                <div className="lg:col-span-2 card-hr p-8" data-testid="current-plan">
                    <div className="flex items-center justify-between mb-3">
                        <div className="eyebrow">Current Active Plan</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded border ${
                            isPaidStudent
                                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                                : "bg-primary/20 text-primary border-primary/40"
                        }`}>
                            {isPaidStudent ? "Paid Subscription" : "Free Trial Account"}
                        </span>
                    </div>

                    <div className="flex flex-wrap items-baseline gap-4 mt-2">
                        <h3 className="text-display text-4xl sm:text-5xl text-white font-black">
                            {isPaidStudent ? activePlan.planName : "Free 1-on-1 Trial"}
                        </h3>
                        <span className="text-heading font-bold text-2xl text-primary font-mono">
                            {isPaidStudent ? `₹${(activePlan.planPrice || 7500).toLocaleString("en-IN")}` : "₹0"}
                        </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                        {isPaidStudent
                            ? `Full access to weekly live batch masterclasses, complete video curriculum & WhatsApp mentor feedback.`
                            : `Complimentary 60-minute live assessment session scheduled with Lead Instructor Harsh Patel.`}
                    </p>

                    {/* Features List */}
                    <ul className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {isPaidStudent ? (
                            <>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Weekly Live Batch Masterclasses (2x/week)</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Full HD Video Curriculum & PDF Tabs</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">WhatsApp Mentor Feedback on practice videos</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Verified Course Completion Certificate</span>
                                </li>
                            </>
                        ) : (
                            <>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">1x 60-Minute 1-on-1 Assessment with Harsh Patel</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Personal Guitar Goal & Technique Audit</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Custom Guitar Progression Roadmap</span>
                                </li>
                                <li className="flex items-start gap-2 text-xs">
                                    <CheckCircle2 size={14} className="text-primary mt-0.5 flex-shrink-0" />
                                    <span className="text-white/80">Access to Foundational Video Lectures</span>
                                </li>
                            </>
                        )}
                    </ul>

                    {/* Action buttons */}
                    <div className="mt-8 flex flex-wrap gap-3">
                        {!isPaidStudent ? (
                            <>
                                <Link
                                    to="/checkout?plan=guitar-foundation-3m"
                                    className="btn-primary !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider flex items-center gap-2"
                                    data-testid="upgrade-3m-btn"
                                >
                                    <Sparkles size={14} /> Upgrade to 3-Month (₹7,500)
                                </Link>
                                <Link
                                    to="/checkout?plan=guitar-complete-6m"
                                    className="btn-outline !py-2.5 !px-5 text-xs font-bold uppercase tracking-wider"
                                    data-testid="upgrade-6m-btn"
                                >
                                    Upgrade to 6-Month (₹13,500)
                                </Link>
                            </>
                        ) : (
                            <Link to="/checkout" className="btn-outline !py-2.5 !px-5 text-xs" data-testid="change-plan">
                                Change / Extend Plan
                            </Link>
                        )}
                    </div>
                </div>

                {/* Payment Method / Verification status */}
                <div className="card-hr p-8 flex flex-col justify-between" data-testid="payment-method">
                    <div>
                        <div className="eyebrow mb-3">Payment Method</div>
                        {isPaidStudent ? (
                            <div className="p-4 border border-emerald-500/30 bg-emerald-500/5 rounded-lg space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500/20 border border-emerald-500/40 rounded flex items-center justify-center font-bold text-emerald-400 text-xs">
                                        {latestPayment?.gateway === "razorpay" ? "RZP" : "UPI"}
                                    </div>
                                    <div>
                                        <div className="font-bold text-sm text-white">
                                            {latestPayment?.gateway === "razorpay" ? "Razorpay Online Payment" : "Direct UPI Transfer"}
                                        </div>
                                        <div className="text-xs text-emerald-400">Verified & Active</div>
                                    </div>
                                </div>
                                {latestPayment?.razorpayPaymentId ? (
                                    <div className="text-xs text-neutral-400 font-mono bg-black/40 p-2 rounded">
                                        Payment ID: <span className="text-white font-bold">{latestPayment.razorpayPaymentId}</span>
                                    </div>
                                ) : latestPayment?.utrNumber ? (
                                    <div className="text-xs text-neutral-400 font-mono bg-black/40 p-2 rounded">
                                        UTR / Ref: <span className="text-white font-bold">{latestPayment.utrNumber}</span>
                                    </div>
                                ) : null}
                            </div>
                        ) : (
                            <div className="p-4 border border-white/10 bg-white/5 rounded-lg space-y-2">
                                <div className="flex items-center gap-2 text-neutral-300 font-bold text-sm">
                                    <ShieldCheck size={16} className="text-primary" /> Free Trial Account
                                </div>
                                <p className="text-xs text-neutral-400 leading-relaxed">
                                    No payment method is required for the free 1-on-1 trial session. UPI payment is available when you upgrade.
                                </p>
                            </div>
                        )}
                    </div>

                    {!isPaidStudent && (
                        <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-lg text-xs space-y-1">
                            <strong className="text-white block">Ready for the complete journey?</strong>
                            <p className="text-neutral-400">Upgrade to unlock batch classes and full certification.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Plan Upgrade Comparison for Free Trial Students */}
            {!isPaidStudent && (
                <div className="mb-10">
                    <h2 className="text-heading font-bold text-xl mb-4">Paid Plan Upgrade Options</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 3-Month Foundation */}
                        <div className="card-hr p-6 border-white/20 hover:border-primary/50 transition-all flex flex-col justify-between">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Beginner to Intermediate</span>
                                    <span className="text-xs font-mono text-neutral-400">12 Weeks</span>
                                </div>
                                <h3 className="text-heading font-bold text-2xl text-white">3-Month Guitar Foundation</h3>
                                <div className="text-3xl font-black text-white font-mono mt-2">
                                    ₹7,500 <span className="text-xs text-neutral-400 font-sans font-normal">/ one-time</span>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2">
                                    Master open chords, rhythm strumming, barre chords, and transition smoothly between 20+ complete songs.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs text-neutral-300 border-t border-white/10 pt-4">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> 24 Structured Video Lessons</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> 2x Weekly Live Batch Classes with Harsh Patel</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> WhatsApp Practice Feedback</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> Foundation Certificate</li>
                                </ul>
                            </div>
                            <Link
                                to="/checkout?plan=guitar-foundation-3m"
                                className="mt-6 btn-primary w-full text-center !py-2.5 text-xs font-bold uppercase tracking-wider"
                                data-testid="choose-foundation-btn"
                            >
                                Upgrade to Foundation (₹7,500)
                            </Link>
                        </div>

                        {/* 6-Month Complete */}
                        <div className="card-hr p-6 border-primary/50 bg-gradient-to-br from-primary/10 via-card to-card flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute top-3 right-3 bg-primary text-white text-[9px] font-black uppercase px-2 py-0.5 rounded">
                                Best Value
                            </div>
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Complete Mastery</span>
                                    <span className="text-xs font-mono text-neutral-400">24 Weeks</span>
                                </div>
                                <h3 className="text-heading font-bold text-2xl text-white">6-Month Guitar Complete</h3>
                                <div className="text-3xl font-black text-white font-mono mt-2">
                                    ₹13,500 <span className="text-xs text-neutral-400 font-sans font-normal">/ one-time (Save ₹1,500)</span>
                                </div>
                                <p className="text-xs text-neutral-400 mt-2">
                                    Full mastery from absolute fundamentals to lead improvisation, pentatonic scales, fingerstyle, and stage performance.
                                </p>
                                <ul className="mt-4 space-y-2 text-xs text-neutral-300 border-t border-white/10 pt-4">
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> 48 Advanced Lessons + All Foundation Modules</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> 2x Weekly Live Batch Masterclasses</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> 1-on-1 Monthly Video Review by Harsh Patel</li>
                                    <li className="flex items-center gap-2"><CheckCircle2 size={13} className="text-primary" /> Complete Guitar Mastery Diploma</li>
                                </ul>
                            </div>
                            <Link
                                to="/checkout?plan=guitar-complete-6m"
                                className="mt-6 btn-primary w-full text-center !py-2.5 text-xs font-bold uppercase tracking-wider shadow-lg shadow-primary/30"
                                data-testid="choose-complete-btn"
                            >
                                Upgrade to Complete (₹13,500)
                            </Link>
                        </div>
                    </div>
                </div>
            )}

            {/* Billing History Section */}
            <section data-testid="payment-history">
                <h2 className="text-heading font-bold text-xl mb-4">
                    {isPaidStudent ? "Billing History & Invoices" : "Account Booking Record"}
                </h2>

                <div className="card-hr overflow-hidden">
                    <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-b border-white/10 bg-white/5">
                        <div className="col-span-3 eyebrow">Invoice / Reference</div>
                        <div className="col-span-3 eyebrow">Date</div>
                        <div className="col-span-3 eyebrow">Plan</div>
                        <div className="col-span-1 eyebrow">Amount</div>
                        <div className="col-span-2 eyebrow text-right">Action / Receipt</div>
                    </div>

                    {isPaidStudent && payments.length > 0 ? (
                        payments.map((p) => (
                            <div
                                key={p.id}
                                className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors items-center"
                                data-testid={`history-${p.id}`}
                            >
                                <div className="col-span-2 md:col-span-3 font-mono text-xs text-white">
                                    {p.id}
                                    {p.gateway === "razorpay" && p.razorpayPaymentId && (
                                        <div className="text-[10px] text-sky-400 font-mono">RZP: {p.razorpayPaymentId}</div>
                                    )}
                                    {p.gateway !== "razorpay" && p.utrNumber && (
                                        <div className="text-[10px] text-neutral-400 font-mono">UTR: {p.utrNumber}</div>
                                    )}
                                </div>
                                <div className="col-span-2 md:col-span-3 text-xs text-muted-foreground flex items-center gap-2">
                                    <Calendar size={12} className="text-primary" />
                                    {p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }) : "Recent"}
                                </div>
                                <div className="col-span-1 md:col-span-3 text-xs text-neutral-200 font-medium">
                                    {p.planName}
                                </div>
                                <div className="col-span-1 md:col-span-1 text-xs font-bold text-white font-mono">
                                    ₹{p.amount?.toLocaleString("en-IN")}
                                </div>
                                <div className="col-span-2 md:col-span-2 md:text-right">
                                    <button
                                        onClick={() => setSelectedInvoice(p)}
                                        className="inline-flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest hover:gap-2 transition-all"
                                    >
                                        <FileText size={13} /> View Receipt
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : isPaidStudent && activeEnrollment ? (
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 items-center">
                            <div className="col-span-2 md:col-span-3 font-mono text-xs text-white">{activeEnrollment.id}</div>
                            <div className="col-span-2 md:col-span-3 text-xs text-muted-foreground flex items-center gap-2">
                                <Calendar size={12} className="text-primary" />
                                {new Date(activeEnrollment.createdAt || Date.now()).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                            <div className="col-span-1 md:col-span-3 text-xs text-neutral-200 font-medium">{activeEnrollment.planName}</div>
                            <div className="col-span-1 md:col-span-1 text-xs font-bold text-white font-mono">₹{activeEnrollment.planPrice?.toLocaleString("en-IN")}</div>
                            <div className="col-span-2 md:col-span-2 md:text-right">
                                <button
                                    onClick={() => setSelectedInvoice({
                                        id: activeEnrollment.id,
                                        planName: activeEnrollment.planName,
                                        amount: activeEnrollment.planPrice || 7500,
                                        createdAt: activeEnrollment.createdAt || new Date().toISOString(),
                                        utrNumber: "UPI-DIRECT-VERIFIED",
                                        status: "verified"
                                    })}
                                    className="inline-flex items-center gap-1.5 text-xs text-primary font-bold uppercase tracking-widest"
                                >
                                    <FileText size={13} /> Receipt
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Free Trial Student Booking History Row */
                        <div className="grid grid-cols-2 md:grid-cols-12 gap-4 px-6 py-4 border-b border-white/5 last:border-0 items-center">
                            <div className="col-span-2 md:col-span-3 font-mono text-xs text-white">
                                {upcomingTrial?.id || "TRL-FREE-TRIAL"}
                            </div>
                            <div className="col-span-2 md:col-span-3 text-xs text-muted-foreground flex items-center gap-2">
                                <Calendar size={12} className="text-primary" />
                                {upcomingTrial?.scheduledDate || new Date().toLocaleDateString("en-IN")}
                            </div>
                            <div className="col-span-1 md:col-span-3 text-xs text-neutral-200 font-medium">
                                Free 1-on-1 Trial Live Assessment
                            </div>
                            <div className="col-span-1 md:col-span-1 text-xs font-bold text-emerald-400 font-mono">
                                ₹0
                            </div>
                            <div className="col-span-2 md:col-span-2 md:text-right">
                                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-bold uppercase tracking-wider">
                                    <CheckCircle2 size={12} /> Confirmed
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {!isPaidStudent && (
                    <div className="mt-4 p-4 bg-white/5 border border-white/10 rounded-lg text-xs text-neutral-400 flex items-center justify-between">
                        <span>No monetary payment required for your complimentary Free Trial session.</span>
                        <Link to="/checkout" className="text-primary font-bold hover:underline">
                            Upgrade to Paid Plan →
                        </Link>
                    </div>
                )}
            </section>

            {/* Receipt / Invoice Modal */}
            {selectedInvoice && (
                <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border border-white/20 rounded-xl w-full max-w-lg p-6 space-y-6 shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div>
                                <span className="text-[10px] font-mono text-primary font-bold uppercase tracking-widest">HRTunes Official Invoice</span>
                                <h3 className="text-heading font-bold text-xl text-white mt-0.5">Payment Receipt</h3>
                            </div>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="p-1 hover:bg-white/10 rounded text-neutral-400 hover:text-white"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4 text-xs">
                            <div className="grid grid-cols-2 gap-3 p-3 bg-white/5 rounded border border-white/10">
                                <div>
                                    <div className="text-neutral-400">Invoice ID:</div>
                                    <div className="font-mono font-bold text-white mt-0.5">{selectedInvoice.id}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-400">Date:</div>
                                    <div className="font-bold text-white mt-0.5">
                                        {new Date(selectedInvoice.createdAt || Date.now()).toLocaleDateString("en-IN", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric"
                                        })}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-neutral-400">Student Name:</div>
                                    <div className="font-bold text-white mt-0.5">{user?.name || selectedInvoice.studentName || "Student"}</div>
                                </div>
                                <div>
                                    <div className="text-neutral-400">Payment Status:</div>
                                    <div className="font-bold text-emerald-400 uppercase mt-0.5">VERIFIED & ACTIVE</div>
                                </div>
                                {selectedInvoice.razorpayPaymentId ? (
                                    <div className="col-span-2">
                                        <div className="text-neutral-400">Razorpay Payment ID:</div>
                                        <div className="font-mono font-bold text-sky-400 mt-0.5">{selectedInvoice.razorpayPaymentId}</div>
                                    </div>
                                ) : selectedInvoice.utrNumber ? (
                                    <div className="col-span-2">
                                        <div className="text-neutral-400">UPI Transaction Ref (UTR):</div>
                                        <div className="font-mono font-bold text-primary mt-0.5">{selectedInvoice.utrNumber}</div>
                                    </div>
                                ) : null}
                            </div>

                            <div className="border-t border-b border-white/10 py-3 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-bold text-white">{selectedInvoice.planName}</span>
                                    <span className="font-mono font-bold text-white">₹{selectedInvoice.amount?.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="text-neutral-400 text-[11px]">Includes all live batch masterclasses, curriculum access & instructor review.</div>
                            </div>

                            <div className="flex justify-between font-bold text-base text-white pt-1">
                                <span>Total Paid:</span>
                                <span className="text-primary font-mono text-lg">₹{selectedInvoice.amount?.toLocaleString("en-IN")}</span>
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => {
                                    window.print();
                                    toast.success("Printing receipt...");
                                }}
                                className="btn-primary w-full !py-2.5 text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2"
                            >
                                <Download size={14} /> Print / Save PDF
                            </button>
                            <button
                                onClick={() => setSelectedInvoice(null)}
                                className="btn-outline w-full !py-2.5 text-xs font-bold uppercase tracking-wider"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
