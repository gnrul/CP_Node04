const express = require('express');
const router = express.Router();
const prisma = require('../config/index');
const { validatePost } = require('../middleware/validate');

router.get('/', async (req, res) => {
  let { page = 1, limit = 10, search, published, authorId } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  let where = {};
  if (search) {
    where.title = { contains: search };
  }
  if (published !== undefined) {
    where.published = published === 'true';
  }
  if (authorId) {
    where.authorId = parseInt(authorId);
  }

  try {
    const posts = await prisma.post.findMany({
      where,
      skip,
      take: limit,
      include: { author: true, tags: true }
    });
    const total = await prisma.post.count({ where });

    res.json({
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(id) },
      include: { author: true, tags: true }
    });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
    res.json(post);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', validatePost, async (req, res) => {
  const { title, content, published, authorId, tags } = req.body;

  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId,
        tags: tags ? {
          connectOrCreate: tags.map(tagName => ({
            where: { name: tagName },
            create: { name: tagName }
          }))
        } : undefined
      },
      include: { tags: true }
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { title, content, published } = req.body;
  try {
    const post = await prisma.post.update({
      where: { id: parseInt(id) },
      data: { title, content, published }
    });
    res.json(post);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.post.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Пост удалил' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;