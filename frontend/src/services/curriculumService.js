import { db, isFirebaseConfigured } from "@/lib/firebase";
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    deleteDoc,
    updateDoc,
    serverTimestamp
} from "firebase/firestore";

const CURRICULUMS_KEY = "hrtunes_curriculums";

// Shared 5-part live lesson breakdown template
const DEFAULT_LESSON_STRUCTURE = {
    warmup: "5 minutes — Finger stretching, pick grip & chromatic coordination drills",
    review: "10 minutes — Review previous practice homework and answer questions",
    newConcept: "20 minutes — Step-by-step instruction on core session concept with visual demonstration",
    application: "15 minutes — Interactive guided song or exercise application over metronome/backing track",
    feedback: "5–10 minutes — Actionable instructor feedback, student Q&A, and structured practice routine"
};

// -------------------------------------------------------------
// 1. FREE TRIAL CURRICULUM
// -------------------------------------------------------------
export const SEED_CURRICULUM_TRIAL = {
    id: "curriculum-free-trial",
    slug: "curriculum-free-trial",
    title: "Free Trial — 1-on-1 Assessment",
    description: "A 60-minute interactive live assessment and introductory session to evaluate goals, technique, and build a personalized guitar roadmap.",
    category: "Trial Assessment",
    level: "All Levels (Beginner to Advanced)",
    instrument: "Guitar",
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80",
    assignedPlanIds: ["free-trial"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    levels: [
        {
            id: "lvl-trial-01",
            levelNumber: 1,
            title: "Live Assessment & Introduction",
            duration: "1 Session (60 mins)",
            description: "Diagnostic 1-on-1 assessment with Lead Instructor Harsh Patel.",
            learningObjectives: "Evaluate student baseline, posture, pick grip, first chords, and build custom roadmap.",
            status: "active",
            modules: [
                {
                    id: "mod-trial-01",
                    moduleNumber: 1,
                    title: "Trial Session Structure",
                    description: "8-point assessment and mini guitar lesson.",
                    learningGoal: "Establish student skill tier and recommend exact course plan.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-trial-01",
                            sessionNumber: 1,
                            title: "Guitar Assessment & Introduction",
                            duration: 60,
                            description: "Comprehensive 60-minute assessment covering goal setting, posture, tuning, basic picking/chord check, mini-lesson, and personalized roadmap.",
                            topics: [
                                "Introduction and Musical Goal Setting",
                                "Guitar Setup and Tuning Check",
                                "Posture and Pick Grip Ergonomics",
                                "Basic Chord & Picking Assessment",
                                "Mini Guitar Lesson",
                                "Simple Song / Riff Application",
                                "Live Feedback & Technique Corrections",
                                "Personalized Learning Roadmap & Recommendation"
                            ],
                            objectives: "Identify student baseline tier (Beginner, Early Beginner, Intermediate, or Advanced) and provide an immediate musical takeaway.",
                            lessonStructure: {
                                warmup: "10 minutes — Goal discussion & instrument tuning",
                                review: "10 minutes — Posture & fretting hand evaluation",
                                newConcept: "20 minutes — Mini lesson: first chord transitions / picking drills",
                                application: "10 minutes — Simple 2-chord progression or riff over beat",
                                feedback: "10 minutes — Instructor evaluation & tailored plan recommendation"
                            },
                            practice: "Review the demonstrated ergonomic pick grip and single-finger exercise for 10 minutes daily.",
                            homework: "Memorize the demonstrated 2-chord transition.",
                            resources: [{ name: "HRTunes Beginner Roadmap Guide (PDF)", type: "pdf", url: "#" }],
                            videoId: "trial-demo",
                            freePreview: true,
                            status: "active"
                        }
                    ]
                }
            ]
        }
    ]
};

// -------------------------------------------------------------
// 2. 3-MONTH GUITAR FOUNDATION CURRICULUM (12 Sessions)
// -------------------------------------------------------------
export const SEED_CURRICULUM_FOUNDATION = {
    id: "curriculum-guitar-foundation-beginner",
    slug: "curriculum-guitar-foundation-beginner",
    title: "Guitar Foundation — Beginner",
    description: "A structured 12-session beginner guitar program covering guitar fundamentals, right-hand and left-hand technique, open chords, rhythm, fingerpicking, tablature and beginner song application.",
    category: "Acoustic & Electric Guitar",
    level: "Beginner",
    instrument: "Guitar",
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?auto=format&fit=crop&w=1200&q=80",
    assignedPlanIds: ["guitar-foundation-3m", "guitar-complete-6m"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    levels: [
        // Level 1: Month 1
        {
            id: "lvl-found-01",
            levelNumber: 1,
            title: "Level 1: Guitar Fundamentals",
            duration: "Month 1 (Sessions 1–4)",
            description: "Build correct posture, guitar handling, picking, fretting, and rhythm fundamentals.",
            learningObjectives: "Student understands correct posture, hand positioning, basic tuning, controlled picking, finger independence, and metronome coordination.",
            status: "active",
            modules: [
                {
                    id: "mod-found-01",
                    moduleNumber: 1,
                    title: "Module 1: Getting Started",
                    description: "Posture, pick grip, open strings, and left-hand dexterity drills.",
                    learningGoal: "Establish clean picking mechanics and coordination between both hands.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-found-01",
                            sessionNumber: 1,
                            title: "Session 1: Guitar Setup & Posture",
                            duration: 60,
                            description: "Understand guitar anatomy, ergonomic sitting & standing posture, pick grip, and electronic/app tuning.",
                            topics: ["Parts of the guitar", "Sitting position", "Standing position", "Hand positioning", "Pick grip", "Basic guitar tuning"],
                            objectives: "Student understands correct guitar posture, hand positioning, and basic tuning.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "15 minutes daily tuning check and pick grip practice on open strings.",
                            homework: "Tune the guitar before every practice session and record 1 minute open string strumming.",
                            resources: [{ name: "Guitar Anatomy & Tuning Chart (PDF)", type: "pdf", url: "#" }],
                            videoId: "found-01",
                            freePreview: true,
                            status: "active"
                        },
                        {
                            id: "ses-found-02",
                            sessionNumber: 2,
                            title: "Session 2: Right-Hand Fundamentals",
                            duration: 60,
                            description: "Master downstrokes, upstrokes, alternate picking, and open-string rhythmic timing.",
                            topics: ["Downstrokes", "Upstrokes", "Alternate picking", "Open-string exercises", "Basic rhythm"],
                            objectives: "Student can perform controlled basic picking and maintain a simple rhythm.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Practice alternate picking (down-up-down-up) on strings 6 through 1 at 60 BPM.",
                            homework: "Clean alternate picking drill on open strings with metronome for 5 minutes.",
                            resources: [{ name: "Right-Hand Picking Drills Sheet", type: "pdf", url: "#" }],
                            videoId: "found-02",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-03",
                            sessionNumber: 3,
                            title: "Session 3: Left-Hand Fundamentals",
                            duration: 60,
                            description: "Proper fretting near the fret wire, thumb placement behind neck, finger strength, and one-finger-per-fret chromatic exercise.",
                            topics: ["Finger positioning", "Fretting technique", "Finger strength", "One-finger-per-fret", "Chromatic 1-2-3-4 exercise"],
                            objectives: "Student develops basic fretting control and finger independence.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Chromatic 1-2-3-4 exercise across all 6 strings at 50–60 BPM daily.",
                            homework: "Record a 30-second video of the 1-2-3-4 exercise ensuring no buzz or muted notes.",
                            resources: [{ name: "Chromatic 1-2-3-4 Tab Sheet", type: "pdf", url: "#" }],
                            videoId: "found-03",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-04",
                            sessionNumber: 4,
                            title: "Session 4: Rhythm & Coordination",
                            duration: 60,
                            description: "Beat counting (1-2-3-4), metronome synchronization, synchronizing picking with fretting, and building a 20-minute practice routine.",
                            topics: ["Beat and counting", "Metronome", "Basic rhythmic patterns", "Right/left hand coordination", "Practice routine"],
                            objectives: "Student can maintain a simple rhythm while coordinating both hands.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Synchronized picking + fretting drills with metronome at 60 BPM.",
                            homework: "Follow the 4-step daily practice routine sheet for 5 consecutive days.",
                            resources: [{ name: "Structured Daily Practice Template (PDF)", type: "pdf", url: "#" }],
                            videoId: "found-04",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        },

        // Level 2: Month 2
        {
            id: "lvl-found-02",
            levelNumber: 2,
            title: "Level 2: Open Chords & Rhythm",
            duration: "Month 2 (Sessions 5–8)",
            description: "Develop a usable open-chord vocabulary and solid 4/4 strumming ability.",
            learningObjectives: "Student can play common open chords (E, A, D, G, C, Em, Am, Dm) and maintain consistent strumming patterns without stopping.",
            status: "active",
            modules: [
                {
                    id: "mod-found-02",
                    moduleNumber: 2,
                    title: "Module 2: Open Chords & Strumming",
                    description: "Essential major & minor chord shapes, anchor fingers, and down/up strumming transitions.",
                    learningGoal: "Transition between all 8 open chords cleanly on time.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-found-05",
                            sessionNumber: 5,
                            title: "Session 5: E, A & D Chords",
                            duration: 60,
                            description: "Fretting E major, A major, and D major cleanly. Understanding chord box diagrams and 1-minute transition switches.",
                            topics: ["E major", "A major", "D major", "Chord diagrams", "Chord transitions"],
                            objectives: "Student can play E, A, and D major chords and transition between them smoothly.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "60-second chord change drills between E-A, A-D, and E-D.",
                            homework: "Achieve 30+ clean chord switches in 60 seconds between D and A.",
                            resources: [{ name: "E, A, D Open Chord Diagram Sheet", type: "pdf", url: "#" }],
                            videoId: "found-05",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-06",
                            sessionNumber: 6,
                            title: "Session 6: G, C & Em Chords",
                            duration: 60,
                            description: "Fretting G major, C major, and E minor. Pivot finger technique and the iconic G-Em-C progression.",
                            topics: ["G major", "C major", "E minor", "Chord transitions"],
                            objectives: "Student can cleanly play G, C, and Em chords and execute transitions with anchor fingers.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Transitioning G to C and C to Em without pausing the strumming hand.",
                            homework: "Play the G-Em-C-D 4-chord loop 4 times continuously without hesitation.",
                            resources: [{ name: "G, C, Em Chord Charts & Transition Guide", type: "pdf", url: "#" }],
                            videoId: "found-06",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-07",
                            sessionNumber: 7,
                            title: "Session 7: Am, Dm & Chord Vocabulary",
                            duration: 60,
                            description: "A minor and D minor shapes. Combining major and minor chords to create expressive progressions.",
                            topics: ["A minor", "D minor", "Common chord combinations", "Chord progression exercises"],
                            objectives: "Student expands chord vocabulary with minor tonalities and plays 4-bar chord progressions.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Play Am-Dm-E-Am minor ballad progression with steady downstrums.",
                            homework: "Record the Am-C-G-D progression at 70 BPM.",
                            resources: [{ name: "Minor Chord Vocabulary & Progressions Sheet", type: "pdf", url: "#" }],
                            videoId: "found-07",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-08",
                            sessionNumber: 8,
                            title: "Session 8: Strumming Fundamentals",
                            duration: 60,
                            description: "Down strumming, down/up 8th note strumming (D-DU-UDU), 4/4 meter timing, and keeping the wrist fluid.",
                            topics: ["Down strumming", "Down/up strumming", "4/4 rhythm", "Metronome", "Chord and rhythm coordination"],
                            objectives: "Student can play common open chords and maintain basic strumming patterns with a metronome.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Strumming pattern D-D-U-U-D-U on G-D-Em-C at 65 BPM with metronome.",
                            homework: "Record 2 minutes of continuous strumming without stopping on chord changes.",
                            resources: [{ name: "Top 5 Essential 4/4 Strumming Patterns (PDF)", type: "pdf", url: "#" }],
                            videoId: "found-08",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        },

        // Level 3: Month 3
        {
            id: "lvl-found-03",
            levelNumber: 3,
            title: "Level 3: Songs & Musical Application",
            duration: "Month 3 (Sessions 9–12)",
            description: "Apply guitar techniques to real music and develop foundational music theory.",
            learningObjectives: "Student can read guitar tablature, play basic fingerpicking patterns, perform 3–5 full beginner songs, and receive their Level 1 certification assessment.",
            status: "active",
            modules: [
                {
                    id: "mod-found-03",
                    moduleNumber: 3,
                    title: "Module 3: Fingerpicking, TAB & Songs",
                    description: "Fingerpicking patterns, tablature notation, major scales introduction, and full song workshops.",
                    learningGoal: "Play 3–5 complete beginner-level songs independently.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-found-09",
                            sessionNumber: 9,
                            title: "Session 9: Fingerpicking Basics",
                            duration: 60,
                            description: "P-I-M-A finger assignment, thumb independence on bass strings, and simple acoustic arpeggio patterns.",
                            topics: ["Finger placement", "Basic picking patterns", "Thumb independence", "Simple fingerpicking exercise"],
                            objectives: "Student can perform clean 4-finger acoustic picking patterns on open chords.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Fingerpicking pattern P-I-M-A on C and G major chords.",
                            homework: "Play the House of the Rising Sun / Stand By Me fingerpicking intro.",
                            resources: [{ name: "Beginner Fingerpicking Patterns & Tabs", type: "pdf", url: "#" }],
                            videoId: "found-09",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-10",
                            sessionNumber: 10,
                            title: "Session 10: TAB & Music Theory",
                            duration: 60,
                            description: "Reading 6-line guitar tablature, understanding frets, note names on the low E & A strings, and the concept of the major scale (W-W-H-W-W-W-H).",
                            topics: ["Reading guitar tablature", "Strings and frets", "Notes on guitar", "Introduction to major scales", "Basic music theory"],
                            objectives: "Student can fluently read guitar tabs and understands the formula of major scales.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "C Major scale in open position using guitar tablature.",
                            homework: "Read and play the 3 single-string melodies on the worksheet.",
                            resources: [{ name: "How to Read Guitar Tablature & Theory Cheat Sheet", type: "pdf", url: "#" }],
                            videoId: "found-10",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-11",
                            sessionNumber: 11,
                            title: "Session 11: Song Workshop",
                            duration: 60,
                            description: "Deconstructing full songs: verse-chorus structure, transitions, strumming dynamics, and playing along with backing tracks.",
                            topics: ["Chord progression", "Strumming", "Song structure", "Playing along with backing tracks"],
                            objectives: "Student can play a complete song from start to finish along with a backing track.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Rehearse chosen song (e.g. 'Kabira' or 'Knockin on Heavens Door') with full backing track.",
                            homework: "Record full song take with verse, chorus, and ending.",
                            resources: [{ name: "Beginner Songbook (5 Complete Song Tabs & Lyrics)", type: "pdf", url: "#" }],
                            videoId: "found-11",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-found-12",
                            sessionNumber: 12,
                            title: "Session 12: Final Performance & Assessment",
                            duration: 60,
                            description: "Full song performance evaluation, rhythm & chord clean check, instructor feedback, personalized practice plan, and next-level roadmap.",
                            topics: ["Full song performance", "Rhythm assessment", "Chord assessment", "Instructor feedback", "Practice plan", "Next-level roadmap"],
                            objectives: "Student finishes the 3-month program as a confident beginner who can independently practice and play several beginner-level songs.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Perform student-selected showcase song with clean transitions and steady tempo.",
                            homework: "Follow the Level 1 graduation practice roadmap.",
                            resources: [{ name: "Level 1 Certificate of Completion & Roadmap Guide", type: "pdf", url: "#" }],
                            videoId: "found-12",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        }
    ]
};

// -------------------------------------------------------------
// 3. 6-MONTH GUITAR COMPLETE CURRICULUM (24 Sessions)
// -------------------------------------------------------------
export const SEED_CURRICULUM_COMPLETE = {
    id: "curriculum-guitar-complete",
    slug: "curriculum-guitar-complete",
    title: "Guitar Complete — Beginner to Intermediate",
    description: "A comprehensive 24-session program taking you from guitar fundamentals to confident intermediate-level playing: barre chords, syncopated rhythm, major & pentatonic scales, lead guitar techniques, basic improvisation, and fingerstyle arrangements.",
    category: "Acoustic & Electric Guitar",
    level: "Beginner to Intermediate",
    instrument: "Guitar",
    status: "published",
    thumbnail: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80",
    assignedPlanIds: ["guitar-complete-6m"],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    levels: [
        // Levels 1, 2, 3 reused from Foundation
        ...SEED_CURRICULUM_FOUNDATION.levels,

        // Level 4: Month 4
        {
            id: "lvl-comp-04",
            levelNumber: 4,
            title: "Level 4: Intermediate Chords & Rhythm",
            duration: "Month 4 (Sessions 13–16)",
            description: "Overcome the barre chord hurdle and master syncopated, percussive rhythm control.",
            learningObjectives: "Student develops reliable F major and B minor barre chord technique and syncopated rhythm control with accents and muting.",
            status: "active",
            modules: [
                {
                    id: "mod-comp-04",
                    moduleNumber: 4,
                    title: "Module 4: Barre Chords & Advanced Rhythm",
                    description: "F major, B minor, movable E-shape and A-shape barre chords, syncopation, and palm muting.",
                    learningGoal: "Play barre chords without hand fatigue or buzzing strings.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-comp-13",
                            sessionNumber: 13,
                            title: "Session 13: Introduction to Barre Chords",
                            duration: 60,
                            description: "What barre chords are, index finger angle, thumb placement, F major shape, and eliminating buzz.",
                            topics: ["What barre chords are", "F major", "Barre technique", "Common mistakes", "Finger positioning"],
                            objectives: "Student understands the mechanical physics of barre chords and frets clean F major.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "5-minute daily index finger barre clamping and 3-string partial barre exercise.",
                            homework: "Switch between C major and F major 15 times smoothly.",
                            resources: [{ name: "Mastering the F Barre Chord Guide (PDF)", type: "pdf", url: "#" }],
                            videoId: "comp-13",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-14",
                            sessionNumber: 14,
                            title: "Session 14: Bm & Minor Barre Chords",
                            duration: 60,
                            description: "B minor chord shape based on A minor form, movable 5th-string root barre chords, and smooth transitions.",
                            topics: ["B minor", "Minor barre shape", "Chord transitions"],
                            objectives: "Student can play Bm and transition between D major and B minor seamlessly.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "D - A - Bm - G progression with clean Bm barre.",
                            homework: "Record the D-A-Bm-G progression without missing the Bm beat.",
                            resources: [{ name: "5th-String Root Barre Chord Chart", type: "pdf", url: "#" }],
                            videoId: "comp-14",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-15",
                            sessionNumber: 15,
                            title: "Session 15: Barre Chord Practice",
                            duration: 60,
                            description: "Moving major and minor barre shapes along the fretboard (F, G, A, B, C). Transposing songs using movable barre chords.",
                            topics: ["Major/minor barre shapes", "Moving barre chords", "Chord progression exercises", "Timing practice"],
                            objectives: "Student can navigate major and minor barre chords across the neck.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Movable barre progression (G barre - C barre - D barre) on frets 3, 5, 8.",
                            homework: "Play a 12-bar rock progression exclusively using movable barre chords.",
                            resources: [{ name: "Movable Barre Chord Fretboard Map", type: "pdf", url: "#" }],
                            videoId: "comp-15",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-16",
                            sessionNumber: 16,
                            title: "Session 16: Advanced Strumming",
                            duration: 60,
                            description: "Syncopation, off-beat strums, percussive fret-hand muting, right-hand palm muting, accents, and 16th-note rhythm feel.",
                            topics: ["Syncopation", "Muting", "Accents", "Rhythm patterns", "Metronome exercises"],
                            objectives: "Student develops advanced rhythmic groove with dynamic accents and chucking/muting.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Percussive slap-strum technique on 4-chord funk/pop progression at 80 BPM.",
                            homework: "Record 60 seconds of syncopated rhythm with audible dynamic accents.",
                            resources: [{ name: "Syncopated & Percussive Strumming Patterns Sheet", type: "pdf", url: "#" }],
                            videoId: "comp-16",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        },

        // Level 5: Month 5
        {
            id: "lvl-comp-05",
            levelNumber: 5,
            title: "Level 5: Scales & Lead Guitar",
            duration: "Month 5 (Sessions 17–20)",
            description: "Understand the fretboard through major and pentatonic scales, lead articulation, and basic solo improvisation.",
            learningObjectives: "Student can play major and pentatonic scale shapes, apply lead articulations (bends, slides, hammer-ons, pull-offs, vibrato), and improvise simple melodic phrases over backing tracks.",
            status: "active",
            modules: [
                {
                    id: "mod-comp-05",
                    moduleNumber: 5,
                    title: "Module 5: Lead Guitar Fundamentals",
                    description: "Scales, expressive lead articulations, call-and-response phrasing, and improvisation.",
                    learningGoal: "Play your first expressive guitar solos over backing tracks.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-comp-17",
                            sessionNumber: 17,
                            title: "Session 17: Major Scale Development",
                            duration: 60,
                            description: "2-octave G Major scale, scale positions, fretboard visualization, and alternate picking scale speed runs.",
                            topics: ["Major scale review", "Scale patterns", "Notes across strings", "Scale exercises"],
                            objectives: "Student can play 2-octave major scale patterns cleanly up and down the neck.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "G Major 2-octave scale with alternate picking at 70 BPM (quarter & 8th notes).",
                            homework: "Memorize the G Major box 1 pattern and record a clean ascending/descending run.",
                            resources: [{ name: "Major Scale 2-Octave Fretboard Diagrams", type: "pdf", url: "#" }],
                            videoId: "comp-17",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-18",
                            sessionNumber: 18,
                            title: "Session 18: Pentatonic Scale",
                            duration: 60,
                            description: "The legendary Minor Pentatonic Box 1 in A minor, root note targets, connecting patterns, and blues/rock backing tracks.",
                            topics: ["Minor pentatonic", "Pentatonic box 1", "Connecting patterns", "Backing track practice"],
                            objectives: "Student can play the A minor pentatonic scale Box 1 and target root notes over backing tracks.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "A minor pentatonic box 1 at fret 5 with backing track.",
                            homework: "Play 3 distinct 2-bar melodic licks within Box 1 over an A minor backing track.",
                            resources: [{ name: "Minor Pentatonic Box 1 & 2 Tab Sheet + Audio Track", type: "pdf", url: "#" }],
                            videoId: "comp-18",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-19",
                            sessionNumber: 19,
                            title: "Session 19: Lead Guitar Techniques",
                            duration: 60,
                            description: "Expressive lead articulation: half and whole step bends, pitch-accurate target notes, slides, hammer-ons, pull-offs, and vocal vibrato.",
                            topics: ["Bending", "Slides", "Hammer-ons", "Pull-offs", "Vibrato"],
                            objectives: "Student can cleanly execute bends, hammer-ons, pull-offs, and vibrato in tune.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Bending pitch-match exercises and hammer-on/pull-off trill drills.",
                            homework: "Record 4 expressive lead phrases combining hammer-ons, slides, and vibrato.",
                            resources: [{ name: "Expressive Lead Guitar Articulations Guide", type: "pdf", url: "#" }],
                            videoId: "comp-19",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-20",
                            sessionNumber: 20,
                            title: "Session 20: Improvisation Fundamentals",
                            duration: 60,
                            description: "Creating musical sentences, call and response, rhythmic variation in soloing, landing on chord tones, and basic blues/rock improvisation.",
                            topics: ["Creating simple phrases", "Call and response", "Playing over backing tracks", "Connecting pentatonic patterns", "Basic improvisation"],
                            objectives: "Student can improvise simple, musical lead solos over a backing track with phrasing.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Improvising 8-bar solos over A minor backing track using space and dynamics.",
                            homework: "Record a 1-minute improvised guitar solo over the provided backing track.",
                            resources: [{ name: "Improvisation & Phrasing Roadmap (PDF)", type: "pdf", url: "#" }],
                            videoId: "comp-20",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        },

        // Level 6: Month 6
        {
            id: "lvl-comp-06",
            levelNumber: 6,
            title: "Level 6: Performance, Fingerstyle & Guitar Development",
            duration: "Month 6 (Sessions 21–24)",
            description: "Intermediate fingerstyle arrangements, genre exploration with power chords, and final recording assessment.",
            learningObjectives: "Student finishes the 6-month program as a confident beginner-to-intermediate guitarist who can play fingerstyle, lead, and rhythm.",
            status: "active",
            modules: [
                {
                    id: "mod-comp-06",
                    moduleNumber: 6,
                    title: "Module 6: Performance & Musical Application",
                    description: "Fingerstyle techniques, power chords, rock riffs, and graduation performance recording.",
                    learningGoal: "Deliver a polished intermediate showcase performance.",
                    status: "active",
                    sessions: [
                        {
                            id: "ses-comp-21",
                            sessionNumber: 21,
                            title: "Session 21: Fingerstyle Fundamentals",
                            duration: 60,
                            description: "Alternating bass technique (Travis picking), independent thumb basslines, and polyphonic fingerstyle coordination.",
                            topics: ["Fingerstyle technique", "Thumb patterns", "Alternating bass", "Basic fingerstyle exercises"],
                            objectives: "Student can maintain steady alternating bass while playing treble melody notes.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Alternating thumb pattern on strings 6-4-5-4 over C and G chords.",
                            homework: "Play 8 bars of steady Travis picking pattern at 60 BPM.",
                            resources: [{ name: "Intermediate Fingerstyle & Alternating Bass Sheet", type: "pdf", url: "#" }],
                            videoId: "comp-21",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-22",
                            sessionNumber: 22,
                            title: "Session 22: Fingerstyle Application",
                            duration: 60,
                            description: "Arranging popular acoustic melodies into fingerstyle pieces, musical dynamics, rubato timing, and expressive touch.",
                            topics: ["Fingerstyle song arrangement", "Dynamics", "Timing", "Musical expression"],
                            objectives: "Student can perform a complete fingerstyle acoustic song arrangement.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Rehearse fingerstyle song piece (e.g. 'Tears in Heaven' or 'Dust in the Wind' intro).",
                            homework: "Record full fingerstyle song take with dynamics and steady tempo.",
                            resources: [{ name: "Fingerstyle Acoustic Arrangement Tabs (PDF)", type: "pdf", url: "#" }],
                            videoId: "comp-22",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-23",
                            sessionNumber: 23,
                            title: "Session 23: Power Chords & Genre Exploration",
                            duration: 60,
                            description: "5th (power) chords on 6th & 5th strings, palm muting drive, rock/pop-punk rhythm riffs, and exploring Indian indie guitar styles.",
                            topics: ["Power chord shapes", "Rock rhythm", "Guitar riffs", "Genre exploration", "Playing with backing tracks"],
                            objectives: "Student can play tight power chord rhythm tracks with heavy palm muting.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Power chord riff exercises (E5, G5, A5, C5, D5) with palm muting.",
                            homework: "Record 1-minute rock riff over dynamic drum track.",
                            resources: [{ name: "Power Chord Shapes & Classic Riffs Tab Guide", type: "pdf", url: "#" }],
                            videoId: "comp-23",
                            freePreview: false,
                            status: "active"
                        },
                        {
                            id: "ses-comp-24",
                            sessionNumber: 24,
                            title: "Session 24: Final Performance & Assessment",
                            duration: 60,
                            description: "Comprehensive graduation performance: student-selected song with rhythm, barre chords, lead solo, and improvisation. Instructor evaluation & roadmap.",
                            topics: ["Student-selected song", "Rhythm performance", "Chord performance", "Lead performance", "Basic improvisation", "Instructor evaluation", "Personalized next-step roadmap"],
                            objectives: "Student finishes the 6-month program as a confident beginner-to-intermediate guitarist with an independent practice routine.",
                            lessonStructure: DEFAULT_LESSON_STRUCTURE,
                            practice: "Deliver full graduation showcase recording incorporating rhythm and lead.",
                            homework: "Follow the 6-Month Intermediate Graduate Roadmap.",
                            resources: [{ name: "HRTunes Intermediate Diploma & Advanced Program Roadmap (PDF)", type: "pdf", url: "#" }],
                            videoId: "comp-24",
                            freePreview: false,
                            status: "active"
                        }
                    ]
                }
            ]
        }
    ]
};

export const ALL_SEED_CURRICULUMS = [
    SEED_CURRICULUM_TRIAL,
    SEED_CURRICULUM_FOUNDATION,
    SEED_CURRICULUM_COMPLETE
];

// Helper to get local curriculums
function getLocalCurriculums() {
    try {
        const data = localStorage.getItem(CURRICULUMS_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
    } catch {
        // ignore
    }
    localStorage.setItem(CURRICULUMS_KEY, JSON.stringify(ALL_SEED_CURRICULUMS));
    return ALL_SEED_CURRICULUMS;
}

function saveLocalCurriculums(curriculums) {
    try {
        localStorage.setItem(CURRICULUMS_KEY, JSON.stringify(curriculums));
    } catch (e) {
        console.error("Failed to save local curriculums", e);
    }
}

/**
 * IDEMPOTENT Seeding of Curriculums
 * Matches by exact document ID so running multiple times never duplicates content.
 */
export async function seedInitialGuitarCurriculum(force = false) {
    if (isFirebaseConfigured && db) {
        try {
            console.log("🎸 Seeding production Curriculums to Firestore...");
            for (const curriculum of ALL_SEED_CURRICULUMS) {
                await setDoc(doc(db, "curriculums", curriculum.id), curriculum, { merge: true });
            }
            console.log("✅ Firestore Curriculums seeded idempotently.");
        } catch (err) {
            console.warn("Firestore curriculum seed warning:", err);
        }
    }

    // Local Storage seed (Idempotent update by ID)
    const existing = getLocalCurriculums();
    const mergedMap = new Map();
    existing.forEach((c) => mergedMap.set(c.id, c));
    ALL_SEED_CURRICULUMS.forEach((c) => {
        if (force || !mergedMap.has(c.id)) {
            mergedMap.set(c.id, c);
        }
    });
    const finalCurriculums = Array.from(mergedMap.values());
    saveLocalCurriculums(finalCurriculums);
    return finalCurriculums;
}

/**
 * Gets all curricula
 */
export async function getCurriculums() {
    if (isFirebaseConfigured && db) {
        try {
            const snap = await getDocs(collection(db, "curriculums"));
            if (!snap.empty) {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                saveLocalCurriculums(list);
                return list;
            }
        } catch (err) {
            console.warn("Firestore getCurriculums failed, using local store:", err);
        }
    }
    return getLocalCurriculums();
}

/**
 * Gets a curriculum by ID
 */
export async function getCurriculumById(curriculumId) {
    const list = await getCurriculums();
    return list.find((c) => c.id === curriculumId || c.slug === curriculumId) || null;
}

/**
 * Save / Update a curriculum
 */
export async function saveCurriculum(curriculum) {
    const currId = curriculum.id || "curriculum-" + Date.now().toString(36);
    const updated = {
        ...curriculum,
        id: currId,
        updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
        try {
            await setDoc(doc(db, "curriculums", currId), {
                ...updated,
                updatedAt: serverTimestamp()
            }, { merge: true });
        } catch (err) {
            console.warn("Firestore saveCurriculum failed:", err);
        }
    }

    const list = await getCurriculums();
    const idx = list.findIndex((c) => c.id === currId);
    if (idx >= 0) {
        list[idx] = updated;
    } else {
        list.push(updated);
    }
    saveLocalCurriculums(list);
    return updated;
}

/**
 * Delete a curriculum
 */
export async function deleteCurriculum(curriculumId) {
    if (isFirebaseConfigured && db) {
        try {
            await deleteDoc(doc(db, "curriculums", curriculumId));
        } catch (err) {
            console.warn("Firestore deleteCurriculum error:", err);
        }
    }
    const list = await getCurriculums();
    const filtered = list.filter((c) => c.id !== curriculumId);
    saveLocalCurriculums(filtered);
    return true;
}

/**
 * Assign a curriculum to subscription plans
 */
export async function assignCurriculumToPlans(curriculumId, planIds) {
    const curriculum = await getCurriculumById(curriculumId);
    if (!curriculum) throw new Error("Curriculum not found");
    curriculum.assignedPlanIds = planIds;
    return await saveCurriculum(curriculum);
}
