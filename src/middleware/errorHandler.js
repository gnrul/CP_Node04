const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const body = { error: err.message || 'Ошибка сервера' };

  if (process.env.NODE_ENV !== 'production') {
    console.error(err.stack);
    body.stack = err.stack;
  }

  res.status(status).json(body);
};

module.exports = errorHandler;