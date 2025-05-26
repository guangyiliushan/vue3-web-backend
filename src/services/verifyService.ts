import nodemailer from 'nodemailer';
import Redis from 'ioredis';

const redis = new Redis();

// 邮箱验证码有效期（秒）
const EMAIL_CODE_EXPIRATION = 300;
// 手机验证码有效期（秒）
const PHONE_CODE_EXPIRATION = 300;

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
export const sendEmailCode = async (userId: string, email: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `verify:email:code:${userId}:${email}`;

  await redis.set(key, code, 'EX', EMAIL_CODE_EXPIRATION);

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is: ${code}`,
  });

  return { success: true };
};

// 验证邮箱验证码
export const validateEmailCode = async (userId: string, email: string, code: string) => {
  const key = `verify:email:code:${userId}:${email}`;
  const storedCode = await redis.get(key);

  if (!storedCode) {
    return { valid: false, message: 'Verification code expired or not found.' };
  }

  if (storedCode !== code) {
    return { valid: false, message: 'Invalid verification code.' };
  }

  await redis.del(key);
  return { valid: true };
};

// 发送手机验证码
export const sendPhoneCode = async (userId: string, phone: string) => {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const key = `verify:phone:code:${userId}:${phone}`;

  await redis.set(key, code, 'EX', PHONE_CODE_EXPIRATION);

  // 假设有一个 sendSMS 方法发送短信
  // await sendSMS(phone, `Your verification code is: ${code}`);
  
  // 为测试目的，返回验证码
  return { success: true, code };
};

// 验证手机验证码
export const verifyPhoneCode = async (userId: string, phone: string, code: string) => {
  const key = `verify:phone:code:${userId}:${phone}`;
  const storedCode = await redis.get(key);

  if (!storedCode) {
    return { valid: false, message: 'Verification code expired or not found.' };
  }

  if (storedCode !== code) {
    return { valid: false, message: 'Invalid verification code.' };
  }

  await redis.del(key);
  return { valid: true };
};