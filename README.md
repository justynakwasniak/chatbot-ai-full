# 🤖 Task Chatbot AI - Full Stack Project

A modern full-stack application for managing tasks with AI-powered chat assistance using Supabase, React/Next.js, and Express.

## 📋 Project Structure

```
chatbot-ai/
├── frontend/                 # Next.js React application
│   ├── pages/               # Page components and routes
│   ├── components/          # Reusable React components
│   ├── hooks/              # Custom React hooks
│   ├── styles/             # Global styles and CSS
│   ├── utils/              # Utility functions and API services
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                 # Express.js API server
│   ├── src/
│   │   ├── routes/        # API route handlers
│   │   ├── controllers/   # Business logic
│   │   ├── middleware/    # Express middleware
│   │   ├── models/        # Data models
│   │   ├── config/        # Configuration files (Supabase, etc.)
│   │   ├── app.ts         # Express app setup
│   │   └── server.ts      # Server entry point
│   ├── package.json
│   └── tsconfig.json
│
├── shared/                  # Shared types and constants
│   ├── types/              # TypeScript type definitions
│   └── constants/          # Application constants
│
├── .env.example            # Environment variables template
├── README.md               # This file
└── project.config.json     # Project configuration
```

## 🚀 Tech Stack

- **Frontend**: React 18, Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **API Communication**: Axios
- **Development**: ts-node, ESLint

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Frontend Setup

```bash
cd frontend
npm install
```

### Backend Setup

```bash
cd backend
npm install
```

## 🔧 Environment Configuration

Create a `.env.local` file in both `frontend` and `backend` directories:

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**Backend (.env)**
```
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_service_role_key
```

## 🏃 Running the Project

### Development Mode

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Production Build

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
cd frontend
npm run build
npm start
```

## 📚 API Endpoints

### Tasks
- `GET /api/tasks` - Get all tasks
- `GET /api/tasks/:id` - Get task by ID
- `POST /api/tasks` - Create new task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

### Chat
- `POST /api/chat/message` - Send message to AI
- `GET /api/chat/task/:task_id` - Get messages for task
- `GET /health` - Health check

## 🗄️ Database Schema (Supabase)

### Tables to create:
- `tasks` - Task management
- `messages` - Chat messages
- `users` - User profiles

See `backend/src/models/` for schema details.

## 🔐 Security Considerations

- Use environment variables for sensitive data
- Implement proper authentication with Supabase
- Validate all API inputs
- Use CORS appropriately

## 📝 Project Status

🚧 **Early Development** - Basic project structure and architecture setup complete. Ready for:
- Feature implementation
- Database schema creation
- UI component development
- API endpoint expansion

## 📄 License

MIT

---

**Next Steps:**
1. Set up Supabase project and obtain credentials
2. Configure environment variables
3. Create database tables in Supabase
4. Implement core features (task CRUD, AI chat)
5. Add authentication

