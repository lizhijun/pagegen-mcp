import { Router } from 'express';
import { generateWebpage, getPromptTemplates } from '../controllers/generateController';

const router = Router();

// 处理网页生成请求
router.post('/', generateWebpage as any);

// 获取所有提示模板信息
router.get('/templates', getPromptTemplates as any);

export { router as generateRouter }; 