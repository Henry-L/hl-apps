import express from 'express';
import cors from 'cors';

import { getLandingHTML } from './templates/landing';
import { playerHTML } from './templates/player';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Direct Cloud Run routes (when accessing the service directly)
app.get('/', (req, res) => res.send(getLandingHTML('')));
app.get('/play/1', (req, res) => res.send(playerHTML(1)));
app.get('/play/2', (req, res) => res.send(playerHTML(2)));

// Firebase proxy routes (when accessing via hl-apps.web.app/apps/escape-room)
app.get('/apps/escape-room', (req, res) => res.send(getLandingHTML('/apps/escape-room')));
app.get('/apps/escape-room/', (req, res) => res.send(getLandingHTML('/apps/escape-room')));
app.get('/apps/escape-room/play/1', (req, res) => res.send(playerHTML(1, '/apps/escape-room')));
app.get('/apps/escape-room/play/2', (req, res) => res.send(playerHTML(2, '/apps/escape-room')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// Start server
app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
