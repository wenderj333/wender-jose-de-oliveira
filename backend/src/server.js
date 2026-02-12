require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    const allowed = (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map(s => s.trim());
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    // Allow any .vercel.app domain
    if (/\.vercel\.app$/.test(origin)) return callback(null, true);
    if (allowed.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
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
