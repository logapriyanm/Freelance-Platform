// promoteToAdmin.js
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

(async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const email = process.env.ADMIN_EMAIL;
    const newPass = process.env.ADMIN_PASSWORD;

    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found, nothing to promote.');
      process.exit(0);
    }

    user.role = 'admin';
    user.isVerified = true;

    // Reset password to env value (hashed via pre-save OR hashed manually)
    // If your model hashes password in pre('save'), set plain text:
    user.password = newPass;

    await user.save();
    console.log('User promoted to admin and password reset:', email);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
