from flask import Flask, request, Response
from flask_cors import CORS
import requests
import json
import logging
import urllib3
import os

# 禁用 SSL 警告
urllib3.disable_warnings()

# 设置环境变量禁用代理
os.environ['NO_PROXY'] = '*'
os.environ['no_proxy'] = '*'

app = Flask(__name__)
CORS(app)

# 设置日志
logging.basicConfig(level=logging.DEBUG)

API_KEY = 'Link_NfHdwAUcT49vVOl3EshytxdVmg8wNAjnGjGBCzfxTj'
API_URL = 'https://api.link-ai.tech/v1/chat/completions'

# 创建一个全局的 session 对象
session = requests.Session()
session.verify = False
session.trust_env = False

@app.route('/chat', methods=['POST'])
def chat():
    try:
        app.logger.debug(f"Received request: {request.json}")
        
        headers = {
            'Authorization': f'Bearer {API_KEY}',
            'Content-Type': 'application/json'
        }
        
        request_body = {
            "messages": [
                {
                    "role": "user",
                    "content": request.json['messages'][0]['content']
                }
            ],
            "model": request.json['model'],
            "stream": True
        }
        
        app.logger.debug(f"Sending to LinkAI with headers: {headers}")
        app.logger.debug(f"Request body: {request_body}")
        
        response = session.post(
            API_URL, 
            json=request_body,
            headers=headers,
            stream=True,
            proxies={'http': None, 'https': None}
        )
        
        app.logger.debug(f"LinkAI response status: {response.status_code}")
        
        if response.status_code != 200:
            app.logger.error(f"LinkAI error response: {response.text}")
            return {"error": response.text}, response.status_code
            
        return Response(
            response.iter_content(chunk_size=8192),
            content_type=response.headers['content-type']
        )
        
    except Exception as e:
        app.logger.error(f"Error occurred: {str(e)}")
        return {"error": str(e)}, 500

if __name__ == '__main__':
    app.run(port=5000, debug=True) 