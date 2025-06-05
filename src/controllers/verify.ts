import { Request, Response, NextFunction } from 'express';
import * as verifyService from '@services/verifyService';

// 发送邮箱验证码
export const sendEmailCode = async (req: Request, res: Response, next: NextFunction) => {
  const { user, verify } = req.body;

  if (!user || !verify?.email || !user.id) {
    return res.status(400).json({ error: 'User email and ID are required.' });
  }

  try {
    await verifyService.sendEmailCode(user.id, verify.email);
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
    const isValid = await verifyService.validateEmailCode(user.id, verify.email, verify.code);
    
    if (!isValid.valid) {
      return res.status(400).json({ error: isValid.message });
    }
    
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
    await verifyService.sendPhoneCode(user.id, verify.phone);
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
    const isValid = await verifyService.verifyPhoneCode(user.id, verify.phone, verify.code);
    
    if (!isValid.valid) {
      return res.status(400).json({ error: isValid.message });
    }
    
    res.success({ message: 'Verification code verified successfully.' });
  } catch (error) {
    next(error);
  }
};