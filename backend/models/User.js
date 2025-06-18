const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['developer', 'tester', 'product_manager', 'admin', 'user'], // Keep 'user' for backward compatibility
    required: [true, 'Role is required'],
    default: 'developer'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  analysisCount: {
    type: Number,
    default: 0
  },
  testGenerationCount: {
    type: Number,
    default: 0
  },
  emailVerified: {
    type: Boolean,
    default: false
  },
  analysisHistory: [{
    code: String,
    purpose: String,
    language: String,
    results: {
      security: [String],
      performance: [String],
      optimization: [String],
      functionality: [String]
    },
    corrections: [String],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  testHistory: [{
    code: String,
    purpose: String,
    language: String,
    role: String,
    tests: mongoose.Schema.Types.Mixed, // Can be string or object for role-based tests
    fixes: [{
      issue: String,
      fixedCode: String
    }],
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  bugReports: [{
    id: String,
    title: String,
    description: String,
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium'
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium'
    },
    status: {
      type: String,
      enum: ['open', 'in-progress', 'resolved', 'closed'],
      default: 'open'
    },
    stepsToReproduce: [String],
    expectedBehavior: String,
    actualBehavior: String,
    environment: mongoose.Schema.Types.Mixed,
    code: String,
    language: String,
    aiAnalysis: mongoose.Schema.Types.Mixed,
    createdBy: String,
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Migrate old role values
  if (this.role === 'user') {
    this.role = 'developer'; // Default migration
  }

  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) return next();

  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Instance method to increment analysis count
userSchema.methods.incrementAnalysisCount = async function() {
  this.analysisCount += 1;
  return await this.save();
};

// Instance method to increment test generation count
userSchema.methods.incrementTestGenerationCount = async function() {
  this.testGenerationCount += 1;
  return await this.save();
};

// Instance method to update last login
userSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  return await this.save();
};

// Instance method to add analysis to history
userSchema.methods.addAnalysisHistory = async function(analysisData) {
  this.analysisHistory.unshift(analysisData);
  // Keep only last 50 analyses
  if (this.analysisHistory.length > 50) {
    this.analysisHistory = this.analysisHistory.slice(0, 50);
  }
  return await this.save();
};

// Instance method to add test generation to history
userSchema.methods.addTestHistory = async function(testData) {
  this.testHistory.unshift(testData);
  // Keep only last 50 test generations
  if (this.testHistory.length > 50) {
    this.testHistory = this.testHistory.slice(0, 50);
  }
  return await this.save();
};

// Instance method to add bug report
userSchema.methods.addBugReport = async function(bugData) {
  this.bugReports.unshift(bugData);
  // Keep only last 100 bug reports
  if (this.bugReports.length > 100) {
    this.bugReports = this.bugReports.slice(0, 100);
  }
  return await this.save();
};

// Static method to find user by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

module.exports = mongoose.model('User', userSchema);
