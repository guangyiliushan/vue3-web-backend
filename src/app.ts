import express, { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '@middlewares/auth';
import cors from 'cors';
import baseRoutes from './routes/index';
import userRoutes from './routes/user';
import verifyRoutes from './routes/verify';
import postRoutes from './routes/post';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/post', postRoutes);
app.use('/verify', verifyRoutes);
app.use('/user', userRoutes);
app.use('/', baseRoutes);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});