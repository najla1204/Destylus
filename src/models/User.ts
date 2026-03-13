import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['engineer', 'project_manager', 'hr'],
    required: true
  },
  employeeId: { type: String, required: true, unique: true, index: true },
  site: { type: String },
  allocatedSites: [{ type: String }],
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  currentStatus: {
    type: String,
    enum: ['available', 'checked-in', 'checked-out', 'on-leave'],
    default: 'available'
  }
}, { timestamps: true });

userSchema.index({ role: 1 });

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error: any) {
    throw error;
  }
});

export default mongoose.models.User || mongoose.model('User', userSchema);
