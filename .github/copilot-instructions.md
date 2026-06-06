# Chatbot AI - Development Instructions

## Project Overview
This is a full-stack application combining Next.js frontend, Express backend, and Supabase database for AI-powered task management and chat assistance.

## Getting Started

### 1. Initial Setup
```bash
# Install all dependencies (root level)
npm install
```

### 2. Environment Configuration
- Copy `.env.example` to create `.env.local` files in both frontend and backend folders
- Add your Supabase credentials
- Update API endpoints if running on different ports

### 3. Development Workflow

**Start Backend:**
```bash
cd backend
npm run dev
```

**Start Frontend (in another terminal):**
```bash
cd frontend
npm run dev
```

## Project Architecture

### Frontend (Next.js)
- **pages/**: Next.js pages and routing
- **components/**: Reusable React components
- **utils/**: API service functions
- **styles/**: Global and component styles
- **hooks/**: Custom React hooks

### Backend (Express)
- **routes/**: API endpoint definitions
- **controllers/**: Business logic
- **models/**: Data models and schemas
- **config/**: Configuration (Supabase, etc.)
- **middleware/**: Express middleware (CORS, auth, etc.)

### Shared
- **types/**: TypeScript interfaces and types
- **constants/**: Application-wide constants

## Key Features (To Be Implemented)

- ✅ Project structure
- 🚧 User authentication (Supabase Auth)
- 🚧 Task CRUD operations
- 🚧 AI chat integration
- 🚧 Message persistence
- 🚧 Real-time updates

## Database Setup (Supabase)

### Tables to Create:
1. **users** - User profiles
2. **tasks** - Task management
3. **messages** - Chat messages

See Supabase documentation for detailed schema.

## Important Notes

- Frontend runs on `localhost:3000`
- Backend runs on `localhost:5000`
- Both communicate via REST API
- Use TypeScript for type safety
- Follow existing code patterns

## Troubleshooting

- **CORS errors**: Check FRONTEND_URL in backend .env
- **API 404**: Verify routes are defined in backend
- **Supabase errors**: Check credentials in .env files
- **Module errors**: Run `npm install` in affected directory

## Next Development Steps

1. Create Supabase tables and configure RLS
2. Implement authentication pages
3. Build task management UI components
4. Create AI service integration
5. Add real-time chat features

---

For detailed documentation, see README.md
