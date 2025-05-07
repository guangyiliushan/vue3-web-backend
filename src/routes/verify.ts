import { Router, Request, Response, NextFunction } from 'express';

import { sendEmailCode , sendPhoneCode} from '@middlewares/verifyCode';

const router = Router();

router.put('/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendEmailCode(req, res);
  }
  catch (err) {
    next(err);
  }
})

router.put('/phone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendPhoneCode(req, res);
  }
  catch (err) {
    next(err);
  }
})

export default router;