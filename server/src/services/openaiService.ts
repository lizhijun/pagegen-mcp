import axios from 'axios';
import dotenv from 'dotenv';
import { Response } from 'express';
import { getTemplateById } from '../templates';

dotenv.config();

// OpenRouter API配置
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

/**
 * 根据prompt和主题生成HTML
 * @param content 生成网页的内容
 * @param promptTemplateId 使用的提示模板ID
 * @param model 使用的模型
 * @returns 生成的HTML内容
 */
export const generateHtml = async (content: string, promptTemplateId?: string, model?: string): Promise<string> => {
  try {
    // 根据模板ID获取相应的提示模板
    const systemPrompt = getTemplateById(promptTemplateId).replace('{{content}}', content);

    // 调用OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL, 
      {
        model: model || 'anthropic/claude-3.7-sonnet:thinking', // 可以更换为其他支持的模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: content }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://mcp-generator.com', // 更改为你的网站
          'X-Title': 'MCP Web Generator', // 修改为纯ASCII字符
          'Content-Type': 'application/json',
        }
      }
    );

    // 提取生成的HTML
    const htmlContent = response.data.choices[0]?.message?.content || '';
    
    // 直接返回内容，不再需要提取markdown代码块
    return htmlContent;
  } catch (error) {
    console.error('OpenRouter API调用失败:', error);
    throw new Error('生成HTML时出错');
  }
};

/**
 * 流式生成HTML并直接写入响应流
 * @param content 生成网页的内容
 * @param res Express响应对象，用于流式传输内容
 * @param promptTemplateId 使用的提示模板ID
 * @param model 使用的模型
 */
export const generateHtmlStreaming = async (content: string, res: Response, promptTemplateId?: string, model?: string): Promise<void> => {
  try {
    // 根据模板ID获取相应的提示模板
    const systemPrompt = getTemplateById(promptTemplateId).replace('{{content}}', content);

    // 初始化内容收集器
    let fullContent = '';
    let htmlContent = '';
    
    try {
      // 调用OpenRouter API并设置stream=true
      const response = await axios.post(
        OPENROUTER_API_URL, 
        {
          model: model || 'anthropic/claude-3.7-sonnet:thinking',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: content }
          ],
          temperature: 0.7,
          stream: true, // 打开流式响应
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://mcp-generator.com',
            'X-Title': 'MCP Web Generator',
            'Content-Type': 'application/json',
          },
          responseType: 'stream', // 设置响应类型为流
        }
      );

      // 处理流式响应
      response.data.on('data', (chunk: Buffer) => {
        // 解析数据块
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          // 只处理有效的数据行
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              // 尝试解析JSON，排除空行
              const jsonStr = line.substring(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                
                // 直接使用累积的内容，不再需要提取markdown代码块
                htmlContent = fullContent;
                
                // 向客户端发送事件
                res.write(`data: ${JSON.stringify({ html: htmlContent })}\n\n`);
              }
            } catch (e) {
              console.error('解析流式响应数据失败:', e, '原始数据:', line);
              // 解析错误时继续处理下一行，而不是中断整个过程
              continue;
            }
          }
        }
      });

      // 处理流结束
      response.data.on('end', () => {
        // 发送完成事件
        res.write(`data: ${JSON.stringify({ done: true, html: htmlContent })}\n\n`);
        res.end();
      });
      
      // 处理错误
      response.data.on('error', (err: Error) => {
        console.error('流处理错误:', err);
        res.write(`data: ${JSON.stringify({ error: '生成过程中出错' })}\n\n`);
        res.end();
      });
    } catch (error) {
      console.error('OpenRouter API流式调用失败:', error);
      res.write(`data: ${JSON.stringify({ error: '调用API失败' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('OpenRouter流式API调用准备阶段失败:', error);
    res.write(`data: ${JSON.stringify({ error: '初始化流失败' })}\n\n`);
    res.end();
  }
};

/**
 * 发送聊天消息并获取回复
 * @param messages 聊天消息数组，格式为 {role: 'user'|'assistant'|'system', content: string}[]
 * @param model 使用的模型
 * @returns AI回复的内容
 */
export const sendChatMessage = async (messages: Array<{role: string, content: string}>, model?: string): Promise<string> => {
  try {
    // 调用OpenRouter API
    const response = await axios.post(
      OPENROUTER_API_URL, 
      {
        model: model || 'anthropic/claude-3.7-sonnet:thinking',
        messages: messages,
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://mcp-generator.com',
          'X-Title': 'MCP Web Generator',
          'Content-Type': 'application/json',
        }
      }
    );

    // 提取回复内容
    const replyContent = response.data.choices[0]?.message?.content || '';
    return replyContent;
  } catch (error) {
    console.error('OpenRouter Chat API调用失败:', error);
    throw new Error('获取聊天回复时出错');
  }
};

/**
 * 流式发送聊天消息并直接写入响应流
 * @param messages 聊天消息数组，格式为 {role: 'user'|'assistant'|'system', content: string}[]
 * @param res Express响应对象，用于流式传输内容
 * @param model 使用的模型
 */
export const sendChatMessageStreaming = async (messages: Array<{role: string, content: string}>, res: Response, model?: string): Promise<void> => {
  try {
    // 初始化内容收集器
    let fullContent = '';
    
    try {
      // 调用OpenRouter API并设置stream=true
      const response = await axios.post(
        OPENROUTER_API_URL, 
        {
          model: model || 'anthropic/claude-3.7-sonnet:thinking',
          messages: messages,
          temperature: 0.7,
          stream: true, // 打开流式响应
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://mcp-generator.com',
            'X-Title': 'MCP Web Generator',
            'Content-Type': 'application/json',
          },
          responseType: 'stream', // 设置响应类型为流
        }
      );

      // 处理流式响应
      response.data.on('data', (chunk: Buffer) => {
        // 解析数据块
        const lines = chunk.toString().split('\n');
        for (const line of lines) {
          // 只处理有效的数据行
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              // 尝试解析JSON，排除空行
              const jsonStr = line.substring(6).trim();
              if (!jsonStr) continue;
              
              const data = JSON.parse(jsonStr);
              const content = data.choices?.[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                
                // 向客户端发送事件
                res.write(`data: ${JSON.stringify({ message: fullContent })}\n\n`);
              }
            } catch (e) {
              console.error('解析流式响应数据失败:', e, '原始数据:', line);
              // 解析错误时继续处理下一行，而不是中断整个过程
              continue;
            }
          }
        }
      });

      // 处理流结束
      response.data.on('end', () => {
        // 发送完成事件
        res.write(`data: ${JSON.stringify({ done: true, message: fullContent })}\n\n`);
        res.end();
      });
      
      // 处理错误
      response.data.on('error', (err: Error) => {
        console.error('流处理错误:', err);
        res.write(`data: ${JSON.stringify({ error: '聊天过程中出错' })}\n\n`);
        res.end();
      });
    } catch (error) {
      console.error('OpenRouter Chat API流式调用失败:', error);
      res.write(`data: ${JSON.stringify({ error: '调用API失败' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('OpenRouter聊天流式API调用准备阶段失败:', error);
    res.write(`data: ${JSON.stringify({ error: '初始化聊天流失败' })}\n\n`);
    res.end();
  }
}; 