# DB Test

A TypeScript/Express Cloud Run service with Firestore database integration.

## Features

- 🗄️ Firestore database (Free tier: 1 GB storage, 50K reads/day, 20K writes/day)
- 📝 CRUD operations for items
- 🎨 Beautiful HTML interface
- 🔌 RESTful API endpoints
- ✅ TypeScript with strict typing

## Setup

### 1. Enable Firestore

```bash
# Enable Firestore API
gcloud services enable firestore.googleapis.com

# Create Firestore database (use Firestore Native mode)
gcloud firestore databases create --location=us-central1
```

### 2. Local Development

```bash
# Install dependencies
npm install

# Set your GCP project
export GCP_PROJECT=your-project-id

# Run in dev mode
npm run dev
```

Visit http://localhost:8080

### 3. Deploy to Cloud Run

```bash
gcloud run deploy db-test \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

The service automatically uses the default project's Firestore instance.

## API Endpoints

- `GET /` - HTML interface
- `GET /api/items` - List all items
- `POST /api/items` - Create item (JSON: `{title, description}`)
- `GET /api/items/:id` - Get single item
- `DELETE /api/items/:id` - Delete item
- `GET /api/health` - Health check

## Free Tier Limits

Firestore free tier includes:
- 1 GB storage
- 50,000 document reads/day
- 20,000 document writes/day
- 20,000 document deletes/day

Cloud Run free tier includes:
- 2 million requests/month
- 360,000 GB-seconds of memory
- 180,000 vCPU-seconds of compute time

Perfect for testing and small apps! 🎉

