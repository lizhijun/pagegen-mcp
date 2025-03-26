import { Router } from 'express';
import { getBooks } from '../controllers/bookController';

const router = Router();

// 获取分页图书数据
router.get('/', getBooks);

export { router as bookRouter }; 