import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPaymentById, listenToPaymentStatus } from "@/services/paymentService";
import { useAuth } from "@/context/AuthContext";
import { CheckCircle2, Clock, XCircle, ArrowRight, MessageCircle, ShieldCheck, Sparkles, Music2, RefreshCw } from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { toast } from "sonner";

export default function PaymentStatus() {
    const { paymentId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);

    const instructorWhatsapp = process.env.REACT_APP_INSTRUCTOR_WHATSAPP || "+919876543210";

    useEffect(() => {
        if (!paymentId) return;

        // Initial fetch & set up real-time listener
        const unsubscribe = listenToPaymentStatus(paymentId, (updated) => {
            if (updated) {
                setPayment(updated);
                setLoading(false);
            }
        });

        // Fallback fetch in case listener takes a moment
        getPaymentById(paymentId).then((res) => {
            if (res) {
                setPayment(res);
                setLoading(false);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, [paymentId]);

    const handleWhatsAppProof = () => {
        if (!payment) return;
        const msg = `Hi HR Tunes Academy, I have completed the UPI payment.\n\n*Student Details:*\n- Name: ${payment.studentName}\n- Plan: ${payment.planName} (₹${payment.amount})\n- UTR / Ref: ${payment.utrNumber}\n- Payment ID: ${payment.id}\n\nPlease verify my enrollment!`;
        const waUrl = `https://wa.me/${instructorWhatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(msg)}`;
        window.open(waUrl, "_blank");
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <RefreshCw className="w-8 h-8 text-red-500 animate-spin" />
                        <p className="text-neutral-400 text-sm">Loading payment verification details...</p>
                    </div>
                </div>
                <SiteFooter />
            </div>
        );
    }

    if (!payment) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col">
                <SiteHeader />
                <div className="flex-1 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md bg-neutral-900/60 border border-neutral-800 rounded-2xl p-8">
                        <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-bold text-white mb-2 font-display uppercase tracking-wide">Payment Record Not Found</h2>
                        <p className="text-neutral-400 text-sm mb-6">We could not locate payment record for #{paymentId}. Please check your reference or start a new checkout.</p>
                        <Link to="/checkout" className="inline-flex items-center justify-center px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded-lg transition">
                            Back to Checkout
                        </Link>
                    </div>
                </div>
                <SiteFooter />
            </div>
        );
    }

    const isVerified = payment.status === "verified";
    const isPending = payment.status === "pending";
    const isRejected = payment.status === "rejected";

    return (
        <div className="min-h-screen bg-black text-white flex flex-col selection:bg-red-600 selection:text-white">
            <SiteHeader />

            <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-12 flex flex-col justify-center">
                {/* Header Card */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl relative">
                    
                    {/* Status Banner */}
                    {isPending && (
                        <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-4 flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-amber-400 rounded-full animate-ping" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-amber-300">Payment Verification in Progress</h3>
                                <p className="text-xs text-amber-400/80">Our admin is reviewing your UPI transaction. This page will update automatically in real-time!</p>
                            </div>
                        </div>
                    )}

                    {isVerified && (
                        <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-6 py-4 flex items-center gap-3">
                            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold text-emerald-300 flex items-center gap-1.5">
                                    Payment Verified & Approved! <Sparkles className="w-4 h-4 text-emerald-400" />
                                </h3>
                                <p className="text-xs text-emerald-400/80">Your enrollment has been successfully activated. Full curriculum access unlocked!</p>
                            </div>
                        </div>
                    )}

                    {isRejected && (
                        <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-4 flex items-center gap-3">
                            <XCircle className="w-6 h-6 text-red-400 shrink-0" />
                            <div>
                                <h3 className="text-sm font-bold text-red-300">Verification Unsuccessful</h3>
                                <p className="text-xs text-red-400/80">Reason: {payment.rejectionReason || "UTR number could not be matched"}. Please check your UTR or contact the instructor.</p>
                            </div>
                        </div>
                    )}

                    {/* Main Content Body */}
                    <div className="p-6 md:p-8 space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                            <div>
                                <span className="text-[11px] font-mono text-neutral-500 uppercase tracking-wider block mb-1">
                                    Reference ID: {payment.id}
                                </span>
                                <h1 className="text-2xl font-bold font-display uppercase tracking-wide text-white flex items-center gap-2">
                                    <Music2 className="w-6 h-6 text-red-500" />
                                    {payment.planName}
                                </h1>
                            </div>
                            <div className="text-right">
                                <span className="text-[11px] text-neutral-400 block font-mono">Amount Paid</span>
                                <span className="text-2xl font-black text-white font-mono">₹{payment.amount}</span>
                            </div>
                        </div>

                        {/* Transaction Summary Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                                <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">Student Name</span>
                                <p className="text-sm font-semibold text-white">{payment.studentName}</p>
                            </div>
                            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                                <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">Email & Phone</span>
                                <p className="text-sm font-semibold text-white">{payment.email} • {payment.phone}</p>
                            </div>
                            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                                <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">Submitted UPI UTR</span>
                                <p className="text-sm font-mono font-bold text-red-400 tracking-wider">{payment.utrNumber}</p>
                            </div>
                            <div className="p-4 bg-neutral-900/60 rounded-xl border border-neutral-800/80">
                                <span className="text-[11px] font-mono text-neutral-400 uppercase block mb-1">Submission Time</span>
                                <p className="text-xs text-neutral-300">{new Date(payment.createdAt).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Action Box based on status */}
                        {isVerified && (
                            <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-black to-neutral-950 border border-emerald-500/30 rounded-xl text-center space-y-4">
                                <div>
                                    <h4 className="text-lg font-bold text-white font-display uppercase tracking-wide">
                                        Welcome to HR Tunes! 🎸
                                    </h4>
                                    <p className="text-xs text-neutral-300 mt-1">
                                        Your subscription is active. Click below to enter your student dashboard.
                                    </p>
                                </div>
                                {user ? (
                                    <Link
                                        to="/dashboard"
                                        className="inline-flex items-center justify-center gap-2 w-full max-w-md mx-auto py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow-lg shadow-red-600/30 font-display tracking-wider uppercase"
                                    >
                                        Go to Student Dashboard
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <Link
                                        to={`/signup?paymentId=${encodeURIComponent(payment.id)}&email=${encodeURIComponent(payment.email)}&name=${encodeURIComponent(payment.studentName)}&plan=${encodeURIComponent(payment.planId)}`}
                                        className="inline-flex items-center justify-center gap-2 w-full max-w-md mx-auto py-3.5 px-6 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition shadow-lg shadow-red-600/30 font-display tracking-wider uppercase"
                                    >
                                        Create Student Password & Access Portal
                                        <ArrowRight className="w-5 h-5" />
                                    </Link>
                                )}
                            </div>
                        )}

                        {isPending && (
                            <div className="space-y-4">
                                <div className="p-4 bg-neutral-900/40 border border-neutral-800 rounded-xl text-xs text-neutral-400 space-y-2">
                                    <div className="flex items-center gap-2 text-neutral-200 font-semibold">
                                        <ShieldCheck className="w-4 h-4 text-red-500" />
                                        Manual Verification in Progress
                                    </div>
                                    <p>
                                        Verification usually takes 5 to 15 minutes. Keep this page open — it will automatically switch as soon as the instructor approves your payment.
                                    </p>
                                </div>

                                <div className="flex flex-col sm:flex-row items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={handleWhatsAppProof}
                                        className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition shadow-md shadow-emerald-600/20 cursor-pointer"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Send Proof via WhatsApp (Speed up verification)
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            getPaymentById(payment.id).then((p) => {
                                                if (p) {
                                                    setPayment(p);
                                                    toast.info("Status refreshed!");
                                                }
                                            });
                                        }}
                                        className="w-full sm:w-auto flex items-center justify-center gap-1.5 py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium border border-neutral-700 rounded-lg transition cursor-pointer"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5" />
                                        Refresh Status
                                    </button>
                                </div>
                            </div>
                        )}

                        {isRejected && (
                            <div className="space-y-4">
                                <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-300">
                                    Payment verification failed. Please double check your UTR number or re-submit proof.
                                </div>
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleWhatsAppProof}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-lg transition cursor-pointer"
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        Contact Instructor on WhatsApp
                                    </button>
                                    <Link
                                        to={`/checkout?plan=${encodeURIComponent(payment.planId)}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-red-600 hover:bg-red-500 text-white text-sm font-semibold rounded-lg transition text-center"
                                    >
                                        Try Again / Update UTR
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <SiteFooter />
        </div>
    );
}
