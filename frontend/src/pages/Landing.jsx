import { Link } from "react-router-dom";
import {
    ArrowRight,
    Play,
    Star,
    Check,
    Guitar,
    Piano,
    Sparkles,
    Users,
    Trophy,
    Clock,
    ArrowUpRight,
} from "lucide-react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import {
    BRAND,
    IMAGES,
    GALLERY,
    COURSES,
    INSTRUCTORS,
    TESTIMONIALS,
    PRICING,
} from "@/lib/mock";

export default function Landing() {
    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
            <SiteHeader />
            <Hero />
            <Marquee />
            <Courses />
            <WhyUs />
            <Instructor />
            <VideoPreview />
            <Gallery />
            <Testimonials />
            <Pricing />
            <FinalCTA />
            <SiteFooter />
        </div>
    );
}

/* ---------------- HERO ---------------- */
function Hero() {
    return (
        <section className="relative overflow-hidden" data-testid="hero-section">
            <div className="absolute inset-0 -z-10">
                <img
                    src={IMAGES.heroGuitar}
                    alt="Electric guitar"
                    className="w-full h-full object-cover opacity-40"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/40" />
            </div>

            <div className="container-hr pt-20 pb-28 md:pt-32 md:pb-40 grid grid-cols-1 md:grid-cols-12 gap-10 items-center relative">
                <div className="md:col-span-8 animate-fade-up">
                    <div className="eyebrow mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-primary" />
                        Live music school · Est. 2013
                    </div>
                    <h1 className="text-display text-6xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] uppercase">
                        Turn passion <br />
                        into{" "}
                        <span className="text-primary italic font-heading font-black">
                            performance
                        </span>
                        .
                    </h1>
                    <p className="mt-8 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
                        Expert 1:1 training in Guitar & Keyboard — for absolute
                        beginners, serious hobbyists, and aspiring pros. Learn
                        from touring musicians, jam with real humans, and play
                        your first full song in 14 days.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Link to="/signup" className="btn-primary animate-pulse-red" data-testid="hero-cta-trial">
                            Book a Free Trial Class
                            <ArrowRight size={16} />
                        </Link>
                        <a href="#courses" className="btn-outline" data-testid="hero-cta-courses">
                            <Play size={14} />
                            Browse Courses
                        </a>
                    </div>

                    <div className="mt-16 grid grid-cols-3 max-w-md gap-6">
                        <HeroStat value="2,300+" label="Students" />
                        <HeroStat value="12" label="Years" />
                        <HeroStat value="4.9★" label="Rating" />
                    </div>
                </div>

                <div className="md:col-span-4 hidden md:block">
                    <div className="relative aspect-[3/4] border border-white/10 overflow-hidden grain">
                        <img
                            src={IMAGES.instructor}
                            alt="Instructor"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                            <div className="eyebrow mb-1 text-primary">Founder</div>
                            <div className="text-heading font-bold text-xl">Harsh Rajput</div>
                            <div className="text-sm text-white/70">Lead Guitar Instructor</div>
                        </div>
                        <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">
                            Live Teacher
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function HeroStat({ value, label }) {
    return (
        <div>
            <div className="text-heading font-black text-3xl md:text-4xl leading-none">{value}</div>
            <div className="eyebrow mt-2">{label}</div>
        </div>
    );
}

/* ---------------- MARQUEE ---------------- */
function Marquee() {
    const items = [
        "ACOUSTIC",
        "ELECTRIC",
        "FINGERSTYLE",
        "BLUES",
        "ROCK",
        "INDIE",
        "CLASSICAL",
        "JAZZ",
        "POP",
    ];
    return (
        <div className="border-y border-white/10 bg-black py-5 overflow-hidden">
            <div className="flex gap-12 animate-marquee whitespace-nowrap">
                {[...items, ...items, ...items].map((it, i) => (
                    <div key={i} className="flex items-center gap-12 text-sm font-bold tracking-[0.3em]">
                        <span className="text-white/60">{it}</span>
                        <span className="text-primary">●</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---------------- COURSES ---------------- */
function Courses() {
    return (
        <section id="courses" className="container-hr py-24 md:py-32" data-testid="courses-section">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
                <div className="md:col-span-5">
                    <div className="eyebrow mb-4">01 · Our Courses</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        Pick your <span className="text-primary">instrument</span>.
                    </h2>
                </div>
                <div className="md:col-span-6 md:col-start-7 flex items-end">
                    <p className="text-white/70 leading-relaxed">
                        Hand-crafted curriculum. Live weekly feedback. Structured
                        modules that take you from your first chord to your first
                        stage.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {COURSES.slice(0, 2).map((c, idx) => (
                    <CourseCard key={c.id} course={c} featured={idx === 0} />
                ))}
                <CourseCard course={COURSES[2]} featured={false} small />
            </div>
        </section>
    );
}

function CourseCard({ course, featured, small }) {
    const span = featured ? "md:col-span-7" : small ? "md:col-span-12" : "md:col-span-5";
    return (
        <article
            className={`${span} card-hr group relative overflow-hidden`}
            data-testid={`course-card-${course.id}`}
        >
            <div className={`relative ${small ? "aspect-[4/1.2]" : "aspect-[16/10]"} overflow-hidden`}>
                <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                {course.comingSoon && (
                    <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest">
                        Coming Soon
                    </div>
                )}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur px-3 py-1 border border-white/20">
                    {course.instrument === "Guitar" ? <Guitar size={13} /> : <Piano size={13} />}
                    <span className="text-xs font-bold uppercase tracking-widest">
                        {course.instrument}
                    </span>
                </div>
            </div>
            <div className="p-6 md:p-8">
                <div className="flex flex-wrap gap-2 mb-4">
                    {course.tags.map((t) => (
                        <span
                            key={t}
                            className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-white/20 text-white/80"
                        >
                            {t}
                        </span>
                    ))}
                </div>
                <h3 className="text-heading font-bold text-2xl md:text-3xl leading-tight">
                    {course.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">{course.subtitle}</p>
                <div className="mt-6 flex items-center justify-between">
                    <div className="flex items-center gap-5 text-xs text-white/60">
                        <span className="flex items-center gap-1.5">
                            <Clock size={12} /> {course.duration}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={12} /> {course.students}
                        </span>
                        {course.rating > 0 && (
                            <span className="flex items-center gap-1.5">
                                <Star size={12} className="text-primary fill-primary" /> {course.rating}
                            </span>
                        )}
                    </div>
                    <Link
                        to={course.comingSoon ? "/signup" : `/dashboard/courses/${course.id}`}
                        className="inline-flex items-center gap-1 text-sm font-bold uppercase tracking-widest hover:text-primary transition-colors"
                        data-testid={`course-explore-${course.id}`}
                    >
                        Explore <ArrowUpRight size={14} />
                    </Link>
                </div>
            </div>
        </article>
    );
}

/* ---------------- WHY US ---------------- */
function WhyUs() {
    const items = [
        {
            icon: Trophy,
            title: "Performance-Oriented",
            body: "Every student gets stage-ready through live practice, jam sessions, and recital opportunities.",
        },
        {
            icon: Users,
            title: "Friendly Mentors",
            body: "Our instructors are touring musicians who focus on individual growth, not scripted videos.",
        },
        {
            icon: Sparkles,
            title: "Custom Curriculum",
            body: "From absolute beginners to intermediates — every lesson is tailored to match your pace and taste.",
        },
        {
            icon: Clock,
            title: "Learn From Anywhere",
            body: "Offline at our studio or live 1:1 online. Same quality. No excuses. No missed weeks.",
        },
    ];
    return (
        <section className="bg-black border-y border-white/10 py-24 md:py-32" data-testid="why-us-section">
            <div className="container-hr grid grid-cols-1 md:grid-cols-12 gap-10">
                <div className="md:col-span-5">
                    <div className="eyebrow mb-4">02 · Why HR Tunes</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        We don't teach music. <br />
                        We <span className="text-primary">inspire</span> it.
                    </h2>
                    <p className="mt-6 text-white/70 max-w-md">
                        Four reasons 2,300+ students chose HR Tunes over the
                        endless YouTube rabbit-hole.
                    </p>
                </div>
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title}
                                className="card-hr p-6 flex flex-col gap-3 group"
                                data-testid={`why-card-${i}`}
                            >
                                <div className="w-10 h-10 flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                    <Icon size={18} />
                                </div>
                                <h3 className="text-heading font-bold text-lg">{item.title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    {item.body}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

/* ---------------- INSTRUCTORS ---------------- */
function Instructor() {
    const main = INSTRUCTORS[0];
    return (
        <section id="instructors" className="container-hr py-24 md:py-32" data-testid="instructor-section">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-center">
                <div className="md:col-span-5 relative">
                    <div className="aspect-[3/4] overflow-hidden border border-white/10 grain relative">
                        <img
                            src={main.image}
                            alt={main.name}
                            className="w-full h-full object-cover"
                        />
                    </div>
                    <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 w-44 hidden md:block">
                        <div className="text-heading font-black text-4xl leading-none">
                            {main.stats.years}+
                        </div>
                        <div className="eyebrow mt-2 !text-white/90">Years teaching</div>
                    </div>
                </div>
                <div className="md:col-span-7 md:pl-10">
                    <div className="eyebrow mb-4">03 · Meet Your Mentor</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        {main.name}.
                    </h2>
                    <div className="text-primary font-bold mt-3 uppercase tracking-widest text-sm">
                        {main.role}
                    </div>
                    <p className="mt-6 text-white/70 leading-relaxed max-w-xl">
                        {main.bio}
                    </p>

                    <div className="mt-8 flex flex-wrap gap-2">
                        {main.skills.map((s) => (
                            <span
                                key={s}
                                className="text-xs font-bold uppercase tracking-widest px-3 py-1.5 border border-white/20 hover:border-primary hover:text-primary transition-colors"
                            >
                                {s}
                            </span>
                        ))}
                    </div>

                    <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                        <div>
                            <div className="text-heading font-black text-3xl">{main.stats.students}+</div>
                            <div className="eyebrow mt-1">Students</div>
                        </div>
                        <div>
                            <div className="text-heading font-black text-3xl">{main.stats.rating}★</div>
                            <div className="eyebrow mt-1">Rating</div>
                        </div>
                        <div>
                            <div className="text-heading font-black text-3xl">100+</div>
                            <div className="eyebrow mt-1">Performances</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

/* ---------------- VIDEO PREVIEW ---------------- */
function VideoPreview() {
    return (
        <section className="container-hr py-24 md:py-32" data-testid="video-section">
            <div className="eyebrow mb-4">04 · Inside the classroom</div>
            <h2 className="text-display text-5xl md:text-6xl leading-[0.95] max-w-3xl">
                Watch a <span className="text-primary">real</span> lesson.
            </h2>
            <div className="mt-12 aspect-video border border-white/10 overflow-hidden group relative">
                <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/jNQXAC9IVRw?rel=0"
                    title="HR Tunes lesson preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    data-testid="landing-video"
                />
            </div>
        </section>
    );
}

/* ---------------- GALLERY ---------------- */
function Gallery() {
    return (
        <section id="gallery" className="bg-black border-y border-white/10 py-24" data-testid="gallery-section">
            <div className="container-hr">
                <div className="flex items-end justify-between mb-10">
                    <div>
                        <div className="eyebrow mb-4">05 · Gallery</div>
                        <h2 className="text-display text-4xl md:text-5xl">
                            From the <span className="text-primary">studio</span>.
                        </h2>
                    </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {GALLERY.map((src, i) => (
                        <div
                            key={src}
                            className={`relative overflow-hidden border border-white/10 group ${
                                i === 0 || i === 3 ? "md:row-span-2 aspect-[3/4]" : "aspect-square"
                            }`}
                        >
                            <img
                                src={src}
                                alt=""
                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------- TESTIMONIALS ---------------- */
function Testimonials() {
    return (
        <section className="container-hr py-24 md:py-32" data-testid="testimonials-section">
            <div className="flex items-end justify-between mb-14">
                <div>
                    <div className="eyebrow mb-4">06 · Student Voices</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        Stories from <br />
                        the <span className="text-primary">stage</span>.
                    </h2>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TESTIMONIALS.map((t, i) => (
                    <div key={t.name} className="card-hr p-8 flex flex-col gap-5" data-testid={`testimonial-${i}`}>
                        <div className="flex gap-0.5">
                            {Array.from({ length: t.rating }, (_, s) => `${t.name}-star-${s}`).map((starKey) => (
                                <Star key={starKey} size={14} className="text-primary fill-primary" />
                            ))}
                        </div>
                        <p className="text-white/90 leading-relaxed">"{t.quote}"</p>
                        <div className="divider-dashed" />
                        <div className="flex items-center gap-3">
                            <img src={t.avatar} alt={t.name} className="w-10 h-10 object-cover border border-white/20" />
                            <div>
                                <div className="font-bold text-sm">{t.name}</div>
                                <div className="text-xs text-muted-foreground">{t.role}</div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ---------------- PRICING ---------------- */
function Pricing() {
    return (
        <section id="pricing" className="bg-black border-y border-white/10 py-24 md:py-32" data-testid="pricing-section">
            <div className="container-hr">
                <div className="text-center mb-14">
                    <div className="eyebrow mb-4">07 · Pricing</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        Simple plans. <span className="text-primary">No strings.</span>
                    </h2>
                    <p className="mt-4 text-white/70 max-w-md mx-auto">
                        Start with a free trial. Upgrade when you're ready.
                        Cancel anytime.
                    </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                    {PRICING.map((p) => (
                        <div
                            key={p.id}
                            className={`relative flex flex-col p-8 transition-all hover:-translate-y-1 ${
                                p.featured
                                    ? "bg-primary text-white border-2 border-primary"
                                    : "bg-card border border-border hover:border-primary/50"
                            }`}
                            data-testid={`pricing-${p.id}`}
                        >
                            {p.featured && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest border border-white/20">
                                    Most Popular
                                </div>
                            )}
                            <div className="eyebrow !text-white/80 mb-2">{p.tagline}</div>
                            <h3 className="text-heading font-bold text-2xl">{p.name}</h3>
                            <div className="mt-6 flex items-baseline gap-1">
                                <span className="text-heading font-black text-5xl">
                                    {p.price === 0 ? "Free" : `₹${p.price.toLocaleString("en-IN")}`}
                                </span>
                                {p.price > 0 && <span className="text-sm opacity-70">{p.cadence}</span>}
                            </div>
                            <ul className="mt-8 space-y-3 flex-1">
                                {p.features.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm">
                                        <Check size={15} className={p.featured ? "text-white" : "text-primary"} />
                                        <span className={p.featured ? "text-white/95" : "text-white/80"}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={p.price === 0 ? "/signup" : "/checkout"}
                                className={`mt-8 text-center py-3 font-bold uppercase tracking-wider text-sm transition-all ${
                                    p.featured
                                        ? "bg-black text-white hover:bg-white hover:text-black"
                                        : "bg-primary text-white hover:brightness-110"
                                }`}
                                data-testid={`pricing-cta-${p.id}`}
                            >
                                {p.cta}
                            </Link>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

/* ---------------- FINAL CTA ---------------- */
function FinalCTA() {
    return (
        <section className="container-hr py-24 md:py-32" data-testid="final-cta">
            <div className="relative overflow-hidden border border-white/10 grain">
                <img
                    src={IMAGES.stage}
                    alt="Stage"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-transparent" />
                <div className="relative p-10 md:p-20 max-w-2xl">
                    <h2 className="text-display text-5xl md:text-7xl leading-[0.9]">
                        Your <span className="text-primary">first chord</span> is one call away.
                    </h2>
                    <p className="mt-6 text-white/80 text-lg max-w-lg">
                        Book a free 60-minute trial. No credit card. Just you, an instrument, and someone who's actually listening.
                    </p>
                    <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <Link to="/signup" className="btn-primary" data-testid="final-cta-trial">
                            Book Free Trial <ArrowRight size={16} />
                        </Link>
                        <a href={`tel:${BRAND.phone}`} className="btn-outline">
                            Call {BRAND.phone}
                        </a>
                    </div>
                </div>
            </div>
        </section>
    );
}
