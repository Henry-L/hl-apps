import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { Firestore } from '@google-cloud/firestore';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const app = express();
const port = process.env.PORT || 8080;

// JWT Secret (in production, use environment variable)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

// Initialize Firestore
const firestore = new Firestore({
  projectId: process.env.GCP_PROJECT || undefined,
});

const COMMUTES_COLLECTION = 'commutes';
const USERS_COLLECTION = 'users';

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Types
interface User {
  id?: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

interface CommuteEntry {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  departureTime: string; // HH:MM
  arrivalTime: string; // HH:MM
  durationMinutes: number;
  dayOfWeek: string; // Monday, Tuesday, etc.
  createdAt: string;
}

interface DayStats {
  day: string;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
  optimalDepartureStart: string;
  optimalDepartureEnd: string;
  totalCommutes: number;
}

interface AuthRequest extends Request {
  userId?: string;
  username?: string;
}

// Helper functions
function getDayOfWeek(dateString: string): string {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const date = new Date(dateString + 'T00:00:00');
  return days[date.getDay()];
}

function calculateDuration(departure: string, arrival: string): number {
  const [depHour, depMin] = departure.split(':').map(Number);
  const [arrHour, arrMin] = arrival.split(':').map(Number);
  
  const depMinutes = depHour * 60 + depMin;
  const arrMinutes = arrHour * 60 + arrMin;
  
  return arrMinutes - depMinutes;
}

function timeToMinutes(time: string): number {
  const [hour, min] = time.split(':').map(Number);
  return hour * 60 + min;
}

function minutesToTime(minutes: number): string {
  const hour = Math.floor(minutes / 60);
  const min = minutes % 60;
  return `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`;
}

// Auth middleware
function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
    if (err) {
      res.status(403).json({ error: 'Invalid or expired token' });
      return;
    }

    req.userId = decoded.userId;
    req.username = decoded.username;
    next();
  });
}

// HTML Template with Login
const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Commute Tracker</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
        }
        .login-container {
            max-width: 400px;
            margin: 100px auto;
        }
        .login-card {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        }
        .login-card h1 {
            color: #4f46e5;
            margin-bottom: 10px;
            text-align: center;
        }
        .login-card .subtitle {
            color: #64748b;
            text-align: center;
            margin-bottom: 30px;
        }
        .header {
            background: white;
            border-radius: 20px;
            padding: 30px;
            margin-bottom: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .header-left h1 {
            color: #4f46e5;
            font-size: 2.5em;
            margin-bottom: 5px;
        }
        .header-left .subtitle {
            color: #64748b;
            font-size: 1.1em;
        }
        .user-info {
            text-align: right;
        }
        .username {
            color: #1e293b;
            font-weight: 600;
            margin-bottom: 5px;
        }
        .logout-btn {
            background: #ef4444;
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9em;
        }
        .cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
        }
        .card {
            background: white;
            border-radius: 20px;
            padding: 30px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        }
        .card h2 {
            color: #1e293b;
            margin-bottom: 20px;
            font-size: 1.5em;
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
        input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e2e8f0;
            border-radius: 10px;
            font-size: 1em;
            transition: border-color 0.2s;
        }
        input:focus {
            outline: none;
            border-color: #4f46e5;
        }
        button {
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            border: none;
            padding: 14px 28px;
            border-radius: 10px;
            font-size: 1em;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
            width: 100%;
        }
        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(79, 70, 229, 0.3);
        }
        button:active {
            transform: translateY(0);
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
        }
        .stat-box {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0e7ff 100%);
            padding: 20px;
            border-radius: 15px;
            text-align: center;
        }
        .stat-value {
            font-size: 2em;
            font-weight: bold;
            color: #4f46e5;
        }
        .stat-label {
            color: #64748b;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .chart-container {
            position: relative;
            height: 300px;
            margin-top: 20px;
        }
        .recommendations {
            background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
            padding: 20px;
            border-radius: 15px;
            margin-top: 20px;
        }
        .recommendations h3 {
            color: #065f46;
            margin-bottom: 15px;
        }
        .rec-item {
            background: white;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            border-left: 4px solid #10b981;
        }
        .rec-day {
            font-weight: 600;
            color: #1e293b;
        }
        .rec-time {
            color: #059669;
            font-weight: 600;
            font-size: 1.1em;
        }
        .rec-stats {
            color: #64748b;
            font-size: 0.9em;
            margin-top: 5px;
        }
        .history {
            margin-top: 20px;
        }
        .history-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        .history-date {
            font-weight: 600;
            color: #1e293b;
        }
        .history-times {
            color: #64748b;
        }
        .history-duration {
            color: #4f46e5;
            font-weight: 600;
        }
        .delete-btn {
            background: #ef4444;
            padding: 8px 16px;
            font-size: 0.9em;
            width: auto;
        }
        .message {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            display: none;
        }
        .message.success {
            background: #d1fae5;
            color: #065f46;
            display: block;
        }
        .message.error {
            background: #fee2e2;
            color: #991b1b;
            display: block;
        }
        #app-container {
            display: none;
        }
        #login-container {
            display: block;
        }
    </style>
</head>
<body>
    <!-- Login Screen -->
    <div id="login-container" class="login-container">
        <div class="login-card">
            <h1>🚗 Commute Tracker</h1>
            <p class="subtitle">Please log in to continue</p>
            <div id="login-message" class="message"></div>
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">Username</label>
                    <input type="text" id="login-username" name="username" required autocomplete="username">
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" required autocomplete="current-password">
                </div>
                <button type="submit">Log In</button>
            </form>
        </div>
    </div>

    <!-- Main App (shown after login) -->
    <div id="app-container" class="container">
        <div class="header">
            <div class="header-left">
                <h1>🚗 Commute Tracker</h1>
                <p class="subtitle">Optimize your morning commute with data</p>
            </div>
            <div class="user-info">
                <div class="username">Logged in as: <span id="current-username"></span></div>
                <button class="logout-btn" onclick="logout()">Log Out</button>
            </div>
        </div>

        <div id="message" class="message"></div>

        <div class="cards">
            <div class="card">
                <h2>Log Today's Commute</h2>
                <form id="commute-form">
                    <div class="form-group">
                        <label for="date">Date</label>
                        <input type="date" id="date" name="date" required>
                    </div>
                    <div class="form-group">
                        <label for="departure">Time Left Home</label>
                        <input type="time" id="departure" name="departure" required>
                    </div>
                    <div class="form-group">
                        <label for="arrival">Time Arrived at Work</label>
                        <input type="time" id="arrival" name="arrival" required>
                    </div>
                    <button type="submit">Log Commute</button>
                </form>
            </div>

            <div class="card">
                <h2>📊 Quick Stats</h2>
                <div class="stats-grid" id="quick-stats">
                    <div class="stat-box">
                        <div class="stat-value" id="total-commutes">0</div>
                        <div class="stat-label">Total Logs</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="avg-duration">--</div>
                        <div class="stat-label">Avg Duration</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-value" id="best-time">--</div>
                        <div class="stat-label">Best Time</div>
                    </div>
                </div>
                <div class="chart-container">
                    <canvas id="weekChart"></canvas>
                </div>
            </div>
        </div>

        <div class="cards">
            <div class="card">
                <h2>🎯 Optimal Departure Times</h2>
                <div class="recommendations" id="recommendations">
                    <p style="color: #64748b;">Log more commutes to see recommendations...</p>
                </div>
            </div>

            <div class="card">
                <h2>📅 Recent History</h2>
                <div class="history" id="history">
                    <p style="color: #64748b;">No commutes logged yet</p>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_BASE = window.location.pathname.includes('/apps/commute-tracker') 
            ? '/apps/commute-tracker' 
            : '';

        let weekChart = null;
        let authToken = localStorage.getItem('authToken');
        let currentUsername = localStorage.getItem('username');

        // Check if already logged in
        if (authToken) {
            showApp();
        }

        function showLogin() {
            document.getElementById('login-container').style.display = 'block';
            document.getElementById('app-container').style.display = 'none';
        }

        function showApp() {
            document.getElementById('login-container').style.display = 'none';
            document.getElementById('app-container').style.display = 'block';
            document.getElementById('current-username').textContent = currentUsername || 'User';
            document.getElementById('date').valueAsDate = new Date();
            loadData();
        }

        function logout() {
            localStorage.removeItem('authToken');
            localStorage.removeItem('username');
            authToken = null;
            currentUsername = null;
            showLogin();
        }

        function showLoginMessage(text, type) {
            const msg = document.getElementById('login-message');
            msg.textContent = text;
            msg.className = 'message ' + type;
            setTimeout(() => {
                msg.className = 'message';
            }, 3000);
        }

        function showMessage(text, type) {
            const msg = document.getElementById('message');
            msg.textContent = text;
            msg.className = 'message ' + type;
            setTimeout(() => {
                msg.className = 'message';
            }, 3000);
        }

        async function apiRequest(endpoint, options = {}) {
            if (authToken && !options.skipAuth) {
                options.headers = {
                    ...options.headers,
                    'Authorization': 'Bearer ' + authToken
                };
            }
            
            const response = await fetch(API_BASE + endpoint, options);
            
            if (response.status === 401 || response.status === 403) {
                logout();
                throw new Error('Authentication failed');
            }
            
            return response;
        }

        // Login form
        document.getElementById('login-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const username = document.getElementById('login-username').value;
            const password = document.getElementById('login-password').value;

            try {
                const response = await fetch(API_BASE + '/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                const data = await response.json();

                if (response.ok) {
                    authToken = data.token;
                    currentUsername = data.username;
                    localStorage.setItem('authToken', authToken);
                    localStorage.setItem('username', currentUsername);
                    showApp();
                } else {
                    showLoginMessage(data.error || 'Login failed', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showLoginMessage('Login failed', 'error');
            }
        });

        async function loadData() {
            try {
                const [commuteRes, statsRes] = await Promise.all([
                    apiRequest('/api/commutes'),
                    apiRequest('/api/stats')
                ]);

                const commutes = await commuteRes.json();
                const stats = await statsRes.json();

                updateQuickStats(commutes, stats);
                updateChart(stats.byDay);
                updateRecommendations(stats.byDay);
                updateHistory(commutes.commutes);
            } catch (error) {
                console.error('Error loading data:', error);
            }
        }

        function updateQuickStats(commutes, stats) {
            document.getElementById('total-commutes').textContent = commutes.total || 0;
            
            if (stats.overall.avgDuration) {
                document.getElementById('avg-duration').textContent = 
                    Math.round(stats.overall.avgDuration) + ' min';
            }
            
            if (stats.overall.bestCommuteDuration) {
                document.getElementById('best-time').textContent = 
                    stats.overall.bestCommuteDuration + ' min';
            }
        }

        function updateChart(byDay) {
            const ctx = document.getElementById('weekChart');
            
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const data = weekdays.map(day => {
                const dayData = byDay.find(d => d.day === day);
                return dayData ? dayData.avgDuration : 0;
            });

            if (weekChart) {
                weekChart.destroy();
            }

            weekChart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: weekdays,
                    datasets: [{
                        label: 'Avg Commute (minutes)',
                        data: data,
                        backgroundColor: 'rgba(79, 70, 229, 0.5)',
                        borderColor: 'rgba(79, 70, 229, 1)',
                        borderWidth: 2,
                        borderRadius: 8
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            display: false
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Minutes'
                            }
                        }
                    }
                }
            });
        }

        function updateRecommendations(byDay) {
            const container = document.getElementById('recommendations');
            
            if (!byDay || byDay.length === 0) {
                container.innerHTML = '<p style="color: #64748b;">Log more commutes to see recommendations...</p>';
                return;
            }

            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const html = weekdays.map(day => {
                const dayData = byDay.find(d => d.day === day);
                if (!dayData || dayData.totalCommutes === 0) {
                    return '';
                }

                return \`
                    <div class="rec-item">
                        <div class="rec-day">\${day}</div>
                        <div class="rec-time">\${dayData.optimalDepartureStart} - \${dayData.optimalDepartureEnd}</div>
                        <div class="rec-stats">
                            Avg: \${Math.round(dayData.avgDuration)} min • 
                            Best: \${dayData.minDuration} min • 
                            Based on \${dayData.totalCommutes} commutes
                        </div>
                    </div>
                \`;
            }).join('');

            container.innerHTML = html || '<p style="color: #64748b;">No data for weekdays yet</p>';
        }

        function updateHistory(commutes) {
            const container = document.getElementById('history');
            
            if (!commutes || commutes.length === 0) {
                container.innerHTML = '<p style="color: #64748b;">No commutes logged yet</p>';
                return;
            }

            const html = commutes.slice(0, 10).map(c => \`
                <div class="history-item">
                    <div>
                        <div class="history-date">\${c.date} (\${c.dayOfWeek})</div>
                        <div class="history-times">\${c.departureTime} → \${c.arrivalTime}</div>
                    </div>
                    <div class="history-duration">\${c.durationMinutes} min</div>
                    <button class="delete-btn" onclick="deleteCommute('\${c.id}')">Delete</button>
                </div>
            \`).join('');

            container.innerHTML = html;
        }

        async function deleteCommute(id) {
            if (!confirm('Delete this commute entry?')) return;

            try {
                const response = await apiRequest('/api/commutes/' + id, {
                    method: 'DELETE'
                });

                if (response.ok) {
                    showMessage('Commute deleted successfully', 'success');
                    loadData();
                } else {
                    showMessage('Error deleting commute', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error deleting commute', 'error');
            }
        }

        document.getElementById('commute-form').addEventListener('submit', async (e) => {
            e.preventDefault();

            const date = document.getElementById('date').value;
            const departure = document.getElementById('departure').value;
            const arrival = document.getElementById('arrival').value;

            try {
                const response = await apiRequest('/api/commutes', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ date, departureTime: departure, arrivalTime: arrival })
                });

                if (response.ok) {
                    showMessage('Commute logged successfully! 🎉', 'success');
                    document.getElementById('commute-form').reset();
                    document.getElementById('date').valueAsDate = new Date();
                    loadData();
                } else {
                    showMessage('Error logging commute', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                showMessage('Error logging commute', 'error');
            }
        });

        // Auto-refresh every 30 seconds if logged in
        setInterval(() => {
            if (!document.hidden && authToken) {
                loadData();
            }
        }, 30000);
    </script>
</body>
</html>
`;

// Routes
app.get('/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/commute-tracker', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

app.get('/apps/commute-tracker/', (req: Request, res: Response) => {
  res.send(HTML_TEMPLATE);
});

// Login endpoint
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    // Find user
    const userSnapshot = await firestore.collection(USERS_COLLECTION)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    // Verify password
    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      username: user.username,
      userId: user.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/apps/commute-tracker/api/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      res.status(400).json({ error: 'Username and password required' });
      return;
    }

    const userSnapshot = await firestore.collection(USERS_COLLECTION)
      .where('username', '==', username)
      .limit(1)
      .get();

    if (userSnapshot.empty) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const userDoc = userSnapshot.docs[0];
    const user = { id: userDoc.id, ...userDoc.data() } as User;

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      res.status(401).json({ error: 'Invalid username or password' });
      return;
    }

    const token = jwt.sign(
      { userId: user.id, username: user.username },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      username: user.username,
      userId: user.id
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Health check (no auth required)
app.get('/api/health', async (req: Request, res: Response) => {
  try {
    await firestore.collection(COMMUTES_COLLECTION).limit(1).get();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

app.get('/apps/commute-tracker/api/health', async (req: Request, res: Response) => {
  try {
    await firestore.collection(COMMUTES_COLLECTION).limit(1).get();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: 'Database connection failed' });
  }
});

// Get all commutes for logged-in user
app.get('/api/commutes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await firestore.collection(COMMUTES_COLLECTION)
      .where('userId', '==', req.userId)
      .orderBy('date', 'desc')
      .orderBy('departureTime', 'desc')
      .get();
    
    const commutes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ commutes, total: commutes.length });
  } catch (error) {
    console.error('Error getting commutes:', error);
    res.status(500).json({ error: 'Failed to get commutes' });
  }
});

app.get('/apps/commute-tracker/api/commutes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await firestore.collection(COMMUTES_COLLECTION)
      .where('userId', '==', req.userId)
      .orderBy('date', 'desc')
      .orderBy('departureTime', 'desc')
      .get();
    
    const commutes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    res.json({ commutes, total: commutes.length });
  } catch (error) {
    console.error('Error getting commutes:', error);
    res.status(500).json({ error: 'Failed to get commutes' });
  }
});

// Create commute entry
app.post('/api/commutes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, departureTime, arrivalTime } = req.body;
    
    if (!date || !departureTime || !arrivalTime) {
      res.status(400).json({ error: 'Date, departure time, and arrival time are required' });
      return;
    }
    
    const durationMinutes = calculateDuration(departureTime, arrivalTime);
    const dayOfWeek = getDayOfWeek(date);
    
    if (durationMinutes < 0) {
      res.status(400).json({ error: 'Arrival time must be after departure time' });
      return;
    }
    
    const entry: Omit<CommuteEntry, 'id'> = {
      userId: req.userId!,
      date,
      departureTime,
      arrivalTime,
      durationMinutes,
      dayOfWeek,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await firestore.collection(COMMUTES_COLLECTION).add(entry);
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Commute logged successfully',
      entry: { id: docRef.id, ...entry }
    });
  } catch (error) {
    console.error('Error creating commute:', error);
    res.status(500).json({ error: 'Failed to create commute entry' });
  }
});

app.post('/apps/commute-tracker/api/commutes', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { date, departureTime, arrivalTime } = req.body;
    
    if (!date || !departureTime || !arrivalTime) {
      res.status(400).json({ error: 'Date, departure time, and arrival time are required' });
      return;
    }
    
    const durationMinutes = calculateDuration(departureTime, arrivalTime);
    const dayOfWeek = getDayOfWeek(date);
    
    if (durationMinutes < 0) {
      res.status(400).json({ error: 'Arrival time must be after departure time' });
      return;
    }
    
    const entry: Omit<CommuteEntry, 'id'> = {
      userId: req.userId!,
      date,
      departureTime,
      arrivalTime,
      durationMinutes,
      dayOfWeek,
      createdAt: new Date().toISOString()
    };
    
    const docRef = await firestore.collection(COMMUTES_COLLECTION).add(entry);
    
    res.status(201).json({ 
      id: docRef.id, 
      message: 'Commute logged successfully',
      entry: { id: docRef.id, ...entry }
    });
  } catch (error) {
    console.error('Error creating commute:', error);
    res.status(500).json({ error: 'Failed to create commute entry' });
  }
});

// Delete commute (only own commutes)
app.delete('/api/commutes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await firestore.collection(COMMUTES_COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Commute not found' });
      return;
    }
    
    const commute = doc.data() as CommuteEntry;
    if (commute.userId !== req.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    
    await firestore.collection(COMMUTES_COLLECTION).doc(req.params.id).delete();
    res.json({ message: 'Commute deleted successfully' });
  } catch (error) {
    console.error('Error deleting commute:', error);
    res.status(500).json({ error: 'Failed to delete commute' });
  }
});

app.delete('/apps/commute-tracker/api/commutes/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const doc = await firestore.collection(COMMUTES_COLLECTION).doc(req.params.id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Commute not found' });
      return;
    }
    
    const commute = doc.data() as CommuteEntry;
    if (commute.userId !== req.userId) {
      res.status(403).json({ error: 'Unauthorized' });
      return;
    }
    
    await firestore.collection(COMMUTES_COLLECTION).doc(req.params.id).delete();
    res.json({ message: 'Commute deleted successfully' });
  } catch (error) {
    console.error('Error deleting commute:', error);
    res.status(500).json({ error: 'Failed to delete commute' });
  }
});

// Get statistics for logged-in user
app.get('/api/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await firestore.collection(COMMUTES_COLLECTION)
      .where('userId', '==', req.userId)
      .get();
    
    const commutes: CommuteEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommuteEntry));
    
    if (commutes.length === 0) {
      res.json({
        overall: {},
        byDay: []
      });
      return;
    }
    
    // Overall stats
    const totalDuration = commutes.reduce((sum, c) => sum + c.durationMinutes, 0);
    const avgDuration = totalDuration / commutes.length;
    const bestCommute = commutes.reduce((min, c) => 
      c.durationMinutes < min ? c.durationMinutes : min, Infinity);
    
    // Stats by day of week
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const byDay: DayStats[] = weekdays.map(day => {
      const dayCommutes = commutes.filter(c => c.dayOfWeek === day);
      
      if (dayCommutes.length === 0) {
        return {
          day,
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0,
          optimalDepartureStart: '--:--',
          optimalDepartureEnd: '--:--',
          totalCommutes: 0
        };
      }
      
      const dayDurations = dayCommutes.map(c => c.durationMinutes);
      const avgDuration = dayDurations.reduce((a, b) => a + b, 0) / dayDurations.length;
      const minDuration = Math.min(...dayDurations);
      const maxDuration = Math.max(...dayDurations);
      
      // Find optimal departure time range
      const threshold = minDuration + (avgDuration - minDuration) * 0.3;
      const goodCommutes = dayCommutes.filter(c => c.durationMinutes <= threshold);
      
      if (goodCommutes.length > 0) {
        const departureTimes = goodCommutes.map(c => timeToMinutes(c.departureTime)).sort((a, b) => a - b);
        const optimalStart = minutesToTime(Math.min(...departureTimes));
        const optimalEnd = minutesToTime(Math.max(...departureTimes));
        
        return {
          day,
          avgDuration: Math.round(avgDuration),
          minDuration,
          maxDuration,
          optimalDepartureStart: optimalStart,
          optimalDepartureEnd: optimalEnd,
          totalCommutes: dayCommutes.length
        };
      }
      
      return {
        day,
        avgDuration: Math.round(avgDuration),
        minDuration,
        maxDuration,
        optimalDepartureStart: '--:--',
        optimalDepartureEnd: '--:--',
        totalCommutes: dayCommutes.length
      };
    });
    
    res.json({
      overall: {
        avgDuration: Math.round(avgDuration),
        bestCommuteDuration: bestCommute,
        totalCommutes: commutes.length
      },
      byDay: byDay.filter(d => d.totalCommutes > 0)
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

app.get('/apps/commute-tracker/api/stats', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const snapshot = await firestore.collection(COMMUTES_COLLECTION)
      .where('userId', '==', req.userId)
      .get();
    
    const commutes: CommuteEntry[] = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CommuteEntry));
    
    if (commutes.length === 0) {
      res.json({
        overall: {},
        byDay: []
      });
      return;
    }
    
    const totalDuration = commutes.reduce((sum, c) => sum + c.durationMinutes, 0);
    const avgDuration = totalDuration / commutes.length;
    const bestCommute = commutes.reduce((min, c) => 
      c.durationMinutes < min ? c.durationMinutes : min, Infinity);
    
    const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const byDay: DayStats[] = weekdays.map(day => {
      const dayCommutes = commutes.filter(c => c.dayOfWeek === day);
      
      if (dayCommutes.length === 0) {
        return {
          day,
          avgDuration: 0,
          minDuration: 0,
          maxDuration: 0,
          optimalDepartureStart: '--:--',
          optimalDepartureEnd: '--:--',
          totalCommutes: 0
        };
      }
      
      const dayDurations = dayCommutes.map(c => c.durationMinutes);
      const avgDuration = dayDurations.reduce((a, b) => a + b, 0) / dayDurations.length;
      const minDuration = Math.min(...dayDurations);
      const maxDuration = Math.max(...dayDurations);
      
      const threshold = minDuration + (avgDuration - minDuration) * 0.3;
      const goodCommutes = dayCommutes.filter(c => c.durationMinutes <= threshold);
      
      if (goodCommutes.length > 0) {
        const departureTimes = goodCommutes.map(c => timeToMinutes(c.departureTime)).sort((a, b) => a - b);
        const optimalStart = minutesToTime(Math.min(...departureTimes));
        const optimalEnd = minutesToTime(Math.max(...departureTimes));
        
        return {
          day,
          avgDuration: Math.round(avgDuration),
          minDuration,
          maxDuration,
          optimalDepartureStart: optimalStart,
          optimalDepartureEnd: optimalEnd,
          totalCommutes: dayCommutes.length
        };
      }
      
      return {
        day,
        avgDuration: Math.round(avgDuration),
        minDuration,
        maxDuration,
        optimalDepartureStart: '--:--',
        optimalDepartureEnd: '--:--',
        totalCommutes: dayCommutes.length
      };
    });
    
    res.json({
      overall: {
        avgDuration: Math.round(avgDuration),
        bestCommuteDuration: bestCommute,
        totalCommutes: commutes.length
      },
      byDay: byDay.filter(d => d.totalCommutes > 0)
    });
  } catch (error) {
    console.error('Error calculating stats:', error);
    res.status(500).json({ error: 'Failed to calculate statistics' });
  }
});

// Start server
app.listen(port, () => {
  console.log(`Commute Tracker running on port ${port}`);
  console.log(`Firestore initialized`);
});
