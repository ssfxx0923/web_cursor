const fetch = require('node-fetch');
const https = require('https');

// 创建一个忽略 SSL 错误的 agent
const agent = new https.Agent({
    rejectUnauthorized: false,
    servername: null
});

// 配置不同模型的API端点和密钥
const API_CONFIG = {
    'linkai': {
        url: 'https://api.link-ai.chat/v1/chat/completions',
        key: process.env.LINKAI_API_KEY,
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages) => ({
            messages,
            model: 'linkai-4o-mini',
            stream: true
        }),
        handleError: (error) => {
            if (error.message?.includes('API key')) {
                return '链猫AI服务暂时不可用，请稍后再试';
            }
            return error.message || '服务暂时不可用';
        }
    },
    'claude': {
        url: 'https://api.anthropic.com/v1/messages',
        key: process.env.CLAUDE_API_KEY,
        headers: (key) => ({
            'x-api-key': key,
            'anthropic-version': '2024-02-29',
            'content-type': 'application/json',
            'accept': 'text/event-stream'
        }),
        formatRequest: (messages) => ({
            model: 'claude-3-sonnet',
            messages: messages.map(msg => ({
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content
            })),
            max_tokens: 4096,
            stream: true
        }),
        handleError: (error) => {
            const errorObj = error.error || error;
            
            // 专门处理余额不足的情况
            if (errorObj.message?.includes('credit balance is too low')) {
                return {
                    message: 'Claude AI 服务余额不足，请联系管理员充值',
                    type: 'balance_insufficient',
                    details: errorObj.message
                };
            }
            
            return errorObj.message || '服务暂时不可用';
        }
    },
    'ceok': {
        url: 'https://api.x.ai/v1/chat/completions',
        key: process.env.CEOK_API_KEY,
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json'
        }),
        formatRequest: (messages) => ({
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                ...messages
            ],
            model: "grok-beta",
            stream: true,
            temperature: 0.7
        }),
        handleError: (error) => {
            if (error.message?.includes('API key')) {
                return 'X.AI 服务暂时不可用，请稍后再试';
            }
            return error.message || '服务暂时不可用';
        },
        fetchOptions: {
            agent,
            timeout: 30000
        }
    },
    'deepseek': {
        url: 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
        key: process.env.ALIYUN_API_KEY,
        headers: (key) => ({
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
            'Accept': 'text/event-stream',
            'X-DashScope-SSE': 'enable'
        }),
        formatRequest: (messages) => ({
            model: 'deepseek-r1',
            input: {
                messages: messages.map(msg => ({
                    role: msg.role === 'assistant' ? 'assistant' : 'user',
                    content: msg.content
                }))
            },
            parameters: {
                result_format: 'message',
                stream: true,
                max_tokens: 4000,
                temperature: 0.7
            }
        }),
        handleError: (error) => {
            const errorObj = error.error || error;
            console.error('[ERROR] Deepseek错误对象:', JSON.stringify(errorObj));
            
            if (errorObj.code === 'InvalidApiKey' || errorObj.code === 'QuotaExceeded' || 
                errorObj.message?.includes('quota') || errorObj.message?.includes('balance')) {
                return {
                    message: 'Deepseek AI 服务配额不足或密钥无效，请联系管理员',
                    type: 'api_error',
                    details: errorObj.message || JSON.stringify(errorObj)
                };
            }
            
            return errorObj.message || errorObj.code || '阿里云Deepseek服务暂时不可用';
        }
    }
};

// Vercel Serverless Function
const handler = async (req, res) => {
    // 更新 CORS 设置
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

    // 处理预检请求
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { messages, model = 'linkai' } = req.body;
        const config = API_CONFIG[model];

        if (!config) {
            return res.status(400).json({ 
                error: 'Unsupported model',
                message: '不支持的AI模型，请选择其他模型'
            });
        }

        if (!config.key) {
            return res.status(503).json({
                error: 'Service unavailable',
                message: `${model.toUpperCase()} AI 服务未配置，请选择其他模型`
            });
        }

        // 添加调试日志 - 记录当前模型和API密钥状态
        console.log(`[DEBUG] 使用模型: ${model}, API密钥是否存在: ${!!config.key}`);
        
        const headers = config.headers(config.key);
        const requestBody = config.formatRequest(messages);
        
        // 添加调试日志 - 记录请求详情
        console.log(`[DEBUG] API请求URL: ${config.url}`);
        console.log(`[DEBUG] 请求头:`, JSON.stringify(headers));
        console.log(`[DEBUG] 请求体:`, JSON.stringify(requestBody));
        
        const fetchOptions = {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(requestBody),
            ...(config.fetchOptions || {})
        };

        const response = await fetch(config.url, fetchOptions);

        // 添加调试日志 - 记录响应状态
        console.log(`[DEBUG] 响应状态码: ${response.status}, 状态文本: ${response.statusText}`);
        
        // 设置流式响应头
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        if (!response.ok) {
            const errorText = await response.text();
            // 添加调试日志 - 记录错误响应内容
            console.error(`[ERROR] API响应错误: ${errorText}`);
            
            let errorObj;
            try {
                errorObj = JSON.parse(errorText);
            } catch (e) {
                errorObj = { message: errorText };
            }
            
            const errorResponse = config.handleError(errorObj);
            const errorMessage = typeof errorResponse === 'string' ? 
                errorResponse : errorResponse.message;
            
            // 向客户端发送错误信息
            res.write(`data: {"choices":[{"delta":{"content":"API调用失败: ${errorMessage}"}}]}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        if (model === 'claude') {
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            try {
                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    const lines = chunk.split('\n');
                    
                    for (const line of lines) {
                        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                        
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                if (data.type === 'error') {
                                    const errorMessage = config.handleError(data);
                                    throw new Error(errorMessage);
                                }
                                if (data.type === 'content_block_delta' && data.delta?.text) {
                                    const safeText = data.delta.text.replace(/"/g, '\\"');
                                    res.write(`data: {"choices":[{"delta":{"content":"${safeText}"}}]}\n\n`);
                                }
                            } catch (e) {
                                console.warn('Failed to parse line:', line, e);
                                continue;
                            }
                        }
                    }
                }
                res.write('data: [DONE]\n\n');
                res.end();
            } catch (error) {
                console.error('Stream error:', error);
                res.write(`data: {"choices":[{"delta":{"content":"数据流传输错误: ${error.message}"}}]}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
            }
        } else if (model === 'deepseek') {
            // Deepseek 特殊处理逻辑
            console.log('[DEBUG] 进入Deepseek专用处理分支');
            
            // 添加详细的响应检查
            console.log('[DEBUG] 响应类型:', typeof response.body);
            console.log('[DEBUG] 响应对象属性:', Object.keys(response.body));
            console.log('[DEBUG] 响应头:', JSON.stringify([...response.headers.entries()]));
            
            try {
                // 使用Node.js原生方式处理流，避免使用getReader
                let responseText = '';
                
                response.body.on('data', (chunk) => {
                    const text = chunk.toString();
                    console.log('[DEBUG] Deepseek原始响应块:', text);
                    
                    const lines = text.split('\n');
                    
                    for (const line of lines) {
                        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                        
                        console.log('[DEBUG] 处理Deepseek响应行:', line);
                        
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                console.log('[DEBUG] 解析后的Deepseek数据:', JSON.stringify(data));
                                
                                // 提取文本 - 根据阿里云API的实际响应格式调整
                                let content = '';
                                
                                if (data.output?.text) {
                                    // 阿里云格式1
                                    content = data.output.text;
                                } else if (data.output?.choices?.[0]?.message?.content) {
                                    // 阿里云格式2
                                    content = data.output.choices[0].message.content;
                                } else if (data.output?.message?.content) {
                                    // 阿里云格式3
                                    content = data.output.message.content;
                                } else if (data.choices?.[0]?.delta?.content) {
                                    // OpenAI兼容格式
                                    content = data.choices[0].delta.content;
                                } else {
                                    // 记录未识别的响应格式
                                    console.log('[DEBUG] 未能识别的Deepseek响应格式:', JSON.stringify(data));
                                }
                                
                                if (content) {
                                    const safeText = content.replace(/"/g, '\\"');
                                    console.log('[DEBUG] 发送到客户端的内容:', safeText);
                                    res.write(`data: {"choices":[{"delta":{"content":"${safeText}"}}]}\n\n`);
                                }
                            } catch (e) {
                                console.error('解析Deepseek响应失败:', line, e);
                                continue;
                            }
                        }
                    }
                });
                
                response.body.on('end', () => {
                    console.log('[DEBUG] Deepseek响应处理完成');
                    res.write('data: [DONE]\n\n');
                    res.end();
                });
                
                response.body.on('error', (error) => {
                    console.error('[ERROR] Deepseek流处理错误:', error);
                    res.write(`data: {"choices":[{"delta":{"content":"Deepseek数据流处理错误: ${error.message}"}}]}\n\n`);
                    res.write('data: [DONE]\n\n');
                    res.end();
                });
                
            } catch (error) {
                console.error('[ERROR] Deepseek流处理错误:', error);
                res.write(`data: {"choices":[{"delta":{"content":"Deepseek数据流处理错误: ${error.message}"}}]}\n\n`);
                res.write('data: [DONE]\n\n');
                res.end();
            }
        } else {
            // 其他模型的处理方式
            console.log(`[DEBUG] 使用默认处理方式处理${model}模型响应`);
            response.body.pipe(res);
            
            response.body.on('end', () => {
                console.log('[DEBUG] 响应流结束');
                res.end();
            });

            response.body.on('error', error => {
                console.error('[ERROR] 流错误:', error);
                if (!res.headersSent) {
                    res.write(`data: {"choices":[{"delta":{"content":"数据流传输错误，请重试"}}]}\n\n`);
                    res.write('data: [DONE]\n\n');
                }
                res.end();
            });
        }

        // 处理客户端断开连接
        req.on('close', () => {
            if (response.body) {
                response.body.destroy();
            }
        });

    } catch (error) {
        console.error('Handler error:', error);
        if (!res.headersSent) {
            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');
            
            res.write(`data: {"choices":[{"delta":{"content":"服务器内部错误: ${error.message}"}}]}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
        }
    }
};

module.exports = handler;