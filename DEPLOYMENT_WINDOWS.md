# Voice Morph App - Windows 部署指南

## 系统要求

- Windows 10/11 (64位)
- Node.js 16.0 或更高版本
- 至少 4GB RAM
- 至少 1GB 可用磁盘空间

## 安装步骤

### 1. 安装 Node.js

1. 访问 [Node.js 官网](https://nodejs.org/)
2. 下载 Windows 安装包 (推荐 LTS 版本)
3. 运行安装程序，按默认设置安装
4. 验证安装：
   ```cmd
   node --version
   npm --version
   ```

### 2. 安装 FFmpeg

#### 方法一：使用 Chocolatey (推荐)

1. 以管理员身份打开 PowerShell
2. 安装 Chocolatey：
   ```powershell
   Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
   ```
3. 安装 FFmpeg：
   ```cmd
   choco install ffmpeg
   ```

#### 方法二：手动安装

1. 访问 [FFmpeg 官网](https://ffmpeg.org/download.html)
2. 下载 Windows 构建版本
3. 解压到 `C:\ffmpeg`
4. 将 `C:\ffmpeg\bin` 添加到系统 PATH 环境变量

### 3. 下载项目

1. 克隆或下载项目到本地：
   ```cmd
   git clone <repository-url>
   cd yuyinzhuanhuan
   ```

### 4. 安装依赖

```cmd
npm install
```

### 5. 启动应用

```cmd
npm start
```

应用将在 http://localhost:3000 启动

## 故障排除

### 常见问题

1. **"Cannot find ffprobe" 错误**
   - 确保 FFmpeg 已正确安装
   - 检查 PATH 环境变量是否包含 FFmpeg 路径
   - 重启命令提示符或 PowerShell

2. **端口被占用**
   ```cmd
   netstat -ano | findstr :3000
   taskkill /PID <进程ID> /F
   ```

3. **权限问题**
   - 以管理员身份运行命令提示符
   - 检查防火墙设置

### 验证安装

1. 检查 FFmpeg：
   ```cmd
   ffmpeg -version
   ffprobe -version
   ```

2. 检查 Node.js：
   ```cmd
   node --version
   npm --version
   ```

## 生产环境部署

### 使用 PM2 (推荐)

1. 安装 PM2：
   ```cmd
   npm install -g pm2
   ```

2. 启动应用：
   ```cmd
   pm2 start server.js --name "voice-morph"
   ```

3. 设置开机自启：
   ```cmd
   pm2 startup
   pm2 save
   ```

### 使用 IIS (可选)

1. 安装 IIS 和 URL Rewrite 模块
2. 安装 iisnode
3. 配置 web.config 文件
4. 部署应用到 IIS

## 性能优化

1. **内存优化**：
   - 设置 Node.js 内存限制
   - 定期清理临时文件

2. **音频处理优化**：
   - 限制并发处理数量
   - 使用 SSD 存储

3. **网络优化**：
   - 启用 gzip 压缩
   - 设置适当的缓存头

## 安全配置

1. **环境变量**：
   ```cmd
   set JWT_SECRET=your-secret-key
   set NODE_ENV=production
   ```

2. **防火墙**：
   - 只开放必要端口 (3000)
   - 使用反向代理 (Nginx)

3. **HTTPS**：
   - 配置 SSL 证书
   - 强制 HTTPS 重定向

## 监控和维护

1. **日志管理**：
   ```cmd
   pm2 logs voice-morph
   ```

2. **性能监控**：
   ```cmd
   pm2 monit
   ```

3. **备份策略**：
   - 定期备份数据库
   - 备份上传的音频文件

## 更新应用

1. 停止应用：
   ```cmd
   pm2 stop voice-morph
   ```

2. 更新代码：
   ```cmd
   git pull
   npm install
   ```

3. 重启应用：
   ```cmd
   pm2 restart voice-morph
   ```

## 技术支持

如果遇到问题，请检查：
1. Node.js 和 FFmpeg 版本
2. 系统日志
3. 网络连接
4. 磁盘空间

更多帮助请参考项目 README 或提交 Issue。
