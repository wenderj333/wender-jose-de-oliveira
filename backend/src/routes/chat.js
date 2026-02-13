const express = require('express');
const router = express.Router();
const db = require('../db/connection');

// GET /api/chat/churches-online
router.get('/churches-online', async (req, res) => {
  try {
    const churches = await db.prepare(
      `SELECT id, name, city, country, denomination, languages FROM churches ORDER BY name ASC`
    ).all();
    res.json(churches);
  } catch (err) {
    res.status(500).json({ error: 'Failed to list churches' });
  }
});

// POST /api/chat/request
router.post('/request', async (req, res) => {
  try {
    const { language = 'pt', name, helpType, churchId, churchName } = req.body;
    const result = await db.prepare(
      `INSERT INTO chat_rooms (requester_name, requester_language, help_type, target_church_id, target_church_name) VALUES (?, ?, ?, ?, ?) RETURNING *`
    ).get(name || 'Anônimo', language, helpType || 'general', churchId || null, churchName || null);
    res.json({ success: true, roomId: result.id, room: result });
  } catch (err) {
    console.error('Error creating chat room:', err);
    res.status(500).json({ error: 'Failed to create chat room' });
  }
});

// GET /api/chat/rooms
router.get('/rooms', async (req, res) => {
  try {
    const rooms = await db.prepare(
      `SELECT * FROM chat_rooms WHERE status = 'waiting' ORDER BY created_at DESC`
    ).all();
    res.json(rooms);
  } catch (err) {
    console.error('Error listing chat rooms:', err);
    res.status(500).json({ error: 'Failed to list rooms' });
  }
});

// GET /api/chat/rooms/:roomId/messages
router.get('/rooms/:roomId/messages', async (req, res) => {
  try {
    const messages = await db.prepare(
      `SELECT * FROM chat_messages WHERE room_id = ? ORDER BY created_at ASC`
    ).all(req.params.roomId);
    res.json(messages);
  } catch (err) {
    console.error('Error getting messages:', err);
    res.status(500).json({ error: 'Failed to get messages' });
  }
});

// POST /api/chat/rooms/:roomId/join
router.post('/rooms/:roomId/join', async (req, res) => {
  try {
    const { pastorName, language } = req.body;
    await db.prepare(
      `UPDATE chat_rooms SET pastor_name = ?, pastor_language = ?, status = 'active' WHERE id = ?`
    ).run(pastorName || 'Pastor', language || 'pt', req.params.roomId);
    const room = await db.prepare('SELECT * FROM chat_rooms WHERE id = ?').get(req.params.roomId);
    res.json({ success: true, room });
  } catch (err) {
    console.error('Error joining chat room:', err);
    res.status(500).json({ error: 'Failed to join room' });
  }
});

// POST /api/chat/rooms/:roomId/close
router.post('/rooms/:roomId/close', async (req, res) => {
  try {
    await db.prepare(
      `UPDATE chat_rooms SET status = 'closed', closed_at = NOW() WHERE id = ?`
    ).run(req.params.roomId);
    res.json({ success: true });
  } catch (err) {
    console.error('Error closing chat room:', err);
    res.status(500).json({ error: 'Failed to close room' });
  }
});

module.exports = router;
