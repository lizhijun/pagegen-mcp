import { Request, Response } from 'express';
import { uploadToGitHub } from '../services/githubService';
import fs from 'fs/promises';

export const uploadFileToGitHub = async (req: Request, res: Response): Promise<void> => {
  try {
    const { owner, repo, path, message } = req.body;
    const file = req.file; // multer 提供的文件对象

    if (!owner || !repo || !path || !message || !file) {
      res.status(400).json({
        error: '缺少必要参数',
        required: ['owner', 'repo', 'path', 'message', 'file']
      });
      return;
    }

    // 读取上传的文件内容
    const content = await fs.readFile(file.path);

    // 上传到 GitHub
    const result = await uploadToGitHub({
      owner,
      repo,
      path,
      content,
      message
    });

    // 删除临时文件
    await fs.unlink(file.path);

    res.status(200).json(result);
  } catch (error) {
    console.error('文件上传失败:', error);
    res.status(500).json({ error: '文件上传处理失败' });
  }
}; 