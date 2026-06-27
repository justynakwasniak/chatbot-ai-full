import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoutes from './routes/chatRoutes';
import { isProduction, logServerError, USER_ERRORS } from './utils/apiErrors';

const app: Express = express();

function normalizeOrigin(url: string): string {
  return url.replace(/\/$/, '');
}

const allowedOrigins = [
  'http://localhost:3000',
  process.env.FRONTEND_URL,
]
  .filter((origin): origin is string => Boolean(origin))
  .map(normalizeOrigin);

app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(normalizeOrigin(origin))) return callback(null, true);
    console.warn(`CORS blocked origin: ${origin}`);
    callback(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Chat routes
app.use('/api/chat', chatRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  logServerError(`${req.method} ${req.path}`, err);
  res.status(err.status || 500).json({
    success: false,
    error: isProduction() ? USER_ERRORS.SERVICE_UNAVAILABLE : (err.message || 'Internal server error'),
  });
});

export default app;
