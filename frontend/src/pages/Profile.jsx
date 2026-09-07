import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState, useEffect } from "react";
import { Camera, Save, Flame, Music2, Trophy, ShieldCheck, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { updateUserProfile } from "@/services/authService";
import { getActiveEnrollment } from "@/services/enrollmentService";
import { toast } from "sonner";

const TIMEZONE_OPTIONS = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"];
const INSTRUMENT_OPTIONS = ["Guitar", "Keyboard", "Both"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
    const { user, setUser } = useAuth();
    const [saving, setSaving] = useState(false);
    const [activeEnr, setActiveEnr] = useState(null);

    const [form, setForm] = useState({
        name: user?.name || "Student",
        email: user?.email || "",
        phone: user?.phone || "",
        level: user?.level || "Beginner",
        instrument: user?.instrument || "Guitar",
        timezone: user?.timezone || "Asia/Kolkata",
        bio: user?.bio || "Learning guitar with live 1-on-1 mentorship on HR Tunes.",
    });

    useEffect(() => {
        if (user) {
            const userId = user.id || user.uid;
            setForm((prev) => ({
                ...prev,
                name: user.name || prev.name,
                email: user.email || prev.email,
                phone: user.phone || prev.phone,
                level: user.level || prev.level,
                instrument: user.instrument || prev.instrument,
                timezone: user.timezone || prev.timezone,
                bio: user.bio || prev.bio
            }));

            getActiveEnrollment(userId).then((enr) => {
                if (enr && enr.status === "active") {
                    setActiveEnr(enr);
                }
            }).catch(() => {});
        }
    }, [user]);

    const update = (k, v) => setForm((prev) => ({ ...prev, [k]: v }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const userId = user?.id || user?.uid;
            if (userId) {
                const updated = await updateUserProfile(userId, form);
                if (updated) {
                    setUser(updated);
                }
            }
            toast.success("Profile details updated successfully!");
        } catch (err) {
            console.error("Save profile error:", err);
            toast.error("Failed to save profile changes.");
        } finally {
            setSaving(false);
        }
    };

    const initials = (form.name || "ST")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const planLabel = activeEnr?.planName || user?.enrolledPlanName || (user?.role === "instructor" ? "Instructor / Admin" : "Free Trial Account");

    return (
        <DashboardLayout subtitle="Settings" title="Your Profile">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 card-hr p-8 h-fit" data-testid="profile-avatar-card">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="w-32 h-32 bg-primary/20 border border-primary/40 flex items-center justify-center text-display text-4xl text-primary font-bold">
                            {initials}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white flex items-center justify-center hover:brightness-110"
                            aria-label="Change photo"
                            type="button"
                            onClick={() => toast.info("Avatar updated")}
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <div className="text-heading font-bold text-xl">{form.name}</div>
                        <div className="text-xs text-muted-foreground mt-0.5">{form.email}</div>
                        <div className="mt-3 inline-flex items-center gap-1 px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-bold uppercase tracking-wider rounded">
                            <Sparkles size={11} /> {planLabel}
                        </div>
                    </div>
                    <div className="divider-dashed my-6" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <Stat icon={Flame} value={user?.stats?.streak || "0"} label="Streak" />
                        <Stat icon={Music2} value={user?.stats?.hours ? `${user.stats.hours}h` : "0.0h"} label="Played" />
                        <Stat icon={Trophy} value={user?.stats?.badges || "0"} label="Badges" />
                    </div>
                </aside>

                <form
                    onSubmit={handleSave}
                    className="lg:col-span-8 card-hr p-8 space-y-6"
                    data-testid="profile-form"
                >
                    <div className="eyebrow">Personal information</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} testId="profile-name" />
                        <Field label="Email (Read Only)" value={form.email} onChange={() => {}} disabled testId="profile-email" />
                        <Field label="Phone" value={form.phone} onChange={(v) => update("phone", v)} testId="profile-phone" />
                        <SelectField label="Timezone" value={form.timezone} onChange={(v) => update("timezone", v)}
                            options={TIMEZONE_OPTIONS} />
                    </div>

                    <div className="divider-dashed" />
                    <div className="eyebrow">Musical preferences</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <SelectField label="Primary instrument" value={form.instrument} onChange={(v) => update("instrument", v)}
                            options={INSTRUMENT_OPTIONS} />
                        <SelectField label="Skill level" value={form.level} onChange={(v) => update("level", v)}
                            options={LEVEL_OPTIONS} />
                    </div>

                    <div>
                        <span className="eyebrow block mb-2">Bio / Practice Goals</span>
                        <textarea
                            value={form.bio}
                            onChange={(e) => update("bio", e.target.value)}
                            rows={3}
                            className="w-full bg-card border border-white/15 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            data-testid="profile-bio"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="submit" disabled={saving} className="btn-primary" data-testid="profile-save">
                            <Save size={14} /> {saving ? "Saving..." : "Save changes"}
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, value, onChange, type = "text", testId, disabled = false }) {
    return (
        <label className="block">
            <span className="eyebrow block mb-2">{label}</span>
            <input
                type={type}
                value={value}
                disabled={disabled}
                onChange={(e) => onChange(e.target.value)}
                className={`w-full bg-card border border-white/15 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 ${
                    disabled ? "opacity-60 cursor-not-allowed bg-white/5" : ""
                }`}
                data-testid={testId}
            />
        </label>
    );
}

function SelectField({ label, value, onChange, options }) {
    return (
        <label className="block">
            <span className="eyebrow block mb-2">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-card border border-white/15 px-4 py-3 text-sm outline-none focus:border-primary cursor-pointer"
            >
                {options.map((o) => (
                    <option key={o} value={o} className="bg-card">{o}</option>
                ))}
            </select>
        </label>
    );
}

function Stat({ icon: Icon, value, label }) {
    return (
        <div>
            <div className="flex items-center justify-center mb-2">
                <Icon size={14} className="text-primary" />
            </div>
            <div className="text-heading font-black text-xl">{value}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">{label}</div>
        </div>
    );
}
