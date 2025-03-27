import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { generateWebpage } from '../services/api';
import './HomePage.css';

const HomePage: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [theme, setTheme] = useState('');
  const [platform, setPlatform] = useState('deepseek');
  const [model, setModel] = useState('anthropic/claude-3.7-sonnet:thinking');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!prompt.trim()) {
      setError('请输入生成提示');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      const result = await generateWebpage(prompt, theme || undefined, platform, model);
      
      // 存储HTML到sessionStorage
      sessionStorage.setItem('generatedHtml', result.html);
      
      // 导航到预览页面
      navigate('/preview');
    } catch (err) {
      console.error('生成失败:', err);
      setError('生成网页时出错，请重试');
    } finally {
      setIsLoading(false);
    }
  };

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
          <label htmlFor="theme">设计主题（可选）</label>
          <input
            type="text"
            id="theme"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="例如：极简、现代、复古、暗色等"
            disabled={isLoading}
          />
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