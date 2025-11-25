# Unified Secrets Management

Instead of creating separate secrets for each API key, use a single JSON secret that all apps can reference.

## Setup

### 1. Create your secrets JSON file

Create a file called `secrets.json` (NOT committed to git):

```json
{
  "stability_api_key": "sk-your-actual-stability-key",
  "jwt_secret": "your-super-secret-jwt-key-min-32-chars",
  "openai_api_key": "sk-your-openai-key-if-needed",
  "other_service_key": "add-more-as-needed"
}
```

### 2. Create the secret in GCP Secret Manager

```bash
# Enable Secret Manager API (if not already enabled)
gcloud services enable secretmanager.googleapis.com

# Create the unified secret from your JSON file
gcloud secrets create app-secrets \
  --data-file=secrets.json

# Or create it from stdin:
cat secrets.json | gcloud secrets create app-secrets --data-file=-
```

### 3. Update an existing secret

```bash
# Add a new version to the secret
gcloud secrets versions add app-secrets \
  --data-file=secrets.json
```

### 4. View the secret (for debugging)

```bash
# List all secrets
gcloud secrets list

# Get the latest version
gcloud secrets versions access latest --secret=app-secrets

# Get a specific version
gcloud secrets versions access 1 --secret=app-secrets
```

## Using in Cloud Run

### Deploy with the unified secret

```bash
# Deploy any app with access to the unified secret
gcloud run deploy YOUR-APP-NAME \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-secrets="APP_SECRETS=app-secrets:latest"
```

The secret will be available as the `APP_SECRETS` environment variable containing the full JSON string.

### Reading the secret in your app

**TypeScript/Node.js:**
```typescript
// Read and parse the JSON secret
const secretsJson = process.env.APP_SECRETS || '{}';
const secrets = JSON.parse(secretsJson);

// Access individual keys
const stabilityApiKey = secrets.stability_api_key;
const jwtSecret = secrets.jwt_secret;
```

**Python/Flask:**
```python
import os
import json

# Read and parse the JSON secret
secrets_json = os.environ.get('APP_SECRETS', '{}')
secrets = json.loads(secrets_json)

# Access individual keys
stability_api_key = secrets.get('stability_api_key')
jwt_secret = secrets.get('jwt_secret')
```

## Local Development

For local development, create a `.env` file (NOT committed):

```bash
APP_SECRETS='{"stability_api_key":"sk-your-key","jwt_secret":"your-jwt-secret"}'
```

Or use separate env vars and construct the JSON:

```bash
STABILITY_API_KEY=sk-your-key
JWT_SECRET=your-jwt-secret
```

Then in your code:
```typescript
// Local development fallback
const secrets = process.env.APP_SECRETS 
  ? JSON.parse(process.env.APP_SECRETS)
  : {
      stability_api_key: process.env.STABILITY_API_KEY,
      jwt_secret: process.env.JWT_SECRET
    };
```

## Security Best Practices

1. **Never commit** `secrets.json` to git (it's in `.gitignore`)
2. **Use least privilege**: Only grant access to secrets for apps that need them
3. **Rotate secrets regularly**: Create new versions in Secret Manager
4. **Use separate secrets for prod/dev** if needed:
   - `app-secrets-prod`
   - `app-secrets-dev`

## Adding a New Secret

1. Edit your local `secrets.json` file
2. Add the new key-value pair
3. Update the secret in GCP:
   ```bash
   gcloud secrets versions add app-secrets --data-file=secrets.json
   ```
4. Redeploy your apps (or they'll auto-pick up the new version on restart)

## Granting Access to Service Accounts

If your apps need to access the secret:

```bash
# Get your Cloud Run service account
# Usually: PROJECT_NUMBER-compute@developer.gserviceaccount.com

# Grant access
gcloud secrets add-iam-policy-binding app-secrets \
  --member="serviceAccount:YOUR-SERVICE-ACCOUNT@YOUR-PROJECT.iam.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

## Example: Migrating from Individual Secrets

If you already have individual secrets:

```bash
# Get existing secret values
STABILITY_KEY=$(gcloud secrets versions access latest --secret=stability-api-key)
JWT_SECRET=$(gcloud secrets versions access latest --secret=jwt-secret)

# Create JSON file
cat > secrets.json <<EOF
{
  "stability_api_key": "$STABILITY_KEY",
  "jwt_secret": "$JWT_SECRET"
}
EOF

# Create unified secret
gcloud secrets create app-secrets --data-file=secrets.json

# Clean up
rm secrets.json

# Optional: Delete old individual secrets (be careful!)
# gcloud secrets delete stability-api-key
# gcloud secrets delete jwt-secret
```

## Troubleshooting

### "Permission denied" error
```bash
# Make sure your Cloud Run service account has access
gcloud secrets add-iam-policy-binding app-secrets \
  --member="serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com" \
  --role="roles/secretmanager.secretAccessor"
```

### "Secret not found"
```bash
# List all secrets to verify it exists
gcloud secrets list
```

### JSON parsing errors
```bash
# Verify your JSON is valid
gcloud secrets versions access latest --secret=app-secrets | jq .
```

### Local development issues
```bash
# Use gcloud auth for local development
gcloud auth application-default login

# Or set APP_SECRETS env var directly:
export APP_SECRETS='{"stability_api_key":"sk-test","jwt_secret":"local-secret"}'
```

