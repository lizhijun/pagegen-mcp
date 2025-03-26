import { Request, Response } from 'express';
import { uploadToGitHub } from '../services/githubService';

/**
 * 处理文件上传到GitHub的请求
 */
export const uploadFileToGitHub = async (req: Request, res: Response) => {
  try {
    const { owner, repo, path, content, message } = req.body;

    // 验证必要参数
    if (!owner || !repo || !path || !content || !message) {
      return res.status(400).json({
        error: '缺少必要参数',
        required: ['owner', 'repo', 'path', 'content', 'message']
      });
    }

    // 调用GitHub服务上传文件
    const result = await uploadToGitHub({
      owner,
      repo,
      path,
      content,
      message
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('上传文件到GitHub时出错:', error);
    res.status(500).json({ error: '处理请求时发生错误' });
  }
}; 