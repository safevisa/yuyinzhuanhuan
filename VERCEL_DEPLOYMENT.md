# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 方法一：通过 Vercel CLI

1. **安装 Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **登录 Vercel**
   ```bash
   vercel login
   ```

3. **部署项目**
   ```bash
   vercel
   ```

4. **生产环境部署**
   ```bash
   vercel --prod
   ```

### 方法二：通过 GitHub 集成

1. **连接 GitHub 仓库**
   - 访问 [vercel.com](https://vercel.com)
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 选择 `safevisa/yuyinzhuanhuan` 仓库

2. **配置项目设置**
   - Framework Preset: `Other`
   - Build Command: `npm run build`
   - Output Directory: `./`
   - Install Command: `npm install`

3. **环境变量设置**
   - 在 Vercel 项目设置中添加以下环境变量：
     - `NODE_ENV`: `production`

4. **部署**
   - 点击 "Deploy" 按钮
   - Vercel 会自动构建和部署项目

## ⚠️ 重要注意事项

### Vercel 版本限制
- **音频处理功能已禁用** - Vercel 版本使用 `vercel-server.js`，不包含完整的音频处理功能
- **演示模式** - 所有 API 端点返回模拟数据，用于展示界面和功能
- **完整功能** - 要使用完整的音频处理功能，请使用本地部署 (`npm start`)

### 文件上传限制
- Vercel 对文件上传有 4.5MB 的限制
- 当前应用支持最大 10MB 音频文件
- 建议在 Vercel 上调整文件大小限制或使用外部存储

### 数据库
- Vercel 版本使用内存数据库（临时存储）
- 数据在每次部署后都会重置
- 建议迁移到 Vercel Postgres 或其他云数据库

### 音频处理
- FFmpeg 在 Vercel 上已禁用
- 建议使用外部音频处理服务或本地部署

## 🔧 优化建议

### 1. 使用 Vercel Postgres
```bash
# 安装 Vercel Postgres
vercel addons create postgres
```

### 2. 使用外部存储
- AWS S3
- Cloudinary
- Vercel Blob Storage

### 3. 音频处理服务
- AWS Lambda
- Google Cloud Functions
- 第三方音频处理 API

## 📁 项目结构

```
yuyinzhuanhuan/
├── vercel.json          # Vercel 配置
├── .vercelignore        # Vercel 忽略文件
├── server.js            # 主服务器文件
├── package.json         # 项目配置
└── public/              # 静态文件
```

## 🌐 部署后访问

部署成功后，您将获得一个 Vercel 域名：
- 开发环境：`https://yuyinzhuanhuan-xxx.vercel.app`
- 生产环境：`https://yuyinzhuanhuan.vercel.app`

## 🔄 自动部署

连接到 GitHub 后，每次推送到 main 分支都会自动触发部署。

## 📞 支持

如果遇到部署问题，请检查：
1. Vercel 控制台的构建日志
2. 环境变量设置
3. 文件大小限制
4. 依赖项安装

---

**享受在 Vercel 上的语音变换应用！** 🎉
