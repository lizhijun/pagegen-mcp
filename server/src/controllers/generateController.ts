import { Request, Response } from 'express';
import { generateHtml } from '../services/openaiService';

// 处理网页生成请求
export const generateWebpage = async (req: Request, res: Response) => {
  try {
    const { prompt, theme } = req.body;
    
    // 验证输入
    if (!prompt) {
      return res.status(400).json({ error: '缺少prompt参数' });
    }
    
    // 调用OpenAI服务生成HTML
    const htmlContent = await generateHtml(prompt, theme);
    
    // 返回生成的HTML
    res.status(200).json({ html: htmlContent });
  } catch (error) {
    console.error('生成网页时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
}; 