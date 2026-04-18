import { Link, NavLink, useNavigate } from "react-router-dom";
import {
    LayoutDashboard,
    Music2,
    Radio,
    ClipboardList,
    CreditCard,
    User,
    LogOut,
    Bell,
    Search,
    Menu,
    X,
} from "lucide-react";
import { useState } from "react";

const NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/dashboard/courses", label: "My Courses", icon: Music2 },
    { to: "/dashboard/live", label: "Live Classes", icon: Radio },
    { to: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { to: "/dashboard/profile", label: "Profile", icon: User },
];

export default function DashboardLayout({ children, title, subtitle, actions }) {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background text-foreground flex" data-testid="dashboard-layout">
            {/* Sidebar */}
            <aside
                className={`${
                    open ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-black border-r border-white/10 transition-transform flex flex-col`}
                data-testid="sidebar"
            >
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg">HR Tunes</span>
                    </Link>
                    <button className="lg:hidden text-white" onClick={() => setOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-3 py-6 space-y-1">
                    <div className="eyebrow px-3 mb-3">Student</div>
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.end}
                                onClick={() => setOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                                        isActive
                                            ? "bg-primary/10 text-white border-l-2 border-primary"
                                            : "text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                    }`
                                }
                                data-testid={`sidebar-${item.label.toLowerCase().replace(/ /g, "-")}`}
                            >
                                <Icon size={17} />
                                {item.label}
                            </NavLink>
                        );
                    })}

                    <div className="eyebrow px-3 mb-3 mt-8">Teach</div>
                    <NavLink
                        to="/instructor"
                        onClick={() => setOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all ${
                                isActive
                                    ? "bg-primary/10 text-white border-l-2 border-primary"
                                    : "text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                            }`
                        }
                        data-testid="sidebar-instructor"
                    >
                        <LayoutDashboard size={17} />
                        Instructor Panel
                    </NavLink>
                </nav>

                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer">
                        <div className="w-9 h-9 bg-primary/20 border border-primary/40 flex items-center justify-center">
                            <span className="text-sm font-bold">AM</span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate">Aarav Mehta</div>
                            <div className="text-xs text-muted-foreground truncate">Student</div>
                        </div>
                        <button
                            className="text-muted-foreground hover:text-primary"
                            onClick={() => navigate("/")}
                            data-testid="sidebar-logout"
                            aria-label="Log out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </div>
            </aside>

            {open && (
                <div
                    className="fixed inset-0 bg-black/60 z-30 lg:hidden"
                    onClick={() => setOpen(false)}
                />
            )}

            {/* Main */}
            <div className="flex-1 min-w-0 flex flex-col">
                <header className="h-16 border-b border-white/10 bg-background/80 backdrop-blur-xl sticky top-0 z-20">
                    <div className="h-full px-6 lg:px-10 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                            <button
                                className="lg:hidden text-white"
                                onClick={() => setOpen(true)}
                                aria-label="Open menu"
                            >
                                <Menu size={22} />
                            </button>
                            <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 w-full max-w-sm">
                                <Search size={15} className="text-muted-foreground" />
                                <input
                                    type="text"
                                    placeholder="Search lessons, courses, instructors…"
                                    className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground"
                                    data-testid="dashboard-search"
                                />
                            </div>
                        </div>
                        <button className="relative w-9 h-9 flex items-center justify-center border border-white/10 hover:border-primary/60 transition-colors" data-testid="notifications-btn">
                            <Bell size={16} />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                        </button>
                    </div>
                </header>

                <main className="flex-1 px-6 lg:px-10 py-10">
                    {(title || subtitle || actions) && (
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
                            <div>
                                {subtitle && <div className="eyebrow mb-2">{subtitle}</div>}
                                {title && (
                                    <h1 className="text-display text-5xl md:text-6xl leading-none">
                                        {title}
                                    </h1>
                                )}
                            </div>
                            {actions}
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
