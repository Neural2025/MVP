const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function migrateUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/test-automation');
    console.log('Connected to MongoDB');

    // Find all users with old role values
    const usersToUpdate = await User.find({ 
      role: { $in: ['user', 'admin'] } 
    }).select('_id email role');

    console.log(`Found ${usersToUpdate.length} users to migrate`);

    for (const user of usersToUpdate) {
      let newRole;
      
      if (user.role === 'admin') {
        newRole = 'admin'; // Keep admin as admin
      } else if (user.role === 'user') {
        newRole = 'developer'; // Default old 'user' role to 'developer'
      }

      if (newRole) {
        await User.updateOne(
          { _id: user._id },
          { $set: { role: newRole } }
        );
        console.log(`Updated user ${user.email}: ${user.role} -> ${newRole}`);
      }
    }

    console.log('Migration completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateUsers();
}

module.exports = migrateUsers;
