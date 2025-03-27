import { Request, Response } from 'express';
import { generateHtml, generateHtmlStreaming } from '../services/openaiService';
import { generateHtmlWithDeepseek, generateHtmlWithDeepseekStreaming } from '../services/deepseekService';

// 处理网页生成请求
export const generateWebpage = async (req: Request, res: Response) => {
  try {
    const { prompt, theme, platform = 'deepseek', model = 'anthropic/claude-3.7-sonnet:thinking', stream = false } = req.body;
    
    // 验证输入
    if (!prompt) {
      return res.status(400).json({ error: '缺少prompt参数' });
    }
    
    // 检查是否使用流式响应
    if (stream) {
      // 设置响应头，指定内容类型为事件流
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 根据model参数选择使用哪个服务的流式API
      if (platform === 'deepseek') {
        // 调用DeepSeek服务流式生成HTML
        await generateHtmlWithDeepseekStreaming(prompt, res, theme);
      } else {
        // 调用OpenAI/OpenRouter服务流式生成HTML
        await generateHtmlStreaming(prompt, res, theme, model);
      }
    } else {
      // 非流式响应，使用原来的实现
      let htmlContent: string;
      
      // 根据platform参数选择使用哪个服务
      if (platform === 'deepseek') {
        // 调用DeepSeek服务生成HTML
        htmlContent = await generateHtmlWithDeepseek(prompt, theme);
      } else {
        // 默认调用OpenAI服务生成HTML
        htmlContent = await generateHtml(prompt, theme, model);
      }
      
      // 返回生成的HTML
      res.status(200).json({ html: htmlContent });
    }
  } catch (error) {
    console.error('生成网页时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
}; 