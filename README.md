# ✝️ Sigo com Fé

**Rede Social Cristã com Ferramentas Pastorais**

*"Tecnologia a serviço do Reino"*

## 📋 Sobre o Projeto

O Sigo com Fé é uma plataforma social cristã que conecta igrejas, fortalece a fé e oferece ferramentas completas de gestão pastoral. Funcionalidades principais:

- 🙏 **Sistema de Oração** — Pedidos, intercessão coletiva, mural de vitórias
- 🔴 **Pastor Orando ao Vivo** — WebSocket em tempo real com bolhas de oração
- 🗺️ **Mapa de Igrejas** — Encontre igrejas em qualquer cidade
- 📊 **Dashboard Pastoral** — Estatísticas, membros, finanças
- 💛 **Dízimos e Ofertas** — Sistema integrado de contribuições
- ✝️ **Novos Convertidos** — Acompanhamento e discipulado

## 🚀 Instalação

### Pré-requisitos

- Node.js 18+
- PostgreSQL 14+
- npm ou yarn

### 1. Banco de Dados

```bash
# Criar o banco de dados
createdb sigocomfe

# Executar migrações
cd backend
cp .env.example .env
# Edite .env com suas credenciais do PostgreSQL
npm install
npm run migrate
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
# API rodando em http://localhost:3001
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
# App rodando em http://localhost:5173
```

## 🏗️ Estrutura do Projeto

```
sigo-com-fe/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + WebSocket
│   │   ├── websocket.js       # "Pastor Orando ao Vivo"
│   │   ├── db/
│   │   │   ├── connection.js  # Pool PostgreSQL
│   │   │   ├── schema.sql     # Migração completa
│   │   │   └── migrate.js     # Script de migração
│   │   ├── routes/
│   │   │   ├── auth.js        # Registro, login, JWT
│   │   │   ├── prayer.js      # Pedidos de oração
│   │   │   ├── churches.js    # Busca de igrejas
│   │   │   └── dashboard.js   # Painel pastoral
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Prayer.js
│   │   │   ├── Church.js
│   │   │   └── PastorSession.js
│   │   └── middleware/
│   │       └── auth.js        # JWT + roles
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx            # Rotas
│   │   ├── main.jsx           # Entry point
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── PrayerFeed.jsx
│   │   │   ├── LivePrayer.jsx
│   │   │   ├── ChurchMap.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── components/
│   │   │   ├── PrayerCard.jsx
│   │   │   ├── AmemButton.jsx
│   │   │   ├── PrayerBubbles.jsx
│   │   │   ├── PastorPrayingOverlay.jsx
│   │   │   └── ChurchPin.jsx
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── WebSocketContext.jsx
│   │   └── styles/
│   │       └── main.css       # Tema verde/dourado
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
└── README.md
```

## 🎨 Tema

Cores principais: **Verde** (#2d8a4e) e **Dourado** (#daa520)

## 📡 WebSocket — Pastor Orando ao Vivo

Quando um pastor ativa o modo "Orando ao Vivo":
1. Todos os membros conectados recebem notificação em tempo real
2. Overlay verde/dourado com efeito de brilho pulsante
3. Bolhas com nomes de igrejas sobem como orações ao céu
4. Contador: "X igrejas orando neste momento"

## 📄 Licença

Projeto privado — Sigo com Fé © 2024
