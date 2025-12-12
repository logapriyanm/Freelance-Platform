/**
 * Input Validation Utilities using Joi
 * Validates request data before processing
 */

const Joi = require('joi');


/**
 * User registration validation
 */
const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required().messages({
      'string.empty': 'Name is required',
      'string.min': 'Name must be at least 2 characters',
      'string.max': 'Name cannot exceed 50 characters'
    }),
    email: Joi.string().min(6).max(255).required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email',
      'string.max': 'Email cannot exceed 255 characters'
    }),
    password: Joi.string().min(6).max(1024).required().messages({
      'string.empty': 'Password is required',
      'string.min': 'Password must be at least 6 characters'
    }),
    role: Joi.string().valid('client', 'freelancer').required().messages({
      'any.only': 'Role must be either client or freelancer'
    }),
    phone: Joi.string().optional().pattern(/^[0-9+\-\s()]{10,15}$/).messages({
      'string.pattern.base': 'Please provide a valid phone number'
    })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * User login validation
 */
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().min(6).max(255).required().email().messages({
      'string.empty': 'Email is required',
      'string.email': 'Please provide a valid email'
    }),
    password: Joi.string().min(6).max(1024).required().messages({
      'string.empty': 'Password is required'
    })
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Project creation validation
 */
const projectValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(5).max(200).required().messages({
      'string.empty': 'Project title is required',
      'string.min': 'Title must be at least 5 characters',
      'string.max': 'Title cannot exceed 200 characters'
    }),
    description: Joi.string().min(20).max(5000).required().messages({
      'string.empty': 'Project description is required',
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 5000 characters'
    }),
    category: Joi.string().valid(
      'graphic-design',
      'web-development',
      'writing',
      'marketing',
      'mobile-app',
      'other'
    ).required().messages({
      'any.only': 'Please select a valid category'
    }),
    skills: Joi.string().optional().allow(''),
    budgetType: Joi.string().valid('fixed', 'hourly').required().messages({
      'any.only': 'Budget type must be either fixed or hourly'
    }),
    budget: Joi.alternatives().conditional('budgetType', {
      is: 'fixed',
      then: Joi.number().min(1).required().messages({
        'number.min': 'Budget must be at least $1',
        'number.base': 'Please enter a valid budget amount'
      }),
      otherwise: Joi.object({
        min: Joi.number().min(1).required().messages({
          'number.min': 'Minimum hourly rate must be at least $1'
        }),
        max: Joi.number().min(Joi.ref('min')).required().messages({
          'number.min': 'Maximum hourly rate must be greater than minimum rate',
          'any.ref': 'Maximum rate must be greater than minimum rate'
        })
      }).required()
    }),
    duration: Joi.string().valid(
      'less-than-1-week',
      '1-2-weeks',
      '2-4-weeks',
      '1-3-months',
      '3-6-months'
    ).required().messages({
      'any.only': 'Please select a valid duration'
    }),
    deadline: Joi.date().greater('now').optional().messages({
      'date.greater': 'Deadline must be in the future'
    }),
    attachments: Joi.array().optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Bid submission validation
 */
const bidValidation = (data) => {
  const schema = Joi.object({
    projectId: Joi.string().required().messages({
      'string.empty': 'Project ID is required'
    }),
    proposal: Joi.string().min(20).max(2000).required().messages({
      'string.empty': 'Proposal is required',
      'string.min': 'Proposal must be at least 20 characters',
      'string.max': 'Proposal cannot exceed 2000 characters'
    }),
    bidAmount: Joi.number().min(1).required().messages({
      'number.min': 'Bid amount must be at least $1',
      'number.base': 'Please enter a valid bid amount'
    }),
    estimatedTime: Joi.object({
      value: Joi.number().min(1).required().messages({
        'number.min': 'Estimated time must be at least 1'
      }),
      unit: Joi.string().valid('hours', 'days', 'weeks', 'months').required().messages({
        'any.only': 'Time unit must be hours, days, weeks, or months'
      })
    }).optional(),
    attachments: Joi.array().optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Profile update validation
 */
const profileValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).optional(),
    bio: Joi.string().max(500).optional().allow(''),
    title: Joi.string().max(100).optional().allow(''),
    hourlyRate: Joi.number().min(0).optional(),
    skills: Joi.array().items(Joi.string()).optional(),
    location: Joi.string().optional().allow(''),
    phone: Joi.string().optional().pattern(/^[0-9+\-\s()]{10,15}$/),
    yearsExperience: Joi.number().min(0).max(50).optional(),
    languages: Joi.array().items(Joi.string()).optional()
  });

  return schema.validate(data, { abortEarly: false });
};

/**
 * Validate pagination parameters
 */
const paginationValidation = (data) => {
  const schema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc')
  });

  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  projectValidation,
  bidValidation,
  profileValidation,
  paginationValidation
};