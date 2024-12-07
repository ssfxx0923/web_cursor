const API_URL = '/api/chat';

async function sendToLinkAI(message, sessionId) {
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                messages: [{
                    role: "user",
                    content: message
                }],
                session_id: sessionId,
                stream: true,
                model: 'linkai-4o-mini'
            })
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
        }

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        return {
            async *[Symbol.asyncIterator]() {
                while (true) {
                    const {done, value} = await reader.read();
                    if (done) break;
                    
                    const chunk = decoder.decode(value);
                    try {
                        // 处理多行数据
                        const lines = chunk.split('\n');
                        for (const line of lines) {
                            if (line.startsWith('data: ')) {
                                const data = JSON.parse(line.slice(6));
                                if (data.choices && data.choices[0].delta && data.choices[0].delta.content) {
                                    yield data.choices[0].delta.content;
                                }
                            }
                        }
                    } catch (e) {
                        console.warn('Failed to parse chunk:', chunk);
                    }
                }
            }
        };
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export { sendToLinkAI };
