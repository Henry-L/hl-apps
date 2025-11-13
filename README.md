# hl-apps

Henry's app-a-day challenge - vibe-coding and deploying apps daily to Cloud Run.

## Apps

- **test-app** - Simple Flask-based Cloud Run service with HTML interface

## Structure

```
hl-apps/
├── apps/
│   └── test-app/     # Individual app directories
│       ├── app.py
│       ├── Dockerfile
│       └── requirements.txt
└── README.md
```

## Development

Each app is a self-contained Cloud Run service that can be deployed independently.

## Deployment

Deploy any app with:

```bash
cd apps/[app-name]
gcloud run deploy [app-name] \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

