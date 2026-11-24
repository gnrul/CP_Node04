const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');

const authRoutes = require('./src/routes/auth');
const postsRoutes = require('./src/routes/posts');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use('/auth', authRoutes);
app.use('/api/posts', postsRoutes);

app.use(errorHandler);

module.exports = app;