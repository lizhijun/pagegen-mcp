import { Router, Request, Response } from 'express';
import { uploadFileToGitHub } from '../controllers/githubController';

const router = Router();

// 处理文件上传到GitHub的请求
router.post('/upload', async (req: Request, res: Response) => {
  await uploadFileToGitHub(req, res);
});

export { router as githubRouter }; 