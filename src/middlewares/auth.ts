import { expressjwt } from 'express-jwt';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPrivateKey, getPublicKey, getSymmetricKey } from '@utils/key';

// export const authMiddleware = expressjwt({
//   secret: getSymmetricKey(),
//   algorithms: ['HS256'],
//   requestProperty: 'body.user',
// }).unless({
//   path: ['/', '/test', '/user/login', '/user/salt', '/user/register'],
// });

export const authMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const unlessPaths = ['/', '/test', '/user/login', '/user/salt', '/user/register','/verify/email', '/verify/phone'];

    if (unlessPaths.includes(req.path)) {
      return next();
    }

    const refreshToken = req.headers['x-refresh-token'] as string;

    const jwtMiddleware = expressjwt({
      secret: getSymmetricKey(),
      algorithms: ['HS256'],
      requestProperty: 'body.auth',
    });

    await new Promise<void>((resolve, reject) => {
      jwtMiddleware(req, res, (err) => {
        if (err) {
          if (!refreshToken) {
            return res.status(401).json({ error: 'No refresh token provided.' });
          }

          let refreshUser;
          try {
            refreshUser = jwt.verify(refreshToken, getPublicKey(), { algorithms: ['RS256'] });
          } catch (err) {
            return res.status(401).json({ error: 'Invalid refresh token.' });
          }

          const now = Math.floor(Date.now() / 1000);
          const exp = (refreshUser as any).exp;

          if (exp - now <= 2 * 24 * 60 * 60) {
            const newRefreshToken = jwt.sign(
              { id: (refreshUser as any).id },
              getPrivateKey(),
              { algorithm: 'RS256', expiresIn: '7d' }
            );
            res.setHeader('x-refresh-token', newRefreshToken);
          }

          const newToken = jwt.sign(
            { id: (refreshUser as any).id },
            getSymmetricKey(),
            { algorithm: 'HS256', expiresIn: '1h' }
          );
          res.setHeader('x-token', newToken);

          req.body.user = { id: (refreshUser as any).id };
          return resolve();
        }

        resolve();
      });
    });

    next();
  } catch (error) {
    if (!res.headersSent) {
      res.status(401).json({ error: 'Unauthorized' });
    }
  }
};