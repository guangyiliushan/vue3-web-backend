import express , { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '@middlewares/auth';
import { errorMiddleware } from '@middlewares/error';
import { responseMiddleware } from '@middlewares/response';
import cors from 'cors';
import baseRoutes from './routes/index';
import userRoutes from './routes/users';
import verifyRoutes from './routes/verify';
import postRoutes from './routes/posts';

const app = express();
const port = 3000;

app.use(responseMiddleware);

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
app.use('/posts', postRoutes);
app.use('/users', userRoutes);
app.use('/', baseRoutes);

app.use(errorMiddleware);

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});