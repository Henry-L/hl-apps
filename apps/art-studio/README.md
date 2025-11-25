# Art Studio

AI-powered wall art generator using **free local prompt enhancement** + **Stability AI** image generation. Uses your Stability credits (no Gemini costs!). Optimized for print sizes.

## Features

- 🎨 **AI Image Generation** - Powered by Stability AI SD3
- ✨ **Free Prompt Enhancement** - Automatically optimizes your prompts (no Gemini costs!)
- 📐 **Print-Optimized** - Choose from standard frame sizes (8x10, 16x20, 24x36, etc.)
- ⬇️ **Download Ready** - High-resolution PNG files ready for printing
- 🎯 **Aspect Ratio Matching** - Automatically optimizes for your chosen print size
- 🖼️ **Beautiful UI** - Simple, elegant interface for creating wall art
- ⚡ **Fast Generation** - ~10-15 seconds per image with Stability AI

## Print Sizes

- **8×10"** - Portrait (4:5 ratio)
- **11×14"** - Portrait (11:14 ratio)
- **16×20"** - Portrait (4:5 ratio) [Default]
- **18×24"** - Portrait (3:4 ratio)
- **24×36"** - Poster (2:3 ratio)
- **20×20"** - Square (1:1 ratio)

## Setup

### 1. Get Stability AI API Key

1. Go to https://platform.stability.ai/
2. Sign up / Log in
3. Navigate to API Keys
4. Create a new API key
5. Copy your API key

### 2. Store API Key in Secret Manager

```bash
# Enable Secret Manager
gcloud services enable secretmanager.googleapis.com

# Create secret with your Stability AI key
echo -n "sk-YOUR-STABILITY-API-KEY-HERE" | \
  gcloud secrets create stability-api-key --data-file=-
```

### 3. Deploy to Cloud Run

**With unified secrets (recommended):**
```bash
cd apps/art-studio

gcloud run deploy art-studio \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="APP_SECRETS=app-secrets:latest"
```

**With individual secret (legacy):**
```bash
gcloud run deploy art-studio \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="STABILITY_API_KEY=stability-api-key:latest"
```

### Add to Firebase Hosting (Optional)

Add to your `firebase.json`:

```json
{
  "source": "/apps/art-studio",
  "run": { "serviceId": "art-studio", "region": "us-central1" }
},
{
  "source": "/apps/art-studio/**",
  "run": { "serviceId": "art-studio", "region": "us-central1" }
}
```

## Local Development

### Setup

```bash
# Install dependencies
npm install

# Option A: Use unified secrets JSON
export APP_SECRETS='{"stability_api_key":"sk-your-key-here"}'

# Option B: Use individual env var
export STABILITY_API_KEY="sk-your-key-here"

# Run dev server
npm run dev
```

Visit http://localhost:8080

## How It Works

### 1. User Input
User enters a simple prompt like "mountain landscape at sunset"

### 2. Prompt Enhancement (Free - No Gemini!)
App automatically enhances the prompt locally with:
- Artistic quality terms
- Print optimization keywords
- High resolution specifications
- Wall art context

Example enhancement:
> "mountain landscape at sunset, ultra high resolution, 8K quality, print-ready, professional photography, perfect for wall art and 16x20 inch print, gallery quality, highly detailed, sharp focus, vibrant colors, masterpiece"

### 3. Image Generation (Stability AI)
Enhanced prompt sent to Stability AI SD3:
- Generates high-quality images
- Matches selected aspect ratio
- Returns PNG for download
- Takes ~10-15 seconds

### 4. Download
User downloads print-ready image file

## Cost

### Prompt Enhancement: **$0.00** 🎉
- Local prompt enhancement (no Gemini!)
- No API calls for optimization
- Completely free

### Image Generation: Stability AI Credits
- Uses your existing Stability AI credits
- **SD3**: ~$0.065 per image
- **SD3 Turbo**: ~$0.04 per image (faster)

### Example Monthly Cost (25 images)
- Prompt Enhancement: $0.00 (local, no Gemini!)
- Stability: 25 × $0.065 = ~$1.63
- **Total: ~$1.63/month**

With your existing Stability credits: **free until credits run out!**

## API Endpoints

- `GET /` - HTML interface
- `POST /api/generate` - Generate artwork
  - Body: `{ prompt: string, size: string }`
  - Returns: `{ imageUrl: string, enhancedPrompt: string, ... }`
- `GET /api/health` - Health check

## Tips for Best Results

1. **Be Descriptive** - More details = better results
   - Bad: "forest"
   - Good: "mystical forest with sunbeams, misty atmosphere, ancient trees"

2. **Specify Style** - Mention artistic style for consistency
   - "oil painting style", "minimalist", "photorealistic", "abstract"

3. **Mention Mood** - Set the emotional tone
   - "serene", "dramatic", "vibrant", "moody"

4. **Choose Right Size** - Match your frame
   - Standard frames: 8×10, 11×14, 16×20
   - Large prints: 18×24, 24×36
   - Modern: Square (20×20)

## Technology Stack

- **Backend**: TypeScript + Express
- **Prompt Enhancement**: Local (free, no Gemini costs!)
- **Image Generation**: Stability AI SD3
- **Deployment**: Cloud Run
- **Secrets**: Secret Manager (for Stability API key only)

## Troubleshooting

### "Stability AI API key not configured"
- Make sure secret is created: `gcloud secrets describe stability-api-key`
- Verify secret is attached to Cloud Run service
- For local dev: export STABILITY_API_KEY environment variable

### Image generation fails
- Check Stability AI credits/balance at https://platform.stability.ai
- Verify API key is valid
- Check Cloud Run logs for detailed error

### Slow generation
- SD3 takes ~10-15 seconds per image
- Use SD3 Turbo for faster results (change model in code)
- This is normal for high-quality image generation

### Image quality issues
- Try being more descriptive in your prompt
- Mention specific art styles
- The local enhancement already adds quality keywords, so focus on the subject/style

## Future Enhancements

Ideas for v2:
- Gallery to save favorite generations
- Multiple style presets
- Batch generation
- Image upscaling
- Custom aspect ratios
- Negative prompts
- Style transfer
- Multiple model options (SDXL, Flux, etc.)

