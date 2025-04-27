import express, { NextFunction, Request, Response } from 'express';
// import cors from 'cors';
// import routes from '@routes/index';

const app = express();
const port = 3000;

// app.use(cors());
// app.use(routes);

// 解析请求体中的 JSON 数据
app.use(express.static('public'));

// 解析请求体中的 URL 编码数据
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'API is running on /api' });
});

// 启动服务
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});