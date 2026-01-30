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
  password: {
    type: String,
    required: true
  },
  gender: {
    type: String,
    required: true,
    enum: ['MALE', 'FEMALE']
  },
  role: {
    type: String,
    required: true,
    enum: ['EMPLOYEE', 'EMPLOYER', 'ADMIN']
  },
  telephone: {
    type: [String],
    default: [],
    validate: {
      validator: function(v) {
        return v.length === 0 || v.every(function(t) {
          return /^\d{10}$/.test(t);
        });
      },
      message: 'Telephone number must be a valid 10-digit number'
    } 
  },
  accountStatus: {
    type: String,
    required: true,
    enum: ['ACTIVE', 'INACTIVE', 'PENDING'],
    default: 'ACTIVE'
  },
  age: {
    type: Number,
    required: true,
    min: 0,
    max: 150
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual property to get full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// hash the password before saving the user model
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// compare given password with the database hash
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};


// indexe for faster queries
userSchema.index({ email: 1 });

const User = mongoose.model('User', userSchema);

export default User;