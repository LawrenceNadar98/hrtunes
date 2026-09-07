import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams, Link } from "react-router-dom";
import {
    ArrowLeft,
    CheckCircle2,
    Shield,
    Clock,
    Calendar,
    Users,
    Sparkles,
    AlertCircle,
    BookOpen,
    ArrowRight,
    Lock
} from "lucide-react";
import { getPlans } from "@/services/courseService";
import { getCurriculums } from "@/services/curriculumService";
import { createOrGetPendingEnrollment } from "@/services/enrollmentService";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function PlanDetails() {
    const { planId: paramPlanId } = useParams();
    const [searchParams] = useSearchParams();
    const planId = paramPlanId || searchParams.get("plan") || "guitar-foundation-3m";
    const navigate = useNavigate();
    const { user } = useAuth();

    const [plan, setPlan] = useState(null);
    const [curriculums, setCurriculums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const plans = await getPlans();
                const matched = plans.find((p) => p.id === planId) || plans.find((p) => p.price > 0) || plans[0];
                setPlan(matched);

                const allCurriculums = await getCurriculums();
                // Filter curriculums assigned to this plan
                const linked = allCurriculums.filter(
                    (c) => c.assignedPlanIds && c.assignedPlanIds.includes(matched.id)
                );
                setCurriculums(linked.length > 0 ? linked : allCurriculums.slice(0, 1));
            } catch (err) {
                console.error("Error loading plan details:", err);
            } finally {
                setLoading(false);
            }
        }
        load();
    }, [planId]);

    const handleProceed = async () => {
        if (!acceptedTerms) {
            toast.error("Please accept the Enrollment Terms and Policies to proceed.");
            return;
        }

        if (!user) {
            // Redirect to Auth and preserve checkout destination
            toast.info("Please create an account or log in to continue enrollment.");
            navigate(`/signup?redirect=${encodeURIComponent(`/checkout?plan=${plan.id}`)}`);
            return;
        }

        setSubmitting(true);
        try {
            const enrollment = await createOrGetPendingEnrollment({
                userId: user.id || user.uid,
                userName: user.name,
                userEmail: user.email,
                planId: plan.id,
                planName: plan.name,
                planPrice: plan.price,
                termsVersion: "v1.2-2026"
            });

            navigate(`/checkout?plan=${plan.id}&enrollmentId=${enrollment.id}`);
        } catch (err) {
            console.error("Failed to initialize enrollment:", err);
            toast.error("Unable to proceed to checkout. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading || !plan) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    <p className="text-muted-foreground text-sm font-mono">Loading plan details…</p>
                </div>
            </div>
        );
    }

    const gstAmount = Math.round(plan.price * 0.18);
    const totalAmount = plan.price + gstAmount;

    // Configurable policies fallback
    const policies = plan.policies || [
        {
            id: "refund",
            title: "Non-Refundable Policy",
            desc: "Course fees are strictly non-refundable once enrollment and payment verification is completed."
        },
        {
            id: "attendance",
            title: "Live Class Attendance",
            desc: "Students are expected to attend scheduled batch sessions punctually. Classes start on the hour."
        },
        {
            id: "missed_class",
            title: "Missed Class Policy",
            desc: "Missed classes are not eligible for individual makeup or re-scheduling, but recorded session summaries and exercises are provided."
        },
        {
            id: "recording",
            title: "Curriculum Access",
            desc: "Active subscription grants full access to interactive video breakdowns, tabs, homework, and weekly instructor feedback."
        }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="plan-details-page">
            {/* Header */}
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                <div className="container-hr h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <Link to="/" className="text-xs text-muted-foreground hover:text-white transition-colors">
                            Back to Home
                        </Link>
                        <Link to="/book-trial" className="btn-outline !py-1.5 !px-3 !text-xs">
                            Book Free Trial Instead
                        </Link>
                    </div>
                </div>
            </header>

            <main className="container-hr py-12">
                <button
                    onClick={() => navigate(-1)}
                    className="eyebrow flex items-center gap-2 mb-8 hover:text-primary transition-colors cursor-pointer"
                >
                    <ArrowLeft size={13} /> Back
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Column: Plan syllabus, features, policies */}
                    <div className="lg:col-span-7 space-y-10">
                        {/* Header Banner */}
                        <div className="border border-white/15 bg-gradient-to-br from-card to-background p-8 relative overflow-hidden">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/20 border border-primary/40 text-primary text-xs font-bold uppercase tracking-widest mb-4">
                                <Sparkles size={13} /> Official HRTunes Curriculum
                            </div>
                            <h1 className="text-display text-4xl sm:text-5xl mb-3">{plan.name}</h1>
                            <p className="text-white/80 text-base leading-relaxed max-w-xl">
                                {plan.tagline || plan.description || "Comprehensive structured guitar training with personal instructor guidance."}
                            </p>

                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/10">
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Calendar size={13} className="text-primary" /> Cadence
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1 capitalize">
                                        {plan.cadence?.replace("/", "") || "Monthly"}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Clock size={13} className="text-primary" /> Session Length
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1">45–60 Mins</div>
                                </div>
                                <div>
                                    <div className="text-xs text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                                        <Users size={13} className="text-primary" /> Format
                                    </div>
                                    <div className="text-heading font-bold text-base mt-1">
                                        {plan.price > 5000 ? "1-on-1 Mentorship" : "Live Batch (1-on-4)"}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* What you will learn */}
                        <section className="card-hr p-8">
                            <div className="eyebrow text-primary mb-3">Learning Outcomes</div>
                            <h2 className="text-heading font-bold text-2xl mb-4">What you will master</h2>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(plan.learningObjectives || [
                                    "Fretboard navigation & anatomical ergonomics",
                                    "Open, barre & power chord transitions without buzzing",
                                    "Rhythmic strumming patterns & timing with metronome",
                                    "Minor pentatonic and major scale lead improvisations",
                                    "Ear training, reading tabs & chord charts fluently",
                                    "Soloing over indie, Bollywood, and rock backing tracks"
                                ]).map((item, idx) => (
                                    <li key={idx} className="flex items-start gap-2.5 text-sm text-white/85">
                                        <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>

                        {/* Included Curriculum Overview */}
                        <section className="card-hr p-8">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <div className="eyebrow text-primary">Syllabus Breakdown</div>
                                    <h2 className="text-heading font-bold text-2xl">Accessible Curriculum</h2>
                                </div>
                                <BookOpen size={20} className="text-muted-foreground" />
                            </div>

                            {curriculums.map((c) => (
                                <div key={c.id} className="space-y-4">
                                    <div className="p-4 bg-white/5 border border-white/10 rounded">
                                        <div className="font-bold text-base text-white">{c.title}</div>
                                        <p className="text-xs text-muted-foreground mt-1">{c.description}</p>
                                    </div>

                                    <div className="space-y-2">
                                        {c.levels?.map((lvl) => (
                                            <div key={lvl.id} className="p-4 bg-card border border-white/10">
                                                <div className="flex items-center justify-between">
                                                    <span className="font-bold text-sm text-primary">{lvl.title}</span>
                                                    <span className="text-[11px] text-muted-foreground font-mono">
                                                        {lvl.modules?.length || 0} Modules · {lvl.modules?.reduce((acc, m) => acc + (m.sessions?.length || 0), 0) || 0} Lessons
                                                    </span>
                                                </div>
                                                <div className="mt-2 text-xs text-white/70">
                                                    {lvl.modules?.map((m) => m.title).join(" · ")}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </section>

                        {/* Important Policies */}
                        <section className="card-hr p-8 border-amber-500/30 bg-amber-500/5">
                            <div className="flex items-center gap-2 mb-3">
                                <AlertCircle size={18} className="text-amber-400" />
                                <div className="eyebrow text-amber-400">Important Plan Policies</div>
                            </div>
                            <h2 className="text-heading font-bold text-xl mb-4 text-white">Enrollment & Attendance Terms</h2>
                            <div className="space-y-4">
                                {policies.map((p) => (
                                    <div key={p.id} className="border-l-2 border-amber-500/50 pl-4">
                                        <h4 className="font-bold text-sm text-amber-200">{p.title}</h4>
                                        <p className="text-xs text-white/75 mt-0.5 leading-relaxed">{p.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Pricing Summary, Terms Checkbox, Proceed CTA */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <div className="card-hr p-8 border-primary/30">
                            <div className="eyebrow text-primary mb-3">Enrollment Summary</div>
                            <div className="flex items-baseline justify-between mb-1">
                                <h3 className="text-heading font-bold text-2xl">{plan.name}</h3>
                                <span className="text-display text-4xl text-primary font-black">
                                    ₹{plan.price.toLocaleString("en-IN")}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">{plan.cadence} · 100% Direct UPI Access</div>

                            <div className="divider-dashed my-6" />

                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Base Tuition Fee</span>
                                    <span>₹{plan.price.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">GST (18%)</span>
                                    <span>₹{gstAmount.toLocaleString("en-IN")}</span>
                                </div>
                                <div className="divider-dashed my-3" />
                                <div className="flex justify-between items-baseline">
                                    <span className="text-heading font-bold text-lg">Total Due</span>
                                    <span className="text-heading font-black text-2xl text-white">
                                        ₹{totalAmount.toLocaleString("en-IN")}
                                    </span>
                                </div>
                            </div>

                            {/* Terms & Conditions Acceptance Box */}
                            <div className="mt-8 p-4 bg-white/5 border border-white/10 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 accent-primary rounded cursor-pointer"
                                        data-testid="terms-checkbox"
                                    />
                                    <span className="text-xs text-white/85 leading-relaxed">
                                        I accept the <strong>HR Tunes Enrollment Terms (v1.2-2026)</strong>, fee non-refundable policy, and live class attendance rules.
                                    </span>
                                </label>
                            </div>

                            {/* Proceed CTA */}
                            <button
                                type="button"
                                onClick={handleProceed}
                                disabled={submitting}
                                className={`w-full mt-6 py-4 flex items-center justify-center gap-2 font-display text-lg uppercase tracking-wider transition-all cursor-pointer ${
                                    acceptedTerms
                                        ? "bg-primary text-white hover:brightness-110 shadow-lg shadow-red-600/30"
                                        : "bg-white/15 text-muted-foreground hover:bg-white/20"
                                }`}
                                data-testid="proceed-to-checkout-btn"
                            >
                                {submitting ? "Preparing Enrollment…" : "Proceed to Enrollment"}
                                <ArrowRight size={18} />
                            </button>

                            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <Lock size={12} className="text-primary" /> Direct UPI Verified · No hidden auto-debit
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
