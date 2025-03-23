import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './WebpagePreview.css';

const WebpagePreview: React.FC = () => {
  const [html, setHtml] = useState<string>('');
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
        </div>
      </div>
      
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