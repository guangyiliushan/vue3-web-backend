// routes/user.ts
import { Router, Request, Response, NextFunction } from 'express';
import { registerUser , loginUser , getSalt } from '@controllers/user';
import { authMiddleware } from '@middlewares/auth';



const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'api user page' });
})

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/salt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getSalt(req, res);
  } catch (error) {
    next(error);
  }
});


router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginUser(req, res);
  } catch (error) {
    next(error);
  }
});

router.post('/auth', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authMiddleware(req, res, next);
  } catch (error) {
    next(error);
  }
});


export default router;