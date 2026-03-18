const fs = require('fs');
const path = 'C:\\Users\\wende\\.openclaw\\openclaw.json';
const config = JSON.parse(fs.readFileSync(path, 'utf8'));

config.agents.defaults.model.primary = 'anthropic/claude-sonnet-4-6';
config.agents.defaults.model.fallbacks = ['google/gemini-2.5-flash'];
config.agents.defaults.models['anthropic/claude-sonnet-4-6'] = {};

fs.writeFileSync(path, JSON.stringify(config, null, 2), 'utf8');
console.log('OK! Modelo mudado para Claude Sonnet 4.6');