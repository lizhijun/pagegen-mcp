import { Router } from 'express';
import { generateWebpage } from '../controllers/generateController';

const router = Router();

// 处理网页生成请求
router.post('/', generateWebpage as any);

export { router as generateRouter }; 