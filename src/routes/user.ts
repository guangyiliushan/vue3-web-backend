// routes/user.ts
import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';


const router = Router();

router.use((req: Request, res: Response, next: NextFunction) => {
  res.write(`[${new Date().toISOString()}] ${req.method} ${req.url}\n`);
  res.write('Headers: ' + JSON.stringify(req.headers) + '\n');
  res.write('Body: ' + JSON.stringify(req.body) + '\n');
  next();
});

router.get('/', (req: Request, res: Response) => {
  res.json({ message: 'api user page' });
})

router.post('/register', 
);

export default router;