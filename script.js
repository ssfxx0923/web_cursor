import { sendToLinkAI } from './api.js';
import { GameManager } from './games.js';

// 删除所有其他的 DOMContentLoaded 事件监听器，只保留这一个
document.addEventListener('DOMContentLoaded', () => {
    // 获取所有需要的元素
    const chatBox = document.querySelector('.chat-box');
    const gameBox = document.querySelector('.game-box');
    const quickButtons = document.querySelector('.quick-buttons');
    const footer = document.querySelector('footer');
    const userInput = document.getElementById('userInput');
    const gameMenu = document.querySelector('.game-menu');
    const socialLinks = document.querySelector('.social-links');
    
    // 初始化游戏管理器
    const gameManager = new GameManager();
    
    // 初始化聊天框
    if (chatBox) {
        chatBox.style.display = 'flex';
        chatBox.classList.remove('collapsed');
    }
    
    // 初始化游戏框
    if (gameBox) {
        gameBox.style.display = 'none';
        gameBox.classList.add('collapsed');
    }
    
    // 确保游戏菜单可见但游戏框隐藏
    if (gameMenu) {
        gameMenu.style.display = 'flex';  // 改为 flex 以显示游戏菜单
    }
    
    // 隐藏游戏界面
    document.getElementById('snakeGame').style.display = 'none';
    document.getElementById('minesweeperGame').style.display = 'none';
    
    // 隐藏快捷按钮、页脚和社交链接
    if (quickButtons) {
        quickButtons.classList.add('hidden');
        quickButtons.style.display = 'none';
    }
    if (footer) {
        footer.classList.add('hidden');
        footer.style.display = 'none';
    }
    if (socialLinks) {
        socialLinks.classList.add('hidden');
        socialLinks.style.display = 'none';
    }
    
    // 确保输入框可以输入
    if (userInput) {
        userInput.removeAttribute('disabled');
        userInput.focus();
    }
    
    // 初始化事件监听
    initChatEvents();
    initGameOptions();
    addReturnToMenuButtons();
    
    // 绑定按钮事件
    const openGameBtn = document.getElementById('openGame');
    const toggleGameBtn = document.getElementById('toggleGame');
    const openChatBtn = document.getElementById('openChat');
    const toggleChatBtn = document.getElementById('toggleChat');
    
    if (openGameBtn) openGameBtn.addEventListener('click', openGame);
    if (toggleGameBtn) toggleGameBtn.addEventListener('click', closeGame);
    if (openChatBtn) openChatBtn.addEventListener('click', openChat);
    if (toggleChatBtn) toggleChatBtn.addEventListener('click', closeChat);
});

// 删除其他所有的 DOMContentLoaded 事件监听器

// 游戏按钮事件监听
const openGameBtn = document.getElementById('openGame');
const toggleGameBtn = document.getElementById('toggleGame');

// 打开游戏框
function openGame(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const gameBox = document.querySelector('.game-box');
    const quickButtons = document.querySelector('.quick-buttons');
    const chatBox = document.querySelector('.chat-box');
    const footer = document.querySelector('footer');
    const gameMenu = document.querySelector('.game-menu');
    
    // 确保聊天框是关闭的
    if (chatBox) {
        chatBox.style.display = 'none';
        chatBox.classList.add('collapsed');
    }
    
    // 显示游戏框和游戏菜单
    if (gameBox) {
        gameBox.style.display = 'flex';
        gameMenu.style.display = 'flex';  // 确保游戏菜单显示
        quickButtons.classList.add('hidden');
        footer.classList.add('hidden');
        
        requestAnimationFrame(() => {
            gameBox.classList.remove('collapsed');
        });
    }
}

// 关闭游戏框
function closeGame(e) {
    if (e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    const gameBox = document.querySelector('.game-box');
    const quickButtons = document.querySelector('.quick-buttons');
    const footer = document.querySelector('footer');
    const socialLinks = document.querySelector('.social-links');
    const gameMenu = document.querySelector('.game-menu');
    const snakeGame = document.getElementById('snakeGame');
    const minesweeperGame = document.getElementById('minesweeperGame');
    
    // 隐藏所有游戏界面
    snakeGame.style.display = 'none';
    minesweeperGame.style.display = 'none';
    
    // 显示游戏菜单
    gameMenu.style.display = 'flex';
    
    // 关闭游戏框
    gameBox.classList.add('collapsed');
    setTimeout(() => {
        gameBox.style.display = 'none';
        
        // 显示快捷按钮
        if (quickButtons) {
            quickButtons.classList.remove('hidden');
            quickButtons.style.display = 'flex';
        }
        
        // 显示页脚
        if (footer) {
            footer.classList.remove('hidden');
            footer.style.display = 'block';
        }
        
        // 显示社交链接
        if (socialLinks) {
            socialLinks.classList.remove('hidden');
            socialLinks.style.display = 'flex';
        }
    }, 300);
}

// 绑定���戏按钮事件
if (openGameBtn) {
    console.log('Adding click listener to openGameBtn');
    openGameBtn.addEventListener('click', openGame);
}

if (toggleGameBtn) {
    console.log('Adding click listener to toggleGameBtn');
    toggleGameBtn.addEventListener('click', closeGame);
}

// 收起展开功能
const toggleBtn = document.getElementById('toggleChat');
const chatBox = document.querySelector('.chat-box');
const chatContainer = document.querySelector('.chat-container');
const chatIcon = document.querySelector('.chat-icon');
const openChatBtn = document.getElementById('openChat');

// 打开聊天框
function openChat(e) {
    if (e) e.stopPropagation();
    const quickButtons = document.querySelector('.quick-buttons');
    const gameBox = document.querySelector('.game-box');
    const footer = document.querySelector('footer');
    
    // 确保游戏框是关闭的
    if (gameBox) {
        gameBox.style.display = 'none';
        gameBox.classList.add('collapsed');
    }
    
    // 显示聊天框，隐藏其他元素
    chatBox.style.display = 'flex';
    quickButtons.classList.add('hidden');
    footer.classList.add('hidden');
    
    requestAnimationFrame(() => {
        chatBox.classList.remove('collapsed');
    });
}

// 关闭聊天框
function closeChat(e) {
    if (e) e.stopPropagation();
    const quickButtons = document.querySelector('.quick-buttons');
    const footer = document.querySelector('footer');
    const socialLinks = document.querySelector('.social-links');
    
    chatBox.classList.add('collapsed');
    setTimeout(() => {
        chatBox.style.display = 'none';
        
        // 显示快捷按钮
        if (quickButtons) {
            quickButtons.classList.remove('hidden');
            quickButtons.style.display = 'flex';
        }
        
        // 显示页脚
        if (footer) {
            footer.classList.remove('hidden');
            footer.style.display = 'block';
        }
        
        // 显示社交链接
        if (socialLinks) {
            socialLinks.classList.remove('hidden');
            socialLinks.style.display = 'flex';
        }
    }, 300);
}

// 事件监听
openChatBtn.addEventListener('click', openChat);
toggleBtn.addEventListener('click', closeChat);

// 修改聊天框初始化
document.addEventListener('DOMContentLoaded', () => {
    const chatBox = document.querySelector('.chat-box');
    const userInput = document.getElementById('userInput');
    const gameBox = document.querySelector('.game-box');
    
    // 初始化聊天框
    chatBox.style.display = 'flex';
    chatBox.classList.remove('collapsed');
    
    // 初始化游戏框
    if (gameBox) {
        gameBox.style.display = 'none';
        gameBox.classList.add('collapsed');
    }
    
    // 确保输入框可以输入
    if (userInput) {
        userInput.removeAttribute('disabled');
        userInput.focus();
    }
    
    // 初始化事件监听
    initChatEvents();
    
    // 移除快捷按钮的隐藏类
    document.querySelector('.quick-buttons')?.classList.remove('hidden');
});

// 修改聊天事件初始化函数
function initChatEvents() {
    const userInput = document.getElementById('userInput');
    const sendButton = document.getElementById('sendButton');
    
    // 移除所有已存在的事件监听器
    const newSendButton = sendButton.cloneNode(true);
    sendButton.parentNode.replaceChild(newSendButton, sendButton);
    
    const newUserInput = userInput.cloneNode(true);
    userInput.parentNode.replaceChild(newUserInput, userInput);
    
    // 重新绑定事件监听器
    newUserInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    });
    
    newUserInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
    
    newSendButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleSendMessage();
    });
}

// 修改发送消息函数
async function handleSendMessage() {
    const userInput = document.getElementById('userInput');
    const message = userInput.value.trim();
    
    if (message) {
        // 先添加用户消息
        addMessage(message, true);
        
        // 清空输入框
        userInput.value = '';
        userInput.style.height = 'auto';
        
        try {
            // 创建系统消息容器
            const aiMessageDiv = document.createElement('div');
            aiMessageDiv.className = 'message system';
            const aiMessageContent = document.createElement('div');
            aiMessageContent.className = 'message-content';
            aiMessageDiv.appendChild(aiMessageContent);
            
            // 添加到聊天区域
            chatMessages.appendChild(aiMessageDiv);
            
            // 发送请求并处理响应
            const response = await sendToLinkAI(message, 'session-1');
            let fullResponse = '';
            
            for await (const chunk of response) {
                fullResponse += chunk;
                aiMessageContent.textContent = fullResponse;
                smoothScrollTo(chatMessages, chatMessages.scrollHeight);
            }
        } catch (error) {
            console.error('Error:', error);
            addMessage('抱歉，发生了一些错误，请稍后重试。', false);
        }
    }
}

// 背景轮播功能
const slides = document.querySelectorAll('.slide');
let currentSlide = 0;

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    slides[index].classList.add('active');
}

function nextSlide() {
    const currentSlideElement = slides[currentSlide];
    const nextSlideIndex = (currentSlide + 1) % slides.length;
    const nextSlideElement = slides[nextSlideIndex];
    
    // 预加载下一张图片
    const preloadImage = new Image();
    preloadImage.src = nextSlideElement.style.backgroundImage.slice(5, -2);
    
    requestAnimationFrame(() => {
        currentSlideElement.style.opacity = '0';
        nextSlideElement.style.opacity = '1';
        currentSlide = nextSlideIndex;
    });
}

// 初始化第一张图片并开始自播放
showSlide(0);
setInterval(nextSlide, 5000); // 每5秒切换一次

// 聊天功能
const chatMessages = document.getElementById('chatMessages');
const userInput = document.getElementById('userInput');
const sendButton = document.getElementById('sendButton');

// 自动调整文本框高度
userInput.addEventListener('input', function() {
    requestAnimationFrame(() => {
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
    });
});

// 发送消息功能
function addMessage(content, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user' : 'system'}`;
    
    const messageContent = document.createElement('div');
    messageContent.className = 'message-content';
    messageContent.textContent = content;
    
    // 使用 DocumentFragment 优化 DOM 操作
    const fragment = document.createDocumentFragment();
    messageDiv.appendChild(messageContent);
    fragment.appendChild(messageDiv);
    
    requestAnimationFrame(() => {
        chatMessages.appendChild(fragment);
        smoothScrollTo(chatMessages, chatMessages.scrollHeight);
    });
}

// 优化滚动性能
function smoothScrollTo(element, target) {
    const start = element.scrollTop;
    const change = target - start;
    const duration = 300;
    let startTime = null;

    function animation(currentTime) {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);
        
        const easing = t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        element.scrollTop = start + change * easing(progress);

        if (timeElapsed < duration) {
            requestAnimationFrame(animation);
        }
    }

    requestAnimationFrame(animation);
}

// 修改游戏选择功能
function initGameOptions() {
    const gameOptions = document.querySelectorAll('.game-option');
    const gameMenu = document.querySelector('.game-menu');
    const games = {
        snake: document.getElementById('snakeGame'),
        minesweeper: document.getElementById('minesweeperGame')
    };

    gameOptions.forEach(option => {
        option.addEventListener('click', () => {
            const gameType = option.getAttribute('data-game');
            
            // 隐藏游戏菜单
            gameMenu.style.display = 'none';
            
            // 隐藏所有游戏，只显示选中的游戏
            Object.keys(games).forEach(game => {
                games[game].style.display = game === gameType ? 'flex' : 'none';
            });

            // 初始化选中的游戏
            if (gameType === 'snake') {
                initSnakeGame();
            } else if (gameType === 'minesweeper') {
                initMinesweeperGame();
            }
        });
    });
}

// 添加返回游戏菜单的功能
function addReturnToMenuButtons() {
    const games = document.querySelectorAll('.game');
    const gameMenu = document.querySelector('.game-menu');
    
    games.forEach(game => {
        const returnButton = document.createElement('button');
        returnButton.classList.add('return-btn');
        returnButton.innerHTML = '<i class="fas fa-arrow-left"></i> 返回菜单';
        returnButton.addEventListener('click', () => {
            // 隐藏当前游戏
            game.style.display = 'none';
            // 显示游戏菜单
            gameMenu.style.display = 'flex';
        });
        
        // 将返回按钮添加到游戏控制区
        const controlsDiv = game.querySelector('.game-controls');
        controlsDiv.appendChild(returnButton);
    });
}

// 贪吃蛇游戏初始化
function initSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const startBtn = document.getElementById('startSnake');
    const scoreElement = document.getElementById('snakeScore');
    
    // 设置画布大小
    canvas.width = 400;
    canvas.height = 400;
    
    // 创建一个容器来包含蛇的所有部分
    const gameContainer = document.createElement('div');
    gameContainer.style.position = 'relative';
    gameContainer.style.width = '400px';
    gameContainer.style.height = '400px';
    canvas.parentElement.insertBefore(gameContainer, canvas);
    gameContainer.appendChild(canvas);
    
    // 修改样式
    const style = document.createElement('style');
    style.textContent = `
        #snakeCanvas {
            position: absolute;
            top: 0;
            left: 0;
            background: #f0f0f0;
            z-index: 1;
        }
        
        .snake-segment {
            position: absolute;
            width: 10px;
            height: 10px;
            background: #4CAF50;
            transition: all 0.3s ease;
            z-index: 2;
        }

        .snake-segment.dying {
            animation: snakeDeath 0.5s ease-in-out forwards;
        }

        @keyframes snakeDeath {
            0% { 
                transform: scale(1);
                background: #4CAF50;
            }
            50% { 
                transform: scale(1.2);
                background: #ff4444;
            }
            100% { 
                transform: scale(1);
                background: #ff4444;
            }
        }

        @keyframes fadeOut {
            0% { opacity: 1; }
            100% { opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    let snake = [];
    let food = {};
    let direction = 'right';
    let gameLoop = null;
    let score = 0;
    
    let isPaused = false;  // 添加暂停状态标志
    let gameStatus = 'initial';  // 添加游戏状态: 'initial', 'playing', 'paused', 'over'
    
    // 初始化蛇和食物
    function init() {
        snake = [
            {x: 200, y: 200},
            {x: 190, y: 200},
            {x: 180, y: 200}
        ];
        score = 0;
        scoreElement.textContent = score;
        createFood();
        direction = 'right';
    }
    
    // 创建食物
    function createFood() {
        food = {
            x: Math.floor(Math.random() * (canvas.width / 10)) * 10,
            y: Math.floor(Math.random() * (canvas.height / 10)) * 10
        };
    }
    
    // 修改制函数
    function draw() {
        // 清空画布
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 清除旧的蛇段
        const oldSegments = gameContainer.querySelectorAll('.snake-segment');
        oldSegments.forEach(segment => segment.remove());

        // 绘制新的蛇段
        snake.forEach(segment => {
            const segmentDiv = document.createElement('div');
            segmentDiv.className = 'snake-segment';
            segmentDiv.style.left = `${segment.x}px`;
            segmentDiv.style.top = `${segment.y}px`;
            gameContainer.appendChild(segmentDiv);
        });

        // 绘制食物
        ctx.fillStyle = '#FF5722';
        ctx.fillRect(food.x, food.y, 10, 10);
    }
    
    // 移动蛇
    function moveSnake() {
        const head = {x: snake[0].x, y: snake[0].y};
        
        switch(direction) {
            case 'right': head.x += 10; break;
            case 'left': head.x -= 10; break;
            case 'up': head.y -= 10; break;
            case 'down': head.y += 10; break;
        }
        
        // 检查是否吃到食物
        if (head.x === food.x && head.y === food.y) {
            createFood();
            score += 10;
            scoreElement.textContent = score;
        } else {
            snake.pop();
        }
        
        // 检查游戏结束条件
        if (head.x < 0 || head.x >= canvas.width || 
            head.y < 0 || head.y >= canvas.height ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            handleGameOver();
            return false;
        }
        
        snake.unshift(head);
        return true;
    }
    
    // 游戏主循环
    function gameStep() {
        if (moveSnake()) {
            draw();
        }
    }
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault();  // 止页面滚动
            toggleGame();
        }
        
        // 其他方向键控制保持不变
        if (gameStatus === 'playing') {
            switch(e.key) {
                case 'ArrowRight':
                    if (direction !== 'left') direction = 'right';
                    break;
                case 'ArrowLeft':
                    if (direction !== 'right') direction = 'left';
                    break;
                case 'ArrowUp':
                    if (direction !== 'down') direction = 'up';
                    break;
                case 'ArrowDown':
                    if (direction !== 'up') direction = 'down';
                    break;
            }
        }
    });
    
    // 开始游戏按钮
    startBtn.addEventListener('click', toggleGame);
    
    // 游戏控制函数
    function toggleGame() {
        switch (gameStatus) {
            case 'initial':  // 首次开始游戏
                startGame();
                break;
            case 'playing':  // 暂停游戏
                pauseGame();
                break;
            case 'paused':   // 继续游戏
                resumeGame();
                break;
            case 'over':     // 重新开始游戏
                startGame();
                break;
        }
    }
    
    // 开始游戏
    function startGame() {
        init();
        gameLoop = setInterval(gameStep, 100);
        gameStatus = 'playing';
        startBtn.innerHTML = '<i class="fas fa-pause"></i><span>暂停</span>';
    }
    
    // 暂停游戏
    function pauseGame() {
        clearInterval(gameLoop);
        gameStatus = 'paused';
        startBtn.innerHTML = '<i class="fas fa-play"></i><span>继续</span>';
        
        // 添加暂停提示
        const pauseOverlay = document.createElement('div');
        pauseOverlay.className = 'pause-overlay';
        pauseOverlay.innerHTML = '<span>已暂停 - 按空格继续</span>';  // 使用 span 包裹文本
        gameContainer.appendChild(pauseOverlay);
    }
    
    // 继续游戏
    function resumeGame() {
        const overlay = gameContainer.querySelector('.pause-overlay');
        if (overlay) overlay.remove();
        
        gameLoop = setInterval(gameStep, 100);
        gameStatus = 'playing';
        startBtn.innerHTML = '<i class="fas fa-pause"></i><span>暂停</span>';
    }
    
    // 修改游戏结束处理
    function handleGameOver() {
        clearInterval(gameLoop);
        gameStatus = 'over';
        gameLoop = null;

        const segments = gameContainer.querySelectorAll('.snake-segment');
        
        segments.forEach((segment, index) => {
            setTimeout(() => {
                segment.classList.add('dying');
            }, index * 100);
        });

        setTimeout(() => {
            segments.forEach(segment => {
                segment.style.animation = 'fadeOut 0.5s ease-out forwards';
            });
            
            setTimeout(() => {
                segments.forEach(segment => segment.remove());
                alert('游戏结束！得分：' + score);
                startBtn.innerHTML = '<i class="fas fa-redo"></i><span>重新开始</span>';
            }, 500);
        }, segments.length * 100 + 500);
    }
    
    // 修改暂停overlay样式
    const pauseStyle = document.createElement('style');
    pauseStyle.textContent = `
        .pause-overlay {
            position: absolute;
            top: -15px;  /* 调整向上延伸的距离 */
            left: -15px;  /* 向左延伸 */
            width: calc(100% + 30px);  /* 增加度 */
            height: calc(100% + 70px);  /* 调整高度 */
            background: rgba(0, 0, 0, 0.1);
            display: flex;
            justify-content: center;
            align-items: center;
            color: white;
            font-size: 20px;
            z-index: 10;
            backdrop-filter: blur(3px);
            border-radius: 15px;
        }

        .pause-overlay::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 15px;
        }

        .pause-overlay span {
            position: relative;
            z-index: 2;
            text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
    `;
    document.head.appendChild(pauseStyle);
    
    // 初始化游戏
    init();
    draw();
    startBtn.innerHTML = '<i class="fas fa-play"></i><span>开始</span>';
}

// 扫雷游戏初始化
function initMinesweeperGame() {
    const board = document.getElementById('minesweeperBoard');
    const startBtn = document.getElementById('startMinesweeper');
    const minesLeftElement = document.getElementById('minesLeft');
    
    const BOARD_SIZE = 16;  // 改为16x16的棋盘
    const MINES_COUNT = 40;  // 增加雷数量
    let minesLeft = MINES_COUNT;
    let cells = [];
    let mines = [];
    let gameOver = false;
    let isFirstClick = true;
    
    // 初始化游戏板
    function initBoard() {
        board.innerHTML = '';
        board.style.gridTemplateColumns = `repeat(${BOARD_SIZE}, 25px)`;  // 调整格子大小
        cells = [];
        mines = [];
        minesLeft = MINES_COUNT;
        gameOver = false;
        isFirstClick = true;
        minesLeftElement.textContent = minesLeft;
        
        // 创建单元格
        for (let i = 0; i < BOARD_SIZE; i++) {
            cells[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                cell.addEventListener('click', () => handleClick(i, j));
                cell.addEventListener('contextmenu', (e) => {
                    e.preventDefault();
                    handleRightClick(i, j);
                });
                
                board.appendChild(cell);
                cells[i][j] = cell;
            }
        }
    }
    
    // 放置地雷（在第一次点击后）
    function placeMines(firstRow, firstCol) {
        for (let i = 0; i < MINES_COUNT; i++) {
            let row, col;
            do {
                row = Math.floor(Math.random() * BOARD_SIZE);
                col = Math.floor(Math.random() * BOARD_SIZE);
            } while (
                mines.some(mine => mine.row === row && mine.col === col) ||
                (Math.abs(row - firstRow) <= 1 && Math.abs(col - firstCol) <= 1)  // 确保第一次点击的周围没有地雷
            );
            
            mines.push({row, col});
        }
    }
    
    // 计算周围地雷数
    function countNearbyMines(row, col) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < BOARD_SIZE && 
                    newCol >= 0 && newCol < BOARD_SIZE) {
                    if (mines.some(mine => mine.row === newRow && mine.col === newCol)) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    // 处理点击事件
    function handleClick(row, col) {
        if (gameOver || cells[row][col].classList.contains('flagged')) return;
        
        // 第一次点击
        if (isFirstClick) {
            placeMines(row, col);
            isFirstClick = false;
        }
        
        const cell = cells[row][col];
        
        // 点到地雷
        if (mines.some(mine => mine.row === row && mine.col === col)) {
            gameOver = true;
            revealAllMines();
            showGameOverAnimation();
            return;
        }
        
        // 显示数字
        const nearbyMines = countNearbyMines(row, col);
        cell.classList.add('revealed');
        
        if (nearbyMines === 0) {
            // 如果是空白格，递归显示周围的格子
            revealEmptyCells(row, col);
        } else {
            cell.classList.add(`n${nearbyMines}`);
            cell.textContent = nearbyMines;
        }
        
        // 检查胜利
        checkWin();
    }
    
    // 游戏结束动画
    function showGameOverAnimation() {
        mines.forEach((mine, index) => {
            setTimeout(() => {
                const cell = cells[mine.row][mine.col];
                cell.classList.add('mine');
                cell.classList.add('explode');
                
                // 添加爆炸动画
                const explosion = document.createElement('div');
                explosion.className = 'explosion';
                cell.appendChild(explosion);
                
                // 移除爆炸动画
                setTimeout(() => {
                    explosion.remove();
                }, 1000);
            }, index * 50);  // 依次显示每个地雷
        });
        
        setTimeout(() => {
            alert('游戏结束！');
        }, mines.length * 50 + 500);
    }
    
    // 处理右键点击（插旗）
    function handleRightClick(row, col) {
        if (gameOver || cells[row][col].classList.contains('revealed')) return;
        
        const cell = cells[row][col];
        
        if (cell.classList.contains('flagged')) {
            cell.classList.remove('flagged');
            minesLeft++;
        } else {
            cell.classList.add('flagged');
            minesLeft--;
        }
        
        minesLeftElement.textContent = minesLeft;
    }
    
    // 显示空白格周围的格子
    function revealEmptyCells(row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                
                if (newRow >= 0 && newRow < BOARD_SIZE && 
                    newCol >= 0 && newCol < BOARD_SIZE) {
                    const cell = cells[newRow][newCol];
                    
                    if (!cell.classList.contains('revealed')) {
                        handleClick(newRow, newCol);
                    }
                }
            }
        }
    }
    
    // 显示所有地雷
    function revealAllMines() {
        mines.forEach(mine => {
            cells[mine.row][mine.col].classList.add('mine');
        });
    }
    
    // 检查胜利条件
    function checkWin() {
        const revealedCount = document.querySelectorAll('.cell.revealed').length;
        if (revealedCount === BOARD_SIZE * BOARD_SIZE - MINES_COUNT) {
            gameOver = true;
            alert('恭喜你赢了！');
        }
    }
    
    // 修改CSS样式
    const style = document.createElement('style');
    style.textContent = `
        #minesweeperBoard {
            display: grid;
            grid-template-columns: repeat(${BOARD_SIZE}, 25px);
            gap: 1px;
            background: #ccc;
            padding: 10px;
            border-radius: 5px;
        }
        
        .cell {
            width: 25px;
            height: 25px;
            background: #eee;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            font-weight: bold;
            user-select: none;
            font-size: 12px;
            position: relative;
            transition: all 0.3s ease;
        }
        
        .cell.revealed {
            background: #fff;
        }
        
        .cell.mine {
            background: #ff4444;
            animation: shake 0.5s ease-in-out;
        }
        
        .cell.explode {
            animation: explode 0.5s ease-in-out;
        }
        
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-2px); }
            75% { transform: translateX(2px); }
        }
        
        @keyframes explode {
            0% { transform: scale(1); }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); }
        }
        
        .explosion {
            position: absolute;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, #ff4444 0%, transparent 70%);
            opacity: 0;
            animation: explode-effect 0.5s ease-out;
        }
        
        @keyframes explode-effect {
            0% { transform: scale(0.5); opacity: 1; }
            100% { transform: scale(2); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // 开始游戏按钮
    startBtn.addEventListener('click', initBoard);
    
    // 初始化游戏
    initBoard();
}

