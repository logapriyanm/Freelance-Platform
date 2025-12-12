// createDefaultAdmin.js (safe)
const User = require('../models/User');

const createDefaultAdmin = async () => {
  try {
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;
    const adminName = process.env.ADMIN_NAME || 'System Administrator';

    if (!adminEmail || !adminPassword) {
      console.warn('ADMIN_EMAIL or ADMIN_PASSWORD not set');
      return;
    }

    console.log('Checking for existing admin user...');

    let admin = await User.findOne({ email: adminEmail });

    if (!admin) {
      console.log('Creating admin user...');

      // Pass plain password — rely on model's pre-save to hash it.
      admin = new User({
        name: adminName,
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        isVerified: true,
        isSuspended: false,
        title: 'Platform Administrator',
        bio: 'System administrator account for platform management',
        location: 'System',
        avatar: '',
        balance: 0,
        rating: 5,
        totalReviews: 0,
        yearsExperience: 0
      });

      await admin.save();
      console.log('Default admin created');
    } else if (admin.role !== 'admin') {
      admin.role = 'admin';
      admin.isVerified = true;
      await admin.save();
      console.log('Updated existing user to admin role');
    } else {
      console.log('Admin already exists');
    }
  } catch (err) {
    console.error('Error creating default admin:', err);
  }
};

module.exports = createDefaultAdmin;
