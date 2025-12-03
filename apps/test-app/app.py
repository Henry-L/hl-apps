import os
from flask import Flask, jsonify, render_template_string, request
from flask_cors import CORS
from datetime import datetime

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

HTML_TEMPLATE = """
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/svg+xml" href="https://hl-apps.web.app/favicon.svg">
    <title>Test App - Cloud Run</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 600px;
            width: 100%;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 2.5em;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 1.1em;
        }
        .status {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 600;
            margin-bottom: 30px;
        }
        .info-box {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .info-item {
            margin-bottom: 10px;
            font-size: 0.95em;
        }
        .info-item:last-child {
            margin-bottom: 0;
        }
        .label {
            font-weight: 600;
            color: #374151;
        }
        .value {
            color: #6b7280;
        }
        .endpoints {
            margin-top: 30px;
        }
        .endpoints h2 {
            color: #333;
            margin-bottom: 15px;
            font-size: 1.3em;
        }
        .endpoint {
            background: #f9fafb;
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 10px;
            border-left: 4px solid #667eea;
        }
        .endpoint-path {
            font-family: 'Courier New', monospace;
            color: #667eea;
            font-weight: 600;
        }
        .endpoint-desc {
            color: #6b7280;
            font-size: 0.9em;
            margin-top: 4px;
        }
        .footer {
            text-align: center;
            margin-top: 30px;
            color: #9ca3af;
            font-size: 0.9em;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🚀 Test App</h1>
        <p class="subtitle">Cloud Run Service</p>
        <div class="status">● Running</div>
        
        <div class="info-box">
            <div class="info-item">
                <span class="label">Version:</span>
                <span class="value">1.0.0</span>
            </div>
            <div class="info-item">
                <span class="label">Timestamp:</span>
                <span class="value" id="timestamp">{{ timestamp }}</span>
            </div>
            <div class="info-item">
                <span class="label">Description:</span>
                <span class="value">A simple Cloud Run test service</span>
            </div>
        </div>

        <div class="endpoints">
            <h2>Available Endpoints</h2>
            <div class="endpoint">
                <div class="endpoint-path">GET /</div>
                <div class="endpoint-desc">This page (HTML) or JSON response</div>
            </div>
            <div class="endpoint">
                <div class="endpoint-path">GET /health</div>
                <div class="endpoint-desc">Health check endpoint (JSON)</div>
            </div>
            <div class="endpoint">
                <div class="endpoint-path">GET /info</div>
                <div class="endpoint-desc">Service information (JSON)</div>
            </div>
            <div class="endpoint">
                <div class="endpoint-path">GET /api</div>
                <div class="endpoint-desc">API test endpoint (JSON)</div>
            </div>
        </div>

        <div class="footer">
            Built for app-a-day challenge 🎨
        </div>
    </div>
</body>
</html>
"""

def home_view():
    """Shared home view logic"""
    if 'application/json' in request.headers.get('Accept', ''):
        return jsonify({
            'message': 'Hello from test-app!',
            'timestamp': datetime.utcnow().isoformat(),
            'status': 'running'
        })
    return render_template_string(HTML_TEMPLATE, timestamp=datetime.utcnow().isoformat())

def api_view():
    """Shared API view logic"""
    return jsonify({
        'message': 'Hello from test-app API!',
        'timestamp': datetime.utcnow().isoformat(),
        'status': 'running'
    })

def health_view():
    """Shared health view logic"""
    return jsonify({
        'status': 'healthy',
        'service': 'test-app'
    })

def info_view():
    """Shared info view logic"""
    return jsonify({
        'app': 'test-app',
        'version': '1.0.0',
        'description': 'A simple Cloud Run test service',
        'endpoints': {
            '/': 'Main endpoint (HTML or JSON)',
            '/api': 'API test endpoint',
            '/health': 'Health check',
            '/info': 'Service information'
        }
    })

# Routes for direct access (when accessing Cloud Run service directly)
@app.route('/')
def hello():
    return home_view()

@app.route('/api')
def api():
    return api_view()

@app.route('/health')
def health():
    return health_view()

@app.route('/info')
def info():
    return info_view()

# Routes for Firebase hosting proxy (when accessing through Firebase)
@app.route('/apps/test-app')
@app.route('/apps/test-app/')
def hello_firebase():
    return home_view()

@app.route('/apps/test-app/api')
def api_firebase():
    return api_view()

@app.route('/apps/test-app/health')
def health_firebase():
    return health_view()

@app.route('/apps/test-app/info')
def info_firebase():
    return info_view()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8080))
    app.run(host='0.0.0.0', port=port)

