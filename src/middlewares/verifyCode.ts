import { Request, Response, NextFunction } from 'express';
import nodemailer from 'nodemailer';
import Redis from 'ioredis';

const redis = new Redis();

// 邮箱验证码有效期（秒）
const EMAIL_CODE_EXPIRATION = 300;

let transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// 发送邮箱验证码中间件
export const sendEmailCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>> = async (req, res) => {
    const { user } = req.body;
    if (!user || !user.email || !user.id) {
        return res.status(400).json({ error: 'User email and ID are required.' });
    }

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `verify:email:code:${user.id}:${user.email}`;

        await redis.set(key, code, 'EX', EMAIL_CODE_EXPIRATION);

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Your Verification Code',
            text: `Your verification code is: ${code}`,
        });

        return res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send verification code.' });
    }
};

// 验证邮箱验证码中间件
export const verifyEmailCode: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined> = async (req, res, next) => {
    const { user } = req.body;

    if (!user || !user.email || !user.id || !user.verifyCode) {
        return res.status(400).json({ error: 'User email, ID, and verification code are required.' });
    }

    try {
        const key = `verify:email:code:${user.id}:${user.email}`;
        const storedCode = await redis.get(key);

        if (!storedCode) {
            return res.status(400).json({ error: 'Verification code expired or not found.' });
        }

        if (storedCode !== user.verifyCode) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }
        await redis.del(key);

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to verify code.' });
    }
};
// 发送手机验证码中间件（预留）
export const sendPhoneCode: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>> = async (req, res) => {
    const { user } = req.body;

    if (!user || !user.phone || !user.id) {
        return res.status(400).json({ error: 'User phone and ID are required.' });
    }

    try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const key = `verify:phone:code:${user.id}:${user.phone}`;
        await redis.setex(key, EMAIL_CODE_EXPIRATION, code);

        // await sendSMS(user.phone, `Your verification code is: ${code}`);

        return res.status(200).json({ message: 'Verification code sent successfully.' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to send verification code.' });
    }
};

// 验证手机验证码中间件（预留）
export const verifyPhoneCode: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined> = async (req, res, next) => {
    const { user } = req.body;

    if (!user || !user.phone || !user.id || !user.verifyCode) {
        return res.status(400).json({ error: 'User phone, ID, and verification code are required.' });
    }

    try {
        const key = `verify:phone:code:${user.id}:${user.phone}`;
        const storedCode = await redis.get(key);

        if (!storedCode) {
            return res.status(400).json({ error: 'Verification code expired or not found.' });
        }

        if (storedCode !== user.verifyCode) {
            return res.status(400).json({ error: 'Invalid verification code.' });
        }
        await redis.del(key);

        next();
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Failed to verify code.' });
    }
};

