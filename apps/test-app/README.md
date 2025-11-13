# Test App

A simple Flask-based Cloud Run service for testing.

## Endpoints

- `GET /` - Main endpoint with timestamp
- `GET /health` - Health check endpoint
- `GET /info` - Service information

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

Visit http://localhost:8080

## Deploy to Cloud Run

```bash
# Set your project ID
export PROJECT_ID=your-project-id

# Build and deploy
gcloud run deploy test-app \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --project $PROJECT_ID
```

Or build with Docker first:

```bash
# Build image
docker build -t gcr.io/$PROJECT_ID/test-app .

# Push to Google Container Registry
docker push gcr.io/$PROJECT_ID/test-app

# Deploy
gcloud run deploy test-app \
  --image gcr.io/$PROJECT_ID/test-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --project $PROJECT_ID
```

## Test Locally with Docker

```bash
docker build -t test-app .
docker run -p 8080:8080 -e PORT=8080 test-app
```

