# HR Tunes — Product Requirements Document

## Original Problem Statement
Design a modern, responsive UI for a full-stack music learning platform focused on guitar classes (with future support for keyboard courses). Dark theme, red/black/white palette, mobile-first, card-based, micro-interactions. Pure frontend (React + Tailwind CSS) with mock data, no backend logic for MVP.

## User Choices (Feb 18, 2026)
- Brand: **HR Tunes** (dark + red aesthetic)
- Scope: **Pure frontend with mock data** (no backend)
- Payments: UI-only mockup (no Stripe)
- Auth: UI-only with Student/Instructor role toggle
- Video: Real YouTube embeds

## Architecture
- React 19 + React Router 7 + Tailwind CSS
- shadcn/ui primitives (sonner toasts) + lucide-react icons
- Fonts: Bebas Neue (display) + Cabinet Grotesk (headings) + Satoshi (body) + JetBrains Mono (code/mono)
- All data from `/app/frontend/src/lib/mock.js`
- Routes defined in `/app/frontend/src/App.js`

## User Personas
1. **Student (Aarav Mehta)** — wants to learn guitar from beginner to intermediate
2. **Instructor (Harsh Patel)** — manages courses, live classes, students, earnings
3. **Visitor** — lands on marketing page, browses courses, books free trial

## What's Implemented (Feb 18, 2026)

### Public
- [x] **Landing** (`/`) — hero ("Turn Passion Into Performance"), marquee, course highlights (Guitar + Keyboard Coming Soon), WhyUs grid, instructor profile, embedded YouTube preview, gallery, testimonials, pricing (3 plans), final CTA, footer
- [x] **Auth** (`/login`, `/signup`) — role toggle (Student ⇄ Instructor), form fields, redirects to correct dashboard on submit
- [x] **Checkout** (`/checkout`) — 3-step (plan select, payment method card/UPI/netbanking, billing contact), order summary with GST, processing state

### Student Dashboard (shared DashboardLayout with sidebar)
- [x] **Dashboard** (`/dashboard`) — stats (streak, hours, lessons, songs), continue learning cards with progress bars, upcoming live, recent activity
- [x] **My Courses** (`/dashboard/courses`) — filter chips, course cards with progress
- [x] **Course Detail** (`/dashboard/courses/:id`) — YouTube video player, modules → lessons sidebar with completion icons, mark-complete toggle, notes, downloadable resources
- [x] **Live Classes** (`/dashboard/live`) — Feb 2026 calendar with clickable days highlighting class dates, timezone selector, upcoming sessions with join buttons, past sessions with recording iframes
- [x] **Assignments** (`/dashboard/assignments`) — tabs for Pending / Submitted / Graded, submit upload button, feedback display
- [x] **Payments** (`/dashboard/payments`) — current plan, payment method card, billing history table
- [x] **Profile** (`/dashboard/profile`) — editable form + stats

### Instructor Panel (`/instructor`)
- [x] **Overview** — 4 KPI stats + earnings bar chart (6 months) + top course & next live class
- [x] **Courses** — grid with Edit/Analytics, Create New card
- [x] **Schedule** — upcoming classes list + quick-schedule form
- [x] **Students** — searchable data table with progress bars & status badges
- [x] **Uploads** — drag-and-drop zone + file input + attach-to-lesson panel

## Design System
- Palette: `#0a0a0a` background, `#fafafa` foreground, `hsl(357 93% 47%)` primary red
- Sharp corners (`radius: 0.25rem`), subtle 1px borders, crystal-glass nav (`backdrop-blur-2xl`)
- Animations: fade-up, marquee, pulse-red CTA
- All interactive elements have `data-testid`

## Testing Status
- Iteration 1 (Feb 18, 2026): 100% frontend pass across 12 test groups. No bugs.

## Backlog / Not Implemented (P1/P2)
- **P1** Real backend (FastAPI + MongoDB): auth, courses CRUD, live class scheduling, payment history
- **P1** Stripe test-mode integration for checkout
- **P1** Real video upload → object storage (instructor uploads)
- **P2** Emergent-managed Google Auth
- **P2** Instructor earnings split/payouts
- **P2** Student → instructor messaging / Q&A
- **P2** Keyboard course content (currently placeholder)
- **P2** Recital booking flow & student progression certificates
- **P2** Push/email reminders for live classes

## Next Tasks
1. Collect client feedback on UI polish and iterate on typography / imagery / copy
2. Decide on backend stack + integrate real auth
3. Wire one end-to-end real flow (Student signup → enroll in Guitar Foundations → watch lesson → mark complete) to prove the integration contract
