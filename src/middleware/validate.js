const Joi = require('joi');

const postValidationSchema = Joi.object({
  title: Joi.string().required(),
  content: Joi.string().allow('', null),
  published: Joi.boolean(),
  authorId: Joi.number().integer().required(),
  tags: Joi.array().items(Joi.string()).optional()
});

const validatePost = (req, res, next) => {
  const { error } = postValidationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  next();
};

module.exports = { validatePost };