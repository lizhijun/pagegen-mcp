import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';
//const API_BASE_URL = 'https://api.willwayai.com/api';

// 网页生成API
export const generateWebpage = async (prompt: string, theme?: string, platform?: string, model?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      prompt,
      theme,
      platform,
      model
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
    let buffer = ''; // 用于存储不完整的块

    // 读取响应流
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      
      // 解码二进制数据
      const chunk = decoder.decode(value, { stream: true });
      
      // 将新块添加到缓冲区
      buffer += chunk;
      
      // 按SSE格式分割消息
      let processBuffer = buffer.split('\n\n');
      
      // 保留可能不完整的最后一部分
      buffer = processBuffer.pop() || '';
      
      // 处理完整的消息
      for (const eventStr of processBuffer) {
        if (eventStr.trim() && eventStr.startsWith('data: ')) {
          try {
            const jsonStr = eventStr.substring(6).trim();
            if (!jsonStr) continue;
            
            const data = JSON.parse(jsonStr);
            
            // 如果有HTML内容，更新并调用回调
            if (data.html) {
              htmlContent = data.html;
              if (onProgress) onProgress(htmlContent);
            }
            
            // 处理完成事件
            if (data.done && onComplete) {
              onComplete(htmlContent);
              return { html: htmlContent };
            }
            
            // 处理错误
            if (data.error && onError) {
              onError(data.error);
              throw new Error(data.error);
            }
          } catch (e) {
            console.error('解析流数据失败:', e);
            // 继续处理其他消息，不中断
            continue;
          }
        }
      }
    }
    
    // 处理完所有数据后，检查是否有最后一部分可处理的数据
    if (buffer.trim() && buffer.startsWith('data: ')) {
      try {
        const jsonStr = buffer.substring(6).trim();
        if (jsonStr) {
          const data = JSON.parse(jsonStr);
          if (data.html) {
            htmlContent = data.html;
            if (onProgress) onProgress(htmlContent);
          }
          if (data.done && onComplete) {
            onComplete(htmlContent);
          }
        }
      } catch (e) {
        console.error('解析最后一块流数据失败:', e);
      }
    }
    
    return { html: htmlContent };
  } catch (error) {
    console.error('Error generating webpage with streaming:', error);
    if (onError) onError(error instanceof Error ? error.message : String(error));
    throw error;
  }
}; 