const express = require('express');
const router = express.Router();

router.get('/chapter', async (req, res) => {
  try {
    const { book, chapter, translation } = req.query;
    const url = `https://bible-api.com/${encodeURIComponent(book)}+${chapter}?translation=${translation || 'kjv'}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { q, translation } = req.query;
    const url = `https://bible-api.com/${encodeURIComponent(q)}?translation=${translation || 'kjv'}`;
    const response = await fetch(url);
    const data = await response.json();
    res.json(data);
  } catch(e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
