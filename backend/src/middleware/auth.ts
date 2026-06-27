import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';
import { USER_ERRORS } from '../utils/apiErrors';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: USER_ERRORS.UNAUTHORIZED });
  }

  const token = authHeader.slice(7);
  const supabase = getSupabase();

  if (!supabase) {
    return res.status(503).json({ success: false, error: USER_ERRORS.SERVICE_UNAVAILABLE });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: USER_ERRORS.SESSION_EXPIRED });
  }

  req.userId = user.id;
  next();
}
