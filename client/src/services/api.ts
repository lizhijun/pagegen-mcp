import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';
//const API_BASE_URL = 'https://api.willwayai.com/api';

// 定义模板信息类型
export interface TemplateInfo {
  id: string;
  name: string;
  description: string;
}

// 网页生成API
export const generateWebpage = async (prompt: string, theme?: string, platform?: string, model?: string, promptTemplateId?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      prompt,
      theme,
      platform,
      model,
      promptTemplateId
    });
    return response.data;
  } catch (error) {
    console.error('Error generating webpage:', error);
    throw error;
  }
};

// 流式生成网页API
export const generateWebpageStreaming = async (
  prompt: string, 
  theme?: string, 
  platform?: string, 
  model?: string,
  promptTemplateId?: string,
  onProgress?: (html: string) => void,
  onComplete?: (html: string) => void,
  onError?: (error: string) => void
) => {
  try {
    // 创建EventSource连接
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        theme,
        platform,
        model,
        promptTemplateId,
        stream: true // 启用流式响应
      })
    });

    // 检查HTTP响应状态
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`请求失败，状态码：${response.status}，错误：${errorText}`);
    }

    // 获取响应reader
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let htmlContent = '';
    let buffer = '';

    // 处理数据
    while (true) {
      const { done, value } = await reader.read();
      
      // 如果读取完成则退出循环
      if (done) {
        // 调用完成回调
        if (onComplete) {
          onComplete(htmlContent);
        }
        break;
      }
      
      // 解码二进制数据
      buffer += decoder.decode(value, { stream: true });
      
      // 处理SSE格式的数据
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';  // 最后一行可能不完整，保存到buffer

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(5));
            
            // 如果有错误消息
            if (data.error) {
              if (onError) onError(data.error);
              return;
            }
            
            // 如果有HTML内容更新
            if (data.html) {
              htmlContent = data.html;
              if (onProgress) onProgress(htmlContent);
            }
            
            // 如果已完成生成
            if (data.done) {
              if (onComplete) onComplete(htmlContent);
              return;
            }
          } catch (e) {
            console.error('解析数据失败:', e);
          }
        }
      }
    }

    return htmlContent;
  } catch (error) {
    console.error('Error streaming webpage:', error);
    if (onError) onError(String(error));
    throw error;
  }
};

// 获取所有可用的提示模板
export const getPromptTemplates = async (): Promise<TemplateInfo[]> => {
  try {
    const response = await axios.get(`${API_BASE_URL}/generate/templates`);
    return response.data.templates;
  } catch (error) {
    console.error('Error fetching prompt templates:', error);
    throw error;
  }
}; 
