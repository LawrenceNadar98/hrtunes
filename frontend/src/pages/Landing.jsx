import { useState, useEffect, useMemo } from "react";
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
import { IMAGES } from "@/lib/images";
import {
    BRAND,
    GALLERY,
    COURSES as DEFAULT_COURSES,
    INSTRUCTORS,
    TESTIMONIALS,
    PRICING as DEFAULT_PRICING,
    INSTRUMENTS as DEFAULT_INSTRUMENTS,
} from "@/lib/mock";
import { getPlans, getCourses, getInstruments } from "@/services/courseService";

// TODO: re-enable when ready
const SHOW_VIDEO_PREVIEW = false;
const SHOW_TESTIMONIALS = false;

export default function Landing() {
    return (
        <div className="min-h-screen bg-background text-foreground" data-testid="landing-page">
            <SiteHeader />
            <Hero />
            <Marquee />
            <Courses />
            <WhyUs />
            <Instructor />
            {SHOW_VIDEO_PREVIEW && <VideoPreview />}
            <Gallery />
            {SHOW_TESTIMONIALS && <Testimonials />}
            <Pricing />
            <FinalCTA />
            <SiteFooter />
        </div>
    );
}

/* ---------------- HERO ---------------- */
function Hero() {
    return (
        <section className="relative overflow-hidden bg-background" data-testid="hero-section">
            <div className="absolute inset-0 -z-10 bg-black">
                <img
                    src={IMAGES.heroGuitar}
                    alt=""
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 h-full w-full md:w-[72%] scale-105 object-cover object-[65%_center] opacity-35 grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-background/25" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/70" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_45%,rgba(239,0,18,0.18),transparent_34%)]" />
            </div>

            <div className="container-hr pt-20 pb-28 md:pt-32 md:pb-40 relative">
                <div className="max-w-5xl animate-fade-up">
                    <div className="eyebrow mb-6 flex items-center gap-3">
                        <span className="w-8 h-px bg-primary" />
                        Live music school · Est. 2013
                    </div>
                    <h1 className="text-display text-5xl sm:text-7xl md:text-8xl lg:text-9xl leading-[0.9] uppercase">
                        Turn passion <br />
                        into <br />
                        <span className="text-primary italic font-heading font-black">
                            performance
                        </span>
                        .
                    </h1>
                    <p className="text-display mt-4 text-3xl sm:text-4xl leading-[0.9] uppercase text-white max-w-xl">
                        Music is not just a hobby, it&apos;s your identity!
                    </p>
                    <p className="mt-8 text-base md:text-lg text-white/70 max-w-xl leading-relaxed">
                        Expert 1:1 training in Guitar, Keyboard & Piano - for absolute
                        beginners, serious hobbyists, and aspiring pros. Learn
                        from touring musicians, jam with real humans, and play
                        your first full song in 14 days.
                    </p>

                    <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <Link to="/book-trial" className="btn-primary animate-pulse-red" data-testid="hero-cta-trial">
                            Book a Free Trial Class
                            <ArrowRight size={16} />
                        </Link>
                        <a href="#courses" className="btn-outline" data-testid="hero-cta-courses">
                            <Play size={14} />
                            Browse Courses
                        </a>
                    </div>

                    <div className="mt-12 sm:mt-16 flex items-start gap-8 sm:gap-14">
                        <HeroStat value="2,300+" label="Students" />
                        <HeroStat value="12" label="Years" />
                        <HeroStat value="4.9★" label="Rating" />
                    </div>
                </div>
            </div>
        </section>
    );
}

function HeroStat({ value, label }) {
    return (
        <div className="flex flex-col items-start gap-1">
            <div className="text-heading font-black text-2xl leading-none tabular-nums sm:text-3xl md:text-4xl">
                {value}
            </div>
            <div className="eyebrow !mt-0 whitespace-nowrap">{label}</div>
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

/* ---------------- COURSES (PICK YOUR INSTRUMENT) ---------------- */
function Courses() {
    const [coursesList, setCoursesList] = useState(DEFAULT_COURSES);
    const [instrumentsList, setInstrumentsList] = useState(DEFAULT_INSTRUMENTS);

    useEffect(() => {
        Promise.all([getCourses(), getInstruments()]).then(([cData, iData]) => {
            if (cData && cData.length > 0) setCoursesList(cData);
            if (iData && iData.length > 0) setInstrumentsList(iData);
        });
    }, []);

    // Group courses by instrument and pick 1 featured course per instrument
    const instrumentCards = useMemo(() => {
        // Find all instruments from store or courses
        const uniqueInstrumentNames = Array.from(
            new Set([
                ...instrumentsList.map((i) => i.name).filter(Boolean),
                ...coursesList.map((c) => c.instrument).filter(Boolean)
            ])
        );

        return uniqueInstrumentNames.map((instName) => {
            const matchingCourses = coursesList.filter(
                (c) => c.instrument?.toLowerCase() === instName.toLowerCase()
            );
            // Pick featured or first course
            const featuredCourse = matchingCourses.find((c) => c.featured) || matchingCourses[0];
            return {
                instrumentName: instName,
                totalCourses: matchingCourses.length,
                course: featuredCourse
            };
        }).filter((item) => item.course); // only include if course exists
    }, [coursesList, instrumentsList]);

    return (
        <section id="courses" className="container-hr py-24 md:py-32" data-testid="courses-section">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-14">
                <div className="md:col-span-5">
                    <div className="eyebrow mb-4">01 · Our Courses</div>
                    <h2 className="text-display text-5xl md:text-6xl leading-[0.95]">
                        Pick your <span className="text-primary">instrument</span>.
                    </h2>
                </div>
                <div className="md:col-span-6 md:col-start-7 flex items-end justify-between">
                    <p className="text-white/70 leading-relaxed max-w-lg text-sm md:text-base">
                        Hand-crafted curriculum. Live weekly feedback. Structured
                        modules that take you from your first chord to your first
                        stage.
                    </p>
                </div>
            </div>

            {/* Instrument Cards Grid (1 representative course per instrument) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {instrumentCards.map(({ instrumentName, totalCourses, course }) => (
                    <InstrumentPickCard
                        key={instrumentName}
                        instrumentName={instrumentName}
                        totalCourses={totalCourses}
                        course={course}
                    />
                ))}
            </div>

            {/* Bottom CTA to View All Courses Catalog */}
            <div className="mt-12 text-center">
                <Link
                    to="/courses"
                    className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-neutral-400 hover:text-white transition-colors bg-white/5 border border-white/10 hover:border-primary/50 px-6 py-3 rounded-full"
                    data-testid="view-all-courses-btn"
                >
                    <Sparkles size={14} className="text-primary" /> View Complete Course Catalog ({coursesList.length} Courses) <ArrowRight size={14} />
                </Link>
            </div>
        </section>
    );
}

function InstrumentPickCard({ instrumentName, totalCourses, course }) {
    const isComingSoon = Boolean(course.comingSoon);

    return (
        <article
            className="card-hr group relative overflow-hidden flex flex-col justify-between border-white/15 hover:border-primary/50 transition-all duration-300 shadow-2xl bg-card"
            data-testid={`instrument-card-${instrumentName.toLowerCase()}`}
        >
            <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-[16/9] overflow-hidden bg-black/80">
                    <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />

                    {isComingSoon && (
                        <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-bold px-3 py-1 uppercase tracking-widest rounded-sm">
                            Coming Soon
                        </div>
                    )}

                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/80 backdrop-blur px-3 py-1.5 border border-white/20 rounded">
                        {instrumentName.toLowerCase() === "guitar" ? (
                            <Guitar size={14} className="text-primary" />
                        ) : instrumentName.toLowerCase() === "keyboard" ? (
                            <Piano size={14} className="text-primary" />
                        ) : (
                            <Sparkles size={14} className="text-primary" />
                        )}
                        <span className="text-xs font-bold uppercase tracking-widest text-white">
                            {instrumentName}
                        </span>
                    </div>
                </div>

                {/* Content Details: EXACT design from Pic 1 */}
                <div className="p-6 md:p-8 space-y-4">
                    {/* Tags Box */}
                    <div className="flex flex-wrap gap-2">
                        {course.tags && course.tags.length > 0 ? (
                            course.tags.map((t) => (
                                <span
                                    key={t}
                                    className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-white/20 text-white/90 bg-white/5 rounded-sm"
                                >
                                    {t}
                                </span>
                            ))
                        ) : (
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 border border-white/20 text-white/90 bg-white/5 rounded-sm">
                                {course.level || "BEGINNER"}
                            </span>
                        )}
                    </div>

                    {/* Title and Subtitle */}
                    <div>
                        <h3 className="text-display text-3xl md:text-4xl leading-tight font-black text-white group-hover:text-primary transition-colors">
                            {course.title}
                        </h3>
                        <p className="mt-2 text-sm text-neutral-300 leading-relaxed font-normal">
                            {course.subtitle || course.description}
                        </p>
                    </div>

                    {/* Meta Row (Clock, Users, Star Rating) */}
                    <div className="flex items-center gap-6 text-xs text-white/70 pt-2 border-t border-white/10 font-mono">
                        <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-primary" /> {course.duration || "8 weeks"}
                        </span>
                        <span className="flex items-center gap-1.5">
                            <Users size={13} className="text-primary" /> {course.students || 0}
                        </span>
                        {(course.rating > 0 || !isComingSoon) && (
                            <span className="flex items-center gap-1.5">
                                <Star size={13} className="text-primary fill-primary" /> {course.rating || 4.9}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Actions: Show More Details + Explore Instrument Courses */}
            <div className="p-6 md:p-8 pt-0 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mt-4">
                <Link
                    to={isComingSoon ? "/signup" : `/dashboard/courses/${course.id}`}
                    className="btn-outline !py-3 !px-4 text-xs font-bold uppercase tracking-wider text-center text-white hover:border-primary flex-1 justify-center"
                    data-testid={`show-details-${course.id}`}
                >
                    Show More Details
                </Link>

                <Link
                    to={`/courses?instrument=${encodeURIComponent(instrumentName)}`}
                    className="btn-primary !py-3 !px-5 text-xs font-bold uppercase tracking-wider text-center flex items-center justify-center gap-1.5 shadow-lg shadow-red-950/40"
                    data-testid={`explore-instrument-${instrumentName.toLowerCase()}`}
                >
                    Explore {instrumentName} Courses {totalCourses > 1 ? `(${totalCourses})` : ""} <ArrowRight size={13} />
                </Link>
            </div>
        </article>
    );
}

/* ---------------- WHY US ---------------- */
function WhyUs() {
    const items = [
        {
            icon: Trophy,
            title: "Performance-Oriented Learning",
            body: "Every student gets stage-ready through live practice, jam sessions, and confidence-building exercises.",
        },
        {
            icon: Users,
            title: "Customized Courses for All Levels",
            body: "Our instructors are passionate musicians who focus on individual growth and personal attention.",
        },
        {
            icon: Sparkles,
            title: "Personalized Roadmap & Feedback",
            body: "From absolute beginners to aspiring professionals - we design lessons that match your pace and goals.",
        },
        {
            icon: Clock,
            title: "Learn From Anywhere",
            body: "With both offline and live online classes, learning music has never been this easy and flexible.",
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
                        Four reasons 2,300+ students chose HR Tunes.
                    </p>
                </div>
                <div className="md:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {items.map((item, i) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.title + i}
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
    const [plans, setPlans] = useState(DEFAULT_PRICING);

    useEffect(() => {
        getPlans().then((data) => {
            if (data && data.length > 0) setPlans(data);
        });
    }, []);

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
                    {plans.map((p) => (
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
                                {p.features?.map((f) => (
                                    <li key={f} className="flex items-start gap-2 text-sm">
                                        <Check size={15} className={p.featured ? "text-white" : "text-primary"} />
                                        <span className={p.featured ? "text-white/95" : "text-white/80"}>{f}</span>
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to={p.price === 0 ? "/book-trial" : `/plans/${p.id}`}
                                className={`mt-8 text-center py-3 font-bold uppercase tracking-wider text-sm transition-all ${
                                    p.featured
                                        ? "bg-black text-white hover:bg-white hover:text-black"
                                        : "bg-primary text-white hover:brightness-110"
                                }`}
                                data-testid={`pricing-cta-${p.id}`}
                            >
                                {p.cta || (p.price === 0 ? "Book Free Trial" : "Choose Plan")}
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
                        <Link to="/book-trial" className="btn-primary" data-testid="final-cta-trial">
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
