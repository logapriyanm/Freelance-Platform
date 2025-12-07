const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
    role: Joi.string().valid('client', 'freelancer').required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email(),
    password: Joi.string().min(6).max(1024).required(),
  });

  return schema.validate(data);
};

const projectValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required(),
    description: Joi.string().min(20).max(5000).required(),
    category: Joi.string().valid(
      'graphic-design',
      'web-development',
      'writing',
      'marketing',
      'mobile-app',
      'other'
    ).required(),
    skills: Joi.string().optional(),
    budgetType: Joi.string().valid('fixed', 'hourly').required(),
    budget: Joi.alternatives().conditional('budgetType', {
      is: 'fixed',
      then: Joi.number().min(1).required(),
      otherwise: Joi.object({
        min: Joi.number().min(1).required(),
        max: Joi.number().min(Joi.ref('min')).required(),
      }).required(),
    }),
    duration: Joi.string().valid(
      'less-than-1-week',
      '1-2-weeks',
      '2-4-weeks',
      '1-3-months',
      '3-6-months'
    ).required(),
    deadline: Joi.date().greater('now').optional(),
  });

  return schema.validate(data);
};

const bidValidation = (data) => {
  const schema = Joi.object({
    projectId: Joi.string().required(),
    proposal: Joi.string().min(20).max(2000).required(),
    bidAmount: Joi.number().min(1).required(),
    estimatedTime: Joi.object({
      value: Joi.number().min(1).required(),
      unit: Joi.string().valid('hours', 'days', 'weeks', 'months').required(),
    }).optional(),
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  projectValidation,
  bidValidation,
};