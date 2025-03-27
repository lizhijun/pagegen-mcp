import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WebpagePreview.css';

const WebpagePreview: React.FC = () => {
  const [html, setHtml] = useState<string>('');
  const [showGithubForm, setShowGithubForm] = useState<boolean>(false);
  const [githubInfo, setGithubInfo] = useState({
    owner: 'lizhjun',
    repo: '',
    path: '',
    message: '上传网页文件'
  });
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadResult, setUploadResult] = useState<{ success?: boolean; message?: string } | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    // 从sessionStorage获取生成的HTML
    const generatedHtml = sessionStorage.getItem('generatedHtml');
    
    if (!generatedHtml) {
      // 如果没有HTML，重定向到首页
      navigate('/');
      return;
    }
    
    setHtml(generatedHtml);
  }, [navigate]);
  
  const handleBack = () => {
    navigate('/');
  };
  
  const handleDownload = () => {
    // 创建Blob对象
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = 'generated-webpage.html';
    document.body.appendChild(a);
    a.click();
    
    // 清理
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleGithubUpload = async () => {
    if (!githubInfo.owner || !githubInfo.repo || !githubInfo.path) {
      setUploadResult({ success: false, message: '请填写所有必要信息' });
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);
      
      // 创建FormData对象
      const formData = new FormData();
      
      // 将HTML内容转换为Blob并作为文件添加
      const htmlBlob = new Blob([html], { type: 'text/html' });
      formData.append('file', htmlBlob, 'webpage.html');
      
      // 添加其他GitHub参数
      formData.append('owner', githubInfo.owner);
      formData.append('repo', githubInfo.repo);
      formData.append('path', githubInfo.path);
      formData.append('message', githubInfo.message);
      
      const response = await fetch('/api/upload/github', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (response.ok) {
        setUploadResult({ 
          success: true, 
          message: '上传成功！文件已上传到GitHub仓库' 
        });
        setShowGithubForm(false);
      } else {
        setUploadResult({ 
          success: false, 
          message: `上传失败: ${result.error || '未知错误'}` 
        });
      }
    } catch (error) {
      setUploadResult({ 
        success: false, 
        message: '上传过程中发生错误，请稍后再试' 
      });
    } finally {
      setUploading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setGithubInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="preview-container">
      <div className="preview-header">
        <h2>生成的网页预览</h2>
        <div className="preview-actions">
          <button className="back-button" onClick={handleBack}>
            返回修改
          </button>
          <button className="download-button" onClick={handleDownload}>
            下载HTML文件
          </button>
          <button 
            className="github-button" 
            onClick={() => setShowGithubForm(true)}
          >
            上传到GitHub
          </button>
        </div>
      </div>
      
      {showGithubForm && (
        <div className="github-form-overlay">
          <div className="github-form">
            <h3>上传到GitHub仓库</h3>
            <div className="form-group">
              <label htmlFor="owner">仓库所有者</label>
              <input 
                type="text" 
                id="owner" 
                name="owner" 
                value={githubInfo.owner} 
                onChange={handleInputChange} 
                placeholder="用户名或组织名" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="repo">仓库名称</label>
              <input 
                type="text" 
                id="repo" 
                name="repo" 
                value={githubInfo.repo} 
                onChange={handleInputChange} 
                placeholder="repository-name" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="path">文件路径</label>
              <input 
                type="text" 
                id="path" 
                name="path" 
                value={githubInfo.path} 
                onChange={handleInputChange} 
                placeholder="path/to/file.html" 
              />
            </div>
            <div className="form-group">
              <label htmlFor="message">提交消息</label>
              <input 
                type="text" 
                id="message" 
                name="message" 
                value={githubInfo.message} 
                onChange={handleInputChange} 
                placeholder="提交描述" 
              />
            </div>
            
            {uploadResult && (
              <div className={`upload-result ${uploadResult.success ? 'success' : 'error'}`}>
                {uploadResult.message}
              </div>
            )}
            
            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button" 
                onClick={() => setShowGithubForm(false)}
              >
                取消
              </button>
              <button 
                type="button" 
                className="upload-button" 
                onClick={handleGithubUpload} 
                disabled={uploading}
              >
                {uploading ? '上传中...' : '确认上传'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="preview-frame-container">
        {html ? (
          <iframe
            title="生成的网页预览"
            className="preview-frame"
            srcDoc={html}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="loading">加载中...</div>
        )}
      </div>
    </div>
  );
};

export default WebpagePreview; 