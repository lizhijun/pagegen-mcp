import { Router } from 'express';
import { handleChatMessage } from '../controllers/chatController';

const router = Router();

// 处理聊天消息请求
router.post('/', handleChatMessage as any);

export { router as chatRouter }; 