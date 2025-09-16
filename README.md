# 🎙️ VoiceMorph - AI语音变换应用

一个现代化的语音变换Web应用，支持录制、上传和实时变换语音效果。

## ✨ 特性

- 🎵 **实时录音** - 浏览器内录制高质量音频
- 🎛️ **多种音效** - 机器人、花栗鼠、深沉、回声等效果
- 🌍 **多语言支持** - 中文、英文、西班牙语
- 🎨 **现代化界面** - 响应式设计，支持深色/浅色主题
- 📱 **移动端友好** - 完全响应式，支持触控操作
- 🎶 **音频可视化** - 实时频谱显示
- 💾 **文件上传** - 支持MP3、WAV、WEBM格式
- 🔄 **即时处理** - 快速音频变换

## 🚀 快速开始

### 环境要求

- Node.js 16+ 
- 现代浏览器（支持Web Audio API）

### 🌐 Vercel 一键部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/safevisa/yuyinzhuanhuan)

1. 点击上方按钮
2. 连接您的 GitHub 账户
3. 选择仓库并部署
4. 等待部署完成

详细部署说明请参考 [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)

### 本地安装和运行

1. **克隆或下载项目**
   ```bash
   cd yuyinzhuanhuan
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **启动应用**
   ```bash
   npm start
   ```

4. **访问应用**
   - 打开浏览器访问: http://localhost:3000
   - 允许麦克风权限以使用录音功能

### 开发模式

```bash
npm run dev
```

使用nodemon自动重启服务器。

## 📁 项目结构

```
yuyinzhuanhuan/
├── server.js              # Express服务器
├── package.json            # 项目配置
├── README.md              # 项目文档
├── public/                # 前端静态文件
│   ├── index.html         # 主页面
│   ├── css/
│   │   └── style.css      # 样式文件
│   └── js/
│       ├── app.js         # 主应用逻辑
│       ├── audio.js       # 音频处理
│       └── i18n.js        # 国际化支持
└── uploads/               # 音频文件存储（自动创建）
```

## 🎮 使用方法

### 录制音频
1. 点击"开始录制"按钮
2. 允许麦克风权限
3. 说话或发声
4. 点击"停止"按钮完成录制

### 上传音频
1. 点击"上传音频文件"按钮
2. 选择音频文件（MP3、WAV、WEBM）
3. 文件大小限制：10MB

### 应用音效
1. 完成录制或上传后，选择想要的音效
2. 系统自动处理音频
3. 播放结果并下载

## 🌐 多语言支持

应用支持以下语言：
- 🇺🇸 English
- 🇨🇳 中文 
- 🇪🇸 Español

通过页面右上角的语言选择器切换语言。

## 🎨 主题切换

支持深色和浅色主题，点击右上角的主题切换按钮。

## 🔧 技术栈

### 后端
- **Node.js** - 运行环境
- **Express** - Web框架
- **Multer** - 文件上传处理
- **CORS** - 跨域支持

### 前端
- **HTML5** - 结构标记
- **CSS3** - 现代样式，支持CSS变量和动画
- **JavaScript ES6+** - 现代JavaScript特性
- **Web Audio API** - 音频录制和处理
- **Canvas API** - 音频可视化

## 🚧 开发计划

当前版本是MVP（最小可行产品），未来计划：

- [ ] 集成真实的音频处理库（FFmpeg）
- [ ] 更多音效类型
- [ ] 音频剪辑功能
- [ ] 用户账户系统
- [ ] 音频分享功能
- [ ] 批量处理
- [ ] API接口文档

## 📝 API 接口

### GET /api/effects
获取可用的音效列表

### POST /api/transform
变换音频
- `audio`: 音频文件（multipart/form-data）
- `effect`: 音效类型

### GET /api/download/:filename
下载处理后的音频文件

## 🐛 故障排除

### 麦克风不工作
- 确保浏览器有麦克风权限
- 检查系统麦克风是否正常
- 尝试刷新页面重新授权

### 音频上传失败
- 检查文件格式（仅支持音频文件）
- 确保文件大小小于10MB
- 尝试不同的音频格式

### 处理失败
- 检查网络连接
- 尝试重新录制或上传
- 查看浏览器控制台错误信息

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

MIT License

## 🙏 鸣谢

- Font Awesome - 图标库
- Web Audio API - 音频处理技术
- Express.js - Web框架

---

**享受语音变换的乐趣！** 🎉
