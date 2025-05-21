import { Router, Request, Response, NextFunction } from 'express';
import { sendEmailCode , sendPhoneCode} from '@services/verifyService';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send('verify'); 
})

router.put('/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendEmailCode(req, res , next);
  }
  catch (err) {
    next(err);
  }
})

router.put('/phone', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await sendPhoneCode(req, res , next);
  }
  catch (err) {
    next(err);
  }
})

export default router;