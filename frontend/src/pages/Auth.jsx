import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, GraduationCap, Mic2 } from "lucide-react";
import { IMAGES } from "@/lib/mock";
import { toast } from "sonner";

const ROLE_OPTIONS = [
    { id: "student", label: "Student", Icon: GraduationCap, redirect: "/dashboard" },
    { id: "instructor", label: "Instructor", Icon: Mic2, redirect: "/instructor" },
];

export default function Auth({ mode = "login" }) {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState(mode);
    const [role, setRole] = useState("student");
    const isSignup = currentMode === "signup";

    const handleSubmit = (e) => {
        e.preventDefault();
        const selected = ROLE_OPTIONS.find((r) => r.id === role);
        toast.success(isSignup ? "Account created (demo)" : "Welcome back (demo)");
        navigate(selected?.redirect || "/dashboard");
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="auth-page">
            <HeroPanel isSignup={isSignup} />

            <div className="flex flex-col min-h-screen">
                <TopBar isSignup={isSignup} onToggle={() => setCurrentMode(isSignup ? "login" : "signup")} />

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
                    <div className="w-full max-w-md">
                        <FormHeading isSignup={isSignup} />
                        <RoleToggle role={role} onChange={setRole} />
                        <AuthForm isSignup={isSignup} onSubmit={handleSubmit} />
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

function TopBar({ isSignup, onToggle }) {
    return (
        <div className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-2 lg:hidden" data-testid="auth-logo">
                <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                <span className="text-heading font-bold text-lg">HR Tunes</span>
            </Link>
            <div className="ml-auto text-sm text-muted-foreground">
                {isSignup ? "Already a student?" : "New here?"}{" "}
                <button
                    onClick={onToggle}
                    className="text-white hover:text-primary font-bold underline underline-offset-4"
                    data-testid="toggle-auth-mode"
                >
                    {isSignup ? "Log in" : "Sign up"}
                </button>
            </div>
        </div>
    );
}

function FormHeading({ isSignup }) {
    return (
        <>
            <div className="eyebrow mb-4">{isSignup ? "Create account" : "Log in"}</div>
            <h1 className="text-display text-5xl md:text-6xl leading-none mb-2">
                {isSignup ? "Start playing." : "Welcome back."}
            </h1>
            <p className="text-muted-foreground mb-8">
                {isSignup ? "Free trial · no credit card required." : "Pick up where you left off."}
            </p>
        </>
    );
}

function RoleToggle({ role, onChange }) {
    return (
        <div className="grid grid-cols-2 gap-2 mb-8 p-1 border border-white/10 bg-card" data-testid="role-toggle">
            {ROLE_OPTIONS.map(({ id, label, Icon }) => (
                <button
                    key={id}
                    type="button"
                    onClick={() => onChange(id)}
                    className={`flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                        role === id ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                    }`}
                    data-testid={`role-${id}`}
                >
                    <Icon size={15} /> {label}
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

function PasswordField() {
    const [show, setShow] = useState(false);
    return (
        <Field label="Password">
            <div className="relative">
                <input
                    required
                    type={show ? "text" : "password"}
                    placeholder="••••••••"
                    className="form-input pr-10"
                    data-testid="auth-password"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                    aria-label="Toggle password"
                >
                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>
        </Field>
    );
}

function RememberRow() {
    return (
        <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                <input type="checkbox" className="accent-primary" /> Remember me
            </label>
            <a href="#" className="text-primary hover:underline">Forgot password?</a>
        </div>
    );
}

function AuthForm({ isSignup, onSubmit }) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            {isSignup && (
                <Field label="Full name">
                    <input required type="text" placeholder="Harsh Rajput" className="form-input" data-testid="signup-name" />
                </Field>
            )}
            <Field label="Email">
                <input required type="email" placeholder="you@hrtunes.in" className="form-input" data-testid="auth-email" />
            </Field>
            <PasswordField />

            {!isSignup && <RememberRow />}

            <button type="submit" className="btn-primary w-full" data-testid="auth-submit">
                {isSignup ? "Create account" : "Log in"}
                <ArrowRight size={16} />
            </button>

            <div className="relative my-6">
                <div className="divider-dashed" />
                <span className="absolute inset-0 flex items-center justify-center">
                    <span className="bg-background px-3 text-xs text-muted-foreground uppercase tracking-widest">or</span>
                </span>
            </div>

            <button type="button" className="btn-outline w-full" data-testid="auth-google">
                Continue with Google
            </button>
        </form>
    );
}

function TermsNote() {
    return (
        <p className="mt-8 text-xs text-muted-foreground text-center">
            By continuing, you agree to HR Tunes{" "}
            <a href="#" className="text-white hover:text-primary">Terms</a> &{" "}
            <a href="#" className="text-white hover:text-primary">Privacy</a>.
        </p>
    );
}
