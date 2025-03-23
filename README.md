# MCP 网页生成器

基于OpenRouter API的网页生成工具，可以根据文本描述和主题生成完整的HTML网页。

## 功能特性

- 根据文本提示生成完整的HTML网页
- 支持自定义设计主题
- 实时预览生成的网页
- 下载生成的HTML文件
- 通过OpenRouter API支持多种AI模型

## 技术栈

- 前端: React、TypeScript、Vite
- 后端: Node.js、Express、TypeScript
- API: OpenRouter API (支持多种AI模型)

## 安装和运行

### 前提条件

- Node.js (v18+)
- npm (v9+)
- OpenRouter API 密钥

### 安装步骤

1. 克隆项目

```
git clone <repository-url>
cd mcp
```

2. 安装依赖

```
npm run setup
```

3. 配置环境变量

在 `server/.env` 文件中配置以下内容:

```
PORT=3001
OPENROUTER_API_KEY=your-openrouter-api-key-here
```

请将 `your-openrouter-api-key-here` 替换为你的OpenRouter API密钥。您可以在 [OpenRouter网站](https://openrouter.ai/) 注册并获取API密钥。

4. 启动应用

```
npm run dev
```

应用将在以下地址运行:
- 前端: http://localhost:3000
- 后端: http://localhost:3001

## 使用方法

1. 在首页输入您想要生成的网页描述
2. 可选择输入设计主题
3. 点击"生成网页"按钮
4. 在预览页面查看生成的网页
5. 可选择下载HTML文件或返回修改描述

## 支持的AI模型

默认使用Claude 3 Opus模型，但您可以通过修改 `server/src/services/openaiService.ts` 文件中的 `model` 参数来选择其他OpenRouter支持的模型，例如:

- `anthropic/claude-3-opus:beta` - Claude 3 Opus
- `anthropic/claude-3-sonnet:beta` - Claude 3 Sonnet 
- `google/gemini-pro` - Google Gemini Pro
- `openai/gpt-4-turbo` - OpenAI GPT-4 Turbo
- `meta-llama/llama-3-70b-instruct` - Llama 3 70B

完整的模型列表请参考 [OpenRouter模型页面](https://openrouter.ai/models)。

## 许可证

MIT 