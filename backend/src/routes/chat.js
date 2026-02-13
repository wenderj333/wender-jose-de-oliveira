const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/chat/churches-online — churches with active pastors or all registered
router.get('/churches-online', (req, res) => {
  try {
    const churches = db.prepare(
      `SELECT id, name, city, country, denomination, languages FROM churches ORDER BY name ASC`
    ).all();
    res.json(churches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list churches' });
  }
});

// POST /api/chat/request — person creates a help chat request
router.post('/request', (req, res) => {
  try {
    const { language = 'pt', name, helpType, churchId, churchName } = req.body;
    const stmt = db.prepare(
      `INSERT INTO chat_rooms (requester_name, requester_language, help_type, target_church_id, target_church_name) VALUES (?, ?, ?, ?, ?)`
    );
    const result = stmt.run(name || 'Anônimo', language, helpType || 'general', churchId || null, churchName || null);
    // Get the created room
    const room = db.prepare('SELECT * FROM chat_rooms WHERE rowid = ?').get(result.lastInsertRowid);
    res.json({ success: true, roomId: room.id, room });
  } catch (err) {
    console.error('Error creating chat room:', err);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// GET /api/chat/rooms — list active rooms waiting for a pastor
router.get('/rooms', (req, res) => {
  try {
    const rooms = db.prepare(
      `SELECT * FROM chat_rooms WHERE status = 'waiting' ORDER BY created_at DESC`
    ).all();
    res.json(rooms);
  } catch (err) {
    console.error('Error listing chat rooms:', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

// GET /api/chat/rooms/:roomId/messages — get message history
router.get('/rooms/:roomId/messages', (req, res) => {
  try {
    const messages = db.prepare(
      `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC`
    ).all(req.params.roomId);
    res.json(messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/chat/rooms/:roomId/join — pastor joins a room
router.post('/rooms/:roomId/join', (req, res) => {
  try {
    const { pastorName, language } = req.body;
    db.prepare(
      `UPDATE chat_rooms SET pastor_name = ?, pastor_language = ?, status = 'active' WHERE id = ?`
    ).run(pastorName || 'Pastor', language || 'pt', req.params.roomId);
    const room = db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(req.params.roomId);
    res.json({ success: true, room });
  } catch (err) {
    console.error('Error joining chat room:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// POST /api/chat/rooms/:roomId/close — close/end chat
router.post('/rooms/:roomId/close', (req, res) => {
  try {
    db.prepare(
      `UPDATE chat_rooms SET status = 'closed', closed_at = datetime('now') WHERE id = ?`
    ).run(req.params.roomId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error closing chat room:', err);
    res.status(500).json({ error: 'Failed to close room' });
  }
});

module.exports = router;
