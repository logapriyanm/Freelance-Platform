const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  platformName: { type: String, default: 'FreelancePro' },
  platformEmail: { type: String, default: 'admin@freelancepro.com' },
  supportEmail: { type: String, default: 'support@freelancepro.com' },
  contactPhone: { type: String, default: '+1 (555) 123-4567' },
  defaultCurrency: { type: String, default: 'USD' },
  timezone: { type: String, default: 'UTC' },
  dateFormat: { type: String, default: 'MM/DD/YYYY' },
  platformCommission: { type: Number, default: 10 },
  freelancerCommission: { type: Number, default: 5 },
  clientFeePercentage: { type: Number, default: 2.5 },
  transactionFee: { type: Number, default: 2 },
  withdrawalFee: { type: Number, default: 1 },
  minimumWithdrawal: { type: Number, default: 50 },
  maximumWithdrawal: { type: Number, default: 10000 },
  maxLoginAttempts: { type: Number, default: 5 },
  sessionTimeout: { type: Number, default: 60 },
  twoFactorEnabled: { type: Boolean, default: true },
  passwordMinLength: { type: Number, default: 8 },
  requireStrongPassword: { type: Boolean, default: true },
  ipWhitelist: [{ type: String }],
  emailVerificationRequired: { type: Boolean, default: true },
  identityVerificationRequired: { type: Boolean, default: true },
  portfolioVerificationRequired: { type: Boolean, default: true },
  bankVerificationRequired: { type: Boolean, default: true },
  projectAutoApprove: { type: Boolean, default: false },
  maxProjectDuration: { type: Number, default: 180 },
  minProjectBudget: { type: Number, default: 10 },
  maxProjectBudget: { type: Number, default: 50000 },
  escrowEnabled: { type: Boolean, default: true },
  escrowPercentage: { type: Number, default: 50 },
  disputeResolutionDays: { type: Number, default: 7 },
  emailNotifications: { type: Boolean, default: true },
  pushNotifications: { type: Boolean, default: true },
  projectAlerts: { type: Boolean, default: true },
  paymentAlerts: { type: Boolean, default: true },
  securityAlerts: { type: Boolean, default: true },
  cacheEnabled: { type: Boolean, default: true },
  cacheDuration: { type: Number, default: 300 },
  maxUploadSize: { type: Number, default: 10 },
  allowedFileTypes: [{ type: String }],
  termsUrl: { type: String, default: '/terms' },
  privacyUrl: { type: String, default: '/privacy' },
  refundPolicyUrl: { type: String, default: '/refund-policy' },
  cookiePolicyUrl: { type: String, default: '/cookie-policy' }
}, {
  timestamps: true
});

// Ensure only one settings document exists
settingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);