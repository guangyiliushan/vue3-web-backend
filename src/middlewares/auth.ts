import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';

const PUBLIC_KEY = fs.readFileSync(path.join(__dirname, '../../public.key'));

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] });
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}