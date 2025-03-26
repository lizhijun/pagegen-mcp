import { Request, Response } from 'express';
import { getBookPages } from '../services/bookService';

/**
 * 获取分页的图书数据
 */
export const getBooks = async (req: Request, res: Response): Promise<void> => {
  try {
    // 获取查询参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const sortBy = req.query.sortBy as string || 'book_rank';
    const sortOrder = (req.query.sortOrder as 'asc' | 'desc') || 'asc';
    const search = req.query.search as string;

    // 调用服务获取数据
    const result = await getBookPages(page, limit, sortBy, sortOrder, search);

    // 返回结果
    res.status(200).json(result);
  } catch (error) {
    console.error('处理图书数据请求时出错:', error);
    res.status(500).json({ error: '获取图书数据失败' });
  }
}; 