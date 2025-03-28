我来帮你了解这个项目的架构，并说明如何部署到 CentOS 生产环境。让我先查看一些关键文件来了解项目结构。


Read file: server/package.json

Read file: server/src/index.ts

根据查看的文件内容，我可以为你总结这个项目的架构和部署方案：

### 项目架构
1. **技术栈**:
   - 后端: Node.js + TypeScript + Express
   - 主要依赖:
     - express: Web 框架
     - cors: 跨域支持
     - dotenv: 环境变量管理
     - axios: HTTP 客户端
     - openai: OpenAI API 集成

2. **项目结构**:
   - `/src`: 源代码目录
   - `/dist`: 编译后的 JavaScript 文件目录
   - 使用 TypeScript 开发，需要编译成 JavaScript 运行

### CentOS 生产环境部署步骤

1. **环境准备**:
```bash
# 安装 Node.js 和 npm
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs

# 安装 PM2 (用于进程管理)
sudo npm install -g pm2
```

2. **项目部署**:
```bash
# 创建部署目录
sudo mkdir -p /var/www/pagegen-mcp
sudo chown -R $USER:$USER /var/www/pagegen-mcp

# 克隆项目到服务器
git clone <your-repo-url> /var/www/pagegen-mcp

# 进入项目目录
cd /var/www/pagegen-mcp/server

# 安装依赖
npm install

# 构建项目
npm run build
```

3. **环境配置**:
```bash
# 创建并配置 .env 文件
cp .env.example .env
# 编辑 .env 文件，设置必要的环境变量
```

4. **使用 PM2 启动服务**:
```bash
# 创建 PM2 配置文件 ecosystem.config.js
pm2 ecosystem

# 编辑 ecosystem.config.js，添加以下内容：
module.exports = {
  apps: [{
    name: "pagegen-mcp",
    script: "./dist/index.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "production",
      PORT: 3001
    }
  }]
}

# 启动服务
pm2 start ecosystem.config.js
```

5. **Nginx 配置** (推荐):
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

6. **安全配置**:
```bash
# 配置防火墙
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 如果使用 SELinux
sudo setsebool -P httpd_can_network_connect 1
```

7. **监控和维护**:
```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs pagegen-mcp

# 重启应用
pm2 restart pagegen-mcp
```

### 注意事项
1. 确保服务器有足够的内存和 CPU 资源
2. 建议使用 HTTPS 进行安全传输
3. 定期备份数据和配置文件
4. 设置日志轮转以防止日志文件过大
5. 配置监控告警系统
6. 确保所有敏感信息（如 API 密钥）都通过环境变量配置

## API 文档

### 主要API

- **书籍API**: `/api/books` - 查询和搜索书籍信息
- **生成API**: `/api/generate` - 使用AI生成HTML网页
- **上传API**: `/api/upload` - 文件上传功能
- **GitHub API**: `/api/github` - GitHub相关功能
- **聊天API**: `/api/chat` - 与AI进行对话交互

更详细的API使用方法，请参考：
- [基本API文档](./API.md)
- [聊天API详细文档](./docs/chat-api.md)
- [生成API详细文档](./docs/generate-api.md)

需要我详细解释任何步骤吗？或者你有其他具体的问题需要了解？
