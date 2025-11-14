# Secrets Management Guide

How to securely manage secrets (API keys, DB credentials, etc.) in Cloud Run.

## Quick Start

### 1. Enable Secret Manager API

```bash
gcloud services enable secretmanager.googleapis.com
```

### 2. Create Secrets

```bash
# Database password
echo -n "your-db-password" | gcloud secrets create db-password --data-file=-

# API key
echo -n "sk-abc123xyz" | gcloud secrets create api-key --data-file=-

# Database URL (for external DB like Supabase)
echo -n "postgresql://user:pass@host:5432/dbname" | \
  gcloud secrets create database-url --data-file=-
```

### 3. Grant Access (if needed)

Cloud Run service accounts automatically have access, but if you need to grant manually:

```bash
# Get your project number
PROJECT_NUMBER=$(gcloud projects describe $(gcloud config get-value project) --format="value(projectNumber)")

# Grant access
gcloud secrets add-iam-policy-binding db-password \
  --member="serviceAccount:${PROJECT_NUMBER}-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### 4. Deploy with Secrets

```bash
gcloud run deploy my-app \
  --source . \
  --region us-central1 \
  --set-secrets="DB_PASSWORD=db-password:latest,API_KEY=api-key:latest"
```

---

## Environment Variables vs Secrets

### Regular Environment Variables (Not Secret)
```bash
# For non-sensitive config
gcloud run deploy my-app \
  --set-env-vars="NODE_ENV=production,LOG_LEVEL=info"
```

### Secret Manager (For Sensitive Data)
```bash
# For passwords, keys, tokens
gcloud run deploy my-app \
  --set-secrets="DB_PASSWORD=db-password:latest"
```

**Rule of thumb:** If it would be bad if it leaked on GitHub → use Secret Manager

---

## Common Use Cases

### 1. External Database (Supabase, PlanetScale)

```bash
# Store connection string
echo -n "postgresql://user:pass@db.supabase.co:5432/postgres" | \
  gcloud secrets create supabase-url --data-file=-

# Deploy
gcloud run deploy db-test \
  --source . \
  --region us-central1 \
  --set-secrets="DATABASE_URL=supabase-url:latest"
```

**In code:**
```typescript
import { createClient } from '@supabase/supabase-js';

const databaseUrl = process.env.DATABASE_URL;
const client = createClient(databaseUrl);
```

### 2. OpenAI API Key

```bash
echo -n "sk-proj-abc123..." | gcloud secrets create openai-api-key --data-file=-

gcloud run deploy ai-app \
  --source . \
  --set-secrets="OPENAI_API_KEY=openai-api-key:latest"
```

### 3. JWT Secret

```bash
openssl rand -base64 32 | gcloud secrets create jwt-secret --data-file=-

gcloud run deploy auth-app \
  --source . \
  --set-secrets="JWT_SECRET=jwt-secret:latest"
```

### 4. Multiple Secrets at Once

```bash
gcloud run deploy my-app \
  --source . \
  --set-secrets="
    DB_HOST=db-host:latest,
    DB_USER=db-user:latest,
    DB_PASS=db-pass:latest,
    API_KEY=api-key:latest
  "
```

---

## Updating Secrets

### Update secret value
```bash
echo -n "new-password" | gcloud secrets versions add db-password --data-file=-
```

### Cloud Run auto-uses `:latest`
After updating, redeploy or force new revision:
```bash
gcloud run services update my-app --region us-central1
```

---

## Managing Secrets

### List all secrets
```bash
gcloud secrets list
```

### View secret metadata (not the value!)
```bash
gcloud secrets describe db-password
```

### View secret value
```bash
gcloud secrets versions access latest --secret="db-password"
```

### Delete a secret
```bash
gcloud secrets delete db-password
```

---

## Best Practices

### ✅ DO

1. **Use Secret Manager for sensitive data**
   - Passwords, API keys, tokens
   - Database credentials
   - Private keys, certificates

2. **Use environment variables for config**
   - `NODE_ENV`, `LOG_LEVEL`
   - Non-sensitive URLs
   - Feature flags

3. **Use `:latest` version**
   - Automatically gets newest version
   - Easy to rotate secrets

4. **Never commit secrets to git**
   - Add `.env` to `.gitignore`
   - Use example files: `.env.example`

5. **Rotate secrets regularly**
   - Update versions in Secret Manager
   - Redeploy service

### ❌ DON'T

1. **Don't hardcode secrets**
   ```typescript
   // BAD
   const apiKey = "sk-abc123...";
   
   // GOOD
   const apiKey = process.env.API_KEY;
   ```

2. **Don't use git for secrets**
   ```bash
   # BAD
   git add .env
   
   # GOOD - .env is in .gitignore
   ```

3. **Don't log secrets**
   ```typescript
   // BAD
   console.log('API Key:', process.env.API_KEY);
   
   // GOOD
   console.log('API Key configured:', !!process.env.API_KEY);
   ```

---

## Local Development

For local development, use `.env` files (never commit them!):

### Create `.env` file
```bash
# .env
DB_PASSWORD=local-dev-password
API_KEY=test-key-123
```

### Load in your app

**Node.js:**
```bash
npm install dotenv
```

```typescript
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.API_KEY;
```

**Python:**
```bash
pip install python-dotenv
```

```python
from dotenv import load_dotenv
load_dotenv()

api_key = os.getenv('API_KEY')
```

### Add to .gitignore
```bash
echo ".env" >> .gitignore
```

### Create example file (commit this!)
```bash
# .env.example
DB_PASSWORD=your-password-here
API_KEY=your-api-key-here
```

---

## Firestore Note

**Good news:** Firestore doesn't need credentials when running on Cloud Run!

Your db-test app uses Application Default Credentials (ADC):
```typescript
const firestore = new Firestore(); // No keys needed!
```

Cloud Run automatically authenticates using its service account. This works for:
- Firestore
- Cloud Storage
- BigQuery
- Other GCP services

You only need Secret Manager for:
- External services (Stripe, OpenAI, etc.)
- External databases (Supabase, PlanetScale)
- Custom API keys

---

## Cost

**Secret Manager Pricing:**
- First 6 secret versions: **FREE**
- Additional secrets: $0.06/secret/month
- Access operations: $0.03 per 10,000 accesses

For app-a-day challenge: **Likely stays free!** 🎉

---

## Example: Full Setup Script

```bash
#!/bin/bash

# Enable API
gcloud services enable secretmanager.googleapis.com

# Create secrets
echo -n "my-db-password" | gcloud secrets create db-password --data-file=-
echo -n "stripe-sk-test-xyz" | gcloud secrets create stripe-key --data-file=-
echo -n "sk-proj-openai-123" | gcloud secrets create openai-key --data-file=-

# Deploy with all secrets
gcloud run deploy my-app \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="NODE_ENV=production" \
  --set-secrets="
    DB_PASSWORD=db-password:latest,
    STRIPE_KEY=stripe-key:latest,
    OPENAI_KEY=openai-key:latest
  "

echo "✅ Deployed with secrets!"
```

---

## Quick Reference

| Task | Command |
|------|---------|
| Create secret | `echo -n "value" \| gcloud secrets create NAME --data-file=-` |
| List secrets | `gcloud secrets list` |
| View secret | `gcloud secrets versions access latest --secret=NAME` |
| Update secret | `echo -n "new-value" \| gcloud secrets versions add NAME --data-file=-` |
| Delete secret | `gcloud secrets delete NAME` |
| Deploy with secret | `gcloud run deploy APP --set-secrets="ENV_VAR=secret-name:latest"` |

---

## Troubleshooting

### Error: Permission denied
```bash
# Grant your service account access
gcloud secrets add-iam-policy-binding SECRET_NAME \
  --member="serviceAccount:SERVICE_ACCOUNT_EMAIL" \
  --role="roles/secretmanager.secretAccessor"
```

### Error: Secret not found
```bash
# Check secret exists
gcloud secrets list

# Check you're in the right project
gcloud config get-value project
```

### Secret not updating in Cloud Run
```bash
# Force new revision
gcloud run services update SERVICE_NAME --region REGION
```

