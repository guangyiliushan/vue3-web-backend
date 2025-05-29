import { Router, Request, Response, NextFunction } from 'express';
import { sendEmailCode, sendPhoneCode, verifyEmailCode, verifyPhoneCode } from '@controllers/verify';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('verify');
})

router.put('/email/check', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyEmailCode(req, res, next);
  }
  catch (err) {
    next(err);
  }
})

router.put('/phone/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await verifyPhoneCode(req, res, next);
  }
  catch (err) {
    next(err);
  } 
})

router.put('/email/send', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendEmailCode(req, res, next);
  }
  catch (err) {
    next(err);
  }
})

router.put('/send/phone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendPhoneCode(req, res, next);
  }
  catch (err) {
    next(err);
  }
})

export default router;