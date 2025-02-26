# 项目结构说明

## 目录结构

项目根目录/
├── api/                   # API目录
│   └── index.js          # API处理逻辑，支持多种AI模型
├── public/               # 静态资源目录
│   ├── images/           # 背景图片目录
│   │   ├── bg01.jpg     # 背景图片1
│   │   ├── bg02.jpg     # 背景图片2
│   │   ├── bg03.jpg     # 背景图片3
│   │   ├── bg04.jpg     # 背景图片4
│   │   ├── bg05.jpg     # 背景图片5
│   │   ├── bg06.jpg     # 背景图片6
│   │   ├── bg07.jpg     # 背景图片7
│   │   ├── bg08.jpg     # 背景图片8
│   │   ├── bg09.jpg     # 背景图片9
│   │   └── bg10.jpg     # 背景图片10
│   ├── api.js           # 前端API接口封装
│   ├── games.js         # 游戏逻辑实现
│   ├── index.html       # 主页面
│   ├── script.js        # 主要JavaScript逻辑
│   └── styles.css       # 样式表
│
├── .gitignore           # Git忽略文件配置
├── package.json         # 项目依赖配置文件
└── vercel.json          # Vercel部署配置文件

## 主要文件说明

### 前端文件
- `public/index.html`: 主页面，包含聊天界面和游戏界面的HTML结构
- `public/styles.css`: 所有的样式定义，包括动画效果和响应式设计
- `public/script.js`: 主要的JavaScript逻辑，处理UI交互、聊天功能和游戏控制
- `public/games.js`: 游戏相关的逻辑，包含贪吃蛇和扫雷两个游戏的实现
- `public/api.js`: 前端API通信封装，支持多种AI模型的调用

### 后端文件
- `api/index.js`: API处理逻辑，支持多种AI模型（LinkAI、Claude、CEOK）的调用和错误处理

### 配置文件
- `package.json`: 项目依赖和脚本配置
- `.gitignore`: Git版本控制忽略文件配置
- `vercel.json`: Vercel部署配置，包含路由和环境设置

## 功能模块

1. **聊天系统**
   - 多模型AI对话支持（LinkAI、Claude、CEOK）
   - 实时流式响应
   - 消息显示和动画效果
   - 可折叠的聊天窗口

2. **游戏系统**
   - 贪吃蛇游戏
     * 支持暂停/继续
     * 分数记录
     * 死亡动画效果
   - 扫雷游戏
     * 16x16棋盘
     * 40个地雷
     * 右键插旗标记
     * 连锁反应效果

3. **UI组件**
   - 背景图片自动轮播
   - 可折叠的聊天/游戏窗口
   - 快捷按钮
   - 社交媒体链接
   - 响应式设计

## 运行说明

1. 安装依赖：
   ```bash
   npm install
   ```

2. 启动服务器：
   ```bash
   npm start
   ```

3. 访问应用：
   - 开发环境：`http://localhost:3000`
   - 生产环境：通过Vercel部署的域名访问

## 环境依赖

### Node.js环境
1. Node.js 14+
2. 必需的Node.js包：
   - express: Web服务器框架
   - node-fetch: 网络请求
   - nodemon (dev): 开发环境自动重启

### 前端依赖
- Font Awesome 6.0.0 (CDN)

## 部署说明

### Vercel部署
1. 项目已配置 `vercel.json`，支持直接部署
2. 自动处理API路由和静态文件
3. 环境变量配置：
   - LINKAI_API_KEY
   - CLAUDE_API_KEY
   - CEOK_API_KEY

### 自定义服务器部署
1. 配置Nginx：
   ```nginx
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           root /path/to/your/project/public;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

## API配置

支持多个AI模型的配置：
```javascript
const API_CONFIG = {
    'linkai': {
        url: 'https://api.link-ai.chat/v1/chat/completions',
        key: process.env.LINKAI_API_KEY
    },
    'claude': {
        url: 'https://api.anthropic.com/v1/messages',
        key: process.env.CLAUDE_API_KEY
    },
    'ceok': {
        url: 'https://api.x.ai/v1/chat/completions',
        key: process.env.CEOK_API_KEY
    }
};
```

## 常见问题

1. **API连接问题**
   - 检查环境变量是否正确配置
   - 确认API密钥是否有效
   - 查看服务器日志获取详细错误信息

2. **游戏性能问题**
   - 使用 RequestAnimationFrame 优化动画
   - 使用 DocumentFragment 优化DOM操作
   - 实现防抖处理用户输入

3. **浏览器兼容性**
   - 使用现代CSS特性（需要现代浏览器支持）
   - 使用 ES6+ 语法（需要现代浏览器支持）

## 维护建议

1. 定期更新依赖包
2. 监控API使用情况和错误日志
3. 优化图片资源和加载性能
4. 定期备份游戏数据
5. 保持代码结构清晰，便于维护
```