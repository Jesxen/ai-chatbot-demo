# AI Business Chatbot Demo

A professional, full-stack AI chatbot demo for small businesses. Upload a plain-text knowledge base and instantly have a Claude-powered assistant that answers customer questions based solely on your business information.

---

## Screenshot

> After launching, you will see a clean setup screen where you enter your business name and upload a `.txt` knowledge base. Once configured, the premium chat interface opens with your brand name and a live AI assistant.

---

## Features

- **Knowledge-base grounded** — Claude only answers from your uploaded `.txt` file; no hallucination of outside facts
- **Premium chat UI** — gradient bubbles, animated typing indicator, auto-scroll, message timestamps
- **Setup flow** — drag-and-drop file upload, inline validation, instant launch
- **Conversation history** — last 10 messages sent as context so Claude follows multi-turn conversations
- **Mobile responsive** — works on phones and tablets
- **Smooth animations** — fade-in messages, animated typing dots, micro-interactions
- **Error handling** — inline error states, graceful API error surfaces
- **Vercel ready** — `vercel.json` included for one-click backend deployment

---

## Prerequisites

- **Node.js 18+** (LTS recommended)
- **npm 9+**
- **Anthropic API key** — get one at https://console.anthropic.com

---

## Setup

### 1. Clone / download the project

```bash
cd C:\Users\jesus\Desktop\negocio\chatbot-demo
```

### 2. Backend setup

```bash
cd backend
npm install
```

Copy the example env file and add your API key:

```bash
copy .env.example .env
```

Open `backend/.env` and set:

```
ANTHROPIC_API_KEY=sk-ant-...your-key-here...
PORT=3001
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

The server runs on `http://localhost:3001`. You should see:

```
Chatbot backend running on http://localhost:3001
Accepting requests from: http://localhost:5173
```

### 3. Frontend setup

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173`.

---

## Environment Variables

### Backend (`backend/.env`)

| Variable           | Required | Default                  | Description                        |
|--------------------|----------|--------------------------|------------------------------------|
| `ANTHROPIC_API_KEY`| Yes      | —                        | Your Anthropic API key             |
| `PORT`             | No       | `3001`                   | Port the Express server listens on |
| `FRONTEND_URL`     | No       | `http://localhost:5173`  | CORS origin for the frontend       |

### Frontend (`frontend/.env`)

| Variable             | Required | Default                   | Description                        |
|----------------------|----------|---------------------------|------------------------------------|
| `VITE_API_URL`       | No       | `http://localhost:3001`   | Backend URL (used in production)   |
| `VITE_BUSINESS_NAME` | No       | `My Business`             | Default business name (overridden in UI) |

---

## How to Use

1. Open `http://localhost:5173` in your browser
2. **Business Name** — type your company name (e.g. "Acme Plumbing")
3. **Knowledge Base** — upload a `.txt` file with your business info:
   - Hours of operation
   - Services offered
   - Pricing
   - FAQs
   - Contact info
   - Anything customers ask about
4. Click **Launch Chatbot**
5. Start chatting — the AI will answer only from your uploaded content

### Example knowledge base (`knowledge.txt`)

```
Business: Acme Plumbing Services
Hours: Monday–Friday 8am–6pm, Saturday 9am–2pm, closed Sunday
Emergency service: available 24/7 for burst pipes and flooding

Services:
- Drain cleaning: $75–$150
- Water heater installation: $400–$800
- Leak repair: $100–$300
- Full bathroom remodel: contact for quote

Contact:
Phone: (555) 123-4567
Email: info@acmeplumbing.com
Address: 123 Main St, Springfield

FAQ:
Q: Do you offer free estimates?
A: Yes, free estimates for jobs over $200.

Q: What payment methods do you accept?
A: Cash, credit card, Zelle, and Venmo.
```

---

## Deployment

### Deploy Backend to Vercel

1. Install the Vercel CLI: `npm i -g vercel`
2. From the `backend/` directory:
   ```bash
   cd backend
   vercel
   ```
3. Follow the prompts. Set environment variables in the Vercel dashboard:
   - `ANTHROPIC_API_KEY`
   - `FRONTEND_URL` (your frontend Vercel URL)

### Deploy Frontend to Vercel

1. From the `frontend/` directory:
   ```bash
   cd frontend
   vercel
   ```
2. The proxy in `vite.config.js` only applies in dev. For production, update `VITE_API_URL` in the Vercel dashboard to point to your backend deployment URL.
3. Update `FRONTEND_URL` in the backend's Vercel env vars to match your frontend deployment URL.

---

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?logo=tailwindcss&logoColor=white&style=flat-square)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white&style=flat-square)
![Express](https://img.shields.io/badge/Express-4-000000?logo=express&logoColor=white&style=flat-square)
![Claude](https://img.shields.io/badge/Claude-Haiku-FF6B35?logo=anthropic&logoColor=white&style=flat-square)

| Layer    | Technology                              |
|----------|-----------------------------------------|
| Frontend | React 18, Vite 5, Tailwind CSS 3        |
| Icons    | Lucide React                            |
| Backend  | Node.js, Express 4, ES Modules          |
| AI       | Anthropic Claude (claude-haiku-4-5-20251001) |
| Upload   | Multer (memory storage)                 |
| Hosting  | Vercel (frontend + backend)             |

---

## Project Structure

```
chatbot-demo/
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   ├── server.js          — Express app, CORS, middleware
│   ├── vercel.json        — Vercel serverless config
│   └── routes/
│       ├── chat.js        — POST /api/chat → Claude API
│       └── upload.js      — POST /api/upload → in-memory KB store
└── frontend/
    ├── package.json
    ├── index.html
    ├── vite.config.js     — Dev proxy /api → localhost:3001
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── .env.example
    └── src/
        ├── main.jsx
        ├── index.css      — Tailwind + custom animations
        ├── App.jsx        — Root state, setup/chat routing
        └── components/
            ├── SetupPanel.jsx     — Initial configuration card
            ├── Header.jsx         — Chat header with branding
            ├── ChatWindow.jsx     — Scrollable message list
            ├── ChatMessage.jsx    — Individual message bubble
            ├── TypingIndicator.jsx — Animated "thinking" dots
            └── ChatInput.jsx      — Auto-resize textarea + send
```
