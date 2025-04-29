import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';
import { Request, Response, NextFunction } from 'express';
import { getPrivateKey, getPublicKey } from '../utils/key';
import { get } from 'http';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] });
    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}