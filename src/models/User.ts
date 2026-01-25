import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['engineer', 'project_manager', 'hr'],
    default: 'engineer'
  },
  employeeId: { type: String, unique: true },
  site: { type: String },
  allocatedSites: [{ type: String }] // For PMs to track which sites they manage
});

// Hash password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 10);
});

export default mongoose.models.User || mongoose.model('User', userSchema);
