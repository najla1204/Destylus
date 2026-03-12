import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ employeeId: 1, isActive: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

export default Session;
