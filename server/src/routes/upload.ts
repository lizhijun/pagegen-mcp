import { Router, Request, Response } from 'express';
import multer from 'multer';
import { uploadFileToGitHub } from '../controllers/uploadController';

const router = Router();

// 配置 multer
const upload = multer({ 
  dest: 'uploads/',
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制文件大小为 5MB
  }
});

// 文件上传路由
router.post('/github', upload.single('file'), async (req: Request, res: Response) => {
  await uploadFileToGitHub(req, res);
});

export { router as uploadRouter }; 