# Generate API 文档

## 概述

Generate API 提供了使用AI模型生成HTML网页的功能，支持多种不同的模板风格和AI平台选择。该API支持使用DeepSeek和OpenRouter作为AI提供商，可以流式或非流式方式返回生成的HTML内容。

## API 端点

### 生成网页

**URL:** `/api/generate`

**方法:** `POST`

**Content-Type:** `application/json`

### 请求参数

| 参数名          | 类型    | 必填 | 描述                                                         |
|-----------------|---------|------|--------------------------------------------------------------|
| prompt          | String  | 是   | 描述要生成的网页内容和风格的文本提示                         |
| platform        | String  | 否   | 使用的AI平台，可选值: "openai"或"deepseek"，默认为"deepseek" |
| model           | String  | 否   | 使用的AI模型，仅在platform=openai时有效，默认为"anthropic/claude-3.7-sonnet:thinking" |
| stream          | Boolean | 否   | 是否使用流式响应，默认为false                                |
| promptTemplateId| String  | 否   | 使用的提示模板ID，默认为"standard"                           |

### 响应格式

#### 非流式响应

**Content-Type:** `application/json`

**成功响应:**

```json
{
  "html": "<!DOCTYPE html><html><head>...</head><body>...</body></html>"
}
```

**错误响应:**

```json
{
  "error": "错误描述"
}
```

#### 流式响应

**Content-Type:** `text/event-stream`

流式响应遵循SSE (Server-Sent Events)格式，每个数据块格式如下:

```
data: {"html":"部分HTML内容"}
```

最后一个数据块会包含done字段:

```
data: {"done":true,"html":"完整的HTML内容"}
```

错误信息:

```
data: {"error":"错误描述"}
```

## 提示模板

### 获取所有可用的提示模板

**URL:** `/api/generate/templates`

**方法:** `GET`

**响应格式:**

```json
{
  "templates": [
    {
      "id": "standard",
      "name": "标准模板",
      "description": "专业美观的网页设计，包含完整的视觉元素和功能"
    },
    {
      "id": "minimal",
      "name": "极简模板",
      "description": "遵循\"少即是多\"的设计哲学，专注于内容本身"
    },
    {
      "id": "creative",
      "name": "创意模板",
      "description": "大胆前卫的设计风格，将网页变成一件艺术品"
    }
  ]
}
```

## 使用示例

### 基本使用 (非流式)

```javascript
async function generateWebpage() {
  const response = await fetch('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: '一个关于人工智能历史的教育网站，包含时间线和重要里程碑',
      platform: 'openai',
      promptTemplateId: 'standard'
    })
  });
  
  const data = await response.json();
  
  if (data.error) {
    console.error('Error:', data.error);
    return;
  }
  
  // 在页面上显示生成的HTML
  document.getElementById('preview').innerHTML = data.html;
  
  // 或者保存HTML内容
  saveToFile(data.html, 'ai-history-website.html');
}
```

### 流式响应使用示例

```javascript
function generateWebpageStreaming() {
  // 创建加载指示器
  const loadingIndicator = document.createElement('div');
  loadingIndicator.textContent = '生成中...';
  document.getElementById('status').appendChild(loadingIndicator);
  
  // 初始化预览区域
  const previewElement = document.getElementById('preview');
  previewElement.innerHTML = '';
  
  // 创建EventSource连接
  const eventSource = new EventSource('/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: '一个关于人工智能历史的教育网站，包含时间线和重要里程碑',
      platform: 'deepseek', // 使用DeepSeek服务
      stream: true
    })
  });

  // 处理接收到的数据
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.error) {
      console.error('Error:', data.error);
      loadingIndicator.textContent = '生成失败: ' + data.error;
      eventSource.close();
      return;
    }
    
    // 更新预览
    previewElement.innerHTML = data.html;
    
    // 检查是否完成
    if (data.done) {
      loadingIndicator.textContent = '生成完成!';
      eventSource.close();
      
      // 可以在此处理生成完成后的逻辑
      saveToFile(data.html, 'ai-history-website.html');
    }
  };
  
  // 错误处理
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    loadingIndicator.textContent = '连接错误，请重试';
    eventSource.close();
  };
}

// 工具函数：保存HTML到文件
function saveToFile(htmlContent, filename) {
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  
  URL.revokeObjectURL(url);
}
```

### 获取和使用模板

```javascript
async function fetchAndUseTemplates() {
  // 获取所有可用模板
  const response = await fetch('/api/generate/templates');
  const data = await response.json();
  
  if (!data.templates) {
    console.error('Failed to fetch templates');
    return;
  }
  
  // 在界面上显示模板选项
  const templateSelector = document.getElementById('template-selector');
  templateSelector.innerHTML = '';
  
  data.templates.forEach(template => {
    const option = document.createElement('option');
    option.value = template.id;
    option.textContent = `${template.name} - ${template.description}`;
    templateSelector.appendChild(option);
  });
  
  // 使用用户选择的模板生成网页
  document.getElementById('generate-btn').addEventListener('click', async () => {
    const selectedTemplateId = templateSelector.value;
    const promptText = document.getElementById('prompt-input').value;
    
    const generateResponse = await fetch('/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: promptText,
        promptTemplateId: selectedTemplateId
      })
    });
    
    const generateData = await generateResponse.json();
    document.getElementById('preview').innerHTML = generateData.html;
  });
}
```

## 错误处理

| HTTP 状态码 | 描述                               |
|-------------|-----------------------------------|
| 400         | 请求参数错误，如缺少必要的prompt参数 |
| 500         | 服务器内部错误                      |

错误响应格式:

```json
{
  "error": "错误描述信息"
}
```

## 平台选择

Generate API 支持两种AI平台:

1. **DeepSeek** (默认): 
   - 优点: 速度快，成本相对较低
   - 限制: 不支持模板选择，所有请求使用内置提示

2. **OpenAI/OpenRouter**:
   - 优点: 支持多种模型选择，支持模板系统
   - 默认模型: "anthropic/claude-3.7-sonnet:thinking"

根据具体需求选择合适的平台。对于简单快速的生成，可以使用DeepSeek；对于需要特定风格或更高质量的生成，可以使用OpenAI/OpenRouter配合不同的模板。

## 最佳实践

1. **优化提示词**: 提供详细的描述，包括目标网站的目的、主题、风格和功能需求
2. **选择合适的模板**: 根据需要的风格选择不同的模板
3. **使用流式响应**: 对于复杂的网页生成，使用流式响应可以提供更好的用户体验
4. **错误处理**: 始终处理可能的错误情况
5. **本地缓存**: 考虑在客户端缓存生成的HTML，避免重复请求 