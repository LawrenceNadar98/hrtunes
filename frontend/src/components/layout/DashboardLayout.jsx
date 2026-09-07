import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
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
    Users,
    Sliders,
    Calendar,
    UploadCloud,
    TrendingUp,
    Shield,
    ArrowUpRight,
    GraduationCap
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getActiveEnrollment } from "@/services/enrollmentService";
import { toast } from "sonner";

const STUDENT_NAV_ITEMS = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
    { to: "/dashboard/courses", label: "My Courses", icon: Music2 },
    { to: "/dashboard/live", label: "Live Classes", icon: Radio },
    { to: "/dashboard/assignments", label: "Assignments", icon: ClipboardList },
    { to: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { to: "/dashboard/profile", label: "Profile", icon: User },
];

const ADMIN_NAV_ITEMS = [
    { id: "payments", label: "UPI Payments", icon: CreditCard, badge: true },
    { id: "plans", label: "Plans Manager", icon: Sliders },
    { id: "curriculum", label: "Curriculum & Courses", icon: Music2 },
    { id: "students", label: "Students Roster", icon: Users },
    { id: "overview", label: "Overview & Earnings", icon: TrendingUp },
    { id: "schedule", label: "Schedule", icon: Calendar },
    { id: "uploads", label: "Uploads", icon: UploadCloud },
];

export default function DashboardLayout({
    children,
    title,
    subtitle,
    actions,
    portal = null, // "admin" | "student" | null (auto-detect)
    activeAdminSection = "payments",
    onSelectAdminSection = null,
    pendingPaymentsCount = 0
}) {
    const [open, setOpen] = useState(false);
    const [activeEnr, setActiveEnr] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuth();

    // Determine if we are in the Admin portal or Student portal
    const isAdminPortal = portal === "admin" || (portal === null && (location.pathname.startsWith("/instructor") || location.pathname.startsWith("/admin")));

    useEffect(() => {
        if (user && !isAdminPortal) {
            const userId = user.id || user.uid;
            getActiveEnrollment(userId).then((enr) => {
                if (enr && enr.status === "active") {
                    setActiveEnr(enr);
                }
            }).catch(() => {});
        }
    }, [user, isAdminPortal]);

    const isPaidPlan = Boolean(
        (activeEnr && activeEnr.status === "active" && activeEnr.planId !== "free-trial" && activeEnr.planId !== "trial") ||
        (user?.enrolledPlanId && user.enrolledPlanId !== "free-trial" && user.enrolledPlanId !== "trial" && user?.enrollmentStatus === "active")
    );
    const userName = user?.name || (isAdminPortal ? "Harsh Patel" : "Student");
    const userRole = isAdminPortal
        ? "Instructor / Administrator"
        : isPaidPlan
        ? (activeEnr?.planName || user?.enrolledPlanName || "Enrolled Student")
        : "Free Trial Account";
    const initials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const handleLogout = async () => {
        await logout();
        toast.info("Logged out successfully");
        navigate("/");
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex" data-testid="dashboard-layout">
            {/* Sidebar */}
            <aside
                className={`${
                    open ? "translate-x-0" : "-translate-x-full"
                } lg:translate-x-0 fixed lg:sticky top-0 left-0 z-40 h-screen w-72 bg-black border-r border-white/10 transition-transform flex flex-col`}
                data-testid="sidebar"
            >
                {/* Brand Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
                    <Link to="/" className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <div className="flex flex-col">
                            <span className="text-heading font-bold text-base leading-tight">HR Tunes</span>
                            <span className="text-[10px] font-mono tracking-widest text-primary uppercase font-bold">
                                {isAdminPortal ? "Admin Studio" : "Student Portal"}
                            </span>
                        </div>
                    </Link>
                    <button className="lg:hidden text-white" onClick={() => setOpen(false)}>
                        <X size={20} />
                    </button>
                </div>

                {/* Sidebar Navigation */}
                <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
                    {isAdminPortal ? (
                        <>
                            <div className="eyebrow px-3 mb-3 flex items-center gap-1.5 text-primary">
                                <Shield size={12} /> Management Controls
                            </div>
                            {ADMIN_NAV_ITEMS.map((item) => {
                                const Icon = item.icon;
                                const isActive = activeAdminSection === item.id;
                                return (
                                    <button
                                        key={item.id}
                                        type="button"
                                        onClick={() => {
                                            if (onSelectAdminSection) {
                                                onSelectAdminSection(item.id);
                                            } else {
                                                navigate(`/instructor?tab=${item.id}`);
                                            }
                                            setOpen(false);
                                        }}
                                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm font-medium transition-all text-left ${
                                            isActive
                                                ? "bg-primary text-white border-l-2 border-white shadow-md shadow-red-900/30 font-bold"
                                                : "text-muted-foreground hover:text-white hover:bg-white/5 border-l-2 border-transparent"
                                        }`}
                                        data-testid={`admin-sidebar-${item.id}`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <Icon size={17} className={isActive ? "text-white" : "text-muted-foreground"} />
                                            <span>{item.label}</span>
                                        </div>
                                        {item.badge && pendingPaymentsCount > 0 && (
                                            <span className="inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-black bg-amber-500 text-black rounded-full">
                                                {pendingPaymentsCount}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}

                            <div className="pt-6 mt-6 border-t border-white/10 px-3">
                                <Link
                                    to="/dashboard"
                                    onClick={() => setOpen(false)}
                                    className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 rounded transition"
                                >
                                    <span className="flex items-center gap-2">
                                        <GraduationCap size={14} className="text-primary" /> View Student Portal
                                    </span>
                                    <ArrowUpRight size={12} />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="eyebrow px-3 mb-3">Student Navigation</div>
                            {STUDENT_NAV_ITEMS.map((item) => {
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
                                                    ? "bg-primary/10 text-white border-l-2 border-primary font-bold"
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

                            {/* Show Admin switch ONLY if user is logged in with instructor role */}
                            {user?.role === "instructor" && (
                                <div className="pt-6 mt-6 border-t border-white/10 px-3">
                                    <Link
                                        to="/instructor"
                                        onClick={() => setOpen(false)}
                                        className="flex items-center justify-between px-3 py-2 text-xs font-semibold text-primary bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded transition"
                                    >
                                        <span className="flex items-center gap-2">
                                            <Shield size={14} /> Instructor Studio
                                        </span>
                                        <ArrowUpRight size={12} />
                                    </Link>
                                </div>
                            )}
                        </>
                    )}
                </nav>

                {/* Bottom User Bar */}
                <div className="p-4 border-t border-white/10">
                    <div className="flex items-center gap-3 p-3 bg-white/5 hover:bg-white/10 transition-colors">
                        <div className="w-9 h-9 bg-primary/20 border border-primary/40 flex items-center justify-center shrink-0 font-bold text-xs text-primary">
                            {initials || (isAdminPortal ? "HP" : "ST")}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-sm font-semibold truncate text-white">{userName}</div>
                            <div className="text-[11px] text-primary truncate font-medium">{userRole}</div>
                        </div>
                        <button
                            className="text-muted-foreground hover:text-primary p-1.5 rounded transition"
                            onClick={handleLogout}
                            data-testid="sidebar-logout"
                            title="Log out"
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

            {/* Main Content Area */}
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
                                    placeholder={isAdminPortal ? "Search students, UTRs, courses…" : "Search lessons, courses, tabs…"}
                                    className="bg-transparent text-sm outline-none flex-1 placeholder:text-muted-foreground text-white"
                                    data-testid="dashboard-search"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {isAdminPortal && (
                                <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-mono font-bold uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/30 rounded">
                                    <Shield size={11} /> Admin Mode
                                </span>
                            )}
                            <button className="relative w-9 h-9 flex items-center justify-center border border-white/10 hover:border-primary/60 transition-colors" data-testid="notifications-btn">
                                <Bell size={16} />
                                <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-primary rounded-full" />
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-1 px-6 lg:px-10 py-10">
                    {(title || subtitle || actions) && (
                        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
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
