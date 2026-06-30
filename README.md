# ⚡ NEXUS: The Agentic Productivity Sentinel

NEXUS is a highly-autonomous, agentic task management system designed to eliminate procrastination through AI-driven schedule manipulation and proactive interventions. Built for the Google AI Hackathon.

## 🏆 Hackathon Core Integrations

1. **Google Gemini 2.0 Flash API (Structured Outputs)**
   NEXUS utilizes the `@google/generative-ai` SDK's structured output schemas to force the Gemini model into a deterministic JSON format. This allows the AI to autonomously decompose massive, ambiguous tasks (e.g., "Physics Midterm") into atomic, time-bounded subtasks without regex parsing brittle text.

2. **Google Calendar API Integration**
   NEXUS doesn't just suggest a schedule—it enforces it. By integrating with `googleapis` and OAuth2, NEXUS queries your calendar for `freebusy` slots and directly executes `events.insert` to block off time for the AI-decomposed subtasks.

3. **Web Speech API (Voice-Enabled Assistance)**
   The NEXUS Co-Pilot features a voice interface. By hooking into the browser's native `webkitSpeechRecognition`, users can verbally instruct the agent to schedule tasks or trigger interventions.

## 🔥 Key Features

- **The Sentinel Background Loop**: A cron-based agent loop running on the Node.js server that constantly monitors deadline proximity.
- **Dynamic Risk Scoring**: Gemini continuously evaluates active deadlines based on time remaining vs. subtask completion, assigning a real-time `risk_score` (0-100%).
- **Proactive Interventions**: If the risk score breaches 50%, NEXUS reaches out to offer decomposition help.
- **Crisis Mode**: If the risk score breaches 80%, NEXUS initiates a full-screen lockdown. It clears low-priority calendar events and uses Gemini to automatically draft a professional, context-aware extension request to the professor/stakeholder.
- **"Time-Machine" Demo Mode**: A specialized UI panel that allows hackathon judges to fast-forward time, triggering the Sentinel loop instantly to witness the autonomous AI behavior.

## 🛠 Tech Stack

- **Client**: React 19, Vite, TypeScript, Tailwind CSS v4, React Router, Lucide Icons.
- **Server**: Node.js, Express, TypeScript, node-cron.
- **AI/APIs**: Gemini 2.0 Flash, Google Calendar API, Web Speech API.

## 🚀 How to Run

NEXUS is a decoupled architecture. You will need two terminal windows.

**1. Start the Backend Server**
```bash
cd server
npm install
npm run dev
```
*(Ensure you have created a `.env` file with your `GEMINI_API_KEY`)*

**2. Start the Frontend Client**
```bash
cd client
npm install
npm run dev
```

Navigate to `http://localhost:5173` to interact with the Sentinel. Click the "Fast-Forward Time" button in the header to simulate the background agent loop triggering Crisis Mode.

## 💡 The "Why"
Traditional to-do apps rely entirely on user discipline. NEXUS shifts the burden of discipline to the AI. It acts as an autonomous executive assistant that actively prevents failure rather than just logging it.
