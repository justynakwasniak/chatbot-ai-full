import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import 'dotenv/config';
import chatRoutes from './routes/chatRoutes';
import { getErrorMessage, getHttpStatus, isProduction, logServerError, USER_ERRORS } from './utils/apiErrors';

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

app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api/chat', chatRoutes);

app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  logServerError(`${req.method} ${req.path}`, err);
  res.status(getHttpStatus(err)).json({
    success: false,
    error: isProduction() ? USER_ERRORS.SERVICE_UNAVAILABLE : getErrorMessage(err),
  });
});

export default app;
