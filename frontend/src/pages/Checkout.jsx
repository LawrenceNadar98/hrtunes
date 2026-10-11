import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { ArrowLeft, Lock, CheckCircle2, Shield, QrCode, CreditCard, Landmark, Check, AlertCircle } from "lucide-react";
import { PRICING as DEFAULT_PRICING } from "@/lib/mock";
import { getPlans } from "@/services/courseService";
import { 
    createUpiPaymentSubmission,
    createRazorpayOrder,
    openRazorpayCheckoutModal,
    fetchPaymentConfig
} from "@/services/paymentService";
import { createOrGetPendingEnrollment } from "@/services/enrollmentService";
import { useAuth } from "@/context/AuthContext";
import UpiQrCode from "@/components/ui/UpiQrCode";
import { toast } from "sonner";

const PAYMENT_METHODS = [
    { 
        id: "razorpay", 
        label: "Razorpay (Cards, UPI, NetBanking)", 
        icon: CreditCard, 
        enabled: true, 
        recommended: true,
        badge: "Instant Activation"
    },
    { 
        id: "upi", 
        label: "Manual UPI (QR Scan & UTR)", 
        icon: QrCode, 
        enabled: true, 
        recommended: false,
        badge: "Manual Verification"
    },
];

export default function Checkout() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const initialPlanId = searchParams.get("plan");
    const paramEnrollmentId = searchParams.get("enrollmentId");

    const { user } = useAuth();

    const [allPlans, setAllPlans] = useState(DEFAULT_PRICING);
    const paidPlans = useMemo(() => allPlans.filter((p) => p.price > 0), [allPlans]);

    const [selected, setSelected] = useState(() => {
        const found = DEFAULT_PRICING.filter((p) => p.price > 0).find((p) => p.id === initialPlanId);
        return found || DEFAULT_PRICING.filter((p) => p.price > 0)[0];
    });

    const [activeEnrollmentId, setActiveEnrollmentId] = useState(paramEnrollmentId || null);

    useEffect(() => {
        getPlans().then((data) => {
            if (data && data.length > 0) {
                setAllPlans(data);
                const paid = data.filter((p) => p.price > 0);
                const match = paid.find((p) => p.id === initialPlanId) || paid[0];
                if (match) setSelected(match);
            }
        });
    }, [initialPlanId]);

    const [method, setMethod] = useState("razorpay");
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchPaymentConfig().then((cfg) => {
            if (cfg && cfg.razorpay_enabled === false) {
                // If backend indicates Razorpay keys are not yet configured, smoothly default to manual UPI
                setMethod("upi");
            }
        });
    }, []);

    // Form inputs
    const [formData, setFormData] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        utrNumber: "",
        notes: ""
    });

    useEffect(() => {
        if (user) {
            setFormData((prev) => ({
                ...prev,
                name: prev.name || user.name || "",
                email: prev.email || user.email || "",
                phone: prev.phone || user.phone || ""
            }));
        }
    }, [user]);

    const upiId = process.env.REACT_APP_UPI_ID || "6352345886-2@ybl";
    const payeeName = process.env.REACT_APP_UPI_PAYEE_NAME || "HR Tunes Academy";
    const totalAmount = Math.round((selected?.price || 0) * 1.18);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();

        // Check if user is logged in
        if (!user) {
            toast.info("Please log in or create an account to link your payment & enrollment.");
            navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${selected.id}`)}`);
            return;
        }

        setProcessing(true);

        // OPTION A: RAZORPAY ONLINE CHECKOUT
        if (method === "razorpay") {
            try {
                // Request authoritative order from trusted backend
                const orderData = await createRazorpayOrder({
                    planId: selected.id,
                    userId: user.id || user.uid,
                    userName: formData.name || user.name || "Student",
                    userEmail: formData.email || user.email,
                    phone: formData.phone || user.phone || ""
                });

                // Open Razorpay Standard Checkout Modal
                openRazorpayCheckoutModal({
                    orderData,
                    user,
                    planName: selected.name,
                    onSuccess: () => {
                        toast.success("Payment verified! Your course enrollment is now active.");
                        setProcessing(false);
                        navigate("/dashboard");
                    },
                    onFailure: (err) => {
                        console.error("Razorpay error:", err);
                        toast.error(err.message || "Payment verification failed. Please try again or use manual UPI.");
                        setProcessing(false);
                    },
                    onDismiss: () => {
                        toast.info("Checkout dismissed. You can complete payment at any time.");
                        setProcessing(false);
                    }
                });
            } catch (err) {
                console.error("Failed to initiate Razorpay checkout:", err);
                toast.error(err.message || "Unable to initiate Razorpay order. Falling back to manual UPI.");
                setProcessing(false);
            }
            return;
        }

        // OPTION B: MANUAL UPI PROOF SUBMISSION (EXISTING WORKFLOW)
        if (method === "upi") {
            if (!formData.utrNumber || formData.utrNumber.trim().length < 6) {
                toast.error("Please enter a valid 12-digit UPI Transaction / UTR reference number.");
                setProcessing(false);
                return;
            }

            try {
                let enrId = activeEnrollmentId;
                if (!enrId) {
                    const enrollment = await createOrGetPendingEnrollment({
                        userId: user.id || user.uid,
                        userName: formData.name || user.name,
                        userEmail: formData.email || user.email,
                        planId: selected.id,
                        planName: selected.name,
                        planPrice: selected.price,
                        termsVersion: "v1.2-2026"
                    });
                    enrId = enrollment.id;
                    setActiveEnrollmentId(enrId);
                }

                const payment = await createUpiPaymentSubmission({
                    userId: user.id || user.uid,
                    enrollmentId: enrId,
                    planId: selected.id,
                    planName: selected.name,
                    amount: totalAmount,
                    studentName: formData.name,
                    email: formData.email,
                    phone: formData.phone,
                    utrNumber: formData.utrNumber.trim(),
                    notes: formData.notes
                });

                toast.success("Payment details submitted successfully! Verification in progress.");
                navigate(`/payment-status/${payment.id}`);
            } catch (err) {
                console.error("Payment submission failed:", err);
                toast.error("Failed to submit payment proof. Please try again.");
                setProcessing(false);
            }
        }
    };

    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="checkout-page">
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                <div className="container-hr h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Lock size={12} className="text-primary" /> Direct UPI Verified Checkout
                    </div>
                </div>
            </header>

            <div className="container-hr py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="eyebrow flex items-center gap-2 mb-8 hover:text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft size={13} /> Back
                </button>

                {!user && (
                    <div className="mb-8 p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="w-5 h-5 text-primary shrink-0" />
                            <span className="text-xs text-white">
                                You are checking out as a guest. We will prompt you to create an account to access your student portal.
                            </span>
                        </div>
                        <Link
                            to={`/login?redirect=${encodeURIComponent(`/checkout?plan=${selected.id}`)}`}
                            className="text-xs font-bold uppercase tracking-wider text-primary hover:underline shrink-0"
                        >
                            Log in here →
                        </Link>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left - plan + form */}
                    <form onSubmit={onSubmit} className="lg:col-span-7 space-y-10">
                        <section>
                            <div className="eyebrow mb-3">Step 01</div>
                            <h2 className="text-display text-4xl mb-6">Choose your plan.</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                {paidPlans.map((p) => (
                                    <button
                                        key={p.id}
                                        type="button"
                                        onClick={() => setSelected(p)}
                                        className={`p-5 border text-left transition-all relative cursor-pointer ${
                                            selected.id === p.id
                                                ? "border-primary bg-primary/10"
                                                : "border-white/15 hover:border-white/30"
                                        }`}
                                        data-testid={`plan-${p.id}`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="font-bold text-sm">{p.name}</div>
                                            {selected.id === p.id && <CheckCircle2 size={14} className="text-primary" />}
                                        </div>
                                        <div className="text-heading font-black text-2xl mt-3">₹{p.price.toLocaleString("en-IN")}</div>
                                        <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{p.cadence}</div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="eyebrow mb-3">Step 02</div>
                            <h2 className="text-display text-4xl mb-6">Payment method.</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                                {PAYMENT_METHODS.map((m) => {
                                    const Icon = m.icon;
                                    const isEnabled = m.enabled !== false;
                                    return (
                                        <button
                                            key={m.id}
                                            type="button"
                                            disabled={!isEnabled}
                                            onClick={() => isEnabled && setMethod(m.id)}
                                            className={`flex flex-col items-start p-4 border transition-all text-left relative ${
                                                method === m.id && isEnabled
                                                    ? "bg-primary/10 border-primary text-white"
                                                    : isEnabled
                                                    ? "border-white/20 hover:border-white/40 text-neutral-300 cursor-pointer"
                                                    : "border-white/10 bg-white/[0.02] text-neutral-500 cursor-not-allowed opacity-60"
                                            }`}
                                            data-testid={`method-${m.id}`}
                                        >
                                            <div className="flex items-center justify-between w-full mb-1">
                                                <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider">
                                                    <Icon size={15} className={method === m.id && isEnabled ? "text-primary" : "text-neutral-400"} />
                                                    <span>{m.label}</span>
                                                </div>
                                                {m.recommended && (
                                                    <span className="text-[9px] bg-primary text-white px-2 py-0.5 font-bold uppercase tracking-wider">
                                                        Active
                                                    </span>
                                                )}
                                            </div>
                                            {m.badge && (
                                                <span className="text-[11px] font-mono text-amber-400/90 mt-1 font-semibold">
                                                    ({m.badge})
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {method === "razorpay" && (
                                <div className="p-6 bg-card/60 border border-primary/30 rounded-xl space-y-4 shadow-xl">
                                    <div className="flex items-center gap-2 text-primary font-bold text-sm">
                                        <Lock className="w-4 h-4" />
                                        <span>Instant Razorpay Payment (Cards, UPI, NetBanking)</span>
                                    </div>
                                    <p className="text-xs text-neutral-300 leading-relaxed">
                                        Clicking the button below will open the official Razorpay Checkout popup. You can complete payment using any Indian Debit/Credit Card, UPI app (GPay, PhonePe, Paytm), NetBanking, or Wallets.
                                    </p>
                                    <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3.5 py-2 rounded">
                                        <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                                        <span>Course curriculum and student portal unlock immediately upon verified completion.</span>
                                    </div>
                                </div>
                            )}

                            {method === "upi" && (
                                <div className="space-y-6">
                                    <UpiQrCode
                                        upiId={upiId}
                                        payeeName={payeeName}
                                        amount={totalAmount}
                                        note={`HRTunes-${selected.name.replace(/\s+/g, "")}`}
                                    />

                                    <div className="p-4 bg-primary/10 border border-primary/30 rounded-lg">
                                        <h4 className="text-xs font-bold text-primary uppercase tracking-wider mb-1">
                                            How to complete payment:
                                        </h4>
                                        <ol className="text-xs text-neutral-300 space-y-1 list-decimal list-inside">
                                            <li>Scan the QR code with GPay / PhonePe / Paytm / BHIM app.</li>
                                            <li>Pay exact total amount: <strong>₹{totalAmount.toLocaleString("en-IN")}</strong>.</li>
                                            <li>Copy the 12-digit <strong>UPI Reference / UTR Number</strong> from your payment receipt.</li>
                                            <li>Enter the UTR number and your contact details below and submit.</li>
                                        </ol>
                                    </div>

                                    <Field label="12-Digit UPI Ref / UTR Number">
                                        <input
                                            required
                                            type="text"
                                            name="utrNumber"
                                            value={formData.utrNumber}
                                            onChange={handleChange}
                                            placeholder="e.g. 402918273645"
                                            className="form-input font-mono font-bold text-primary tracking-widest"
                                            data-testid="upi-utr"
                                        />
                                    </Field>
                                </div>
                            )}
                        </section>

                        <section>
                            <div className="eyebrow mb-3">Step 03</div>
                            <h2 className="text-display text-4xl mb-6">Student details.</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <Field label="Full Name">
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Aarav Mehta"
                                        className="form-input"
                                        data-testid="billing-name"
                                    />
                                </Field>
                                <Field label="Email Address (Used for Login)">
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. student@gmail.com"
                                        className="form-input"
                                        data-testid="billing-email"
                                    />
                                </Field>
                                <div className="sm:col-span-2">
                                    <Field label="WhatsApp / Phone Number">
                                        <input
                                            required
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. +91 9876543210"
                                            className="form-input"
                                            data-testid="billing-phone"
                                        />
                                    </Field>
                                </div>
                            </div>
                        </section>

                        <button
                            type="submit"
                            disabled={processing}
                            className="btn-primary w-full !py-4 flex items-center justify-center gap-2 font-display text-xl tracking-wider uppercase shadow-xl shadow-red-600/30 cursor-pointer"
                            data-testid="pay-btn"
                        >
                            {processing
                                ? (method === "razorpay" ? "Opening Secure Checkout..." : "Submitting Payment Proof...")
                                : (method === "razorpay"
                                    ? `Pay with Razorpay · ₹${totalAmount.toLocaleString("en-IN")}`
                                    : `Submit Payment & Verify · ₹${totalAmount.toLocaleString("en-IN")}`)}
                        </button>
                    </form>

                    {/* Right - summary */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <div className="card-hr p-8">
                            <div className="eyebrow mb-4 text-primary">Order summary</div>
                            <div className="flex items-baseline justify-between mb-2">
                                <div>
                                    <div className="text-heading font-bold text-xl">{selected.name}</div>
                                    <div className="text-sm text-muted-foreground">{selected.tagline}</div>
                                </div>
                                <div className="text-heading font-black text-2xl">₹{selected.price.toLocaleString("en-IN")}</div>
                            </div>
                            <div className="text-xs text-muted-foreground">{selected.cadence}</div>

                            <ul className="mt-6 space-y-2">
                                {selected.features?.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm text-white/80">
                                        <CheckCircle2 size={14} className="text-primary mt-0.5 shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>

                            <div className="divider-dashed my-6" />
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>₹{selected.price.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-sm mt-2">
                                <span className="text-muted-foreground">GST (18%)</span>
                                <span>₹{Math.round(selected.price * 0.18).toLocaleString("en-IN")}</span>
                            </div>
                            <div className="divider-dashed my-4" />
                            <div className="flex justify-between items-baseline">
                                <span className="text-heading font-bold text-lg">Total</span>
                                <span className="text-heading font-black text-3xl text-primary">
                                    ₹{totalAmount.toLocaleString("en-IN")}
                                </span>
                            </div>

                            <div className="mt-6 p-3 bg-white/5 border border-white/10 flex items-start gap-2 text-xs text-muted-foreground">
                                <Shield size={14} className="text-primary mt-0.5 shrink-0" />
                                <span>
                                    Direct UPI payments are reviewed and verified directly by HR Tunes Lead Instructor.
                                </span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}

function Field({ label, children }) {
    return (
        <label className="block">
            <span className="eyebrow block mb-2">{label}</span>
            {children}
        </label>
    );
}
