const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/proxy/chat', async (req, res) => {
    try {
        const response = await fetch('https://api.link-ai.tech/v1/chat/memory/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer Link_NfHdwAUcT49vVOl3EshytxdVmg8wNAjnGjGBCzfxTj`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(req.body)
        });
        
        response.body.pipe(res);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
}); 