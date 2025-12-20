const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },

  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  category: {
    type: String,
    enum: [
      'graphic-design',
      'web-development',
      'writing',
      'marketing',
      'mobile-app',
      'data-science',
      'ai-ml',
      'other'
    ],
    required: true
  },

  skills: [{ type: String, trim: true }],

  budgetType: {
    type: String,
    enum: ['fixed', 'hourly'],
    required: true
  },

  budget: {
    fixed: Number,
    min: Number,
    max: Number
  },

  duration: {
    type: String,
    enum: [
      'less-than-1-week',
      '1-2-weeks',
      '2-4-weeks',
      '1-3-months',
      '3-6-months'
    ]
  },

  status: {
    type: String,
    enum: ['open', 'in-progress', 'completed', 'cancelled'],
    default: 'open'
  },

  selectedFreelancer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },

  bids: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bid'
  }],

  deadline: Date
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
