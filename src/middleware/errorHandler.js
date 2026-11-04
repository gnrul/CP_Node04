const errorHandler = (err, req, res, next) => {
  console.error(err.stack); 
  const statusCode = res.statusCode && res.statusCode >= 400 ? res.statusCode : 500;
  res.status(statusCode).json({
    error: err.message || 'Внутренняя ошибка сервера'
  });
};

module.exports = errorHandler;