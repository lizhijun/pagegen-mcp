import axios from 'axios';

// API基础URL
// const API_BASE_URL = 'http://localhost:3001/api';
const API_BASE_URL = 'https://api.willwayai.com/api';

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