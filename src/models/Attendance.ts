// src/models/Attendance.ts
import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema({
  employeeName: { type: String, required: true },
  employeeId: { type: String, required: true, index: true },
  role: { type: String, required: true },
  site: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['checked-in', 'checked-out'],
    required: true 
  },
  approvalStatus: { 
    type: String, 
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  checkInTime: { type: Date, required: true },
  checkOutTime: { type: Date },
  inTimePhoto: { type: String },
  outTimePhoto: { type: String },
  totalHours: { type: Number },
  notes: { type: String },
  rejectionReason: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date },
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
    address: { type: String }
  }
}, { timestamps: true });

// Create an index for faster lookups
attendanceSchema.index({ employeeId: 1, checkInTime: -1 });

// Create the model if it doesn't exist
const Attendance = mongoose.models.Attendance || mongoose.model('Attendance', attendanceSchema);

export default Attendance;