import { Request, Response, NextFunction } from 'express';

export function requireApiKey(req: Request, res: Response, next: NextFunction) {
  const auth = req.get('Authorization') || '';
  const token = auth.replace(/^Bearer\s+/i, '').trim();
  const expected = process.env.COPILOT_KEY || '';
  if (!token || !expected || token !== expected) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  next();
}
