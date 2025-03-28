import { Request, Response } from 'express';
import { sendChatMessage, sendChatMessageStreaming } from '../services/openaiService';

/**
 * 处理聊天消息请求
 */
export const handleChatMessage = async (req: Request, res: Response) => {
  try {
    const { 
      messages, 
      model = 'anthropic/claude-3.7-sonnet:thinking', 
      stream = false
    } = req.body;
    
    // 验证输入
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: '缺少有效的messages参数' });
    }
    
    // 检查是否使用流式响应
    if (stream) {
      // 设置响应头，指定内容类型为事件流
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      
      // 调用流式聊天API
      await sendChatMessageStreaming(messages, res, model);
    } else {
      // 非流式响应
      const replyContent = await sendChatMessage(messages, model);
      
      // 返回AI的回复
      res.status(200).json({ 
        message: replyContent,
        role: 'assistant'
      });
    }
  } catch (error) {
    console.error('处理聊天消息时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
}; 