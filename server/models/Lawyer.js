import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phone: {
    type: String,
    trim: true
  },
  role: {
    type: String,
    default: 'lawyer'
  },
  specialization: [{
    type: String,
    required: true
  }],
  experience: {
    type: Number,
    required: true
  },
  barAssociationId: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  languages: [String],
  hourlyRate: {
    type: Number,
    required: true
  },
  availability: {
    type: Boolean,
    default: true
  },
  verified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Password hashing middleware
lawyerSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
lawyerSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const Lawyer = mongoose.model('Lawyer', lawyerSchema);

export default Lawyer;