# Cloud Advisor - Interactive Q&A System

An AI-powered Q&A system built with **Next.js 16**, **FastAPI**, and **Google Gemini**. This application serves as a Cloud Advisor, helping users understand Google Cloud Platform, Google Workspace, and cloud migration strategies.
This is an Assessment Project - Built for Pawa IT Solutions Full-Stack Developer Assessment

---
View the live app at
[Backend](https://interactive-qa-system-production.up.railway.app)

[frontend](https://interactive-qa-system.vercel.app/)

---

## Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Architecture Overview](#-architecture-overview)
- [How It Works](#-how-it-works)
- [Design Decisions](#-design-decisions--why-we-built-it-this-way)
- [Project Structure](#-project-structure)
- [Local Development](#-local-development-setup)
- [API Documentation](#-api-endpoints)
- [Deployment Guide](#-deployment)
- [Limitations](#-known-limitations)
- [Future Enhancements](#-future-enhancements)
- [License](#-license)

---

## Features

- **Streaming AI Responses** - Real-time response generation using Vercel AI SDK
- **Conversation History** - Persistent storage of chat sessions with SQLite
- **Dark/Light Mode** - Theme toggle with system preference detection
- **Modern UI** - Responsive design with shadcn/ui and TailwindCSS
- **Cloud Expertise** - Specialized in Google Cloud and Workspace guidance
- **Swagger API Docs** - Interactive API documentation at `/docs`

---

## Tech Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend | Next.js 16, React 19, TailwindCSS | Latest stable, excellent DX, built-in API routes |
| UI Components | shadcn/ui, Lucide Icons | Accessible, customizable, no vendor lock-in |
| AI Integration | Vercel AI SDK, Google Gemini 2.5 Flash | Best streaming DX, generous free tier |
| Backend | Python 3.11+, FastAPI | Async support, auto-generated OpenAPI docs |
| ORM | SQLModel | Combines SQLAlchemy + Pydantic validation |
| Database | SQLite | Zero-config whichis good for prototyping |
| Deployment | Vercel + Railway | Free tiers, Git-based CI/CD |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        VERCEL (Frontend)                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │   Next.js App   │───▶│  /api/chat      │───▶│  Vercel AI SDK  │  │
│  │   (React 19)    │    │  (Route Handler)│    │  + Gemini API   │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
│           │                                              │           │
│           │              Streaming Response              │           │
│           ◀──────────────────────────────────────────────┘           │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                      Conversation CRUD (REST)
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        RAILWAY (Backend)                             │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐  │
│  │    FastAPI      │───▶│    SQLModel     │───▶│     SQLite      │  │
│  │   (Uvicorn)     │    │   (Pydantic)    │    │   (File DB)     │  │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **User sends message** -> Frontend captures input
2. **Streaming request** -> Next.js API route calls Gemini via Vercel AI SDK
3. **Real-time response** -> Chunks streamed to UI as they generate
4. **Persistence** -> Complete Q&A pair saved to FastAPI backend
5. **History retrieval** -> Previous conversations loaded from SQLite

---

## How It Works

### 1. Chat Flow (Streaming)

```typescript
// Frontend: app/api/chat/route.ts
const result = streamText({
  model: google('gemini-2.5-flash'),
  system: CLOUD_ADVISOR_PROMPT,
  messages: conversationHistory,
});
return result.toDataStreamResponse();
```

The Vercel AI SDK handles:

- Streaming tokens as Server-Sent Events (SSE)
- Automatic error handling and retries

### 2. Conversation Persistence

```python
# Backend: After each complete exchange
POST /api/conversations/{id}/messages
[
  {"role": "user", "content": "How do I set up GCS?"},
  {"role": "assistant", "content": "Here's how..."}
]
```

Messages are saved in pairs after the AI finishes responding, ensuring we only persist complete exchanges.

### 3. State Management

```
┌─────────────────────────────────────────────────┐
│                  React State                     │
├─────────────────────────────────────────────────┤
│  messages[]        - Current chat messages       │
│  conversations[]   - Sidebar list                │
│  currentId         - Active conversation UUID   │
│  isLoading         - Streaming status            │
└─────────────────────────────────────────────────┘
```

React's `useState` is used in this project for simplicity. inlarger projects, Zustand or Redux should be considered for more complex state management.

---

## Design Decisions

### Why SQLite Instead of PostgreSQL?

| Factor | SQLite | PostgreSQL |
|--------|--------|------------|
| **Setup Complexity** | Zero config, single file | Requires server, connection pooling |
| **Cost** | Free (file-based) | Requires hosted instance ($7+/month) |
| **Scalability** | Single-user, ~100k requests/day | Multi-user, millions of requests |
| **ACID Compliance** | Full support | Full support |
| **Concurrency** | Limited (file locking) | Excellent (MVCC) |

For this assessment project, I chose SQLite's due to its simplicity and zero operational overhead.

1. **Zero operational overhead** - No database server to manage
2. **Portable** - Database is a single file, easy to reset/backup
3. **Fast for reads** - Chat history is read-heavy, SQLite excels here
4. **Production-ready** - SQLite handles 100k+ daily requests
5. **Easy migration path** - SQLModel/SQLAlchemy makes switching to PostgreSQL trivial

```python
# Switching to PostgreSQL is one line change:
# From: DATABASE_URL=sqlite:///./conversations.db
# To:   DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### Why Vercel AI SDK Instead of Direct API Calls?

| Direct Fetch | Vercel AI SDK |
|--------------|---------------|
| Manual SSE parsing | Built-in streaming |
| Custom error handling | Automatic retries |
| No TypeScript types | Full type safety |
| ~50 lines of code | ~10 lines of code |

Generally it's easier to use the Vercel AI SDK for streaming LLMs due to its abstractions and built-in features. And it is already battle-tested in production at Vercel.

### Why shadcn/ui?

I chose shadcn/ui because it copies components into your project, giving full control and zero runtime dependency.

---

## Project Structure

```
interactive-qa-system/
├── backend/                 # FastAPI backend
│   ├── app/
│   │   ├── main.py         # FastAPI entry point + OpenAPI config
│   │   ├── config.py       # Pydantic Settings (env vars)
│   │   ├── database.py     # SQLite engine setup
│   │   ├── models.py       # SQLModel schemas with validation
│   │   └── routers/
│   │       └── conversations.py  # CRUD endpoints
│   ├── requirements.txt
│   └── railway.toml        # Railway deployment config
│
├── frontend/               # Next.js frontend
│   ├── app/
│   │   ├── api/chat/route.ts    # Streaming AI endpoint
│   │   ├── globals.css          # Tailwind + shadcn variables
│   │   ├── layout.tsx           # Root layout + ThemeProvider
│   │   └── page.tsx             # Main chat interface
│   ├── components/
│   │   ├── ui/                  # shadcn/ui components
│   │   ├── ChatContainer.tsx    # Main chat wrapper
│   │   ├── ChatMessage.tsx      # Message bubble + markdown
│   │   ├── ChatInput.tsx        # Input with send button
│   │   ├── ConversationSidebar.tsx  # History sidebar
│   │   ├── WelcomeScreen.tsx    # Initial state UI
│   │   ├── theme-provider.tsx   # Dark mode context
│   │   └── theme-toggle.tsx     # Theme switcher
│   ├── lib/
│   │   ├── api.ts              # Backend API client
│   │   ├── types.ts            # TypeScript interfaces
│   │   └── utils.ts            # cn() utility
│   └── package.json
│
├── PROMPTS.md              # AI system prompt documentation
└── README.md               
```

---

## Local Development Setup

### Prerequisites

- Node.js 18+ and pnpm
- Python 3.11+
- Google AI Studio API Key ([gotten here](https://aistudio.google.com/apikey))

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/interactive-qa-system.git
cd interactive-qa-system
```

### 2. Backend Setup

```bash
cd backend

python -m venv venv
.\venv\Scripts\activate  

# Install deps
pip install -r requirements.txt

# Create environment file
echo "FRONTEND_URL=http://localhost:3000" > .env

# Start the server
uvicorn app.main:app --reload --port 8000
```
The API docs will be available a http://127.0.0.1:8000/docs

### 3. Frontend Setup

```bash
cd frontend

# Install deps
pnpm install

# Copy .env.example to your .env fileand change the env variables

# Start development server
pnpm dev
```
---

## API Endpoints

### Backend REST API

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | API info and links |
| `GET` | `/health` | Health check for monitoring |
| `GET` | `/docs` | Swagger UI documentation |
| `GET` | `/redoc` | ReDoc documentation |
| `GET` | `/api/conversations` | List all conversations |
| `POST` | `/api/conversations` | Create new conversation |
| `GET` | `/api/conversations/{id}` | Get conversation with messages |
| `PATCH` | `/api/conversations/{id}` | Update conversation title |
| `DELETE` | `/api/conversations/{id}` | Delete conversation |
| `POST` | `/api/conversations/{id}/messages` | Add messages |
| `GET` | `/api/conversations/{id}/messages` | Get all messages |

### Frontend API Route

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/chat` | Streaming chat with Gemini |

---

## Deployment

### Frontend -> Vercel

1. Push code to GitHub
2. Import repository in [Vercel](https://vercel.com)
3. Set **Root Directory**: `frontend`
4. Add environment variables:
   - `GOOGLE_GENERATIVE_AI_API_KEY`
   - `NEXT_PUBLIC_BACKEND_URL`
5. Deploy (auto CI/CD on every push)

### Backend -> Railway

1. Create project in [Railway](https://railway.app)
2. Connect GitHub repository
3. Set **Root Directory**: `backend`
4. Add environment variable:
   - `FRONTEND_URL` (your Vercel URL)
5. Deploy (auto CI/CD on every push)

---

## ⚠️ Known Limitations

### Current Constraints

| Limitation | Impact | Mitigation |
| ------------ | -------- | ------------ |
| **SQLite single-writer** | Only one write at a time | In production Postgresql is most suitable |
| **No authentication** | Anyone can access any conversation | Better auth is usually my go to choice |
| **No rate limiting** | API abuse possible | Add FastAPI-Limiter or Vercel's built-in limits |
| **Memory-only context** | AI doesn't remember across sessions | Context is rebuilt from DB on each request |
| **No message editing** | Can't modify sent messages | Would need optimistic updates + API endpoint |
| **No file uploads** | Text-only input | Gemini supports multimodal promts |

### Technical Debt

1. **Error boundaries** - Need proper React error boundaries for production
2. **Loading states** - Could add skeleton loaders for better UX
3. **Analytics** - No usage tracking or monitoring

---

## 📄 License

MIT License - Feel free to use this project for learning and development.

---

## Author

Built by Kite Eugine for **Pawa IT Solutions** Full-Stack Developer Assessment
