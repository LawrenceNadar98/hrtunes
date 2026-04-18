import DashboardLayout from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { Camera, Save, Flame, Music2, Trophy } from "lucide-react";
import { toast } from "sonner";

const TIMEZONE_OPTIONS = ["Asia/Kolkata", "Asia/Dubai", "Europe/London", "America/New_York"];
const INSTRUMENT_OPTIONS = ["Guitar", "Keyboard", "Both"];
const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function Profile() {
    const [form, setForm] = useState({
        name: "Aarav Mehta",
        email: "aarav@test.com",
        phone: "+91 98000 12345",
        level: "Beginner",
        instrument: "Guitar",
        timezone: "Asia/Kolkata",
        bio: "Indie rock lover. Learning guitar to play my own songs.",
    });

    const update = (k, v) => setForm({ ...form, [k]: v });

    return (
        <DashboardLayout subtitle="Settings" title="Your Profile">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <aside className="lg:col-span-4 card-hr p-8 h-fit" data-testid="profile-avatar-card">
                    <div className="relative w-32 h-32 mx-auto">
                        <div className="w-32 h-32 bg-primary/20 border border-primary/40 flex items-center justify-center text-display text-5xl">
                            {form.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <button
                            className="absolute bottom-0 right-0 w-9 h-9 bg-primary text-white flex items-center justify-center hover:brightness-110"
                            aria-label="Change photo"
                            onClick={() => toast.info("Photo upload (demo)")}
                        >
                            <Camera size={14} />
                        </button>
                    </div>
                    <div className="text-center mt-6">
                        <div className="text-heading font-bold text-xl">{form.name}</div>
                        <div className="text-sm text-muted-foreground">{form.email}</div>
                    </div>
                    <div className="divider-dashed my-6" />
                    <div className="grid grid-cols-3 gap-2 text-center">
                        <Stat icon={Flame} value="7" label="Streak" />
                        <Stat icon={Music2} value="42h" label="Played" />
                        <Stat icon={Trophy} value="5" label="Badges" />
                    </div>
                </aside>

                <form
                    onSubmit={(e) => { e.preventDefault(); toast.success("Profile saved (demo)"); }}
                    className="lg:col-span-8 card-hr p-8 space-y-6"
                    data-testid="profile-form"
                >
                    <div className="eyebrow">Personal information</div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <Field label="Full name" value={form.name} onChange={(v) => update("name", v)} testId="profile-name" />
                        <Field label="Email" value={form.email} onChange={(v) => update("email", v)} testId="profile-email" />
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
                        <span className="eyebrow block mb-2">Bio</span>
                        <textarea
                            value={form.bio}
                            onChange={(e) => update("bio", e.target.value)}
                            rows={4}
                            className="w-full bg-card border border-white/15 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 resize-none"
                            data-testid="profile-bio"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <button type="button" className="btn-outline">Cancel</button>
                        <button type="submit" className="btn-primary" data-testid="profile-save">
                            <Save size={14} /> Save changes
                        </button>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
}

function Field({ label, value, onChange, type = "text", testId }) {
    return (
        <label className="block">
            <span className="eyebrow block mb-2">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-card border border-white/15 px-4 py-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
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
