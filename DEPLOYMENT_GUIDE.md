# VoiceMorph 部署指南

## 目录
- [概述](#概述)
- [系统要求](#系统要求)
- [环境配置](#环境配置)
- [数据库部署](#数据库部署)
- [应用部署](#应用部署)
- [监控与维护](#监控与维护)
- [故障排除](#故障排除)
- [安全配置](#安全配置)

## 概述

VoiceMorph 是一个基于 Node.js 的语音转换 Web 应用程序，支持多种部署方式：
- 本地开发环境
- Vercel 无服务器部署
- 传统服务器部署

## 系统要求

### 最低要求
- Node.js 16.0+ 
- npm 8.0+
- 2GB RAM
- 1GB 存储空间

### 推荐配置
- Node.js 18.0+
- npm 9.0+
- 4GB RAM
- 10GB 存储空间
- SSD 存储

### 依赖软件
- FFmpeg (用于音频处理)
- SQLite3 (数据库)

## 环境配置

### 1. 环境变量设置

创建 `.env` 文件：

```bash
# 应用配置
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-domain.com

# 数据库配置
DB_PATH=/path/to/production/data.db
DB_BACKUP_PATH=/path/to/backups

# 安全配置
JWT_SECRET=your-super-secret-jwt-key-here
SESSION_SECRET=your-super-secret-session-key-here

# 文件上传配置
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/path/to/uploads

# 音频处理配置
FFMPEG_PATH=/usr/bin/ffmpeg
FFPROBE_PATH=/usr/bin/ffprobe

# 邮件配置 (可选)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# 支付配置 (可选)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
```

### 2. 安装依赖

```bash
# 安装 Node.js 依赖
npm install

# 安装 FFmpeg (Ubuntu/Debian)
sudo apt update
sudo apt install ffmpeg

# 安装 FFmpeg (CentOS/RHEL)
sudo yum install epel-release
sudo yum install ffmpeg

# 安装 FFmpeg (macOS)
brew install ffmpeg
```

## 数据库部署

### 1. 生产环境数据库配置

修改 `database.js` 中的数据库路径：

```javascript
// 生产环境使用持久化数据库
const dbPath = process.env.NODE_ENV === 'production' 
    ? process.env.DB_PATH || '/var/lib/voicemorph/data.db'
    : path.join(__dirname, 'data.db');
```

### 2. 数据库初始化

```bash
# 创建数据库目录
sudo mkdir -p /var/lib/voicemorph
sudo chown -R $USER:$USER /var/lib/voicemorph

# 初始化数据库
node -e "
const Database = require('./database.js');
const db = new Database();
console.log('Database initialized successfully');
"
```

### 3. 数据库备份策略

#### 自动备份脚本

创建 `scripts/backup-db.sh`：

```bash
#!/bin/bash

# 配置
DB_PATH="/var/lib/voicemorph/data.db"
BACKUP_DIR="/var/backups/voicemorph"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="voicemorph_backup_${DATE}.db"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
cp $DB_PATH "$BACKUP_DIR/$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_DIR/$BACKUP_FILE"

# 删除7天前的备份
find $BACKUP_DIR -name "voicemorph_backup_*.db.gz" -mtime +7 -delete

echo "Database backup completed: $BACKUP_FILE.gz"
```

#### 设置定时备份

```bash
# 编辑 crontab
crontab -e

# 添加每日凌晨2点备份
0 2 * * * /path/to/scripts/backup-db.sh
```

### 4. 数据库迁移

#### 从开发环境迁移到生产环境

```bash
# 1. 导出开发数据库
sqlite3 data.db ".backup development_backup.db"

# 2. 传输到生产服务器
scp development_backup.db user@production-server:/tmp/

# 3. 在生产服务器恢复
sqlite3 /var/lib/voicemorph/data.db ".restore /tmp/development_backup.db"
```

## 应用部署

### 1. 本地开发部署

```bash
# 克隆项目
git clone <repository-url>
cd yuyinzhuanhuan

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

### 2. Vercel 无服务器部署

#### 配置 Vercel

创建 `vercel.json`：

```json
{
  "version": 2,
  "builds": [
    {
      "src": "vercel-server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "vercel-server.js"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

#### 部署步骤

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署
vercel --prod
```

### 3. 传统服务器部署

#### 使用 PM2 进程管理

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'voicemorph',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save
pm2 startup
```

#### 使用 Nginx 反向代理

创建 Nginx 配置 `/etc/nginx/sites-available/voicemorph`：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;

    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";

    # 静态文件
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

    # 文件上传大小限制
    client_max_body_size 10M;
}
```

启用配置：

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/voicemorph /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

## 监控与维护

### 1. 健康检查

应用提供健康检查端点：

```bash
# 检查应用状态
curl http://localhost:3000/api/health

# 预期响应
{
  "status": "ok",
  "environment": "production",
  "platform": "server",
  "message": "VoiceMorph API is running"
}
```

### 2. 日志管理

#### 配置日志轮转

创建 `/etc/logrotate.d/voicemorph`：

```
/var/log/voicemorph/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload voicemorph
    endscript
}
```

### 3. 性能监控

#### 使用 PM2 监控

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs voicemorph

# 监控资源使用
pm2 monit

# 重启应用
pm2 restart voicemorph
```

#### 系统监控脚本

创建 `scripts/monitor.sh`：

```bash
#!/bin/bash

# 检查应用状态
if ! curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "Application is down, restarting..."
    pm2 restart voicemorph
fi

# 检查磁盘空间
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Warning: Disk usage is ${DISK_USAGE}%"
fi

# 检查内存使用
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ $MEMORY_USAGE -gt 90 ]; then
    echo "Warning: Memory usage is ${MEMORY_USAGE}%"
fi
```

## 故障排除

### 1. 常见问题

#### 应用无法启动

```bash
# 检查端口占用
netstat -tulpn | grep :3000

# 检查进程
ps aux | grep node

# 查看错误日志
pm2 logs voicemorph --err
```

#### 数据库连接问题

```bash
# 检查数据库文件权限
ls -la /var/lib/voicemorph/data.db

# 修复权限
sudo chown -R $USER:$USER /var/lib/voicemorph/
```

#### 音频处理失败

```bash
# 检查 FFmpeg 安装
ffmpeg -version

# 检查 FFmpeg 路径
which ffmpeg

# 测试音频处理
ffmpeg -i input.wav -af "asetrate=44100*1.5" output.wav
```

### 2. 性能优化

#### 数据库优化

```sql
-- 创建索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_recordings_user_id ON recordings(user_id);
CREATE INDEX idx_recordings_created_at ON recordings(created_at);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- 分析查询性能
EXPLAIN QUERY PLAN SELECT * FROM users WHERE email = ?;
```

#### 应用优化

```javascript
// 启用 gzip 压缩
const compression = require('compression');
app.use(compression());

// 设置缓存头
app.use((req, res, next) => {
    if (req.url.match(/\.(css|js|png|jpg|jpeg|gif|ico|svg)$/)) {
        res.setHeader('Cache-Control', 'public, max-age=31536000');
    }
    next();
});
```

## 安全配置

### 1. 环境安全

```bash
# 设置文件权限
chmod 600 .env
chmod 700 /var/lib/voicemorph/
chmod 700 /var/backups/voicemorph/

# 配置防火墙
sudo ufw allow 22
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. 应用安全

#### 更新依赖

```bash
# 检查安全漏洞
npm audit

# 修复漏洞
npm audit fix

# 更新依赖
npm update
```

#### 配置 HTTPS

```bash
# 使用 Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. 数据安全

#### 数据库加密

```bash
# 使用 SQLCipher 加密数据库
npm install sqlcipher

# 修改 database.js 使用加密
const sqlite3 = require('sqlcipher').verbose();
```

#### 备份加密

```bash
# 加密备份文件
gpg --symmetric --cipher-algo AES256 voicemorph_backup.db

# 解密备份文件
gpg --decrypt voicemorph_backup.db.gpg > voicemorph_backup.db
```

## 部署检查清单

### 部署前检查

- [ ] 环境变量配置正确
- [ ] 数据库路径设置正确
- [ ] FFmpeg 安装并可用
- [ ] 文件权限设置正确
- [ ] SSL 证书配置
- [ ] 防火墙规则配置
- [ ] 备份策略实施

### 部署后验证

- [ ] 应用健康检查通过
- [ ] 用户注册功能正常
- [ ] 音频上传和处理正常
- [ ] 数据库操作正常
- [ ] 日志记录正常
- [ ] 监控系统工作正常

### 维护任务

- [ ] 定期备份数据库
- [ ] 监控系统资源使用
- [ ] 更新依赖包
- [ ] 检查安全漏洞
- [ ] 清理日志文件
- [ ] 性能优化调整

---

## 联系支持

如有部署问题，请检查：
1. 日志文件：`pm2 logs voicemorph`
2. 系统资源：`htop` 或 `top`
3. 网络连接：`netstat -tulpn`
4. 数据库状态：`sqlite3 /var/lib/voicemorph/data.db ".tables"`

更多技术支持，请参考项目文档或提交 Issue。
