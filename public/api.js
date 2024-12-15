const API_URL = '/api/chat';

// 修改为每个模型独立的消息历史
const messageHistories = {
    'linkai': [],
    'claude': [],
    'ceok': []
};

async function sendToLinkAI(message, sessionId) {
    messageHistories.linkai.push({
        role: "user",
        content: message
    });
    
    return sendToAI(messageHistories.linkai, 'linkai');
}

async function sendToClaude(message, sessionId) {
    messageHistories.claude.push({
        role: "user",
        content: message
    });
    return sendToAI(messageHistories.claude, 'claude');
}

async function sendToCeok(message, sessionId) {
    messageHistories.ceok.push({
        role: "user",
        content: message
    });
    return sendToAI(messageHistories.ceok, 'ceok');
}

async function sendToAI(messages, model) {
    try {
        console.log(`Sending ${model} request:`, {
            messageCount: messages.length,
            model
        });

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: model
            }),
            credentials: 'same-origin'
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`API Error (${response.status}):`, errorText);
            throw new Error('API 请求失败，请检查配置或稍后重试');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            async *[Symbol.asyncIterator]() {
                try {
                    let responseText = '';
                    while (true) {
                        const {done, value} = await reader.read();
                        if (done) break;
                        
                        const chunk = decoder.decode(value);
                        const lines = chunk.split('\n');
                        
                        for (const line of lines) {
                            if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
                            
                            if (line.startsWith('data: ')) {
                                try {
                                    const data = JSON.parse(line.slice(6));
                                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                        const content = data.choices[0].delta.content;
                                        responseText += content;
                                        yield content;
                                    }
                                } catch (e) {
                                    console.warn('Failed to parse line:', line, e);
                                    continue;
                                }
                            }
                        }
                    }
                    // 将AI的回复添加到对应模型的历史记录中
                    if (responseText) {
                        messageHistories[model].push({
                            role: "assistant",
                            content: responseText
                        });
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                    throw new Error('连接中断，请刷新页面重试');
                }
            }
        };
    } catch (error) {
        console.error('Request error:', error);
        throw error;
    }
}

// 修改清除历史记录函数，可以指定清除特定模型的历史记录
function clearMessageHistory(model = null) {
    if (model && messageHistories[model]) {
        messageHistories[model] = [];
    } else {
        // 如果没有指定模型，清除所有历史记录
        Object.keys(messageHistories).forEach(key => {
            messageHistories[key] = [];
        });
    }
}

export { sendToLinkAI, sendToClaude, sendToCeok, clearMessageHistory };
