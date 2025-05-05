import { expressjwt } from 'express-jwt';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { getPrivateKey, getPublicKey, getSymmetricKey } from '@utils/key';

export const authMiddleware = expressjwt({
  secret: getSymmetricKey(),
  algorithms: ['HS256'],
  requestProperty: 'body.user',
}).unless({
  path: ['/', '/test', '/user/login', '/user/salt', '/user/register'],
});

export function handleRefreshToken(req: Request, res: Response, next: NextFunction) {
  // 定义白名单路径
  const unlessPaths = ['/', '/test', '/user/login', '/user/salt', '/user/register'];

  // 如果请求路径在白名单中，直接跳过验证
  if (unlessPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers['authorization'];
  if (!authHeader) return res.status(401).json({ error: 'No token provided.' });

  const token = authHeader.split(' ')[1];
  try {
    // 验证 token
    const decoded = jwt.verify(token, getSymmetricKey(), { algorithms: ['HS256'] });
    req.body.user = decoded; // 将解码后的用户信息存储到 req.body.user
    next(); // token 有效，继续处理请求
  } catch (err) {
    // token 无效或过期，验证 refreshToken
    const refreshUser = req.body.refreshUser; // 从 express-jwt 解码的 refreshToken 信息
    if (!refreshUser) return res.status(401).json({ error: 'No refresh token provided.' });
    // 验证 refreshToken 签名
    try {
      jwt.verify(refreshUser, getPublicKey(), { algorithms: ['RS256'] }); 
    }
    catch (err) {
      return res.status(401).json({ error: 'Invalid refresh token.' }); 
    }

    const now = Math.floor(Date.now() / 1000); // 当前时间（秒）
    const exp = refreshUser.exp; // refreshToken 过期时间

    // 如果 refreshToken 剩余时间小于等于 2 天，延长 7 天
    if (exp - now <= 2 * 24 * 60 * 60) {
      const newRefreshToken = jwt.sign(
        { id: refreshUser.id },
        getPrivateKey(),
        { algorithm: 'RS256', expiresIn: '7d' }
      );
      res.setHeader('x-refresh-token', newRefreshToken);
    }

    // 生成新的 token
    const newToken = jwt.sign(
      { id: refreshUser.id },
      getSymmetricKey(),
      { algorithm: 'HS256', expiresIn: '1h' }
    );
    res.setHeader('x-token', newToken);

    req.body.user = { id: refreshUser.id }; // 将解码后的用户信息存储到 req.body.user
    next(); // 继续处理请求
  }
}