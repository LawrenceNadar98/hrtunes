import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";

const NAV = [
    { label: "Courses", href: "/#courses" },
    { label: "Instructors", href: "/#instructors" },
    { label: "Pricing", href: "/#pricing" },
    { label: "Gallery", href: "/#gallery" },
    { label: "Contact", href: "/#contact" },
];

export default function SiteHeader() {
    const [open, setOpen] = useState(false);
    return (
        <header
            className="sticky top-0 z-50 backdrop-blur-2xl bg-background/60 border-b border-white/10"
            data-testid="site-header"
        >
            <div className="container-hr flex items-center justify-between h-16">
                <Link to="/" className="flex items-center gap-2 group" data-testid="site-logo">
                    <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm group-hover:rotate-12 transition-transform">
                        HR
                    </span>
                    <span className="text-heading font-bold text-lg tracking-tight">
                        HR Tunes
                    </span>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                    {NAV.map((n) => (
                        <a
                            key={n.label}
                            href={n.href}
                            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
                            data-testid={`nav-${n.label.toLowerCase()}`}
                        >
                            {n.label}
                        </a>
                    ))}
                </nav>

                <div className="hidden md:flex items-center gap-3">
                    <Link
                        to="/login"
                        className="text-sm font-medium text-white/80 hover:text-white transition-colors"
                        data-testid="header-login-link"
                    >
                        Log in
                    </Link>
                    <Link to="/book-trial" className="btn-primary !py-2 !px-4 text-xs" data-testid="header-trial-btn">
                        Book Free Trial
                    </Link>
                </div>

                <button
                    className="md:hidden text-white"
                    onClick={() => setOpen(!open)}
                    aria-label="Menu"
                    data-testid="mobile-menu-btn"
                >
                    {open ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {open && (
                <div className="md:hidden border-t border-white/10 bg-background">
                    <div className="container-hr py-4 flex flex-col gap-4">
                        {NAV.map((n) => (
                            <a
                                key={n.label}
                                href={n.href}
                                className="text-sm font-medium text-muted-foreground hover:text-white"
                                onClick={() => setOpen(false)}
                            >
                                {n.label}
                            </a>
                        ))}
                        <div className="divider-dashed" />
                        <Link to="/login" className="text-sm" onClick={() => setOpen(false)}>Log in</Link>
                        <Link to="/book-trial" className="btn-primary" onClick={() => setOpen(false)}>
                            Book Free Trial
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
