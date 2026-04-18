import DashboardLayout from "@/components/layout/DashboardLayout";
import { LIVE_CLASSES, TIMEZONES } from "@/lib/mock";
import { useState } from "react";
import { Calendar, Clock, Users, Globe, Video, Play } from "lucide-react";
import { toast } from "sonner";

// Simple calendar grid for Feb 2026
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH = { year: 2026, month: 1, label: "February 2026" }; // month 0-indexed

function buildCalendar(year, month) {
    const first = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = first.getDay();
    const cells = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
}

export default function LiveClasses() {
    const [tz, setTz] = useState("Asia/Kolkata");
    const [selectedDay, setSelectedDay] = useState(18);
    const cells = buildCalendar(MONTH.year, MONTH.month);

    const daysWithClasses = new Set(
        LIVE_CLASSES.filter((l) => l.status === "upcoming").map((l) => {
            const d = new Date(l.date);
            return d.getDate();
        })
    );

    const upcoming = LIVE_CLASSES.filter((l) => l.status === "upcoming");
    const past = LIVE_CLASSES.filter((l) => l.status === "past");

    return (
        <DashboardLayout
            subtitle="Schedule"
            title="Live Classes"
            actions={
                <div className="flex items-center gap-2 border border-white/10 bg-card px-3 py-2">
                    <Globe size={14} className="text-muted-foreground" />
                    <select
                        value={tz}
                        onChange={(e) => setTz(e.target.value)}
                        className="bg-transparent text-sm outline-none cursor-pointer"
                        data-testid="timezone-select"
                    >
                        {TIMEZONES.map((t) => (
                            <option key={t} value={t} className="bg-card">
                                {t}
                            </option>
                        ))}
                    </select>
                </div>
            }
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Calendar */}
                <div className="lg:col-span-5 card-hr p-6" data-testid="calendar-card">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <div className="eyebrow">Calendar</div>
                            <div className="text-heading font-bold text-xl">{MONTH.label}</div>
                        </div>
                        <Calendar size={16} className="text-primary" />
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {DAYS.map((d) => (
                            <div key={d} className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground text-center py-2">
                                {d}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {cells.map((d, i) => {
                            const hasClass = d && daysWithClasses.has(d);
                            const isSelected = d === selectedDay;
                            return (
                                <button
                                    key={i}
                                    disabled={!d}
                                    onClick={() => d && setSelectedDay(d)}
                                    className={`aspect-square flex flex-col items-center justify-center text-sm font-medium border transition-all ${
                                        !d
                                            ? "border-transparent"
                                            : isSelected
                                            ? "bg-primary text-white border-primary"
                                            : "border-white/10 hover:border-primary/60 hover:bg-primary/5"
                                    }`}
                                    data-testid={d ? `cal-day-${d}` : undefined}
                                >
                                    {d && (
                                        <>
                                            <span>{d}</span>
                                            {hasClass && !isSelected && <span className="w-1 h-1 bg-primary rounded-full mt-0.5" />}
                                        </>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    <div className="divider-dashed my-6" />
                    <div className="space-y-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-primary rounded-full" /> Upcoming class</div>
                        <div className="flex items-center gap-2"><span className="w-2 h-2 bg-white/40 rounded-full" /> Group session</div>
                    </div>
                </div>

                {/* Upcoming */}
                <div className="lg:col-span-7">
                    <h2 className="text-heading font-bold text-xl mb-4">Upcoming Sessions</h2>
                    <div className="space-y-3">
                        {upcoming.map((lc) => (
                            <div
                                key={lc.id}
                                className="card-hr p-5 flex flex-col md:flex-row md:items-center gap-5"
                                data-testid={`upcoming-${lc.id}`}
                            >
                                <div className="flex-shrink-0 bg-primary/10 border border-primary/40 p-4 text-center min-w-[80px]">
                                    <div className="text-[10px] font-bold uppercase tracking-widest text-primary">
                                        {new Date(lc.date).toLocaleDateString("en-IN", { month: "short" })}
                                    </div>
                                    <div className="text-heading font-black text-2xl leading-none">
                                        {new Date(lc.date).getDate()}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-heading font-bold text-lg">{lc.title}</div>
                                    <div className="text-sm text-muted-foreground">{lc.course} · {lc.instructor}</div>
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-white/60">
                                        <span className="flex items-center gap-1.5"><Clock size={12} /> {lc.time} · {lc.duration} min</span>
                                        <span className="flex items-center gap-1.5"><Users size={12} /> {lc.attendees} attending</span>
                                        <span className="flex items-center gap-1.5"><Globe size={12} /> {lc.timezone}</span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => toast.success("Joining session (demo)…")}
                                    className="btn-primary flex-shrink-0"
                                    data-testid={`join-${lc.id}`}
                                >
                                    <Video size={14} /> Join Live
                                </button>
                            </div>
                        ))}
                    </div>

                    <h2 className="text-heading font-bold text-xl mt-10 mb-4">Past Sessions</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {past.map((lc) => (
                            <div key={lc.id} className="card-hr overflow-hidden group" data-testid={`past-${lc.id}`}>
                                <div className="relative aspect-video bg-black">
                                    <iframe
                                        src={lc.recordingUrl}
                                        className="w-full h-full"
                                        title={lc.title}
                                        allowFullScreen
                                    />
                                </div>
                                <div className="p-5">
                                    <div className="text-xs text-muted-foreground mb-1">
                                        {new Date(lc.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" })} · Recording
                                    </div>
                                    <div className="text-heading font-bold">{lc.title}</div>
                                    <div className="text-xs text-muted-foreground mt-1">{lc.course}</div>
                                    <button className="mt-4 text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-1.5 hover:gap-2 transition-all">
                                        <Play size={12} className="fill-primary" /> Play Recording
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
