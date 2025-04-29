import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPrivateKey, getPublicKey } from '@utils/key';

export function refreshTokenMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, getPublicKey(), { algorithms: ['RS256'] });
    const exp = (decoded as any).exp * 1000;
    const now = Date.now();
    if (exp - now < 5 * 60 * 1000) {
      const newToken = jwt.sign(
        { id: (decoded as any).id, email: (decoded as any).email },
        getPrivateKey(),
        { algorithm: 'RS256', expiresIn: '1h' }
      );
      res.setHeader('x-refresh-token', newToken);
    }

    (req as any).user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token.' });
  }
}