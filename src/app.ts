import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import userRoutes from './routes/user';

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.use('/user', userRoutes);

app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'API is running on /api' });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});