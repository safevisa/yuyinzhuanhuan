# 🚀 语音变换应用部署文档

## 📋 系统要求

### 基础环境
- **Node.js**: 版本 16.0 或更高
- **npm**: 版本 8.0 或更高
- **FFmpeg**: 版本 4.0 或更高（用于音频处理）
- **操作系统**: Windows, macOS, Linux

### 推荐配置
- **内存**: 最少 2GB RAM，推荐 4GB+
- **存储**: 最少 1GB 可用空间
- **CPU**: 双核或更高

## 🔧 安装步骤

### 1. 克隆项目
```bash
git clone https://github.com/safevisa/yuyinzhuanhuan.git
cd yuyinzhuanhuan
```

### 2. 安装依赖
```bash
npm install
```

### 3. 安装 FFmpeg

#### Windows

**方法一：使用 Chocolatey (推荐)**
1. 以管理员身份打开 PowerShell
2. 安装 Chocolatey：
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. 安装 FFmpeg：
   ```cmd
   choco install ffmpeg
   ```

**方法二：手动安装**
1. 下载 FFmpeg: https://ffmpeg.org/download.html
2. 解压到 `C:\ffmpeg`
3. 将 `C:\ffmpeg\bin` 添加到系统 PATH 环境变量

**方法三：使用项目内置 FFmpeg (自动)**
项目已配置使用 `ffmpeg-static` 和 `ffprobe-static`，无需手动安装 FFmpeg。

#### macOS
```bash
# 使用 Homebrew
brew install ffmpeg

# 或使用 MacPorts
sudo port install ffmpeg
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt update
sudo apt install ffmpeg
```

#### Linux (CentOS/RHEL)
```bash
sudo yum install epel-release
sudo yum install ffmpeg
```

### 4. 验证 FFmpeg 安装
```bash
ffmpeg -version
```

## ⚙️ 配置设置

### 环境变量（可选）
创建 `.env` 文件：
```env
# 服务器配置
PORT=3000
NODE_ENV=production

# 数据库配置
DB_PATH=./data.db

# 安全配置
SESSION_SECRET=your-super-secret-key-here
JWT_SECRET=your-jwt-secret-key-here

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads

# CORS 配置
FRONTEND_URL=http://localhost:3000
```

### 数据库初始化
数据库会在首次启动时自动创建，无需手动配置。

## 🚀 启动应用

### 开发模式
```bash
npm run dev
# 或
nodemon server.js
```

### 生产模式
```bash
npm start
# 或
node server.js
```

### 后台运行（Linux/macOS）
```bash
# 使用 nohup
nohup node server.js > app.log 2>&1 &

# 使用 PM2（推荐）
npm install -g pm2
pm2 start server.js --name "voice-morph"
pm2 save
pm2 startup
```

## 🌐 访问应用

- **本地访问**: http://localhost:3000
- **网络访问**: http://your-server-ip:3000

## 📁 目录结构

```
yuyinzhuanhuan/
├── server.js              # 主服务器文件
├── database.js            # 数据库操作层
├── audio-processor.js     # 音频处理引擎
├── auth.js               # 认证中间件
├── package.json          # 项目依赖配置
├── data.db              # SQLite 数据库（自动生成）
├── uploads/             # 音频文件存储目录
└── public/              # 静态文件目录
    ├── index.html       # 主页面
    ├── css/            # 样式文件
    └── js/             # JavaScript 文件
        ├── app.js      # 主应用逻辑
        ├── auth.js     # 前端认证
        ├── audio.js    # 音频处理
        ├── i18n.js     # 国际化
        └── navigation.js # 导航管理
```

## 🔒 安全配置

### 生产环境安全建议

1. **更改默认密钥**
   ```env
   SESSION_SECRET=your-unique-session-secret
   JWT_SECRET=your-unique-jwt-secret
   ```

2. **配置 HTTPS**
   - 使用 Nginx 或 Apache 作为反向代理
   - 配置 SSL 证书

3. **防火墙设置**
   ```bash
   # 只开放必要端口
   sudo ufw allow 3000
   sudo ufw enable
   ```

4. **文件权限**
   ```bash
   chmod 755 uploads/
   chmod 644 data.db
   ```

## 📊 性能优化

### 1. 使用 PM2 进程管理
```bash
npm install -g pm2
pm2 start server.js --name "voice-morph" --instances max
pm2 startup
pm2 save
```

### 2. 配置 Nginx 反向代理
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 数据库优化
- 定期清理旧文件
- 监控数据库大小
- 考虑数据备份策略

## 🔧 故障排除

### 常见问题

1. **FFmpeg 未找到**
   ```
   Error: Cannot find ffmpeg
   ```
   **解决方案**: 确保 FFmpeg 已安装并在 PATH 中

2. **端口被占用**
   ```
   Error: listen EADDRINUSE :::3000
   ```
   **解决方案**: 更改端口或停止占用端口的进程

3. **文件上传失败**
   ```
   Error: File too large
   ```
   **解决方案**: 检查文件大小限制和磁盘空间

4. **数据库错误**
   ```
   Error: SQLITE_CANTOPEN
   ```
   **解决方案**: 检查文件权限和磁盘空间

### 日志查看
```bash
# 查看应用日志
pm2 logs voice-morph

# 查看错误日志
pm2 logs voice-morph --err

# 实时监控
pm2 monit
```

## 📈 监控和维护

### 1. 健康检查
```bash
# 检查应用状态
curl http://localhost:3000/api/effects

# 检查数据库
sqlite3 data.db ".tables"
```

### 2. 定期维护
- 清理临时文件
- 备份数据库
- 更新依赖包
- 监控磁盘使用

### 3. 备份策略
```bash
# 备份数据库
cp data.db data.db.backup.$(date +%Y%m%d)

# 备份上传文件
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## 🚀 部署到云服务器

### 1. 准备服务器
- 安装 Node.js 和 FFmpeg
- 配置防火墙
- 设置域名和 SSL

### 2. 部署步骤
```bash
# 克隆代码
git clone https://github.com/safevisa/yuyinzhuanhuan.git
cd yuyinzhuanhuan

# 安装依赖
npm install --production

# 启动应用
pm2 start server.js --name "voice-morph"
```

### 3. 域名配置
- 配置 DNS 解析
- 设置 SSL 证书
- 配置反向代理

## 📞 技术支持

如遇到部署问题，请检查：
1. 系统要求是否满足
2. FFmpeg 是否正确安装
3. 端口是否被占用
4. 文件权限是否正确
5. 查看应用日志获取详细错误信息

## 📖 详细部署指南

- **Windows 用户**: 请参考 [Windows 部署指南](DEPLOYMENT_WINDOWS.md) 获取详细的 Windows 安装说明
- **macOS 用户**: 参考上述 macOS 安装步骤
- **Linux 用户**: 参考上述 Linux 安装步骤

---

**部署完成后，您的语音变换应用就可以正常使用了！** 🎉
