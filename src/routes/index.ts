// routes/index.ts
import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.json({ status: 'API is running on /api' });
});

router.get('/test', (req: Request, res: Response) => {
  res.json({ message: 'Hello World!' });
});

export default router;

