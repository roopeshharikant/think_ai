const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true
    },

    password: {
      type: String,
      required: true
    },

    role: {
      type: String,
      enum: ['Learner', 'Instructor', 'TA', 'Admin'],
      default: 'Learner'
    },

    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active'
    },

    resetPasswordToken: {
      type: String,
      select: false
    },

    resetPasswordExpires: {
      type: Date,
      select: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('User', UserSchema);  