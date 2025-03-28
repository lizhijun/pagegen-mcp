import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import { generateRouter } from './routes/generate';
import { githubRouter } from './routes/github';
import { uploadRouter } from './routes/upload';
import { bookRouter } from './routes/book';
import { chatRouter } from './routes/chat';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(bodyParser.json());

// 路由
app.use('/api/generate', generateRouter);
app.use('/api/github', githubRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/books', bookRouter);
app.use('/api/chat', chatRouter);

// 健康检查端点
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 