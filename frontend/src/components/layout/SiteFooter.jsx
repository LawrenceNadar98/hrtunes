import { Instagram, Facebook, Youtube, Linkedin, Mail, MapPin, Phone } from "lucide-react";
import { BRAND } from "@/lib/mock";
import { Link } from "react-router-dom";

export default function SiteFooter() {
    return (
        <footer className="bg-black border-t border-white/10 mt-24" data-testid="site-footer">
            <div className="container-hr py-16 grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-5">
                    <div className="flex items-center gap-2">
                        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary text-white font-black text-sm">HR</span>
                        <span className="text-heading font-bold text-lg tracking-tight">HR Tunes</span>
                    </div>
                    <p className="mt-4 text-sm text-muted-foreground max-w-sm leading-relaxed">
                        {BRAND.description}
                    </p>
                    <div className="mt-6 flex items-center gap-3">
                        {[Instagram, Facebook, Youtube, Linkedin].map((Icon, i) => (
                            <a
                                key={i}
                                href="#"
                                className="w-9 h-9 flex items-center justify-center border border-white/20 hover:bg-primary hover:border-primary hover:-translate-y-0.5 transition-all"
                                data-testid={`social-${i}`}
                            >
                                <Icon size={15} />
                            </a>
                        ))}
                    </div>
                </div>

                <div className="md:col-span-3">
                    <div className="eyebrow mb-4">Explore</div>
                    <ul className="space-y-2 text-sm">
                        <li><a href="/#courses" className="text-white/80 hover:text-primary">Courses</a></li>
                        <li><a href="/#pricing" className="text-white/80 hover:text-primary">Pricing</a></li>
                        <li><a href="/#instructors" className="text-white/80 hover:text-primary">Instructors</a></li>
                        <li><Link to="/login" className="text-white/80 hover:text-primary">Student Login</Link></li>
                        <li><Link to="/instructor" className="text-white/80 hover:text-primary">Instructor Portal</Link></li>
                    </ul>
                </div>

                <div className="md:col-span-4" id="contact">
                    <div className="eyebrow mb-4">Contact</div>
                    <ul className="space-y-3 text-sm">
                        <li className="flex items-start gap-3 text-white/80">
                            <Phone size={15} className="mt-0.5 text-primary" /> {BRAND.phone}
                        </li>
                        <li className="flex items-start gap-3 text-white/80">
                            <Mail size={15} className="mt-0.5 text-primary" /> {BRAND.email}
                        </li>
                        <li className="flex items-start gap-3 text-white/80">
                            <MapPin size={15} className="mt-0.5 text-primary flex-shrink-0" />
                            <span>{BRAND.address}</span>
                        </li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10">
                <div className="container-hr py-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
                    <div>© {new Date().getFullYear()} HR Tunes. All rights reserved.</div>
                    <div className="font-mono">v1.0 · crafted in Ahmedabad</div>
                </div>
            </div>
        </footer>
    );
}
