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

async function sendToDeepseek(message, sessionId) {
    const messages = getMessageHistory('deepseek');
    messages.push({
        role: "user",
        content: message
    });
    saveMessageHistory('deepseek', messages);
    
    // 添加调试日志
    console.log('发送到Deepseek的消息:', message);
    console.log('完整消息历史:', messages);
    
    try {
        return sendToAI(messages, 'deepseek');
    } catch (error) {
        console.error('Deepseek API调用失败:', error);
        throw error;
    }
}

async function sendToAI(messages, model) {
    try {
        console.log(`[DEBUG] 开始发送请求到${model}模型`);
        
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

        console.log(`[DEBUG] 收到${model}响应:`, response.status, response.statusText);
        console.log(`[DEBUG] 响应头:`, [...response.headers.entries()]);

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[ERROR] API响应错误:`, errorText);
            throw new Error(`网络请求失败 (${response.status}): ${errorText || '未知错误'}`);
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            async *[Symbol.asyncIterator]() {
                try {
                    let responseText = '';
                    let buffer = ''; // 用于处理分段的JSON
                    let isFirst = true;
                    
                    console.log(`[DEBUG] 开始读取${model}响应流`);
                    
                    while (true) {
                        const {done, value} = await reader.read();
                        if (done) {
                            console.log(`[DEBUG] ${model}响应流结束`);
                            break;
                        }
                        
                        const chunk = decoder.decode(value);
                        console.log(`[DEBUG] 收到数据块:`, chunk.substring(0, 100) + (chunk.length > 100 ? '...' : ''));
                        
                        buffer += chunk;
                        const lines = buffer.split('\n');
                        // 保留最后一行，它可能是不完整的
                        buffer = lines.pop() || '';
                        
                        for (const line of lines) {
                            if (line.trim() === '') continue;
                            if (line.trim() === 'data: [DONE]') {
                                console.log(`[DEBUG] 检测到完成标记`);
                                continue;
                            }
                            
                            // 忽略元数据行
                            if (line.startsWith('id:') || line.startsWith('event:') || line.startsWith(':')) {
                                console.log(`[DEBUG] 忽略元数据行:`, line);
                                continue;
                            }
                            
                            if (line.startsWith('data: ')) {
                                try {
                                    const dataStr = line.slice(6);
                                    console.log(`[DEBUG] 解析数据:`, dataStr.substring(0, 50) + (dataStr.length > 50 ? '...' : ''));
                                    
                                    const data = JSON.parse(dataStr);
                                    
                                    // 标准OpenAI格式
                                    if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                        const content = data.choices[0].delta.content;
                                        console.log(`[DEBUG] 提取到标准格式内容:`, content.substring(0, 30) + (content.length > 30 ? '...' : ''));
                                        responseText += content;
                                        yield content;
                                    } 
                                    // 检查Deepseek特有格式
                                    else if (data.output?.choices?.[0]?.message?.reasoning_content) {
                                        // Deepseek返回累计内容，我们需要找出新增部分
                                        const fullContent = data.output.choices[0].message.reasoning_content;
                                        let newContent = '';
                                        
                                        if (responseText === '') {
                                            newContent = fullContent;
                                        } else {
                                            newContent = fullContent.substring(responseText.length);
                                        }
                                        
                                        if (newContent) {
                                            console.log(`[DEBUG] 提取到Deepseek增量内容:`, newContent.substring(0, 30) + (newContent.length > 30 ? '...' : ''));
                                            responseText = fullContent; // 更新累计内容
                                            yield newContent;
                                        }
                                    }
                                    // 其他可能的格式
                                    else if (data.output?.text) {
                                        const content = data.output.text;
                                        console.log(`[DEBUG] 提取到output.text格式内容`);
                                        responseText += content;
                                        yield content;
                                    }
                                    else {
                                        console.warn(`[WARN] 未识别的响应格式:`, JSON.stringify(data).substring(0, 100));
                                    }
                                } catch (e) {
                                    console.error(`[ERROR] 解析响应失败:`, line, e);
                                    if (isFirst) {
                                        // 如果第一次解析就失败，直接显示原始内容
                                        isFirst = false;
                                        const errorMsg = "解析响应失败，原始数据: " + line.substring(0, 50);
                                        yield errorMsg;
                                        responseText += errorMsg;
                                    }
                                    continue;
                                }
                            } else {
                                console.warn(`[WARN] 未知格式的行:`, line);
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
                    console.error(`[ERROR] 流处理错误:`, error);
                    yield `\n\n[连接错误: ${error.message}]`;
                    throw new Error('连接中断，请刷新页面重试: ' + error.message);
                }
            }
        };
    } catch (error) {
        console.error(`[ERROR] 请求错误:`, error);
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

export { sendToLinkAI, sendToClaude, sendToCeok, sendToDeepseek, clearMessageHistory };
