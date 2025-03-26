import pool from '../config/database';

export interface BookPage {
  id: number;
  book_rank: number;
  book_name: string;
  douban_url: string | null;
  page_url: string | null;
  author: string | null;
  publisher: string | null;
  publish_date: string | null;
  price: string | null;
  rate: number | null;
  comment: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * 获取分页的图书数据
 * @param page 页码，从1开始
 * @param limit 每页记录数
 * @param sortBy 排序字段
 * @param sortOrder 排序顺序 'asc' 或 'desc'
 * @param search 搜索关键词
 * @returns 分页结果
 */
export const getBookPages = async (
  page: number = 1,
  limit: number = 10,
  sortBy: string = 'book_rank',
  sortOrder: 'asc' | 'desc' = 'asc',
  search?: string
): Promise<PaginationResult<BookPage>> => {
  try {
    // 确保页码和每页条数为正数
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const offset = (validPage - 1) * validLimit;

    // 构建查询条件
    let whereClause = '';
    let queryParams: any[] = [];

    if (search) {
      whereClause = `WHERE book_name LIKE ? OR author LIKE ? OR publisher LIKE ? OR comment LIKE ?`;
      const searchPattern = `%${search}%`;
      queryParams = [searchPattern, searchPattern, searchPattern, searchPattern];
    }

    // 验证排序字段
    const validColumns = [
      'id', 'book_rank', 'book_name', 'author', 'publisher', 
      'publish_date', 'price', 'rate', 'created_at', 'updated_at'
    ];
    
    const validSortBy = validColumns.includes(sortBy) ? sortBy : 'book_rank';
    const validSortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

    // 计算总记录数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM book_pages ${whereClause}`,
      queryParams
    ) as any[];

    const total = countResult[0].total;

    // 查询数据
    const [rows] = await pool.query(
      `SELECT * FROM book_pages ${whereClause} 
       ORDER BY ${validSortBy} ${validSortOrder} 
       LIMIT ? OFFSET ?`,
      [...queryParams, validLimit, offset]
    );

    return {
      data: rows as BookPage[],
      total,
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(total / validLimit)
    };
  } catch (error) {
    console.error('获取图书数据失败:', error);
    throw new Error('获取图书数据失败');
  }
}; 