require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { setupWebSocket } = require('./websocket');

const app = express();
app.set('trust proxy', 1);
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
app.use(require('helmet')());

// Rate limiting
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: { error: 'Muitas requisições. Tente novamente em 15 minutos.' } });
const chatLimiter = rateLimit({ windowMs: 1 * 60 * 1000, max: 30, message: { error: 'Limite de mensagens atingido.' } });
app.use('/api/', limiter);
app.use('/api/chat', chatLimiter);

// JWT secret warning
if (process.env.JWT_SECRET === 'sigocomfe-secret-key-2026-mudar-em-producao') {
  console.warn('⚠️  AVISO: Usando JWT_SECRET padrão! Defina um segredo forte em produção.');
}

// Migrations run separately via: node src/db/migrate.js

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/prayers', require('./routes/prayer'));
app.use('/api/churches', require('./routes/churches'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/feed', require('./routes/feed'));
app.use('/api/help-requests', require('./routes/help'));
app.use('/api/chat', require('./routes/chat'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', name: 'Sigo com Fé API', version: '1.0.0' });
});

// WebSocket
const wss = setupWebSocket(server);

// Give help route access to WSS for broadcasting
const helpRoute = require('./routes/help');
helpRoute.setWss(wss);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🙏 Sigo com Fé API rodando na porta ${PORT}`);
  console.log(`📡 WebSocket disponível em ws://localhost:${PORT}/ws`);
});
