# User Setup Guide

## Creating User Accounts

This app requires manual user creation by you. Follow these steps:

### 1. Make sure Firestore is set up
```bash
gcloud services enable firestore.googleapis.com
gcloud firestore databases create --location=us-central1
```

### 2. Deploy the app (if not already done)
```bash
cd apps/commute-tracker
gcloud run deploy commute-tracker \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### 3. Install dependencies locally
```bash
npm install
```

### 4. Create user accounts

**For your wife:**
```bash
node create-user.js "wife" "choose-a-secure-password"
```

**For guest/default viewing:**
```bash
node create-user.js "guest" "guest123"
```

**Additional users (if needed):**
```bash
node create-user.js "username" "password"
```

### 5. Share credentials

Give your wife her username and password. Each user will see only their own commute data.

## Security Notes

- Passwords are hashed with bcrypt before storing
- JWT tokens expire after 30 days
- Users can only view/edit their own data
- The JWT secret should be changed in production (set JWT_SECRET environment variable)

## Changing JWT Secret (Optional but Recommended)

```bash
# Generate a random secret
openssl rand -base64 32

# Deploy with the secret
gcloud run deploy commute-tracker \
  --source . \
  --set-env-vars="JWT_SECRET=your-generated-secret-here" \
  --region us-central1 \
  --allow-unauthenticated
```

## Troubleshooting

**"User already exists"**
- The username is taken. Try a different one or delete the existing user from Firestore console.

**Can't create users**
- Make sure you've deployed the app and Firestore is set up
- Make sure you're in the correct project: `gcloud config get-value project`
- Check that dependencies are installed: `npm install`

**Login not working**
- Verify the user was created successfully
- Check username/password spelling
- Clear browser localStorage and try again

