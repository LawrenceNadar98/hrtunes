import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import {
    ArrowRight,
    Eye,
    EyeOff,
    GraduationCap,
    Mic2,
    ShieldCheck,
    Sparkles,
    CheckCircle2
} from "lucide-react";
import { IMAGES } from "@/lib/images";
import { useAuth } from "@/context/AuthContext";
import { getPaymentById } from "@/services/paymentService";
import { getPlans } from "@/services/courseService";
import { signInWithGoogle } from "@/services/authService";
import { toast } from "sonner";

const ROLE_OPTIONS = [
    { id: "student", label: "Student", Icon: GraduationCap, redirect: "/dashboard" },
    { id: "instructor", label: "Instructor / Admin", Icon: Mic2, redirect: "/instructor" },
];

export default function Auth({ mode = "login" }) {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const redirectUrl = searchParams.get("redirect") || "";
    const paymentId = searchParams.get("paymentId");
    const planParam = searchParams.get("plan") || (redirectUrl.includes("plan=") ? new URLSearchParams(redirectUrl.split("?")[1]).get("plan") : "");
    const paramEmail = searchParams.get("email") || "";
    const paramName = searchParams.get("name") || "";
    const isTrialBooked = searchParams.get("trialBooked") === "true";

    const { login, signup, setUser } = useAuth();

    const [currentMode, setCurrentMode] = useState(paymentId ? "signup" : (isTrialBooked ? "login" : mode));
    const [role, setRole] = useState("student");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [verifiedPayment, setVerifiedPayment] = useState(null);
    const [selectedPlanObj, setSelectedPlanObj] = useState(null);

    const [formData, setFormData] = useState({
        name: paramName,
        email: paramEmail,
        password: "",
        phone: ""
    });

    const isSignup = currentMode === "signup";

    useEffect(() => {
        if (paymentId) {
            setCurrentMode("signup");
            getPaymentById(paymentId).then((p) => {
                if (p) {
                    setVerifiedPayment(p);
                    setFormData((prev) => ({
                        ...prev,
                        name: prev.name || p.studentName,
                        email: prev.email || p.email,
                        phone: prev.phone || p.phone
                    }));
                }
            });
        }
    }, [paymentId]);

    useEffect(() => {
        if (planParam) {
            getPlans().then((plans) => {
                const found = plans.find((p) => p.id === planParam);
                if (found) setSelectedPlanObj(found);
            });
        }
    }, [planParam]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleGoogleAuth = async () => {
        setGoogleLoading(true);
        try {
            const userProfile = await signInWithGoogle();
            setUser(userProfile);
            toast.success(`Signed in as ${userProfile.name}`);

            if (redirectUrl) {
                navigate(redirectUrl);
            } else if (userProfile.role === "instructor") {
                navigate("/instructor");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            console.error("Google Auth error:", err);
            toast.error("Google authentication failed. Please try email login.");
        } finally {
            setGoogleLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (isSignup) {
                const user = await signup({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone
                });
                toast.success("Account created successfully! Welcome to HR Tunes.");

                if (redirectUrl) {
                    navigate(redirectUrl);
                } else if (user.role === "instructor" || role === "instructor") {
                    navigate("/instructor");
                } else {
                    navigate("/dashboard");
                }
            } else {
                const user = await login({
                    email: formData.email,
                    password: formData.password,
                    role
                });
                toast.success(`Welcome back, ${user.name}!`);

                if (redirectUrl) {
                    navigate(redirectUrl);
                } else if (user.role === "instructor" || role === "instructor") {
                    navigate("/instructor");
                } else {
                    navigate("/dashboard");
                }
            }
        } catch (err) {
            console.error("Auth error:", err);
            toast.error(err.message || "Authentication failed. Please check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="auth-page">
            <HeroPanel isSignup={isSignup} />

            <div className="flex flex-col min-h-screen">
                <TopBar
                    isSignup={isSignup}
                    onToggle={() => setCurrentMode(isSignup ? "login" : "signup")}
                    redirectUrl={redirectUrl}
                />

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
                    <div className="w-full max-w-md">
                        {/* Selected Plan Continuity Banner */}
                        {selectedPlanObj && (
                            <div className="mb-6 p-3.5 bg-primary/10 border border-primary/30 rounded-xl flex items-center justify-between">
                                <div className="text-xs">
                                    <span className="text-primary font-bold block uppercase tracking-wider">
                                        Selected Enrollment
                                    </span>
                                    <span className="text-white font-bold">{selectedPlanObj.name}</span>
                                </div>
                                <span className="text-xs font-mono font-bold bg-primary text-white px-2.5 py-1">
                                    ₹{selectedPlanObj.price.toLocaleString("en-IN")}
                                </span>
                            </div>
                        )}

                        {/* Free Trial Booked Success Banner */}
                        {isTrialBooked && (
                            <div className="mb-6 p-4 bg-emerald-500/15 border border-emerald-500/40 rounded-xl flex items-start gap-3">
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                                <div className="text-xs">
                                    <p className="font-bold text-emerald-300 text-sm flex items-center gap-1.5">
                                        Free Trial Reserved! <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                                    </p>
                                    <p className="text-white/90 mt-1 leading-relaxed">
                                        Your 1-on-1 session is booked. Log in with your email {paramEmail && <strong className="text-emerald-300">({paramEmail})</strong>} and the password you just created.
                                    </p>
                                </div>
                            </div>
                        )}

                        <FormHeading isSignup={isSignup} hasPayment={Boolean(paymentId)} isTrial={isTrialBooked} />

                        {!paymentId && !redirectUrl && <RoleToggle role={role} onChange={setRole} />}

                        {/* Google Auth Button */}
                        <button
                            type="button"
                            onClick={handleGoogleAuth}
                            disabled={googleLoading}
                            className="w-full mb-5 py-3 px-4 bg-white text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-3 hover:bg-neutral-200 transition-colors cursor-pointer"
                            data-testid="google-auth-btn"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                            {googleLoading ? "Signing in…" : "Continue with Google"}
                        </button>

                        <div className="flex items-center gap-3 my-5">
                            <div className="h-px bg-white/10 flex-1" />
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">
                                Or with email
                            </span>
                            <div className="h-px bg-white/10 flex-1" />
                        </div>

                        <AuthForm
                            isSignup={isSignup}
                            formData={formData}
                            onChange={handleChange}
                            onSubmit={handleSubmit}
                            loading={loading}
                        />
                        <TermsNote />
                    </div>
                </div>
            </div>
        </div>
    );
}

function HeroPanel({ isSignup }) {
    return (
        <div className="relative hidden lg:block overflow-hidden grain">
            <img src={IMAGES.heroGuitar} alt="Guitar" className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
            <div className="absolute top-10 left-10 flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                <span className="text-heading font-bold text-lg">HR Tunes</span>
            </div>
            <div className="absolute bottom-16 left-10 right-10">
                <div className="eyebrow mb-4 text-primary">{isSignup ? "Welcome to the stage" : "Back to the stage"}</div>
                <h2 className="text-display text-5xl md:text-6xl leading-[0.9]">
                    Music is not a hobby. <br />
                    It's your <span className="text-primary">identity</span>.
                </h2>
            </div>
        </div>
    );
}

function TopBar({ isSignup, onToggle, redirectUrl }) {
    return (
        <div className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2 lg:hidden" data-testid="auth-logo">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                <span className="text-heading font-bold text-lg">HR Tunes</span>
            </Link>
            <div className="ml-auto text-sm text-muted-foreground">
                {isSignup ? "Already registered?" : "New student?"}{" "}
                <button
                    onClick={onToggle}
                    className="text-white hover:text-primary font-bold underline underline-offset-4 cursor-pointer"
                    data-testid="toggle-auth-mode"
                >
                    {isSignup ? "Log in" : "Sign up"}
                </button>
            </div>
        </div>
    );
}

function FormHeading({ isSignup, hasPayment }) {
    return (
        <>
            <div className="eyebrow mb-4">{isSignup ? "Create Student Account" : "Welcome Back"}</div>
            <h1 className="text-display text-5xl md:text-6xl leading-none mb-2">
                {isSignup ? (hasPayment ? "Claim Access." : "Start playing.") : "Log in."}
            </h1>
            <p className="text-muted-foreground mb-6">
                {isSignup
                    ? (hasPayment ? "Create your password to activate your course dashboard." : "Learn guitar with personalized live guidance.")
                    : "Pick up right where you left off."}
            </p>
        </>
    );
}

function RoleToggle({ role, onChange }) {
    return (
        <div className="grid grid-cols-2 gap-2 mb-6 p-1 border border-white/10 bg-card" data-testid="role-toggle">
            {ROLE_OPTIONS.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    className={`flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        role === id ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                    data-testid={`role-${id}`}
                >
                    <Icon size={14} /> {label}
                </button>
            ))}
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

function PasswordField({ value, onChange }) {
    const [show, setShow] = useState(false);
    return (
        <Field label="Password">
            <div className="relative">
                <input
                    required
                    type={show ? "text" : "password"}
                    name="password"
                    value={value}
                    onChange={onChange}
                    placeholder="••••••••"
                    className="form-input pr-10"
                    data-testid="auth-password"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white cursor-pointer"
                    aria-label="Toggle password"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </Field>
    );
}

function AuthForm({ isSignup, formData, onChange, onSubmit, loading }) {
    return (
        <form onSubmit={onSubmit} className="space-y-4">
            {isSignup && (
                <Field label="Full Name">
                    <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={onChange}
                        placeholder="e.g. Aarav Mehta"
                        className="form-input"
                        data-testid="signup-name"
                    />
                </Field>
            )}
            <Field label="Email Address">
                <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={onChange}
                    placeholder="you@gmail.com"
                    className="form-input"
                    data-testid="auth-email"
                />
            </Field>

            {isSignup && (
                <Field label="WhatsApp / Phone (Optional)">
                    <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={onChange}
                        placeholder="+91 9876543210"
                        className="form-input"
                    />
                </Field>
            )}

            <PasswordField value={formData.password} onChange={onChange} />

            <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full !py-3.5 flex items-center justify-center gap-2 cursor-pointer mt-2"
                data-testid="auth-submit"
            >
                {loading ? "Please wait..." : isSignup ? "Create Account & Continue" : "Log in"}
                <ArrowRight size={16} />
            </button>
        </form>
    );
}

function TermsNote() {
    return (
        <p className="mt-6 text-xs text-muted-foreground text-center">
            By continuing, you agree to HR Tunes{" "}
            <Link to="/" className="text-white hover:text-primary underline">Terms</Link> &{" "}
            <Link to="/" className="text-white hover:text-primary underline">Privacy Policy</Link>.
        </p>
    );
}
