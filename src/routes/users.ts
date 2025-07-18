// routes/user.ts
import { Router, Request, Response, NextFunction } from 'express';
import { registerUser , loginUser , getSalt ,getUser, updateUsername, updateEmail, updatePassword } from '@controllers/users';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'api user page' });
})

router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await registerUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post('/salt', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getSalt(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await loginUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.get('/me', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await getUser(req, res, next);
  } catch (error) {
    next(error);
  }
});

router.put('/update/username', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateUsername(req, res, next);
  }
  catch (error) {
    next(error); 
  }
});

router.put('/update/email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updateEmail(req, res, next);
  } catch (error) {
    next(error); 
  } 
});

router.put('/update/password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    await updatePassword(req, res, next);
  } catch (error) {
    next(error); 
  } 
})


export default router;