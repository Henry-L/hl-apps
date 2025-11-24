import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 8080;

// Stability AI API Key (from environment variable or Secret Manager)
const STABILITY_API_KEY = process.env.STABILITY_API_KEY || '';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Print sizes (width x height in inches)
const PRINT_SIZES = {
  '8x10': { width: 8, height: 10, aspectRatio: '4:5' },
  '11x14': { width: 11, height: 14, aspectRatio: '11:14' },
  '16x20': { width: 16, height: 20, aspectRatio: '4:5' },
  '18x24': { width: 18, height: 24, aspectRatio: '3:4' },
  '24x36': { width: 24, height: 36, aspectRatio: '2:3' },
  'square': { width: 20, height: 20, aspectRatio: '1:1' }
};

// HTML Template
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Art Studio - AI Wall Art Generator</title>
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
            padding: 20px;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
        }
        .header {
            background: white;
            border-radius: 20px;
            padding: 40px;
            margin-bottom: 30px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            text-align: center;
        }
        h1 {
            color: #667eea;
            font-size: 3em;
            margin-bottom: 10px;
        }
        .subtitle {
            color: #64748b;
            font-size: 1.2em;
        }
        .main-grid {
            display: grid;
            grid-template-columns: 1fr 1.5fr;
            gap: 30px;
            margin-bottom: 30px;
        }
        @media (max-width: 1024px) {
            .main-grid {
                grid-template-columns: 1fr;
            }
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        h2 {
            color: #1e293b;
            margin-bottom: 20px;
            font-size: 1.8em;
        }
        .form-group {
            margin-bottom: 20px;
        }
        label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #475569;
        }
        input, textarea, select {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1em;
            font-family: inherit;
            transition: border-color 0.2s;
        }
        textarea {
            min-height: 120px;
            resize: vertical;
        }
        input:focus, textarea:focus, select:focus {
            outline: none;
            border-color: #667eea;
        }
        button {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
            margin-top: 10px;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
        }
        button:active {
            transform: translateY(0);
        }
        button:disabled {
            opacity: 0.6;
            cursor: not-allowed;
            transform: none;
        }
        .size-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 10px;
            margin-bottom: 20px;
        }
        .size-option {
            padding: 15px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            text-align: center;
            cursor: pointer;
            transition: all 0.2s;
        }
        .size-option:hover {
            border-color: #667eea;
            background: #f0f9ff;
        }
        .size-option.selected {
            border-color: #667eea;
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            font-weight: 600;
        }
        .size-name {
            font-size: 1.1em;
            color: #1e293b;
            margin-bottom: 5px;
        }
        .size-dims {
            font-size: 0.9em;
            color: #64748b;
        }
        .gallery {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            min-height: 600px;
            display: flex;
            flex-direction: column;
        }
        .image-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            background: #f8fafc;
            border-radius: 15px;
            overflow: hidden;
            margin-bottom: 20px;
            position: relative;
        }
        .placeholder {
            color: #94a3b8;
            text-align: center;
            padding: 40px;
        }
        .placeholder-icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
        .generated-image {
            max-width: 100%;
            max-height: 100%;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .loading {
            text-align: center;
            padding: 40px;
        }
        .spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e2e8f0;
            border-top: 4px solid #667eea;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 20px;
        }
        @keyframes spin {
            to { transform: rotate(360deg); }
        }
        .image-info {
            background: #f8fafc;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 8px;
            font-size: 0.95em;
        }
        .info-label {
            color: #64748b;
        }
        .info-value {
            font-weight: 600;
            color: #1e293b;
        }
        .prompt-display {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .prompt-label {
            font-weight: 600;
            color: #065f46;
            margin-bottom: 8px;
        }
        .prompt-text {
            color: #064e3b;
            line-height: 1.5;
        }
        .action-buttons {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
        }
        .download-btn {
            background: #10b981;
        }
        .download-btn:hover {
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.3);
        }
        .new-btn {
            background: #6366f1;
        }
        .message {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        .message.error {
            background: #fee2e2;
            color: #991b1b;
        }
        .message.info {
            background: #dbeafe;
            color: #1e40af;
        }
        .hidden {
            display: none;
        }
        .step-indicator {
            display: flex;
            justify-content: center;
            gap: 10px;
            margin-bottom: 20px;
        }
        .step {
            padding: 8px 16px;
            border-radius: 20px;
            background: #e2e8f0;
            color: #64748b;
            font-size: 0.9em;
        }
        .step.active {
            background: #667eea;
            color: white;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎨 Art Studio</h1>
            <p class="subtitle">AI-Powered Wall Art Generator • Stability AI • Free Prompt Enhancement • Optimized for Print</p>
        </div>

        <div class="main-grid">
            <!-- Left Panel - Input -->
            <div class="card">
                <h2>Create Your Art</h2>
                
                <div class="step-indicator">
                    <div class="step active" id="step-1">1. Describe</div>
                    <div class="step" id="step-2">2. Size</div>
                    <div class="step" id="step-3">3. Generate</div>
                </div>

                <div id="message" class="message hidden"></div>

                <form id="art-form">
                    <div class="form-group">
                        <label for="prompt">What do you want to create?</label>
                        <textarea 
                            id="prompt" 
                            name="prompt" 
                            placeholder="Example: A serene mountain landscape at sunset with a lake reflecting the colors..." 
                            required></textarea>
                        <small style="color: #64748b;">Be descriptive! Our AI will enhance your prompt for better results.</small>
                    </div>

                    <div class="form-group">
                        <label>Choose Print Size</label>
                        <div class="size-grid">
                            <div class="size-option" data-size="8x10">
                                <div class="size-name">8×10"</div>
                                <div class="size-dims">Portrait</div>
                            </div>
                            <div class="size-option" data-size="11x14">
                                <div class="size-name">11×14"</div>
                                <div class="size-dims">Portrait</div>
                            </div>
                            <div class="size-option selected" data-size="16x20">
                                <div class="size-name">16×20"</div>
                                <div class="size-dims">Portrait</div>
                            </div>
                            <div class="size-option" data-size="18x24">
                                <div class="size-name">18×24"</div>
                                <div class="size-dims">Portrait</div>
                            </div>
                            <div class="size-option" data-size="24x36">
                                <div class="size-name">24×36"</div>
                                <div class="size-dims">Poster</div>
                            </div>
                            <div class="size-option" data-size="square">
                                <div class="size-name">20×20"</div>
                                <div class="size-dims">Square</div>
                            </div>
                        </div>
                        <input type="hidden" id="size" name="size" value="16x20" required>
                    </div>

                    <button type="submit" id="generate-btn">
                        ✨ Generate Wall Art
                    </button>
                </form>
            </div>

            <!-- Right Panel - Results -->
            <div class="gallery">
                <h2>Your Artwork</h2>
                
                <div id="placeholder" class="image-container">
                    <div class="placeholder">
                        <div class="placeholder-icon">🖼️</div>
                        <p>Your AI-generated art will appear here</p>
                        <p style="margin-top: 10px; font-size: 0.9em;">Enter a prompt and click generate to start</p>
                    </div>
                </div>

                <div id="loading" class="loading hidden">
                    <div class="spinner"></div>
                    <p style="color: #667eea; font-weight: 600; margin-bottom: 10px;">Creating your masterpiece...</p>
                    <p style="color: #64748b; font-size: 0.9em;">Enhancing prompt & generating with Stability AI...</p>
                    <p id="loading-step" style="color: #64748b; font-size: 0.9em; margin-top: 5px;">This takes about 10-15 seconds ⏳</p>
                </div>

                <div id="result" class="hidden">
                    <div class="prompt-display">
                        <div class="prompt-label">📝 Enhanced Prompt</div>
                        <div class="prompt-text" id="enhanced-prompt"></div>
                    </div>

                    <div class="image-container">
                        <img id="generated-image" class="generated-image" alt="Generated artwork">
                    </div>

                    <div class="image-info">
                        <div class="info-row">
                            <span class="info-label">Print Size:</span>
                            <span class="info-value" id="result-size"></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Aspect Ratio:</span>
                            <span class="info-value" id="result-ratio"></span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">Recommended DPI:</span>
                            <span class="info-value">300 DPI (Print Quality)</span>
                        </div>
                    </div>

                    <div class="action-buttons">
                        <button class="download-btn" onclick="downloadImage()">
                            ⬇️ Download
                        </button>
                        <button class="new-btn" onclick="createNew()">
                            ➕ Create New
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.pathname.includes('/apps/art-studio') 
            ? '/apps/art-studio' 
            : '';

        let selectedSize = '16x20';
        let currentImageUrl = '';
        let currentPrompt = '';

        // Size selection
        document.querySelectorAll('.size-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                selectedSize = option.dataset.size;
                document.getElementById('size').value = selectedSize;
            });
        });

        function showMessage(text, type = 'error') {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type;
            setTimeout(() => {
                msg.className = 'message hidden';
            }, 5000);
        }

        function updateSteps(step) {
            [1, 2, 3].forEach(i => {
                const stepEl = document.getElementById(\`step-\${i}\`);
                if (i <= step) {
                    stepEl.classList.add('active');
                } else {
                    stepEl.classList.remove('active');
                }
            });
        }

        document.getElementById('art-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const prompt = document.getElementById('prompt').value;
            const size = selectedSize;

            // Show loading
            document.getElementById('placeholder').classList.add('hidden');
            document.getElementById('result').classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');
            document.getElementById('generate-btn').disabled = true;
            updateSteps(3);

            try {
                const response = await fetch(API_BASE + '/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, size })
                });

                const data = await response.json();

                if (response.ok) {
                    currentImageUrl = data.imageUrl;
                    currentPrompt = prompt;

                    document.getElementById('enhanced-prompt').textContent = data.enhancedPrompt;
                    document.getElementById('generated-image').src = data.imageUrl;
                    document.getElementById('result-size').textContent = size.replace('x', '×') + '"';
                    document.getElementById('result-ratio').textContent = data.aspectRatio;

                    document.getElementById('loading').classList.add('hidden');
                    document.getElementById('result').classList.remove('hidden');
                } else {
                    throw new Error(data.error || 'Generation failed');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage(error.message || 'Failed to generate artwork. Please try again.', 'error');
                document.getElementById('loading').classList.add('hidden');
                document.getElementById('placeholder').classList.remove('hidden');
            } finally {
                document.getElementById('generate-btn').disabled = false;
            }
        });

        function downloadImage() {
            if (!currentImageUrl) return;

            const link = document.createElement('a');
            link.href = currentImageUrl;
            link.download = \`artwork-\${selectedSize}-\${Date.now()}.png\`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        function createNew() {
            document.getElementById('result').classList.add('hidden');
            document.getElementById('placeholder').classList.remove('hidden');
            document.getElementById('art-form').reset();
            selectedSize = '16x20';
            document.querySelectorAll('.size-option').forEach(o => o.classList.remove('selected'));
            document.querySelector('[data-size="16x20"]').classList.add('selected');
            updateSteps(1);
        }
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/art-studio', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/art-studio/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

// Health check
app.get('/api/health', async (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

app.get('/apps/art-studio/api/health', async (req: Request, res: Response) => {
  res.json({ status: 'healthy' });
});

// Helper function to enhance prompts locally (free alternative to Gemini)
function enhancePrompt(userPrompt: string, printSize: any): string {
  const printContext = `${printSize.width}x${printSize.height} inch print`;
  const qualityTerms = 'ultra high resolution, 8K quality, print-ready, professional photography';
  
  // Enhance the prompt by adding quality terms
  const enhanced = `${userPrompt}, ${qualityTerms}, perfect for wall art and ${printContext}, gallery quality, highly detailed, sharp focus, vibrant colors, masterpiece`;
  
  return enhanced;
}

// Generate artwork
app.post('/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, size } = req.body;

    if (!prompt || !size) {
      res.status(400).json({ error: 'Prompt and size are required' });
      return;
    }

    const printSize = PRINT_SIZES[size as keyof typeof PRINT_SIZES];
    if (!printSize) {
      res.status(400).json({ error: 'Invalid size' });
      return;
    }

    // Step 1: Enhance the prompt (free, no API needed - no Gemini!)
    console.log('Enhancing prompt locally...');
    const enhancedPrompt = enhancePrompt(prompt, printSize);
    console.log('Enhanced prompt:', enhancedPrompt);

    // Step 2: Generate image using Stability AI
    console.log('Generating image with Stability AI...');
    
    if (!STABILITY_API_KEY) {
      throw new Error('Stability AI API key not configured');
    }

    // Determine aspect ratio for Stability AI
    let aspectRatio = '1:1';
    if (printSize.aspectRatio === '4:5') aspectRatio = '4:5';
    else if (printSize.aspectRatio === '3:4') aspectRatio = '3:4';
    else if (printSize.aspectRatio === '2:3') aspectRatio = '2:3';
    else if (printSize.aspectRatio === '1:1') aspectRatio = '1:1';
    
    // Call Stability AI API
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', aspectRatio);
    formData.append('model', 'sd3-large'); // or 'sd3-large-turbo' for faster
    
    const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: formData
    });

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      console.error('Stability API error:', errorText);
      throw new Error(`Stability AI API error: ${stabilityResponse.status}`);
    }

    // Get image as buffer and convert to base64
    const imageBuffer = await stabilityResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    res.json({
      success: true,
      imageUrl,
      enhancedPrompt,
      size: `${printSize.width}x${printSize.height}`,
      aspectRatio: printSize.aspectRatio
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate artwork. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

app.post('/apps/art-studio/api/generate', async (req: Request, res: Response) => {
  try {
    const { prompt, size } = req.body;

    if (!prompt || !size) {
      res.status(400).json({ error: 'Prompt and size are required' });
      return;
    }

    const printSize = PRINT_SIZES[size as keyof typeof PRINT_SIZES];
    if (!printSize) {
      res.status(400).json({ error: 'Invalid size' });
      return;
    }

    console.log('Enhancing prompt locally...');
    const enhancedPrompt = enhancePrompt(prompt, printSize);
    console.log('Enhanced prompt:', enhancedPrompt);

    console.log('Generating image with Stability AI...');
    
    if (!STABILITY_API_KEY) {
      throw new Error('Stability AI API key not configured');
    }

    let aspectRatio = '1:1';
    if (printSize.aspectRatio === '4:5') aspectRatio = '4:5';
    else if (printSize.aspectRatio === '3:4') aspectRatio = '3:4';
    else if (printSize.aspectRatio === '2:3') aspectRatio = '2:3';
    else if (printSize.aspectRatio === '1:1') aspectRatio = '1:1';
    
    const formData = new FormData();
    formData.append('prompt', enhancedPrompt);
    formData.append('output_format', 'png');
    formData.append('aspect_ratio', aspectRatio);
    formData.append('model', 'sd3-large');
    
    const stabilityResponse = await fetch('https://api.stability.ai/v2beta/stable-image/generate/sd3', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STABILITY_API_KEY}`,
        'Accept': 'image/*'
      },
      body: formData
    });

    if (!stabilityResponse.ok) {
      const errorText = await stabilityResponse.text();
      console.error('Stability API error:', errorText);
      throw new Error(`Stability AI API error: ${stabilityResponse.status}`);
    }

    const imageBuffer = await stabilityResponse.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:image/png;base64,${imageBase64}`;

    res.json({
      success: true,
      imageUrl,
      enhancedPrompt,
      size: `${printSize.width}x${printSize.height}`,
      aspectRatio: printSize.aspectRatio
    });

  } catch (error) {
    console.error('Generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate artwork. Please try again.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Art Studio running on port ${port}`);
  console.log(`Using Stability AI for image generation`);
  console.log(`Using free local prompt enhancement (no Gemini costs!)`);
  if (STABILITY_API_KEY) {
    console.log('Stability API Key: Configured ✓');
  } else {
    console.log('WARNING: Stability API Key not configured');
  }
});

