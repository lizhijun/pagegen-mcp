import { Request, Response } from 'express';
import { generateHtml, generateHtmlStreaming } from '../services/openaiService';
import { generateHtmlWithDeepseek, generateHtmlWithDeepseekStreaming } from '../services/deepseekService';
import { getAllTemplatesInfo } from '../templates';

// 处理网页生成请求
export const generateWebpage = async (req: Request, res: Response) => {
  try {
    const { 
      prompt, 
      platform = 'deepseek', 
      model = 'anthropic/claude-3.7-sonnet:thinking', 
      stream = false,
      promptTemplateId = 'standard'  // 默认使用标准模板
    } = req.body;
    
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
        // 调用DeepSeek服务流式生成HTML (DeepSeek目前不支持模板选择)
        await generateHtmlWithDeepseekStreaming(prompt, res);
      } else {
        // 调用OpenAI/OpenRouter服务流式生成HTML，传递promptTemplateId
        await generateHtmlStreaming(prompt, res, promptTemplateId, model);
      }
    } else {
      // 非流式响应，使用原来的实现
      let htmlContent: string;
      
      // 根据platform参数选择使用哪个服务
      if (platform === 'deepseek') {
        // 调用DeepSeek服务生成HTML (DeepSeek目前不支持模板选择)
        htmlContent = await generateHtmlWithDeepseek(prompt);
      } else {
        // 默认调用OpenAI服务生成HTML，传递promptTemplateId
        htmlContent = await generateHtml(prompt, promptTemplateId, model);
      }
      
      // 返回生成的HTML
      res.status(200).json({ html: htmlContent });
    }
  } catch (error) {
    console.error('生成网页时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
};

// 获取所有可用的提示模板
export const getPromptTemplates = (req: Request, res: Response) => {
  try {
    const templates = getAllTemplatesInfo();
    res.status(200).json({ templates });
  } catch (error) {
    console.error('获取模板列表时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
}; 