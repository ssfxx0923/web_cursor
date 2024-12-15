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
        const { messages, model = 'linkai-4o-mini' } = req.body;
        const config = API_CONFIG[model];

        if (!config) {
            return res.status(400).json({ error: 'Unsupported model' });
        }

        let headers = {
            'Content-Type': 'application/json'
        };

        // 根据不同模型配置不同的请求头和请求体
        let requestBody;
        if (model === 'claude-3-sonnet') {
            headers['x-api-key'] = config.key;
            headers['anthropic-version'] = '2023-06-01';
            requestBody = {
                messages: messages,
                model: 'claude-3-sonnet',
                stream: true,
                max_tokens: 1000
            };
        } else if (model === 'ceok-2') {
            headers['Authorization'] = `Bearer ${config.key}`;
            requestBody = {
                messages: messages,
                model: 'ceok-2',
                stream: true
            };
        } else {
            // LinkAI
            headers['Authorization'] = `Bearer ${config.key}`;
            requestBody = {
                messages: messages,
                model: 'linkai-4o-mini',
                stream: true
            };
        }

        // 设置响应头以支持流式传输
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        const response = await fetch(config.url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`API request failed: ${error}`);
        }

        // 转发流式响应
        const reader = response.body.getReader();
        
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            
            const chunk = new TextDecoder().decode(value);
            res.write(`data: ${chunk}\n\n`);
        }

        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 