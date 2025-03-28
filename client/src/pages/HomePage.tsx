import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWebpage, generateWebpageStreaming, getPromptTemplates, TemplateInfo } from '../services/api';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('openrouter');
  const [model, setModel] = useState('deepseek/deepseek-chat-v3-0324:free');
  const [promptTemplateId, setPromptTemplateId] = useState('standard');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('请输入生成提示');
      return;
    }
    
    setIsLoading(true);
    setError('');
    setGenerationProgress(0);
    
    try {
      // 使用流式API生成网页
      const result = await generateWebpageStreaming(
        prompt, 
        undefined, 
        platform, 
        model,
        promptTemplateId,
        // 进度回调
        (html) => {
          // 更新生成进度 (简单估算进度)
          const progress = Math.min(95, Math.max(5, Math.floor(html.length / 100)));
          setGenerationProgress(progress);
        },
        // 完成回调
        (html) => {
          setGenerationProgress(100);
          // 存储HTML到sessionStorage
          sessionStorage.setItem('generatedHtml', html);
        },
        // 错误回调
        (errorMsg) => {
          setError(errorMsg || '生成网页时出错，请重试');
        }
      );
      
      // 导航到预览页面
      navigate('/preview');
    } catch (err) {
      console.error('生成失败:', err);
      setError('生成网页时出错，请重试');
    } finally {
      setIsLoading(false);
      setGenerationProgress(0);
    }
  };

  useEffect(() => {
    const fetchTemplates = async () => {
      const templates = await getPromptTemplates();
      setTemplates(templates);
    };

    fetchTemplates();
  }, []);

  return (
    <div className="homepage">
      <header>
        <h1>MCP网页生成器</h1>
        <p>输入描述，生成您的定制网页</p>
      </header>
      
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="prompt">网页描述</label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="请描述您想要的网页内容和功能，例如：一个简洁的咖啡店网站，包括菜单和联系方式"
            rows={5}
            disabled={isLoading}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="promptTemplate">设计模板</label>
          <select
            id="promptTemplate"
            value={promptTemplateId}
            onChange={(e) => setPromptTemplateId(e.target.value)}
            disabled={isLoading}
          >
            {templates.length === 0 ? (
              <option value="standard">标准模板 - 专业美观的网页设计</option>
            ) : (
              templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.name} - {template.description}
                </option>
              ))
            )}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="platform">平台选择</label>
          <select
            id="platform"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            disabled={isLoading}
          >
            <option value="openrouter">OpenRouter</option>
            <option value="deepseek">DeepSeek</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="model">模型选择</label>
          <select
            id="model"
            value={model}
            onChange={(e) => setModel(e.target.value)}
            disabled={isLoading}
          >
            <option value="deepseek/deepseek-chat-v3-0324:free">deepseek/deepseek-chat-v3-0324:free</option>
            <option value="anthropic/claude-3.7-sonnet:thinking">Claude 3.7 Sonnet</option>
            <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
            <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
            <option value="openai/gpt-4o">GPT-4o</option>
          </select>
        </div>
        
        {isLoading && generationProgress > 0 && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${generationProgress}%` }}></div>
            <div className="progress-text">{generationProgress < 100 ? '生成中...' : '完成！'}</div>
          </div>
        )}
        
        <button 
          type="submit"
          disabled={isLoading}
          className={isLoading ? 'loading' : ''}
        >
          {isLoading ? '生成中...' : '生成网页'}
        </button>
      </form>
    </div>
  );
};

export default HomePage; 