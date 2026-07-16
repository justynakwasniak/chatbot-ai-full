# HablaAI — AI Spanish Tutor (Demo)

A full-stack demo app for practicing Spanish with an AI tutor. Built as a **portfolio / learning project** — not a production product.

> **Demo notice**
>
> - This is a **training / showcase application**. Feel free to explore, but don’t treat it as a commercial service.
> - **No real email required.** Use any email and password to sign up (e.g. `test@example.com`). You do **not** need a real inbox — email confirmation is disabled for the demo.
> - **Fair use limit:** **30 user messages per account per day** (UTC). This protects the free-tier database and AI API costs if many people try the live demo.

## Demo

[![HablaAI demo](https://img.youtube.com/vi/nVaOx6Gl5N4/hqdefault.jpg)](https://www.youtube.com/watch?v=nVaOx6Gl5N4)

## Features

- Email + password auth (Supabase)
- Per-user chat history stored in PostgreSQL
- AI replies via Groq (`llama-3.3-70b-versatile`)
- Create, switch, and delete conversations
- Mobile-friendly chat UI with keyboard-aware layout
- Rate limiting and basic security (JWT auth, CORS, user-scoped data)

## Tech Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | Next.js 14, React 18, TypeScript, Tailwind CSS |
| Backend | Node.js, Express, TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (anon key on frontend, JWT on API) |
| AI | Groq API |

## Project Structure

```
chatbot-ai/
├── frontend/                 # Next.js app (Vercel)
│   ├── app/                  # App Router (layout, page)
│   ├── components/
│   │   ├── auth/             # Login / sign-up
│   │   └── chat/             # Chat UI
│   └── lib/                  # API client, Supabase, types
│
├── backend/                  # Express API (Render)
│   ├── src/
│   │   ├── routes/           # HTTP endpoints
│   │   ├── middleware/       # Auth (JWT)
│   │   ├── services/         # DB + Groq
│   │   ├── config/           # Supabase client
│   │   └── utils/            # User-facing errors
│   └── supabase/             # SQL schema & migrations
│
├── .env.example
└── render.yaml               # Backend deploy config
```

## Prerequisites

- Node.js 18+
- npm
- [Supabase](https://supabase.com) project
- [Groq](https://groq.com) API key

## Setup

### 1. Install dependencies

From the repo root (npm workspaces):

```bash
npm install
```

Or install separately in `frontend/` and `backend/`.

### 2. Database

In Supabase **SQL Editor**, run:

1. `backend/supabase/schema.sql`
2. `backend/supabase/migration-auth.sql` (if upgrading an older DB)

Enable **Email** auth in Supabase → Authentication → Providers. For the demo, you can disable email confirmation so any address works.

### 3. Environment variables

Copy `.env.example` and create:

**`frontend/.env.local`**

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**`backend/.env`**

```env
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
GROQ_API_KEY=your_groq_api_key
DAILY_MESSAGE_LIMIT=30
```

Never commit `.env` files. The backend must use the **service_role** key; the frontend only uses the **anon** key.

## Running Locally

**Terminal 1 — backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 — frontend:**

```bash
cd frontend
npm run dev
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:5000  
- Health check: http://localhost:5000/health  

Or from the root:

```bash
npm run dev
```

## Tests

Unit tests (Vitest) cover pure logic: attachment validation, API error mapping, TTS text cleanup, and message timestamps.

API route tests for `POST /api/chat/message` use mocks (no real Groq/Supabase): auth, validation, daily limit, and happy path.

```bash
npm test
```

Or separately:

```bash
npm run test --workspace=backend
npm run test --workspace=frontend
```

## API Endpoints

All chat routes except `/status` require `Authorization: Bearer <supabase_jwt>`.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health |
| `GET` | `/api/chat/status` | DB / auth status |
| `GET` | `/api/chat/conversations` | List user's conversations |
| `POST` | `/api/chat/conversations` | Create conversation |
| `GET` | `/api/chat/conversations/:id` | Get conversation + messages |
| `DELETE` | `/api/chat/conversations/:id` | Delete conversation |
| `POST` | `/api/chat/message` | Send message, get AI reply |

**Rate limit:** `POST /api/chat/message` returns `429` when the user exceeds `DAILY_MESSAGE_LIMIT` (default **30 messages/day**).

## Deployment

- **Frontend:** Vercel (`frontend/`) — set `NEXT_PUBLIC_*` env vars  
- **Backend:** Render (`backend/`, see `render.yaml`) — set `SUPABASE_*`, `GROQ_API_KEY`, `FRONTEND_URL`, optional `DAILY_MESSAGE_LIMIT`  

After deploying the backend, redeploy the frontend if you add new API routes.

## Adding a demo video to this README

1. **Record** a short screen capture (30–90 s): login → send a message → show AI reply. On Windows: **Win + G** (Xbox Game Bar) or [OBS Studio](https://obsproject.com/) (free).
2. **Upload** the video (easiest for README + LinkedIn):
   - [YouTube](https://studio.youtube.com) → **Create** → upload → set visibility to **Unlisted**
   - Copy the video ID from the URL: `youtube.com/watch?v=`**`dQw4w9WgXcQ`**
3. **Edit** the [Demo](#demo) section above: replace both `VIDEO_ID` placeholders with your ID.

**Without YouTube:** open a GitHub **Issue** in this repo, drag your `.mp4` into the comment box, wait for upload, copy the `https://github.com/user-attachments/assets/...` URL, and replace the YouTube line with that URL (GitHub embeds it automatically).

## Security (summary)

- Users can only access their own conversations (`user_id` from JWT, not request body)
- Secrets (`GROQ_API_KEY`, service role key) only on the server
- CORS restricted to `FRONTEND_URL` + localhost
- User-facing error messages; no raw stack traces in production

## License

MIT
