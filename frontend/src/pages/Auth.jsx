import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, GraduationCap, Mic2 } from "lucide-react";
import { IMAGES } from "@/lib/mock";
import { toast } from "sonner";

export default function Auth({ mode = "login" }) {
    const navigate = useNavigate();
    const [currentMode, setCurrentMode] = useState(mode);
    const [role, setRole] = useState("student"); // student | instructor
    const [showPwd, setShowPwd] = useState(false);

    const isSignup = currentMode === "signup";

    const handleSubmit = (e) => {
        e.preventDefault();
        toast.success(isSignup ? "Account created (demo)" : "Welcome back (demo)");
        if (role === "instructor") navigate("/instructor");
        else navigate("/dashboard");
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2" data-testid="auth-page">
            {/* Left - hero image */}
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

            {/* Right - form */}
            <div className="flex flex-col min-h-screen">
                <div className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2 lg:hidden" data-testid="auth-logo">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="ml-auto text-sm text-muted-foreground">
                        {isSignup ? "Already a student?" : "New here?"}{" "}
                        <button
                            onClick={() => setCurrentMode(isSignup ? "login" : "signup")}
                            className="text-white hover:text-primary font-bold underline underline-offset-4"
                            data-testid="toggle-auth-mode"
                        >
                            {isSignup ? "Log in" : "Sign up"}
                        </button>
                    </div>
                </div>

                <div className="flex-1 flex items-center justify-center px-6 md:px-12 py-12">
                    <div className="w-full max-w-md">
                        <div className="eyebrow mb-4">{isSignup ? "Create account" : "Log in"}</div>
                        <h1 className="text-display text-5xl md:text-6xl leading-none mb-2">
                            {isSignup ? "Start playing." : "Welcome back."}
                        </h1>
                        <p className="text-muted-foreground mb-8">
                            {isSignup ? "Free trial · no credit card required." : "Pick up where you left off."}
                        </p>

                        {/* Role toggle */}
                        <div className="grid grid-cols-2 gap-2 mb-8 p-1 border border-white/10 bg-card" data-testid="role-toggle">
                            <button
                                type="button"
                                onClick={() => setRole("student")}
                                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                    role === "student" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                                }`}
                                data-testid="role-student"
                            >
                                <GraduationCap size={15} /> Student
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("instructor")}
                                className={`flex items-center justify-center gap-2 py-3 text-sm font-bold uppercase tracking-wider transition-all ${
                                    role === "instructor" ? "bg-primary text-white" : "text-muted-foreground hover:text-white"
                                }`}
                                data-testid="role-instructor"
                            >
                                <Mic2 size={15} /> Instructor
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {isSignup && (
                                <Field label="Full name">
                                    <input
                                        required
                                        type="text"
                                        placeholder="Harsh Rajput"
                                        className="auth-input"
                                        data-testid="signup-name"
                                    />
                                </Field>
                            )}
                            <Field label="Email">
                                <input
                                    required
                                    type="email"
                                    placeholder="you@hrtunes.in"
                                    className="auth-input"
                                    data-testid="auth-email"
                                />
                            </Field>
                            <Field label="Password">
                                <div className="relative">
                                    <input
                                        required
                                        type={showPwd ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="auth-input pr-10"
                                        data-testid="auth-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd(!showPwd)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                                        aria-label="Toggle password"
                                    >
                                        {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            </Field>

                            {!isSignup && (
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 text-muted-foreground cursor-pointer">
                                        <input type="checkbox" className="accent-primary" /> Remember me
                                    </label>
                                    <a href="#" className="text-primary hover:underline">Forgot password?</a>
                                </div>
                            )}

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

                        <p className="mt-8 text-xs text-muted-foreground text-center">
                            By continuing, you agree to HR Tunes{" "}
                            <a href="#" className="text-white hover:text-primary">Terms</a> &{" "}
                            <a href="#" className="text-white hover:text-primary">Privacy</a>.
                        </p>
                    </div>
                </div>
            </div>
            <style>{`
                .auth-input {
                    width: 100%;
                    background: hsl(0 0% 7%);
                    border: 1px solid hsl(0 0% 15%);
                    padding: 0.75rem 1rem;
                    color: white;
                    font-size: 0.875rem;
                    outline: none;
                    transition: all 0.2s;
                }
                .auth-input:focus {
                    border-color: hsl(357 93% 47%);
                    box-shadow: 0 0 0 3px hsl(357 93% 47% / 0.15);
                }
                .auth-input::placeholder { color: hsl(0 0% 40%); }
            `}</style>
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
