import axios from 'axios';
import dotenv from 'dotenv';
import { Response } from 'express';
import { getTemplateById } from '../templates';

dotenv.config();

// DeepSeek API配置
const DEEPSEEK_API_URL = 'https://api.deepseek.com/v1/chat/completions';
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;

/**
 * 根据prompt和主题生成HTML (DeepSeek版本)
 * @param prompt 生成网页的内容
 * @param promptTemplateId 使用的提示模板ID，默认为标准模板
 * @returns 生成的HTML内容
 */
export const generateHtmlWithDeepseek = async (prompt: string, promptTemplateId?: string): Promise<string> => {
  try {
    // 根据模板ID获取相应的提示模板
    const systemPrompt = getTemplateById(promptTemplateId).replace('{{content}}', prompt);

    // 调用DeepSeek API
    const response = await axios.post(
      DEEPSEEK_API_URL, 
      {
        model: 'deepseek-chat', // 使用DeepSeek模型
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
          'Content-Type': 'application/json',
        }
      }
    );

    // 提取生成的HTML
    const htmlContent = response.data.choices[0]?.message?.content || '';
    
    // 直接返回内容，不再需要提取markdown代码块
    return htmlContent;
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    throw new Error('生成HTML时出错');
  }
};

/**
 * 流式生成HTML并直接写入响应流 (DeepSeek版本)
 * @param prompt 生成网页的内容
 * @param res Express响应对象，用于流式传输内容
 * @param promptTemplateId 使用的提示模板ID，默认为标准模板
 */
export const generateHtmlWithDeepseekStreaming = async (prompt: string, res: Response, promptTemplateId?: string): Promise<void> => {
  try {
    // 根据模板ID获取相应的提示模板
    const systemPrompt = getTemplateById(promptTemplateId).replace('{{content}}', prompt);

    // 初始化内容收集器
    let fullContent = '';
    let htmlContent = '';
    
    try {
      // 调用DeepSeek API并设置stream=true
      const response = await axios.post(
        DEEPSEEK_API_URL, 
        {
          model: 'deepseek-chat', // 使用DeepSeek模型
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          stream: true, // 启用流式输出
        },
        {
          headers: {
            'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
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
                
                // 尝试从当前累积的内容中提取HTML部分
                const match = fullContent.match(/```html\n([\s\S]*?)(\n```|$)/);
                if (match) {
                  htmlContent = match[1];
                } else {
                  htmlContent = fullContent;
                }
                
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
      console.error('DeepSeek API流式调用失败:', error);
      res.write(`data: ${JSON.stringify({ error: '调用API失败' })}\n\n`);
      res.end();
    }
  } catch (error) {
    console.error('DeepSeek流式API调用准备阶段失败:', error);
    res.write(`data: ${JSON.stringify({ error: '初始化流失败' })}\n\n`);
    res.end();
  }
}; 