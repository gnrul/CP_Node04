const express = require('express');
const router = express.Router();
const prisma = require('../config/index');
const { validatePost } = require('../middleware/validate');
const { authRequired } = require('../middleware/auth');

router.get('/', async (req, res, next) => {
  try {
    let { page = 1, limit = 10, search, published, authorId } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const where = {};
    if (search) where.title = { contains: search };
    if (published !== undefined) where.published = published === 'true';
    if (authorId) where.authorId = parseInt(authorId);

    const posts = await prisma.post.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      include: { author: true, tags: true },
    });
    const total = await prisma.post.count({ where });

    res.json({
      data: posts,
      meta: { total, page, limit, pages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { author: true, tags: true },
    });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });
    res.json(post);
  } catch (err) {
    next(err);
  }
});

router.post('/', authRequired, validatePost, async (req, res, next) => {
  try {
    const { title, content, published, tags } = req.body;
    const post = await prisma.post.create({
      data: {
        title,
        content,
        published,
        authorId: req.user.id,
        tags: tags
          ? {
              connectOrCreate: tags.map((name) => ({
                where: { name },
                create: { name },
              })),
            }
          : undefined,
      },
      include: { tags: true },
    });
    res.status(201).json(post);
  } catch (err) {
    next(err);
  }
});

router.patch('/:id', authRequired, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });

    const isOwner = post.authorId === req.user.id;
    const isStaff = req.user.role === 'MODERATOR' || req.user.role === 'ADMIN';
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: 'Нельзя менять чужой пост' });
    }

    const { title, content, published } = req.body;
    const updated = await prisma.post.update({
      where: { id },
      data: { title, content, published },
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authRequired, async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const post = await prisma.post.findUnique({ where: { id } });
    if (!post) return res.status(404).json({ error: 'Пост не найден' });

    const isOwner = post.authorId === req.user.id;
    const isStaff = req.user.role === 'MODERATOR' || req.user.role === 'ADMIN';
    if (!isOwner && !isStaff) {
      return res.status(403).json({ error: 'Нельзя удалить чужой пост' });
    }

    await prisma.post.delete({ where: { id } });
    res.json({ message: 'Пост удалил' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;