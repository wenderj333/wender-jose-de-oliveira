require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN || 'http://localhost:5173' }));
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prayers', require('./routes/prayer'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feed', require('./routes/feed'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Sigo com Fé API', version: '1.0.0' });
});

// WebSocket
setupWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🙏 Sigo com Fé API rodando na porta ${PORT}`);
  console.log(`📡 WebSocket disponível em ws://localhost:${PORT}/ws`);
});
