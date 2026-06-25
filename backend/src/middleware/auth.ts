import { Request, Response, NextFunction } from 'express';
import { getSupabase } from '../config/supabase';

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Unauthorized. Please sign in.' });
  }

  const token = authHeader.slice(7);
  const supabase = getSupabase();

  if (!supabase) {
    return res.status(503).json({ success: false, error: 'Auth not configured' });
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    return res.status(401).json({ success: false, error: 'Invalid or expired session. Please sign in again.' });
  }

  req.userId = user.id;
  next();
}
