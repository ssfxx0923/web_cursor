const fetch = require('node-fetch');

const API_KEY = process.env.LINK_AI_API_KEY;
const API_URL = 'https://api.link-ai.tech/v1/chat/completions';

module.exports = async (req, res) => {
    // 设置CORS头
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    // 处理OPTIONS请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });

        // 转发响应头
        res.setHeader('Content-Type', response.headers.get('content-type'));
        
        // 转发响应体
        response.body.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}; 