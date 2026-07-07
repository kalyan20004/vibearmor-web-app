<div align="center">
  <img src="docs/logo.png" alt="VibeArmor Logo" width="200" height="200">
  <h1>🛡️ VibeArmor</h1>
  <p><strong>Next-Generation Autonomous Deadline Intelligence Agent</strong></p>
  
  <p>
    <a href="https://vibearmor-web-app.onrender.com">Live Demo</a> •
    <a href="#-the-problem">The Problem</a> •
    <a href="#-solution--features">Features</a> •
    <a href="#-technical-implementation">Technical Implementation</a> •
    <a href="#%EF%B8%8F-google-technologies-utilized">Google Integrations</a>
  </p>
</div>

---

## 📸 Application Showcase

> **Note to Maintainer:** Place your screenshots in the `docs/` folder to populate these previews!

### Seamless Google OAuth Login
![Login Page](docs/login.png)
*Secure, 1-click Google OAuth 2.0 authentication granting the Sentinel necessary Calendar and Task permissions.*

### The Sentinel Dashboard
![VibeArmor Dashboard](docs/dashboard.png)
*The central command hub where the Sentinel monitors active deadlines, risk scores, and dynamically adjusts your calendar.*

### Crisis Mode (Screen Takeover)
![Crisis Mode Interventions](docs/crisis-mode.png)
*An aggressive, full-screen takeover activated when a deadline is mathematically at risk. Includes Lofi focus radio, locked-down navigation, and an AI-drafted extension email.*

### VibeArmor Co-Pilot
![AI Co-Pilot](docs/co-pilot.png)
*A fully integrated conversational AI assistant featuring native Voice Input (Microphone) and dynamic Google Calendar scheduling.*

---

## 🌪 The Problem

Traditional productivity tools and calendars are fundamentally passive; they rely entirely on the user's discipline. They send a push notification, which is instantly dismissed, and then they give up. When a user's discipline fails—due to procrastination, burnout, or ADHD—the tool fails with them. 

There is a critical need for a system that doesn't just *remind* you to work, but actively **intervenes** to protect your deadlines. We need a shift from passive task management to **Autonomous Deadline Intelligence**.

## 🚀 Solution & Features

**VibeArmor** replaces the passive "to-do list" with a proactive "Sentinel" that lives in the background.

- **The Sentinel AI (Autonomous Agentic Depth):** A true background agent powered by a strict cron-loop. It reads the database, assesses deadline risks, and autonomously pushes subtask updates to your Google Calendar without any human input.
- **Priority Conflict Resolution:** If you add a new project, the Sentinel intelligently cross-references your database to detect overlapping deadlines and automatically resolves scheduling conflicts.
- **Dynamic Risk Calibration:** VibeArmor learns from your procrastination patterns. If you frequently finish tasks at the last minute, the AI artificially inflates your future risk scores to trigger early interventions.
- **Crisis Mode (Screen Takeover):** When you are failing, the app stops being polite. Crisis Mode locks down your screen, uses the Web Speech API to give you a stern audio warning, and plays distraction-free Lofi beats to trap you in a productive state.
- **AI Extension Drafter:** If the AI determines you cannot mathematically finish the task in time, it automatically drafts a highly professional extension request to your professor/manager and provides a 1-click button to open Gmail natively.

---

## 🧠 Technical Implementation

VibeArmor is built using a modern, highly scalable full-stack architecture, deeply integrated with the Google ecosystem.

### Frontend (Product Experience & Design)
- **Framework:** React 19 + TypeScript + Vite
- **Styling:** We engineered a premium, dark-mode glassmorphism aesthetic using **Tailwind CSS v4**. 
- **Advanced UI Mechanics:** We utilized advanced CSS stacking contexts and **React Portals** to handle the complex, un-closable "Crisis Mode" screen takeovers, ensuring the user cannot navigate away.
- **State Management:** Complex global state for user authentication, live agent chat streaming, and dynamic calendar blocks.

### Backend (Technical Architecture)
- **Framework:** Node.js + Express + TypeScript
- **Database & Storage:** **Supabase (PostgreSQL)** handles persistent storage of users, complex task relationships (Projects -> Deadlines -> Subtasks), and historical behavioral patterns.
- **Background Cron Engine:** A decoupled `node-cron` background service acts as the "Sentinel," waking up continuously to evaluate mathematical risk scores and trigger Google Calendar mutations without the user needing to be online.
- **Real-Time Streaming:** Utilizes **Server-Sent Events (SSE)** for high-speed, typewriter-style token streaming from the AI models directly to the React frontend.

### Authentication & Security
- **OAuth 2.0:** Implemented **Passport.js** for secure Google OAuth 2.0 authentication.
- **Secure Token Management:** Securely stores Google `access_tokens` and `refresh_tokens` in the database to allow the background Sentinel agent to manage the user's calendar while they are offline.

---

## ⚙️ Google Technologies Utilized

Our application is deeply intertwined with the Google ecosystem, utilizing multiple core Google technologies to achieve true agentic depth:

1. **Google Gemini API:** We utilized Gemini (`gemini-1.5-flash` / `gemma-2-9b`) via the official `@google/generative-ai` SDK to power the core intelligence of the application. Gemini handles the complex JSON-structured task decomposition (breaking a 2-week project into 30-minute chunks), powers the conversational Co-Pilot, and dynamically generates the emergency extension emails.
2. **Google Calendar API:** We engineered a flawless, two-way read/write integration. By securely storing refresh tokens, the Sentinel Agent can autonomously create, update, and color-code calendar blocks directly on the user's primary Google Calendar.
3. **Google Tasks API:** Fully integrated with Google Tasks to ensure subtasks and checklist items generated by the AI are perfectly synced to the user's native Google workspace.
4. **Google OAuth 2.0:** We implemented strict, secure Google authentication to manage user identities and safely request the precise permissions needed for Calendar and Task modifications.
5. **Google Gmail Compose Web Interface:** We integrated direct routing to Gmail's native web compose interface (`mail.google.com`), allowing the AI to seamlessly pass its drafted extension requests directly into the user's actual email client.

---

## 📂 Project Folder Structure

VibeArmor is engineered with a clean, decoupled monolithic architecture separating the React frontend from the Node.js backend:

```text
vibearmor-web-app/
│
├── client/                     # Frontend Application (React + Vite)
│   ├── src/
│   │   ├── components/         # Reusable UI components (Dashboard, CrisisMode, AgentChat)
│   │   ├── lib/                # API clients and utility functions
│   │   ├── App.tsx             # Main React Router configuration
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.tsx            # React DOM entry point
│   ├── package.json
│   └── tailwind.config.js
│
├── server/                     # Backend Application (Node.js + Express)
│   ├── routes/                 # API endpoint definitions (auth, interventions, deadlines)
│   ├── services/               # Core business logic
│   │   ├── agentService.ts     # The Sentinel Background Cron Engine
│   │   ├── calendarService.ts  # Google Calendar API wrapper
│   │   ├── geminiService.ts    # Google Generative AI integration & streaming
│   │   └── supabaseClient.ts   # PostgreSQL Database connection
│   ├── index.ts                # Express server initialization
│   └── package.json
│
├── docs/                       # Project screenshots and assets
└── README.md
```

---

## 💻 Local Development Setup

VibeArmor uses a decoupled architecture. You will need two terminal windows to run it locally.

### 1. Start the Backend Server
```bash
cd server
npm install
npm run dev
```
*(Ensure you have created a `.env` file containing your `GEMINI_API_KEY`, `SUPABASE_URL`, and Google OAuth Credentials)*

### 2. Start the Frontend Client
```bash
cd client
npm install
npm run dev
```

Navigate to `http://localhost:5173` to interact with the Sentinel!

---
*Built with ❤️ for the Google AI Hackathon.*
