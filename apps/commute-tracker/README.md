# Commute Tracker

Data-driven commute optimization tool. Track daily departure and arrival times to discover the optimal time to leave for work each weekday.

## Features

- 🔒 **Secure Authentication** - Username/password login with JWT tokens
- 📝 **Easy Logging** - Quick form to log departure & arrival times
- 📊 **Analytics Dashboard** - View commute statistics by day of week
- 🎯 **Optimal Time Recommendations** - Discover the best time windows to leave
- 📈 **Visual Charts** - Beautiful Chart.js visualizations
- 📅 **History** - View and manage past commute entries
- 👤 **Multi-User Support** - Each user has their own private data
- 🔄 **Real-time Updates** - Auto-refresh every 30 seconds

## How It Works

1. **Log Your Commutes** - Enter the time you left home and arrived at work
2. **Build Data** - Log commutes for at least a few weeks for better insights
3. **Get Recommendations** - App analyzes patterns and suggests optimal departure windows
4. **Optimize** - Use insights to consistently have shorter commutes

## Analytics Features

### By Day of Week
- Average commute duration
- Best/worst commute times
- Optimal departure time ranges (within top 30% of shortest commutes)
- Number of data points

### Overall Stats
- Total commutes logged
- Average duration across all days
- Best commute time ever

### Visualization
- Bar chart showing average commute by weekday
- Easily spot which days have the worst traffic

## Setup

### 1. Enable Firestore
```bash
gcloud services enable firestore.googleapis.com
gcloud firestore databases create --location=us-central1
```

### 2. Create User Accounts

After deploying (or during local development), create user accounts manually:

```bash
cd apps/commute-tracker
npm install  # if not already done

# Create account for your wife
node create-user.js "wife" "password123"

# Create default/guest account
node create-user.js "guest" "guest123"
```

This stores hashed passwords securely in Firestore.

### 3. Deploy to Cloud Run
```bash
cd apps/commute-tracker

gcloud run deploy commute-tracker \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Important:** After deploying, create user accounts using the script above.

### Add to Firebase Hosting (Optional)
Add to your `firebase.json`:
```json
{
  "source": "/apps/commute-tracker",
  "run": { "serviceId": "commute-tracker", "region": "us-central1" }
},
{
  "source": "/apps/commute-tracker/**",
  "run": { "serviceId": "commute-tracker", "region": "us-central1" }
}
```

## Local Development

```bash
# Install dependencies
npm install

# Run in dev mode
npm run dev
```

Visit http://localhost:8080

## Data Model

### User
```typescript
{
  id: string;
  username: string;
  passwordHash: string;  // bcrypt hashed
  createdAt: string;
}
```

### Commute Entry
```typescript
{
  id: string;
  userId: string;        // Links to User.id
  date: string;          // YYYY-MM-DD
  departureTime: string; // HH:MM
  arrivalTime: string;   // HH:MM
  durationMinutes: number;
  dayOfWeek: string;     // Monday, Tuesday, etc.
  createdAt: string;     // ISO timestamp
}
```

## API Endpoints

### Public
- `GET /` - HTML interface (login page)
- `POST /api/login` - Login (returns JWT token)
- `GET /api/health` - Health check

### Authenticated (requires JWT token in Authorization header)
- `GET /api/commutes` - List user's commutes
- `POST /api/commutes` - Log new commute
- `DELETE /api/commutes/:id` - Delete commute (own only)
- `GET /api/stats` - Get user's analytics and recommendations

## Tips for Best Results

1. **Be Consistent** - Log every commute for accurate patterns
2. **Include Variety** - Log commutes at different departure times
3. **Give It Time** - Need at least 5-10 commutes per weekday for good recommendations
4. **Weekend Traffic** - Currently optimized for weekdays (Mon-Fri)
5. **Special Events** - Delete outliers (accidents, special events) for cleaner data

## Technology Stack

- **Backend**: TypeScript + Express
- **Database**: Cloud Firestore
- **Authentication**: JWT tokens + bcrypt
- **Visualization**: Chart.js
- **Deployment**: Cloud Run
- **Hosting**: Firebase (optional)

## Cost

Everything runs within GCP free tier:
- Firestore: 1 GB storage, 50K reads/day, 20K writes/day
- Cloud Run: 2M requests/month

Perfect for personal use! 🎉

## Future Enhancements

Ideas for v2:
- Weather integration (correlate traffic with weather)
- Multi-user support with authentication
- Compare routes (different paths to work)
- Export data to CSV
- Push notifications for optimal departure time
- Machine learning predictions
- Integration with Google Maps traffic data

