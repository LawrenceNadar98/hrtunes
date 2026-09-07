import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
    Calendar,
    Clock,
    Video,
    CheckCircle2,
    Sparkles,
    ShieldCheck,
    ArrowRight,
    ArrowLeft,
    Check,
    User,
    Mail,
    Phone,
    HelpCircle,
    Eye,
    EyeOff,
    LogIn,
    Info
} from "lucide-react";
import { getAvailableTrialSlots, createTrialBooking } from "@/services/trialService";
import { registerStudent } from "@/services/authService";
import { useAuth } from "@/context/AuthContext";
import { IMAGES } from "@/lib/images";
import { toast } from "sonner";

export default function BookTrial() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const slotData = getAvailableTrialSlots();

    const [selectedDate, setSelectedDate] = useState(slotData[0]?.date || "");
    const [selectedSlot, setSelectedSlot] = useState(slotData[0]?.slots[0] || "");
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [bookedBooking, setBookedBooking] = useState(null);
    const [showPassword, setShowPassword] = useState(false);
    const [countdown, setCountdown] = useState(6);

    // Form data for trial booking
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        notes: ""
    });

    // Auto-redirect timer when booking is confirmed
    useEffect(() => {
        let timer;
        if (bookedBooking && countdown > 0) {
            timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
        } else if (bookedBooking && countdown === 0) {
            navigate(`/login?email=${encodeURIComponent(formData.email)}&trialBooked=true`);
        }
        return () => clearTimeout(timer);
    }, [bookedBooking, countdown, formData.email, navigate]);

    const activeDateObj = slotData.find((d) => d.date === selectedDate) || slotData[0];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleConfirmBooking = async (e) => {
        e.preventDefault();

        if (!acceptedTerms) {
            toast.error("Please accept the Free Trial Terms to confirm your slot.");
            return;
        }

        if (!selectedDate || !selectedSlot) {
            toast.error("Please select an available date and time slot.");
            return;
        }

        if (!formData.name.trim() || !formData.email.trim()) {
            toast.error("Please provide your name and email address.");
            return;
        }

        if (!formData.password || formData.password.length < 6) {
            toast.error("Please create a password of at least 6 characters.");
            return;
        }

        setSubmitting(true);
        try {
            // 1. Always create / register student account with the entered credentials without auto-logging in
            const newStudent = await registerStudent({
                name: formData.name.trim(),
                email: formData.email.trim().toLowerCase(),
                password: formData.password,
                phone: formData.phone.trim(),
                autoLogin: false
            });

            // 2. Create the trial booking linked to this newly created student
            const booking = await createTrialBooking({
                userId: newStudent.id || newStudent.uid,
                userName: formData.name.trim(),
                userEmail: formData.email.trim().toLowerCase(),
                phone: formData.phone.trim(),
                scheduledDate: selectedDate,
                timeSlot: selectedSlot,
                notes: formData.notes.trim()
            });

            // 3. Clear any existing active session so the student logs in freshly
            await logout();

            setBookedBooking(booking);
            toast.success("🎸 Free Trial successfully booked! Please log in.");
        } catch (err) {
            console.error("Trial booking failed:", err);
            toast.error("Failed to book trial slot. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // If booking was just completed, render success screen with redirect to login
    if (bookedBooking) {
        return (
            <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6">
                <div className="card-hr max-w-lg w-full p-8 border-primary/40 text-center space-y-6">
                    <div className="w-16 h-16 bg-emerald-500/20 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                        <Check size={32} />
                    </div>

                    <div>
                        <div className="eyebrow text-emerald-400 mb-2">Booking Confirmed!</div>
                        <h1 className="text-display text-4xl">You're on the stage.</h1>
                        <p className="text-sm text-white/80 mt-2">
                            Your 60-minute Free Trial has been reserved with Lead Instructor <strong>Harsh Patel</strong>.
                        </p>
                    </div>

                    <div className="p-5 bg-white/5 border border-white/10 rounded-lg text-left space-y-3 font-mono text-xs">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Student Name:</span>
                            <span className="text-white font-bold">{formData.name}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Login Email:</span>
                            <span className="text-primary font-bold">{formData.email}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Scheduled Date:</span>
                            <span className="text-white">{bookedBooking.scheduledDate}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Time Slot:</span>
                            <span className="text-white">{bookedBooking.timeSlot}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Platform:</span>
                            <span className="text-white flex items-center gap-1">
                                <Video size={12} className="text-primary" /> Google Meet (1-on-1)
                            </span>
                        </div>
                    </div>

                    <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-white/90">
                        Please log in with your email (<strong>{formData.email}</strong>) and password to access your Student Portal.
                    </div>

                    <div className="space-y-3 pt-2">
                        <button
                            onClick={() => navigate(`/login?email=${encodeURIComponent(formData.email)}&trialBooked=true`)}
                            className="btn-primary w-full !py-3.5 font-bold text-sm flex items-center justify-center gap-2"
                            data-testid="proceed-to-login-btn"
                        >
                            <LogIn size={16} /> Proceed to Login ({countdown}s)
                        </button>
                        <p className="text-[11px] text-muted-foreground">
                            Redirecting you to the login page automatically...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="book-trial-page">
            <header className="border-b border-white/10 bg-card/60 backdrop-blur-md sticky top-0 z-30">
                <div className="container-hr h-16 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Sparkles size={13} className="text-primary" /> 100% Free · Zero Credit Card
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
                    {/* Left: Trial details & Slot selector */}
                    <div className="lg:col-span-7 space-y-8">
                        <div>
                            <div className="eyebrow text-primary mb-2">Free 60-Min 1-on-1 Session</div>
                            <h1 className="text-display text-4xl sm:text-5xl mb-4">Book your Free Trial.</h1>
                            <p className="text-white/80 text-base leading-relaxed">
                                Experience personalized guitar coaching with Harsh Patel. Bring your guitar (or just your curiosity), and we'll evaluate your goals and play your first chords together.
                            </p>
                        </div>

                        {/* What happens in 60 mins */}
                        <div className="card-hr p-6">
                            <h3 className="text-heading font-bold text-lg mb-4 flex items-center gap-2">
                                <Sparkles size={16} className="text-primary" /> What happens during the trial
                            </h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <div className="text-primary font-bold text-lg mb-1">01</div>
                                    <div className="font-bold text-sm text-white">Posture & Anatomy</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Holding the guitar correctly, ergonomic finger positioning & tuning.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <div className="text-primary font-bold text-lg mb-1">02</div>
                                    <div className="font-bold text-sm text-white">First Chord & Beat</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Clean sound without buzzing, simple 4/4 rhythm & strumming technique.
                                    </p>
                                </div>
                                <div className="p-4 bg-white/5 border border-white/10">
                                    <div className="text-primary font-bold text-lg mb-1">03</div>
                                    <div className="font-bold text-sm text-white">Custom Roadmap</div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        Personalized learning path based on your favorite music and pace.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Step 1: Select Date */}
                        <section className="space-y-4">
                            <div className="eyebrow text-primary">Step 01</div>
                            <h3 className="text-heading font-bold text-xl">Select a Date</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                                {slotData.map((d) => {
                                    const isSel = d.date === selectedDate;
                                    return (
                                        <button
                                            key={d.date}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDate(d.date);
                                                setSelectedSlot(d.slots[0]);
                                            }}
                                            className={`p-3.5 border text-left transition-all ${
                                                isSel
                                                    ? "bg-primary text-white border-primary shadow-lg shadow-red-600/20"
                                                    : "bg-card border-white/15 hover:border-white/30 text-neutral-300"
                                            }`}
                                        >
                                            <div className="text-[11px] uppercase tracking-wider opacity-80">
                                                {d.displayDate.split(",")[0]}
                                            </div>
                                            <div className="font-bold text-sm mt-0.5">
                                                {d.displayDate.split(",")[1]}
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </section>

                        {/* Step 2: Select Time Slot */}
                        <section className="space-y-4">
                            <div className="eyebrow text-primary">Step 02</div>
                            <h3 className="text-heading font-bold text-xl">Select Time Slot</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {activeDateObj?.slots.map((slot) => {
                                    const isSel = slot === selectedSlot;
                                    return (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setSelectedSlot(slot)}
                                            className={`p-4 border text-left flex items-center justify-between transition-all ${
                                                isSel
                                                    ? "bg-primary/20 border-primary text-white font-bold"
                                                    : "bg-card border-white/15 hover:border-white/30 text-white/80"
                                            }`}
                                        >
                                            <div className="flex items-center gap-2 text-sm">
                                                <Clock size={15} className={isSel ? "text-primary" : "text-muted-foreground"} />
                                                {slot}
                                            </div>
                                            {isSel && <CheckCircle2 size={16} className="text-primary" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </section>
                    </div>

                    {/* Right: Student info & Confirm CTA */}
                    <aside className="lg:col-span-5 lg:sticky lg:top-24 h-fit">
                        <form onSubmit={handleConfirmBooking} className="card-hr p-8 space-y-6">
                            <div className="eyebrow text-primary">Step 03 · Student Details</div>
                            <h3 className="text-heading font-bold text-xl">Confirm your details</h3>

                            <div className="space-y-4">
                                {user && (
                                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded text-xs text-amber-200 flex items-start gap-2">
                                        <Info size={15} className="text-amber-400 shrink-0 mt-0.5" />
                                        <span>
                                            You are currently logged in as <strong>{user.name}</strong> ({user.email}). Fill in below to register a new student account.
                                        </span>
                                    </div>
                                )}

                                <label className="block">
                                    <span className="eyebrow block mb-1.5">Full Name *</span>
                                    <input
                                        required
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Rahul Sharma"
                                        className="form-input"
                                        data-testid="trial-name"
                                    />
                                </label>

                                <label className="block">
                                    <span className="eyebrow block mb-1.5">Email Address *</span>
                                    <input
                                        required
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="e.g. rahul.guitar@gmail.com"
                                        className="form-input"
                                        data-testid="trial-email"
                                    />
                                </label>

                                <label className="block">
                                    <span className="eyebrow block mb-1.5">WhatsApp / Phone *</span>
                                    <input
                                        required
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="e.g. +91 9876543210"
                                        className="form-input"
                                        data-testid="trial-phone"
                                    />
                                </label>

                                <label className="block">
                                    <span className="eyebrow block mb-1.5">Create Password (for Student Portal Login) *</span>
                                    <div className="relative">
                                        <input
                                            required
                                            minLength={6}
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="Create a password (min 6 chars)"
                                            className="form-input pr-10"
                                            data-testid="trial-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-white"
                                            aria-label="Toggle password visibility"
                                        >
                                            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <span className="text-[11px] text-muted-foreground mt-1 block">
                                        You will use this email and password to log in to your Student Dashboard.
                                    </span>
                                </label>

                                <label className="block">
                                    <span className="eyebrow block mb-1.5">Any specific goals or favorite songs? (Optional)</span>
                                    <textarea
                                        rows={2}
                                        name="notes"
                                        value={formData.notes}
                                        onChange={handleChange}
                                        placeholder="e.g. Complete beginner, want to play acoustic Hindi songs…"
                                        className="form-input resize-none"
                                    />
                                </label>
                            </div>

                            {/* Terms acceptance */}
                            <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                                <label className="flex items-start gap-3 cursor-pointer select-none">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                        className="mt-1 w-4 h-4 accent-primary rounded cursor-pointer"
                                        data-testid="trial-terms-checkbox"
                                    />
                                    <span className="text-xs text-white/80 leading-relaxed">
                                        I agree to attend the scheduled 1-on-1 trial session on time. I understand this is 100% free with no payment obligation.
                                    </span>
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={submitting}
                                className={`w-full py-4 flex items-center justify-center gap-2 font-display text-lg uppercase tracking-wider transition-all cursor-pointer ${
                                    acceptedTerms
                                        ? "bg-primary text-white hover:brightness-110 shadow-xl shadow-red-600/30"
                                        : "bg-white/15 text-muted-foreground"
                                }`}
                                data-testid="confirm-trial-booking-btn"
                            >
                                {submitting ? "Reserving Slot…" : "Confirm Free Trial Booking"}
                                <ArrowRight size={18} />
                            </button>

                            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                                <ShieldCheck size={14} className="text-emerald-400" /> Instant Google Meet invitation sent upon booking
                            </div>
                        </form>
                    </aside>
                </div>
            </main>
        </div>
    );
}
