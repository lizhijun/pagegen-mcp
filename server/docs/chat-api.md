# Chat API 文档

## 概述

Chat API 提供了与AI模型进行对话的能力，支持多轮对话以及流式响应。服务器使用OpenRouter作为代理，可以访问多种不同的AI模型，包括Claude、GPT-4等。

## API 端点

### 发送聊天消息

**URL:** `/api/chat`

**方法:** `POST`

**Content-Type:** `application/json`

### 请求参数

| 参数名   | 类型    | 必填 | 描述                                                         |
|----------|---------|------|--------------------------------------------------------------|
| messages | Array   | 是   | 对话消息数组，每条消息包含role和content字段                  |
| model    | String  | 否   | 使用的AI模型，默认为"anthropic/claude-3.7-sonnet:thinking"   |
| stream   | Boolean | 否   | 是否使用流式响应，默认为false                                |

**messages数组格式:**

```json
[
  { "role": "system", "content": "系统提示内容" },
  { "role": "user", "content": "用户消息内容" },
  { "role": "assistant", "content": "AI响应内容" }
]
```

- `role` 可选值:
  - `system`: 系统指令，用于设置AI的行为和限制
  - `user`: 用户发送的消息
  - `assistant`: AI之前的回复，用于提供对话上下文

### 响应格式

#### 非流式响应

**Content-Type:** `application/json`

**成功响应:**

```json
{
  "message": "AI回复的内容",
  "role": "assistant"
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
data: {"message":"部分回复内容"}
```

最后一个数据块会包含done字段:

```
data: {"done":true,"message":"完整的回复内容"}
```

错误信息:

```
data: {"error":"错误描述"}
```

## 使用示例

### 基本使用 (非流式)

```javascript
async function sendChatMessage() {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '你是一个有用的助手' },
        { role: 'user', content: '请简要介绍一下中国的四大发明' }
      ],
      model: 'anthropic/claude-3.7-sonnet:thinking'
    })
  });
  
  const data = await response.json();
  console.log(data.message);
}
```

### 流式响应使用示例

```javascript
function sendStreamingChatMessage() {
  const eventSource = new EventSource('/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messages: [
        { role: 'system', content: '你是一个有用的助手' },
        { role: 'user', content: '请简要介绍一下中国的四大发明' }
      ],
      stream: true
    })
  });

  let fullResponse = '';
  
  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data);
    
    if (data.error) {
      console.error('Error:', data.error);
      eventSource.close();
      return;
    }
    
    if (data.done) {
      console.log('Final response:', data.message);
      eventSource.close();
    } else {
      // 累积部分响应
      fullResponse = data.message;
      console.log('Partial response:', fullResponse);
    }
  };
  
  eventSource.onerror = (error) => {
    console.error('EventSource error:', error);
    eventSource.close();
  };
}
```

### 多轮对话示例

```javascript
async function multiTurnConversation() {
  // 初始化对话历史
  const conversation = [
    { role: 'system', content: '你是一个有用的助手' }
  ];
  
  // 第一轮对话
  conversation.push({ role: 'user', content: '你好，请介绍一下自己' });
  
  const response1 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation })
  });
  
  const data1 = await response1.json();
  const assistantReply = data1.message;
  
  // 将AI的回复添加到对话历史
  conversation.push({ role: 'assistant', content: assistantReply });
  
  // 第二轮对话
  conversation.push({ role: 'user', content: '你能告诉我更多关于你的能力吗？' });
  
  const response2 = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages: conversation })
  });
  
  const data2 = await response2.json();
  console.log(data2.message);
}
```

## 错误处理

| HTTP 状态码 | 描述                                   |
|-------------|----------------------------------------|
| 400         | 请求参数错误，如缺少必要的messages参数 |
| 500         | 服务器内部错误                         |

错误响应格式:

```json
{
  "error": "错误描述信息"
}
```

## 注意事项

1. 对话历史需要在客户端维护，每次请求都需要发送完整的对话上下文
2. 使用流式响应时，需要妥善处理SSE连接的关闭
3. 默认使用的是Claude 3.7 Sonnet，但可以通过model参数更换为其他模型 