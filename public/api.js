// 修改API_URL为相对路径
const API_URL = '/api/chat';

// 其余代码保持不变
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

        // ... 其余代码保持不变
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export { sendToLinkAI }; 