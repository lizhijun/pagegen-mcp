import axios from 'axios';

// API基础URL
const API_BASE_URL = 'http://localhost:3001/api';

// 网页生成API
export const generateWebpage = async (prompt: string, theme?: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/generate`, {
      prompt,
      theme
    });
    return response.data;
  } catch (error) {
    console.error('Error generating webpage:', error);
    throw error;
  }
}; 