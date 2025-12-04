import express from 'express';
import cors from 'cors';

import { landingHTML } from './templates/landing';
import { playerHTML } from './templates/player';

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

// Routes
app.get('/', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room', (req, res) => res.send(landingHTML));
app.get('/apps/escape-room/', (req, res) => res.send(landingHTML));

app.get('/play/1', (req, res) => res.send(playerHTML(1)));
app.get('/play/2', (req, res) => res.send(playerHTML(2)));

app.get('/health', (req, res) => res.json({ status: 'healthy' }));

// Start server
app.listen(port, () => {
  console.log(`🔐 Escape Room running on port ${port}`);
});
