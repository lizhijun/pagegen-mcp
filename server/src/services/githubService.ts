import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const GITHUB_API_URL = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

interface GitHubUploadParams {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
}

/**
 * 上传文件到GitHub仓库
 * @param params 上传参数
 * @returns 上传结果
 */
export const uploadToGitHub = async (params: GitHubUploadParams): Promise<any> => {
  try {
    const { owner, repo, path, content, message } = params;

    // 首先检查文件是否已存在
    try {
      const existingFile = await axios.get(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`,
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      // 如果文件存在，需要获取其SHA
      const sha = existingFile.data.sha;

      // 更新文件
      const response = await axios.put(
        `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`,
        {
          message,
          content: Buffer.from(content).toString('base64'),
          sha
        },
        {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      return response.data;
    } catch (error: any) {
      // 如果文件不存在（404错误），创建新文件
      if (error.response?.status === 404) {
        const response = await axios.put(
          `${GITHUB_API_URL}/repos/${owner}/${repo}/contents/${path}`,
          {
            message,
            content: Buffer.from(content).toString('base64')
          },
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        return response.data;
      }
      throw error;
    }
  } catch (error) {
    console.error('GitHub API调用失败:', error);
    throw new Error('上传文件到GitHub时出错');
  }
}; 