使用示例：
基本查询: GET /api/books
分页: GET /api/books?page=2&limit=20
排序: GET /api/books?sortBy=rate&sortOrder=desc
搜索: GET /api/books?search=哈利波特

## Generate API

### 生成网页
- 端点: POST /api/generate
- 描述: 基于文本提示生成HTML网页
- 请求体:
  ```json
  {
    "prompt": "一个关于太空旅行的网站首页",
    "platform": "openai", // 可选，可选值: "openai"或"deepseek"，默认为"deepseek"
    "model": "anthropic/claude-3.7-sonnet:thinking", // 可选，仅在platform=openai时有效
    "stream": false, // 可选，设置为true时启用流式响应
    "promptTemplateId": "standard" // 可选，选择提示模板，默认为"standard"
  }
  ```
- 响应 (非流式):
  ```json
  {
    "html": "<!DOCTYPE html><html><head>...</head><body>...</body></html>"
  }
  ```
- 响应 (流式):
  流式响应遵循SSE (Server-Sent Events)格式:
  ```
  data: {"html":"<!DOCTYPE"}

  data: {"html":"<!DOCTYPE html><html>"}

  data: {"html":"<!DOCTYPE html><html><head>"}

  ...

  data: {"done":true,"html":"完整的HTML内容"}
  ```

### 获取可用模板
- 端点: GET /api/generate/templates
- 描述: 获取所有可用的生成网页提示模板
- 响应:
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

### 使用示例
```javascript
// 非流式请求示例
const response = await fetch('/api/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: '一个关于健康饮食的博客网站',
    platform: 'openai',
    promptTemplateId: 'creative'
  })
});
const data = await response.json();
document.getElementById('preview').innerHTML = data.html;

// 流式请求示例
const eventSource = new EventSource('/api/generate', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify({
    prompt: '一个关于健康饮食的博客网站',
    stream: true
  })
});

let currentHtml = '';
eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    document.getElementById('preview').innerHTML = data.html;
    eventSource.close();
  } else {
    currentHtml = data.html;
    document.getElementById('preview').innerHTML = currentHtml;
  }
};
```

## Chat API

### 发送聊天消息
- 端点: POST /api/chat
- 描述: 发送聊天消息并获取AI回复
- 请求体:
  ```json
  {
    "messages": [
      { "role": "system", "content": "你是一个有用的助手" },
      { "role": "user", "content": "你好，请介绍一下自己" }
    ],
    "model": "anthropic/claude-3.7-sonnet:thinking", // 可选，默认为claude-3.7-sonnet
    "stream": false // 可选，设置为true时启用流式响应
  }
  ```
- 响应 (非流式):
  ```json
  {
    "message": "你好！我是Claude，一个由Anthropic开发的AI助手...",
    "role": "assistant"
  }
  ```
- 响应 (流式):
  流式响应遵循SSE (Server-Sent Events)格式:
  ```
  data: {"message":"你好"}

  data: {"message":"你好！我是"}

  data: {"message":"你好！我是Claude，一个由"}

  ...

  data: {"done":true,"message":"完整的回复内容"}
  ```

### 使用示例
```javascript
// 非流式请求示例
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '写一个简单的HTML网页' }
    ]
  })
});
const data = await response.json();
console.log(data.message);

// 流式请求示例
const eventSource = new EventSource('/api/chat?stream=true', {
  headers: { 'Content-Type': 'application/json' },
  method: 'POST',
  body: JSON.stringify({
    messages: [
      { role: 'user', content: '写一个简单的HTML网页' }
    ],
    stream: true
  })
});

eventSource.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.done) {
    eventSource.close();
  } else {
    console.log(data.message);
  }
};
```