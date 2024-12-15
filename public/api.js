const API_URL = '/api/chat';

// 修改消息历史存储结构，使用 localStorage
const MESSAGE_HISTORY_KEY = 'chatMessageHistory';

// 获取消息历史
function getMessageHistory(model) {
    const histories = JSON.parse(localStorage.getItem(MESSAGE_HISTORY_KEY) || '{}');
    return histories[model] || [];
}

// 保存消息历史
function saveMessageHistory(model, messages) {
    const histories = JSON.parse(localStorage.getItem(MESSAGE_HISTORY_KEY) || '{}');
    histories[model] = messages;
    localStorage.setItem(MESSAGE_HISTORY_KEY, JSON.stringify(histories));
}

async function sendToLinkAI(message, sessionId) {
    const messages = getMessageHistory('linkai');
    messages.push({
        role: "user",
        content: message
    });
    saveMessageHistory('linkai', messages);
    return sendToAI(messages, 'linkai');
}

async function sendToClaude(message, sessionId) {
    const messages = getMessageHistory('claude');
    messages.push({
        role: "user",
        content: message
    });
    saveMessageHistory('claude', messages);
    return sendToAI(messages, 'claude');
}

async function sendToCeok(message, sessionId) {
    const messages = getMessageHistory('ceok');
    messages.push({
        role: "user",
        content: message
    });
    saveMessageHistory('ceok', messages);
    return sendToAI(messages, 'ceok');
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
            }),
            credentials: 'same-origin',
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error('网络请求失败，请稍后重试');
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
                        const messages = getMessageHistory(model);
                        messages.push({
                            role: "assistant",
                            content: responseText
                        });
                        saveMessageHistory(model, messages);
                    }
                } catch (error) {
                    console.error('Stream error:', error);
                    throw new Error('连接中断，请刷新页面重试');
                }
            }
        };
    } catch (error) {
        console.error('Request error:', error);
        throw new Error(error.message || '请求失败，请稍后重试');
    }
}

// 修改清除历史记录函数
function clearMessageHistory(model = null) {
    if (model) {
        // 清除指定模型的历史记录
        const histories = JSON.parse(localStorage.getItem(MESSAGE_HISTORY_KEY) || '{}');
        histories[model] = [];
        localStorage.setItem(MESSAGE_HISTORY_KEY, JSON.stringify(histories));
    } else {
        // 清除所有历史记录
        localStorage.setItem(MESSAGE_HISTORY_KEY, '{}');
    }
}

export { sendToLinkAI, sendToClaude, sendToCeok, clearMessageHistory };
