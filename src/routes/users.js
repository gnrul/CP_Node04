const express = require('express');
const router = express.Router();
const prisma = require('../config/index');

router.get('/', async (req, res) => {
  let { page = 1, limit = 10 } = req.query;
  page = parseInt(page);
  limit = parseInt(limit);
  const skip = (page - 1) * limit;

  try {
    const users = await prisma.user.findMany({ skip, take: limit });
    const total = await prisma.user.count();
    res.json({
      data: users,
      meta: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: parseInt(req.params.id) } });
    if (!user) {
      res.status(404);
      throw new Error('Пользователь не найден');
    }
    res.json(user);
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res) => {
  const { email, name, role } = req.body;
  try {
    const user = await prisma.user.create({
      data: { email, name, role }
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email, role } = req.body;
  try {
    const user = await prisma.user.update({
      where: { id: parseInt(id) },
      data: { name, email, role }
    });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Пользователь удален' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;