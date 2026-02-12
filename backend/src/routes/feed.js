const express = require('express');
const router = express.Router();

// GET /api/feed - Listar publicações do mural
router.get('/', async (req, res) => {
  try {
    // TODO: Implementar busca no banco de dados
    res.json({ posts: [], message: 'Feed endpoint pronto para uso' });
  } catch (err) {
    console.error('Erro ao buscar feed:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

// POST /api/feed - Criar nova publicação
router.post('/', async (req, res) => {
  try {
    const { content, category, churchId } = req.body;
    if (!content || !category) {
      return res.status(400).json({ error: 'Conteúdo e categoria são obrigatórios' });
    }
    // TODO: Salvar no banco de dados
    res.status(201).json({ message: 'Publicação criada com sucesso', post: { content, category } });
  } catch (err) {
    console.error('Erro ao criar publicação:', err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

module.exports = router;
