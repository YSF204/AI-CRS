import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    firstName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    maxlength: 50,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
  },
  passwordHash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    required: true,
    enum: ['EMPLOYEE', 'EMPLOYER', 'ADMIN']
  },
  status: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'ACTIVE'
  },
  phones: [String],
  address: {
    street: String,
    city: String
  },
  employeeProfile: {
    age: Number,
    currentStatus: String
  },
  employerProfile: {
    specialization: String,
    accountStatus: {
      type: String,
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
      default: 'PENDING'
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  adminProfile: {
    permissions: [String]
  }
}, {
  timestamps: true
});

// hash the pasword before saving the user model
userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }
  next();
});

// compare given password with the database hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.passwordHash);
};

const User = mongoose.model('User', userSchema);

export default User;