# RankUp 🎯

## Basic Details

**Team Name:** Team RankUp

### Team Members
- **Member 1:** Hannah Elizabeth George — MITS Kochi 
- **Member 2:** Nanda Rajeev - MITS Kochi

### Hosted Project Link
https://rankup100.vercel.app/

---

## Project Description

RankUp is a Codeforces-style competitive exam preparation platform for JEE, NEET, and GATE aspirants. Students solve rated questions, earn or lose Elo rating points based on performance and speed, and compete on real-time per-exam leaderboards. Every question has a difficulty rating, every subject has a weakness tracker, and every student has a live tier — from Aspirant all the way to Legend.

---

## The Problem Statement

Over 5.1 million students appear for JEE, NEET, and GATE every year, yet 91% of JEE/NEET aspirants don't clear on their first attempt. The core issue is that existing platforms — Allen, Unacademy, Testbook — give students scores from mock tests but never tell them where they actually stand relative to peers. There is no real-time competitive ranking, no subject-wise weakness tracking, no gamification, and no single platform that handles all three exams together. Students are preparing blind.

---

## The Solution

RankUp brings the competitive rating system from programming platforms like Codeforces into the exam prep space. Every question in the system has an Elo rating. Students solve questions under a timer, and their rating goes up or down based on correctness and speed. This creates a live, accurate picture of a student's skill level. Separate leaderboards for JEE, NEET, and GATE let students compete fairly within their own exam pool. A weakness engine tracks accuracy per subject and topic and surfaces critical gaps automatically. Streaks, tier badges, and speed bonuses keep students engaged and coming back daily.

---

## Technical Details

### Technologies / Components Used

**Languages Used:**
- JavaScript (React / Next.js frontend)
- SQL (PostgreSQL database queries)

**Frameworks Used:**
- Next.js 14 (React framework with server-side rendering, backend API server)

**Libraries Used:**
- React (UI component library)
- Custom Elo rating engine (built in-house)
- Redis client (leaderboard caching)
- ws (WebSocket library for real-time leaderboard updates)

**Tools Used:**
- VS Code
- Git & GitHub
- Vercel (frontend deployment)
- Supabase (backend + database hosting)

---

## Features

- **Multi-Exam Support:** Fully separate rating systems, question pools, leaderboards, and subject breakdowns for JEE (Physics / Chemistry / Maths), NEET (Physics / Chemistry / Biology), and GATE (Engineering Maths / Core Subject / Aptitude). Switch between exams with a single click.

- **Elo Rating System:** Every question has a difficulty rating (like chess pieces). Solve a hard question correctly and gain more rating. Get an easy one wrong and lose more. Your rating converges to your true skill level over time. Speed bonuses reward fast correct answers.

- **Live Per-Exam Leaderboards:** Real-time ranked leaderboards for each exam, powered by WebSockets. Your position updates the moment you submit an answer. See exactly where you stand — globally and within your exam pool.

- **Weakness Engine:** The platform tracks your accuracy per subject and per topic across every attempt. It automatically identifies your critical weak spots and surfaces them prominently on your dashboard so you know exactly what to study next.

- **Gamified Progression:** Six tier levels (Aspirant → Scholar → Expert → Grandmaster → Master → Legend), streak tracking, speed badges, and exam-specific achievements (JEE Grinder, NEET Scholar, GATE Engineer). Progress feels rewarding, not just functional.

- **Solve Mode with Timer:** A countdown timer starts when you select your first answer option. Correct answers under 30 seconds earn +5 speed bonus, under 60 seconds earn +3. The timer turns gold then red as time runs low.

---

## Implementation

### For Software

#### Installation

```bash
# Clone the repository
git clone https://github.com/team-rankup/rankup.git
cd rankup

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

#### Run

```bash
# Start the backend server (from /backend)
npm run dev
# Backend runs at http://localhost:4000

# Start the frontend (from /frontend)
npm run dev
# Frontend runs at http://localhost:3000

# Or run the single-file demo version directly
# Place rankup_v3.jsx in src/app/rankup/page.tsx
# Add "use client" as the first line
# Then:
npm run dev
# Visit http://localhost:3000/rankup
```

---

## Project Documentation

### For Software

#### Screenshots

<img width="1920" height="1020" alt="dashboard" src="https://github.com/user-attachments/assets/1cc96a1d-8efa-4f24-8149-57c897960404" />

*Main dashboard showing the student's JEE rating (1248), 12-day streak, Next Rated Challenge card, and subject performance cards for Physics, Chemistry, and Mathematics — each with their individual ratings and critical weakness indicators.*

<img width="1920" height="1020" alt="solve" src="https://github.com/user-attachments/assets/5b962ff7-7c2a-4882-ad3f-32af7590f11e" />

*The Solve Mode page showing a JEE Physics question with a 90-second countdown timer, four answer options (option D selected and highlighted in green), subject filter tabs at the top (Physics active), and difficulty/topic tags.*

<img width="1920" height="1020" alt="leaderboard" src="https://github.com/user-attachments/assets/3ae66082-7dc7-42d0-b266-535d5bb23a43" />

*The Global Leaderboard page for JEE, showing the top-ranked students with their ratings, tier badges (Legend, Master, Grandmaster), daily streaks, and today's rating change. The current user (Aryan Sharma, rank #8) is highlighted in green. The right panel shows the user's standings across all three exams — JEE, NEET, and GATE.*

<img width="1920" height="1020" alt="result" src="https://github.com/user-attachments/assets/73248ee9-329c-4021-ab5f-e21788bf824c" />

*The result feedback modal that appears after submitting an answer, showing "Correct!" with the rating delta (+20), speed bonus (+5), and buttons to review the answer or move to the next question.*

---

### Diagrams

#### System Architecture

```
┌─────────────────────────────────────────────────┐
│                   BROWSER                        │
│  Next.js Frontend (React, Inline CSS, SVG)       │
│  Pages: Dashboard, Solve, Leaderboard,           │
│         History, Progress, Badges, Profile       │
└──────────────────┬──────────────────────────────┘
                   │  REST + WebSocket
┌──────────────────▼──────────────────────────────┐
│              Next.js API SERVER                   │
│  GET  /api/question?exam=JEE&subject=Physics     │
│  POST /api/solve                                 │
│  GET  /api/leaderboard?exam=JEE                  │
│  WS   /leaderboard-live                          │
└────────┬────────────────────┬────────────────────┘
         │                    │
┌────────▼────────┐  ┌────────▼────────┐
│   PostgreSQL    │  │   Redis Cache   │
│  - users        │  │  - ratings      │
│  - questions    │  │  - leaderboard  │
│  - attempts     │  │    snapshots    │
│  - ratings      │  └─────────────────┘
└─────────────────┘
```

*The frontend communicates with the Express API over REST for question fetching and answer submission, and over WebSocket for real-time leaderboard updates. PostgreSQL stores all persistent data. Redis caches leaderboard queries for sub-100ms response times.*

#### Application Workflow

```
Student logs in
      │
      ▼
Selects Exam (JEE / NEET / GATE)
      │
      ▼
Selects Subject
      │
      ▼
System fetches rated question from pool
      │
      ▼
Student reads question → starts timer → selects answer
      │
      ├── Correct + Fast ──→ +15 to +20 rating + speed bonus
      │
      └── Wrong ──────────→ -7 rating
             │
             ▼
      Rating updates in DB → Redis cache invalidated
             │
             ▼
      WebSocket pushes new leaderboard to all clients
             │
             ▼
      Student sees updated rank, tier badge, streak
```

---

## Additional Documentation

### API Documentation

**Base URL:** `[https://api.rankup.dev]`

---

#### `GET /api/question`

Fetches a random rated question from the pool for the specified exam and subject.

**Parameters:**
- `exam` (string): One of `JEE`, `NEET`, `GATE`
- `subject` (string): Subject name matching the exam — e.g., `Physics`, `Biology`, `Core Subject`

**Response:**
```json
{
  "id": "jp1",
  "text": "A ball is projected at 30° with speed 20 m/s. What is the range? (g = 10 m/s²)",
  "options": ["20√3 m", "34.6 m", "40 m", "Both A & B"],
  "difficulty": "Medium",
  "topic": "Projectile Motion",
  "qRating": 1280,
  "exam": "JEE",
  "subject": "Physics"
}
```

---

#### `POST /api/solve`

Submits a student's answer, calculates the result and rating delta, and records the attempt.

**Request Body:**
```json
{
  "userId": "user_abc123",
  "questionId": "jp1",
  "selectedOption": 3,
  "timeTaken": 24,
  "exam": "JEE"
}
```

**Response:**
```json
{
  "correct": true,
  "correctIndex": 3,
  "ratingDelta": 20,
  "speedBonus": 5,
  "newRating": 1268,
  "explanation": "Both 34.6m and 20√3m are correct — range formula R = v²sin(2θ)/g confirms both answers."
}
```

---

#### `GET /api/leaderboard`

Returns the ranked leaderboard for a specific exam.

**Parameters:**
- `exam` (string): One of `JEE`, `NEET`, `GATE`
- `limit` (integer, optional): Number of entries to return. Default: 50

**Response:**
```json
{
  "exam": "JEE",
  "updatedAt": "2025-02-21T10:30:00Z",
  "entries": [
    {
      "rank": 1,
      "userId": "u1",
      "name": "Priya Kapoor",
      "rating": 1842,
      "tier": "Legend",
      "streak": 34,
      "solved": 1204,
      "delta": 42
    }
  ]
}
```

---

## AI Tools Used

**Tool Used:** Claude (Anthropic)

**Purpose:** Full-stack development assistance throughout the hackathon.

**Key Prompts Used:**
- "Build a React single-file app with a dashboard, solve mode, leaderboard, and progress tracker with a dark terminal green theme matching this screenshot"
- "Refine the frontend code to have different tabs and leaderboards for different exams NEET, JEE and GATE"
- "Create a PPT template matching this idea and interface"
- "Give me a PPT for presenting this for a hackathon"

**Percentage of AI-generated code:** ~85%

**Human Contributions:**
- Product concept and problem identification (the gap in the exam prep market)
- Exam-specific domain knowledge (subject lists, topic names, difficulty calibration)
- Architecture decisions (Elo rating system design, WebSocket strategy)
- UI/UX feedback and iteration direction
- Integration planning for real backend
- Presentation strategy and hackathon pitch narrative

---

## Team Contributions

**Nanda Rajeev:** Frontend development, UI/UX design,Documentation, exam tab system, solve mode with timer

**Hannah Elizabeth George:** Backend API design, Elo rating engine, PostgreSQL schema design, REST endpoint specification, React architecture


---

## License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

*Made with ❤️ at TinkerHub*
