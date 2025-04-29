import express from 'express'; 

const app = express();
const port = 3000;
 
// 基础路由
app.get('/', (req, res) => {
  res.send('Hello Express!');
});
 
// 启动服务
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});