const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// 配置不同模型的API端点和密钥
const API_CONFIG = {
    'linkai-4o-mini': {
        url: 'https://api.link-ai.chat/v1/chat/completions',
        key: process.env.LINKAI_API_KEY
    },
    'claude-3-sonnet': {
        url: 'https://api.anthropic.com/v1/messages',
        key: process.env.CLAUDE_API_KEY
    },
    'ceok-2': {
        url: 'https://api.ceok.com/v1/chat/completions',  // 替换为实际的CEOK API端点
        key: process.env.CEOK_API_KEY
    }
};

app.post('/api/chat', async (req, res) => {
    try {
        const { messages, model = 'linkai' } = req.body;
        const config = API_CONFIG[model];

        if (!config) {
            return res.status(400).json({ 
                error: {
                    message: "不支持的模型",
                    type: "invalid_request_error"
                }
            });
        }

        if (!config.key) {
            console.error(`Missing API key for model: ${model}`);
            return res.status(401).json({ 
                error: {
                    message: "API密钥未配置",
                    type: "invalid_api_key"
                }
            });
        }

        // 设置响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch(config.url, {
            method: 'POST',
            headers: config.headers(config.key),
            body: JSON.stringify(config.formatRequest(messages))
        });

        if (!response.ok) {
            const errorText = await response.text();
            let errorObj;
            try {
                errorObj = JSON.parse(errorText);
            } catch (e) {
                errorObj = { message: errorText };
            }
            throw { status: response.status, ...errorObj };
        }

        // 直接转发流式响应
        response.body.pipe(res);

    } catch (error) {
        console.error('Server error:', error);
        const errorMessage = config.handleError(error);
        
        // 确保以正确的格式返回错误
        res.write(`data: {"error":{"message":"${errorMessage}"}}\n\n`);
        res.write('data: [DONE]\n\n');
        res.end();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 