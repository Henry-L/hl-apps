# Get a FREE Gemini API Key

The app uses Google's Gemini 1.5 Flash for intelligent prompt enhancement. It's **completely FREE** with a very generous quota!

## Free Tier Limits (Gemini API)

- **15 requests per minute**
- **1 million requests per day**
- **1500 requests per day for free tier**

This is MORE than enough for personal use!

## How to Get Your FREE API Key

### 1. Go to Google AI Studio
Visit: https://aistudio.google.com/app/apikey

### 2. Sign in with your Google account

### 3. Click "Get API Key"

### 4. Create a new API key
- Click "Create API key"
- Select a project (or create a new one)
- Copy your API key (starts with `AIza...`)

### 5. Add to your secrets

**Option A: Update unified secret (recommended)**

1. Go to https://console.cloud.google.com/security/secret-manager
2. Click on `app-secrets`
3. Click "NEW VERSION"
4. Add your Gemini key to the JSON:
   ```json
   {
     "stability_api_key": "sk-...",
     "jwt_secret": "...",
     "gemini_api_key": "AIza..."
   }
   ```
5. Click "ADD NEW VERSION"

**Option B: Create individual secret**

```bash
echo -n "AIza-YOUR-GEMINI-KEY" | \
  gcloud secrets create gemini-api-key --data-file=-

# Grant access to Cloud Run
gcloud secrets add-iam-policy-binding gemini-api-key \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 6. Redeploy your app

```bash
cd apps/art-studio
gcloud run deploy art-studio \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="APP_SECRETS=app-secrets:latest"
```

## What You Get

With the Gemini API key, your prompts will be **intelligently enhanced** by AI:

**Without Gemini (local fallback):**
```
mountain landscape → mountain landscape, 8K quality, print-ready, gallery quality
```

**With Gemini (AI-enhanced):**
```
mountain landscape → A breathtaking mountain landscape at golden hour, 
majestic snow-capped peaks rising against a vibrant sky painted with 
warm oranges and soft pinks, serene alpine lake reflecting the scene, 
professional nature photography, ultra-high resolution 8K quality, 
dramatic lighting, rich color depth, perfect for large format wall art
```

Much better results! 🎨

## Cost

**$0.00** - Completely FREE with the generous quota!

## Local Development

```bash
export GEMINI_API_KEY="AIza-your-key-here"
# Or add to APP_SECRETS JSON
export APP_SECRETS='{"stability_api_key":"sk-...","gemini_api_key":"AIza-..."}'

npm run dev
```

## Troubleshooting

### "Gemini API key not found"
- Check that the key is in your `app-secrets` JSON
- Make sure you've redeployed after adding the key

### Rate limit errors
- Free tier: 15 requests/min, 1500/day
- This should be plenty for normal use
- If you hit limits, the app falls back to local enhancement

### Invalid API key
- Make sure you copied the full key (starts with `AIza`)
- The key should be from AI Studio, not Vertex AI
- Try creating a new API key

