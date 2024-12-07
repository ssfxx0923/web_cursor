# 项目结构说明

## 目录结构

项目根目录/
├── images/                 # 背景图片目录
│   ├── bg01.jpg           # 背景图片1 (610KB)
│   ├── bg02.jpg           # 背景图片2 (1.68MB)
│   ├── bg03.jpg           # 背景图片3 (1.09MB)
│   ├── bg04.jpg           # 背景图片4 (1.71MB)
│   ├── bg05.jpg           # 背景图片5 (1.17MB)
│   ├── bg06.jpg           # 背景图片6 (938KB)
│   ├── bg07.jpg           # 背景图片7 (2.44MB)
│   ├── bg08.jpg           # 背景图片8 (1.26MB)
│   ├── bg09.jpg           # 背景图片9 (1.02MB)
│   ├── bg10.jpg           # 背景图片10 (1.43MB)
│   ├── bg11.jpg           # 背景图片11 (1.99MB)
│   ├── bg12.jpg           # 背景图片12 (1.02MB)
│   └── bg13.jpg           # 背景图片13 (1.85MB)
│
├── api.js                 # API接口封装 (2.02KB)
├── games.js              # 游戏逻辑实现 (15.56KB)
├── index.html            # 主页面 (6.90KB)
├── script.js             # 主要JavaScript逻辑 (8.04KB)
├── server.js             # Node.js服务器 (824B)
├── server.py             # Python Flask服务器 (2.21KB)
└── styles.css            # 样式表 (16.70KB)

## 主要文件说明

### 前端文件
- `index.html`: 主页面，包含聊天界面和游戏界面的HTML结构
- `styles.css`: 所有的样式定义，包括动画效果
- `script.js`: 主要的JavaScript逻辑，处理UI交互和聊天功能
- `games.js`: 游戏相关的逻辑，包含贪吃蛇和扫雷两个游戏
- `api.js`: API通信相关的封装

### 后端文件
- `server.py`: Python Flask服务器，处理与Link AI API的通信
- `server.js`: Node.js备用服务器

### 资源文件
- `images/`: 存放背景图片的目录，包含13张轮播背景图

## 功能模块

1. **聊天系统**
   - AI对话功能
   - 消息显示和动画
   - 实时响应

2. **游戏系统**
   - 贪吃蛇游戏
   - 扫雷游戏
   - 游戏状态管理

3. **UI组件**
   - 背景图片轮播
   - 可折叠的聊天窗口
   - 可折叠的游戏窗口
   - 快捷按钮
   - 社交媒体链接

## 运行说明

1. 启动后端服务器（二选一）：
   ```bash
   # 使用Python服务器
   python server.py
   
   # 或使用Node.js服务器
   node server.js
   ```

2. 访问应用：
   - 打开浏览器访问 `http://127.0.0.1:5000/index.html`

## 注意事项

1. 确保安装所需依赖：
   - Python: Flask, flask-cors, requests
   - Node.js: express, cors, node-fetch

2. 图片资源较大，首次加载可能需要一定时间
3. 需要通过HTTP服务器访问，不能直接打开HTML文件

## 环境依赖

### Python环境
1. Python 3.6+ 
2. 必需的Python包：
   ```bash
   pip install flask
   pip install flask-cors
   pip install requests
   pip install urllib3
   ```
   或使用requirements.txt安装：
   ```bash
   pip install -r requirements.txt
   ```

### Node.js环境（备选）
1. Node.js 12+
2. 必需的Node.js包：
   ```bash
   npm install express
   npm install cors
   npm install node-fetch
   ```
   或使用package.json安装：
   ```bash
   npm install
   ```

### 前端依赖
1. Font Awesome 6.0.0
   - 已通过CDN引入：
   ```html
   <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
   ```

## 部署说明

### 本地部署
1. 克隆或下载项目文件
2. 安装所需依赖
3. 启动服务器
4. 访问应用

### 服务器部署
1. 将所有文件上传到服务器
2. 安装所需依赖
3. 配置服务器（Apache/Nginx）：
   ```nginx
   # Nginx配置示例
   server {
       listen 80;
       server_name your_domain.com;

       location / {
           root /path/to/your/project;
           index index.html;
           try_files $uri $uri/ /index.html;
       }

       location /chat {
           proxy_pass http://127.0.0.1:5000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

4. 启动后端服务
5. 访问应用

## 配置说明

### API配置
1. 在 `server.py` 中配置 Link AI API密钥：
   ```python
   API_KEY = 'your_api_key_here'
   ```

2. 在 `server.js` 中配置（如果使用Node.js）：
   ```javascript
   const API_KEY = 'your_api_key_here';
   ```

### 端口配置
- Python服务器默认端口：5000
- Node.js服务器默认端口：3000

可在各自的服务器文件中修改：
python
# server.py
app.run(port=5000, debug=True)
```
```javascript
// server.js
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
```

## 常见问题

1. **CORS错误**
   - 确保已正确配置CORS
   - 检查服务器是否正确响应OPTIONS请求

2. **图片加载问题**
   - 检查图片路径是否正确
   - 确保图片文件权限正确
   - 考虑使用图片压缩优化加载速度

3. **API连接问题**
   - 检查API密钥是否正确
   - 确认网络连接正常
   - 查看服务器日志获取详细错误信息

## 维护建议

1. 定期更新依赖包
2. 监控API使用情况
3. 备份重要数据
4. 检查服务器日志
5. 优化图片资源
```