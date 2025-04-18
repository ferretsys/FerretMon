import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { WebSocketServer } from 'ws';
import { handleSocket } from './socket.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 82;

const wss = new WebSocketServer({ server: app.listen(PORT, () => {
    console.log(`Monitor server is running on port ${PORT}`);
}) });

wss.on('connection', handleSocket);

app.use(express.static(path.join(__dirname, '../public')));
