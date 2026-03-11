// src/models/Leave.ts
import mongoose from 'mongoose';

const leaveSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String, required: true, index: true },
  type: { 
    type: String, 
    required: true,
    enum: ['Casual Leave', 'Sick Leave', 'Emergency Leave']
  },
  from: { type: Date, required: true },
  to: { type: Date, required: true },
  reason: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

// Create an index for faster lookups
leaveSchema.index({ employeeId: 1, createdAt: -1 });

const Leave = mongoose.models.Leave || mongoose.model('Leave', leaveSchema);

export default Leave;
