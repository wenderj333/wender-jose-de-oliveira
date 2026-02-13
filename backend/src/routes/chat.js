const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// POST /api/chat/request — person creates a help chat request
router.post('/request', (req, res) => {
  try {
    const { language = 'pt', name, helpType } = req.body;
    const stmt = db.prepare(
      `INSERT INTO chat_rooms (requester_name, requester_language, help_type) VALUES (?, ?, ?)`
    );
    const result = stmt.run(name || 'Anônimo', language, helpType || 'general');
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
