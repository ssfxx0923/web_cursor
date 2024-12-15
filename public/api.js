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
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: messages,
                model: model
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            async *[Symbol.asyncIterator]() {
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
                                    if (data.error) {
                                        throw new Error(data.error.message);
                                    }
                                    if (data.choices?.[0]?.delta?.content) {
                                        yield data.choices[0].delta.content;
                                    }
                                } catch (e) {
                                    if (e.message) throw e;
                                    console.warn('Failed to parse line:', line, e);
                                }
                            }
                        }
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                    throw error;
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
