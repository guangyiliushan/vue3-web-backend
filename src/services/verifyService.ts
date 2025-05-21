import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import Redis from 'ioredis';

const redis = new Redis();

// 邮箱验证码有效期（秒）
const EMAIL_CODE_EXPIRATION = 300;

let transporter = nodemailer.createTransport({
    host: 'smtp.126.com',
    port: 25,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 发送邮箱验证码
export const sendEmailCode = async (req: Request, res: Response, next: NextFunction) => {
  const { user, verify } = req.body;

  if (!user || !verify?.email || !user.id) {
    return res.status(400).json({ error: 'User email and ID are required.' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `verify:email:code:${user.id}:${verify.email}`;

    await redis.set(key, code, 'EX', EMAIL_CODE_EXPIRATION);

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: verify.email,
      subject: 'Your Verification Code',
      text: `Your verification code is: ${code}`,
    });

    res.success({ message: 'Verification code sent successfully.' });
  } catch (error) {
    next(error);
  }
};

// 验证邮箱验证码
export const verifyEmailCode = async (req: Request, res: Response, next: NextFunction) => {
  const { user, verify } = req.body;

  if (!user || !verify?.email || !user.id || !verify.code) {
    return res.status(400).json({ error: 'User email, ID, and verification code are required.' });
  }

  try {
    const key = `verify:email:code:${user.id}:${verify.email}`;
    const storedCode = await redis.get(key);

    if (!storedCode) {
      return res.status(400).json({ error: 'Verification code expired or not found.' });
    }

    if (storedCode !== verify.code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await redis.del(key);
    res.success({ message: 'Verification code verified successfully.' });
  } catch (error) {
    next(error);
  }
};

// 发送手机验证码
export const sendPhoneCode = async (req: Request, res: Response, next: NextFunction) => {
  const { user, verify } = req.body;

  if (!user || !verify?.phone || !user.id) {
    return res.status(400).json({ error: 'User phone and ID are required.' });
  }

  try {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const key = `verify:phone:code:${user.id}:${verify.phone}`;

    await redis.set(key, code, 'EX', EMAIL_CODE_EXPIRATION);

    // 假设有一个 sendSMS 方法发送短信
    // await sendSMS(verify.phone, `Your verification code is: ${code}`);

    res.success({ message: 'Verification code sent successfully.' });
  } catch (error) {
    next(error);
  }
};

// 验证手机验证码
export const verifyPhoneCode = async (req: Request, res: Response, next: NextFunction) => {
  const { user, verify } = req.body;

  if (!user || !verify?.phone || !user.id || !verify.code) {
    return res.status(400).json({ error: 'User phone, ID, and verification code are required.' });
  }

  try {
    const key = `verify:phone:code:${user.id}:${verify.phone}`;
    const storedCode = await redis.get(key);

    if (!storedCode) {
      return res.status(400).json({ error: 'Verification code expired or not found.' });
    }

    if (storedCode !== verify.code) {
      return res.status(400).json({ error: 'Invalid verification code.' });
    }

    await redis.del(key);
    res.success({ message: 'Verification code verified successfully.' });
  } catch (error) {
    next(error);
  }
};