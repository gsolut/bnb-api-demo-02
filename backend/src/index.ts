import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import marketRoutes from './routes/marketRoutes.js';
import { ClientSocketServer } from './ws/socketServer.js';
import { PORT } from './config/constants.js';

dotenv.config();

const app = express();
const server = http.createServer(app);

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[HTTP] ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// REST Routes
app.use('/api/market', marketRoutes);

// Root check
app.get('/', (_req, res) => {
  res.json({
    name: 'Binance API Proxy & Gateway',
    version: '1.0.0',
    status: 'online',
    endpoints: {
      symbols: '/api/market/symbols',
      klines: '/api/market/klines?symbol=ETHUSDT&interval=1m&limit=500',
      stats: '/api/market/stats?symbol=ETHUSDT',
      health: '/api/market/health',
      ws: 'ws://localhost:4000/ws',
    },
  });
});

// Initialize WebSocket Gateway
new ClientSocketServer(server);

// Start server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Binance Proxy Backend Server Running`);
  console.log(`📡 HTTP REST: http://localhost:${PORT}`);
  console.log(`⚡ WebSocket: ws://localhost:${PORT}/ws`);
  console.log(`=========================================`);
});
