// Mock data for HR Tunes UI
// Structured so it can be swapped with API calls later.

export const BRAND = {
    name: "HR Tunes",
    tagline: "Strum Your Story",
    description:
        "Premium guitar & keyboard classes — from absolute beginner to stage-ready performer.",
    email: "info@hrtunes.in",
    phone: "+91 88661 08396",
    address:
        "305, Hill Town Landmark, Opp. Das Khaman Nikol, Naroda Rd, Nikol, Ahmedabad, Gujarat 382350",
};

export const IMAGES = {
    heroGuitar:
        "https://images.unsplash.com/photo-1761596896861-2a35624b9841?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzNzl8MHwxfHNlYXJjaHw0fHxlbGVjdHJpYyUyMGd1aXRhciUyMGNsb3NlJTIwdXAlMjBkYXJrfGVufDB8fHx8MTc3NjUxNzA4M3ww&ixlib=rb-4.1.0&q=85",
    acoustic:
        "https://images.unsplash.com/photo-1763889784402-5e8744af31b2?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwzfHxwbGF5aW5nJTIwYWNvdXN0aWMlMjBndWl0YXIlMjBtb29keXxlbnwwfHx8fDE3NzY1MTcwODN8MA&ixlib=rb-4.1.0&q=85",
    keyboard:
        "https://images.unsplash.com/photo-1447876576829-25dd6c4b3d21?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NTY2Nzd8MHwxfHNlYXJjaHwxfHxoYW5kcyUyMHBsYXlpbmclMjBwaWFubyUyMGtleWJvYXJkJTIwZGFya3xlbnwwfHx8fDE3NzY1MTcwODN8MA&ixlib=rb-4.1.0&q=85",
    instructor:
        "https://images.unsplash.com/photo-1762289350936-783284eb2f4a?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjAzMjd8MHwxfHNlYXJjaHwxfHxtdXNpY2lhbiUyMHBvcnRyYWl0JTIwZGFyayUyMGJhY2tncm91bmR8ZW58MHx8fHwxNzc2NTE3MTAyfDA&ixlib=rb-4.1.0&q=85",
    stage:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?auto=format&fit=crop&w=1600&q=80",
    hands:
        "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    studio:
        "https://images.unsplash.com/photo-1519677100203-a0e668c92439?auto=format&fit=crop&w=1600&q=80",
};

// Gallery for landing page
export const GALLERY = [
    "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1519892338195-4f74b6c2ff6b?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
    "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80",
];

export const COURSES = [
    {
        id: "guitar-foundations",
        title: "Guitar Foundations",
        subtitle: "Strum your first song in 14 days",
        level: "Beginner",
        instrument: "Guitar",
        instructor: "Harsh Rajput",
        duration: "8 weeks",
        lessons: 24,
        students: 1284,
        rating: 4.9,
        price: 2999,
        thumbnail:
            "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
        tags: ["Beginner", "Acoustic", "Hindi / English"],
        progress: 42,
        description:
            "A ground-up beginner track covering posture, chords, rhythm, and your first 5 songs. Includes weekly live feedback.",
        modules: [
            {
                id: "m1",
                title: "The Instrument",
                lessons: [
                    { id: "l1", title: "Parts of the Guitar", duration: "08:12", videoId: "jNQXAC9IVRw", completed: true, notes: "Learn every part of the guitar — headstock, neck, body, bridge — and how they affect tone.", resources: ["worksheet-01.pdf"] },
                    { id: "l2", title: "Tuning 101 (Standard E)", duration: "11:45", videoId: "kJQP7kiw5Fk", completed: true, notes: "Ear training + tuner app walkthrough. Daily 2-minute practice drill.", resources: ["tuning-cheatsheet.pdf"] },
                    { id: "l3", title: "Holding & Posture", duration: "07:30", videoId: "hY7m5jjJ9mM", completed: true, notes: "Correct posture prevents injury and improves tone.", resources: [] },
                ],
            },
            {
                id: "m2",
                title: "First Chords",
                lessons: [
                    { id: "l4", title: "The Em & Am Chords", duration: "12:20", videoId: "9bZkp7q19f0", completed: true, notes: "Cleanest open chord shapes for beginners.", resources: ["chord-chart.pdf"] },
                    { id: "l5", title: "D, G, C — The Magic 3", duration: "14:05", videoId: "dQw4w9WgXcQ", completed: false, notes: "Most songs use these three chords. Muscle memory drill inside.", resources: ["chord-chart.pdf"] },
                    { id: "l6", title: "Chord Transitions", duration: "10:15", videoId: "OPf0YbXqDm0", completed: false, notes: "Transitions make or break your first song. 15 min drill.", resources: [] },
                ],
            },
            {
                id: "m3",
                title: "Strumming & Rhythm",
                lessons: [
                    { id: "l7", title: "Down-Up Strum", duration: "09:44", videoId: "RgKAFK5djSk", completed: false, notes: "Wrist-driven strumming for relaxed sound.", resources: [] },
                    { id: "l8", title: "16th Note Grooves", duration: "13:02", videoId: "fJ9rUzIMcZQ", completed: false, notes: "Unlock 80% of pop songs with these patterns.", resources: ["rhythm-patterns.pdf"] },
                ],
            },
            {
                id: "m4",
                title: "Your First Song",
                lessons: [
                    { id: "l9", title: "Song Breakdown: Perfect", duration: "18:40", videoId: "2Vv-BfVoq4g", completed: false, notes: "Play Perfect by Ed Sheeran end-to-end.", resources: ["perfect-tabs.pdf"] },
                    { id: "l10", title: "Final Performance", duration: "06:10", videoId: "CevxZvSJLk8", completed: false, notes: "Record yourself and upload for feedback.", resources: [] },
                ],
            },
        ],
    },
    {
        id: "guitar-intermediate",
        title: "Lead Guitar — Intermediate",
        subtitle: "Solos, scales & improvisation",
        level: "Intermediate",
        instrument: "Guitar",
        instructor: "Harsh Rajput",
        duration: "10 weeks",
        lessons: 30,
        students: 642,
        rating: 4.8,
        price: 4499,
        thumbnail:
            "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
        tags: ["Intermediate", "Electric", "Improvisation"],
        progress: 12,
        description:
            "Pentatonic, blues, modes and phrasing. Build your first 3-minute solo from scratch.",
        modules: [
            {
                id: "m1",
                title: "Scales Deep Dive",
                lessons: [
                    { id: "l1", title: "The Minor Pentatonic", duration: "14:10", videoId: "jNQXAC9IVRw", completed: true, notes: "The scale behind every rock solo.", resources: ["pentatonic.pdf"] },
                    { id: "l2", title: "Blues Scale Extensions", duration: "11:20", videoId: "kJQP7kiw5Fk", completed: false, notes: "Add the blue note and change everything.", resources: [] },
                ],
            },
            {
                id: "m2",
                title: "Phrasing & Feel",
                lessons: [
                    { id: "l3", title: "Bends, Slides, Vibrato", duration: "16:40", videoId: "9bZkp7q19f0", completed: false, notes: "The 3 techniques that make you sound 'human'.", resources: [] },
                ],
            },
        ],
    },
    {
        id: "keyboard-intro",
        title: "Keyboard Essentials",
        subtitle: "Feel the flow, note by note",
        level: "Beginner",
        instrument: "Keyboard",
        instructor: "Priya Sharma",
        duration: "6 weeks",
        lessons: 18,
        students: 0,
        rating: 0,
        price: 2499,
        thumbnail:
            "https://images.unsplash.com/photo-1519892338195-4f74b6c2ff6b?auto=format&fit=crop&w=1200&q=80",
        tags: ["Coming Soon", "Keyboard", "Beginner"],
        progress: 0,
        comingSoon: true,
        description:
            "Coming soon. Classical & digital keyboard foundations — chords, melodies, and your first recital piece.",
        modules: [],
    },
];

export const INSTRUCTORS = [
    {
        id: "harsh",
        name: "Harsh Rajput",
        role: "Founder · Lead Guitar Instructor",
        bio: "12+ years playing guitar across studio sessions, live tours, and teaching over 2,300 students. Former touring guitarist for Indian indie acts.",
        image: IMAGES.instructor,
        stats: { students: 2314, years: 12, rating: 4.9 },
        skills: ["Acoustic", "Electric", "Fingerstyle", "Improv"],
    },
    {
        id: "priya",
        name: "Priya Sharma",
        role: "Keyboard Instructor",
        bio: "Trinity-certified pianist with a love for film scores and contemporary pop arrangement.",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80",
        stats: { students: 412, years: 8, rating: 4.8 },
        skills: ["Classical", "Jazz", "Pop Arrangement"],
    },
];

export const TESTIMONIALS = [
    {
        name: "Aarav Mehta",
        role: "Student · Guitar Foundations",
        rating: 5,
        quote:
            "I went from zero to playing three full songs in six weeks. The live feedback sessions are unreal — you feel seen, not lost in a course library.",
        avatar:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300&q=80",
    },
    {
        name: "Sana Kapoor",
        role: "Student · Lead Guitar",
        rating: 5,
        quote:
            "The pentatonic module alone is worth the price. Harsh breaks down phrasing in a way every YouTube tutorial failed to.",
        avatar:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80",
    },
    {
        name: "Kabir Anand",
        role: "Parent of 11-yr-old student",
        rating: 5,
        quote:
            "Patient, structured, and fun. My son actually asks to practice now. That alone is a miracle.",
        avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
    },
];

export const PRICING = [
    {
        id: "trial",
        name: "Free Trial",
        tagline: "See if it clicks",
        price: 0,
        cadence: "/one session",
        featured: false,
        cta: "Book Free Trial",
        features: [
            "60 min 1:1 with instructor",
            "Personal learning plan",
            "Instrument check-up",
            "No credit card required",
        ],
    },
    {
        id: "monthly",
        name: "Monthly",
        tagline: "Stay in rhythm",
        price: 2999,
        cadence: "/month",
        featured: true,
        cta: "Start Monthly",
        features: [
            "4 live 1:1 classes / month",
            "All recorded courses unlocked",
            "Weekly assignments + feedback",
            "Access to student community",
            "Cancel anytime",
        ],
    },
    {
        id: "quarterly",
        name: "Quarterly",
        tagline: "Best value",
        price: 7999,
        cadence: "/3 months",
        featured: false,
        cta: "Go Quarterly",
        features: [
            "12 live classes",
            "2 group jam sessions",
            "Priority scheduling",
            "Recital invitation",
            "Save ₹1,000 vs monthly",
        ],
    },
];

export const LIVE_CLASSES = [
    {
        id: "lc1",
        title: "Fingerpicking Fundamentals",
        instructor: "Harsh Rajput",
        date: "2026-02-18",
        time: "18:00",
        duration: 60,
        timezone: "Asia/Kolkata",
        status: "upcoming",
        attendees: 12,
        course: "Guitar Foundations",
        recordingUrl: null,
    },
    {
        id: "lc2",
        title: "Blues Improvisation Lab",
        instructor: "Harsh Rajput",
        date: "2026-02-20",
        time: "19:30",
        duration: 90,
        timezone: "Asia/Kolkata",
        status: "upcoming",
        attendees: 8,
        course: "Lead Guitar — Intermediate",
        recordingUrl: null,
    },
    {
        id: "lc3",
        title: "Open Jam & Q&A",
        instructor: "Harsh Rajput",
        date: "2026-02-22",
        time: "20:00",
        duration: 120,
        timezone: "Asia/Kolkata",
        status: "upcoming",
        attendees: 24,
        course: "All students",
        recordingUrl: null,
    },
    {
        id: "lc4",
        title: "Strumming Patterns — Recorded",
        instructor: "Harsh Rajput",
        date: "2026-02-10",
        time: "18:00",
        duration: 60,
        timezone: "Asia/Kolkata",
        status: "past",
        attendees: 18,
        course: "Guitar Foundations",
        recordingUrl: "https://www.youtube.com/embed/jNQXAC9IVRw",
    },
    {
        id: "lc5",
        title: "Pentatonic Masterclass",
        instructor: "Harsh Rajput",
        date: "2026-02-05",
        time: "19:00",
        duration: 75,
        timezone: "Asia/Kolkata",
        status: "past",
        attendees: 14,
        course: "Lead Guitar — Intermediate",
        recordingUrl: "https://www.youtube.com/embed/9bZkp7q19f0",
    },
];

export const ASSIGNMENTS = [
    {
        id: "a1",
        title: "Record yourself playing Em, Am, D",
        course: "Guitar Foundations",
        dueDate: "2026-02-18",
        status: "pending",
    },
    {
        id: "a2",
        title: "Pentatonic scale — 60 BPM clean take",
        course: "Lead Guitar — Intermediate",
        dueDate: "2026-02-22",
        status: "pending",
    },
    {
        id: "a3",
        title: "Strumming pattern #2 — D DU UDU",
        course: "Guitar Foundations",
        dueDate: "2026-02-12",
        status: "submitted",
        grade: "A",
        feedback: "Great timing. Work on transitions between D and G.",
    },
    {
        id: "a4",
        title: "First performance — Perfect",
        course: "Guitar Foundations",
        dueDate: "2026-02-05",
        status: "graded",
        grade: "A+",
        feedback: "Nailed it. Ready to move on to the next module.",
    },
];

export const RECENT_ACTIVITY = [
    { id: 1, text: "Completed lesson ‘Chord Transitions’", time: "2h ago", type: "lesson" },
    { id: 2, text: "Submitted assignment ‘Strumming pattern #2’", time: "Yesterday", type: "assignment" },
    { id: 3, text: "Joined live class ‘Pentatonic Masterclass’", time: "3 days ago", type: "live" },
    { id: 4, text: "Achieved 7-day practice streak", time: "5 days ago", type: "streak" },
];

export const STUDENTS = [
    { id: 1, name: "Aarav Mehta", email: "aarav@test.com", course: "Guitar Foundations", progress: 72, lastActive: "2h ago", status: "active" },
    { id: 2, name: "Sana Kapoor", email: "sana@test.com", course: "Lead Guitar", progress: 34, lastActive: "1d ago", status: "active" },
    { id: 3, name: "Rohan Das", email: "rohan@test.com", course: "Guitar Foundations", progress: 91, lastActive: "30m ago", status: "active" },
    { id: 4, name: "Ishita Jain", email: "ishita@test.com", course: "Guitar Foundations", progress: 18, lastActive: "4d ago", status: "at-risk" },
    { id: 5, name: "Vikram Sinha", email: "vikram@test.com", course: "Lead Guitar", progress: 56, lastActive: "5h ago", status: "active" },
    { id: 6, name: "Anaya Roy", email: "anaya@test.com", course: "Guitar Foundations", progress: 3, lastActive: "12d ago", status: "inactive" },
];

export const PAYMENT_HISTORY = [
    { id: "inv-1042", date: "2026-02-01", plan: "Monthly", amount: 2999, status: "Paid", method: "VISA •• 4242" },
    { id: "inv-1021", date: "2026-01-01", plan: "Monthly", amount: 2999, status: "Paid", method: "VISA •• 4242" },
    { id: "inv-0998", date: "2025-12-01", plan: "Monthly", amount: 2999, status: "Paid", method: "UPI" },
    { id: "inv-0966", date: "2025-11-01", plan: "Monthly", amount: 2999, status: "Paid", method: "UPI" },
];

export const EARNINGS = {
    total: 482700,
    thisMonth: 86400,
    students: 214,
    avgRating: 4.9,
    monthly: [
        { m: "Sep", v: 52300 },
        { m: "Oct", v: 61000 },
        { m: "Nov", v: 68200 },
        { m: "Dec", v: 74500 },
        { m: "Jan", v: 80200 },
        { m: "Feb", v: 86400 },
    ],
};

export const TIMEZONES = [
    "Asia/Kolkata",
    "Asia/Dubai",
    "Asia/Singapore",
    "Europe/London",
    "Europe/Berlin",
    "America/New_York",
    "America/Los_Angeles",
    "Australia/Sydney",
];
