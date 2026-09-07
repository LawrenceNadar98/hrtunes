// Production seed configuration and brand assets for HR Tunes
import { IMAGES } from "./images";

export { IMAGES };

export const BRAND = {
  name: "HR Tunes",
  tagline: "Strum Your Story",
  description:
    "Premium guitar & keyboard classes - from absolute beginner to stage-ready performer.",
  email: "info@hrtunes.in",
  phone: "+91 88661 08396",
  address:
    "305, Hill Town Landmark, Opp. Das Khaman Nikol, Naroda Rd, Nikol, Ahmedabad, Gujarat 382350",
};

// Gallery for landing page
export const GALLERY = [
  "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1471478331149-c72f17e33c73?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=900&q=80",
  "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?auto=format&fit=crop&w=900&q=80",
  IMAGES.keyboard,
];

export const INSTRUMENTS = [
  {
    id: "guitar",
    name: "Guitar",
    icon: "Guitar",
    description: "Acoustic, Electric, and Fingerstyle guitar mastery programs.",
    coverImage: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80"
  },
  {
    id: "keyboard",
    name: "Keyboard",
    icon: "Piano",
    description: "Piano fundamentals, keyboard theory, and two-hand independence.",
    coverImage: "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80"
  }
];

export const COURSES = [
  {
    id: "curriculum-guitar-foundation-beginner",
    title: "Guitar Foundations",
    subtitle: "Strum your first song in 14 days",
    level: "Beginner",
    instrument: "Guitar",
    instructor: "Harsh Patel",
    duration: "8 weeks",
    lessons: 24,
    students: 0,
    rating: 4.9,
    price: 7500,
    thumbnail:
      "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    tags: ["BEGINNER", "ACOUSTIC", "HINDI / ENGLISH"],
    featured: true,
    progress: 0,
    description:
      "A structured foundation program taking beginners from zero to confidently strumming, chord changing, and playing 5+ complete songs.",
    assignedPlanIds: ["guitar-foundation-3m", "guitar-complete-6m"],
    modules: [],
  },
  {
    id: "curriculum-guitar-complete",
    title: "6-Month Guitar Complete",
    subtitle: "Complete mastery from open chords to lead guitar & soloing",
    level: "Beginner to Intermediate",
    instrument: "Guitar",
    instructor: "Harsh Patel",
    duration: "24 weeks",
    lessons: 48,
    students: 0,
    rating: 5.0,
    price: 13500,
    thumbnail:
      "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?auto=format&fit=crop&w=1200&q=80",
    tags: ["INTERMEDIATE", "ELECTRIC / ACOUSTIC", "LEAD & SOLOING"],
    featured: false,
    progress: 0,
    description:
      "Comprehensive 6-month journey covering acoustic foundations, barre chords, pentatonic scales, fingerstyle, and lead improvisation.",
    assignedPlanIds: ["guitar-complete-6m"],
    modules: [],
  },
  {
    id: "curriculum-free-trial",
    title: "Free Trial — 1-on-1 Assessment",
    subtitle: "A 60-minute interactive live assessment & personalized roadmap",
    level: "Assessment",
    instrument: "Guitar",
    instructor: "Harsh Patel",
    duration: "1 session",
    lessons: 1,
    students: 0,
    rating: 5.0,
    price: 0,
    thumbnail:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    tags: ["FREE TRIAL", "1-ON-1 LIVE", "ASSESSMENT"],
    featured: false,
    progress: 0,
    description:
      "A 60-minute interactive live assessment and introductory session to evaluate goals, technique, and build a personalized guitar roadmap.",
    assignedPlanIds: ["free-trial"],
    modules: [],
  },
  {
    id: "keyboard-essentials",
    title: "Keyboard Essentials",
    subtitle: "Feel the flow, note by note",
    level: "Beginner",
    instrument: "Keyboard",
    instructor: "Priya Sharma",
    duration: "6 weeks",
    lessons: 18,
    students: 0,
    rating: 4.8,
    price: 3499,
    thumbnail:
      "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1200&q=80",
    tags: ["BEGINNER", "PIANO / KEYS", "HINDI / ENGLISH"],
    progress: 0,
    featured: true,
    comingSoon: true,
    description:
      "Coming soon. Classical & digital keyboard foundations — chords, melodies, and your first recital piece.",
    assignedPlanIds: [],
    modules: [],
  },
];

export const INSTRUCTORS = [
  {
    id: "harsh",
    name: "Harsh Patel",
    role: "Founder · Lead Guitar Instructor",
    bio: "12+ years playing guitar across studio sessions, live tours, and teaching over 2,300 students. At HR Tunes, it’s more than music lessons - it’s artist development. Learn at your own pace with personalized guidance.",
    image: IMAGES.instructor,
    stats: { students: 2314, years: 12, rating: 4.9 },
    skills: ["Acoustic", "Electric", "Fingerstyle", "Improv", "Classical", "Digital Piano", "Electronic Keyboard"],
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
];

export const PRICING = [
  {
    id: "free-trial",
    slug: "free-trial",
    name: "Free Trial",
    tagline: "Experience the HRTunes Method",
    type: "trial",
    price: 0,
    currency: "INR",
    duration: "1 session",
    durationUnit: "session",
    sessionCount: 1,
    sessionFrequency: "1 session",
    sessionDuration: "60 minutes",
    cadence: "/1 live session (60 mins)",
    featured: false,
    cta: "Book Free Trial",
    positioning: "Experience the HRTunes teaching method before committing to a full course.",
    targetAudience: "Anyone curious to learn guitar or assess their current skill level.",
    learningObjectives: [
      "Live 60-minute guitar skill & goal assessment",
      "Guitar setup, tuning, posture, and pick grip check",
      "First chord & simple strumming mini-lesson",
      "Personalized learning roadmap from lead instructor"
    ],
    features: [
      "60-minute live 1-on-1 online session",
      "Basic skill assessment (Beginner to Advanced)",
      "Posture, pick grip & instrument check-up",
      "Mini lesson & first clean chords / simple riff",
      "Personalized course recommendation roadmap",
      "100% Free · No credit card required"
    ],
    policies: [
      { id: "limit", title: "One Session per Student", desc: "Free trial is valid for one 60-minute live 1-on-1 session." },
      { id: "punctuality", title: "Attendance", desc: "Please join the meeting link on time for your full session." }
    ]
  },
  {
    id: "guitar-foundation-3m",
    slug: "guitar-foundation-3m",
    name: "3-Month Guitar Foundation",
    tagline: "Beginner Foundation",
    type: "course",
    price: 7500,
    currency: "INR",
    duration: "3 months",
    durationUnit: "months",
    sessionCount: 12,
    sessionFrequency: "1 session per week",
    sessionDuration: "60 minutes",
    cadence: "/3 months (12 sessions)",
    featured: true,
    cta: "Enroll Now",
    positioning: "Build a strong guitar foundation and confidently play your first songs.",
    targetAudience: "Beginners and students with little previous guitar experience.",
    learningObjectives: [
      "Hold and tune the guitar correctly with proper posture",
      "Controlled downstroke & upstroke alternate picking",
      "7–10 common open chords (E, A, D, G, C, Em, Am, Dm)",
      "Basic fingerpicking patterns & thumb independence",
      "Read guitar tablature & understand basic music theory",
      "Play 3–5 complete beginner-level songs with metronome"
    ],
    features: [
      "12 live weekly interactive sessions (60 min each)",
      "Complete Level 1, 2 & 3 Beginner Curriculum",
      "7–10 common open chords & smooth transitions",
      "Strumming patterns & metronome coordination",
      "Basic fingerpicking & guitar tablature reading",
      "3–5 beginner-level full song workshops",
      "Personalized practice routine & final assessment"
    ],
    policies: [
      { id: "refund", title: "Non-Refundable Policy", desc: "Tuition fee is non-refundable after verified enrollment." },
      { id: "attendance", title: "Live Class Attendance", desc: "Weekly batch sessions must be attended punctually." },
      { id: "practice", title: "Practice Routine", desc: "15–20 minutes daily practice recommended between sessions." }
    ]
  },
  {
    id: "guitar-complete-6m",
    slug: "guitar-complete-6m",
    name: "6-Month Guitar Complete",
    tagline: "Beginner → Intermediate",
    type: "course",
    price: 13500,
    currency: "INR",
    duration: "6 months",
    durationUnit: "months",
    sessionCount: 24,
    sessionFrequency: "1 session per week",
    sessionDuration: "60 minutes",
    cadence: "/6 months (24 sessions)",
    featured: false,
    cta: "Enroll Now",
    positioning: "Complete guitar journey from absolute fundamentals to intermediate soloing and performance.",
    targetAudience: "Committed students aiming for solid guitar mastery.",
    learningObjectives: [
      "All learning objectives from 3-Month Foundation",
      "Major & minor barre chords with clean tone across fretboard",
      "Minor pentatonic scale & Major pentatonic across 5 positions",
      "Lead guitar techniques (Bending, Slides, Hammer-ons, Pull-offs, Vibrato)",
      "Improvisation over blues & pop backing tracks",
      "Perform 8–10 diverse full songs with rhythm & lead components"
    ],
    features: [
      "All 12 sessions from 3-Month Foundation included",
      "24 live weekly interactive sessions (60 min each)",
      "Major & minor barre chords (F major, B minor & movable shapes)",
      "Advanced syncopated rhythm & percussive muting",
      "Major & Minor Pentatonic scales across fretboard",
      "Lead guitar techniques (Bending, Slides, Hammer-ons, Pull-offs, Vibrato)",
      "Improvisation fundamentals over backing tracks",
      "Fingerstyle arrangements & power chord exploration",
      "Final performance recording & instructor roadmap"
    ],
    policies: [
      { id: "refund", title: "Non-Refundable Policy", desc: "Tuition fee is non-refundable after verified enrollment." },
      { id: "attendance", title: "Live Class Attendance", desc: "Weekly batch sessions must be attended punctually." },
      { id: "practice", title: "Practice Routine", desc: "20–30 minutes daily practice recommended between sessions." }
    ]
  }
];

export const LIVE_CLASSES = [];
export const ASSIGNMENTS = [];
export const RECENT_ACTIVITY = [];
export const STUDENTS = [];
export const PAYMENT_HISTORY = [];
export const EARNINGS = { total: 0, thisMonth: 0, students: 0, avgRating: 5.0, monthly: [] };

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
