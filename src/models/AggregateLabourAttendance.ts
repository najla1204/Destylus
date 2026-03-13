import mongoose from 'mongoose';

const aggregateLabourAttendanceSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  date: { type: Date, required: true },
  skilledCount: { type: Number, default: 0 },
  unskilledCount: { type: Number, default: 0 },
  supervisorCount: { type: Number, default: 0 },
  entries: [{
    workerType: { type: String, required: true },
    count: { type: Number, required: true },
    photo: { type: String },
    name: { type: String },
    notes: { type: String }
  }],
  totalCount: { type: Number, default: 0 },
  loggedBy: { type: String, required: true },
  notes: { type: String }
}, { timestamps: true });

aggregateLabourAttendanceSchema.index({ siteId: 1, date: -1 });

const AggregateLabourAttendance = mongoose.models.AggregateLabourAttendance || mongoose.model('AggregateLabourAttendance', aggregateLabourAttendanceSchema);

export default AggregateLabourAttendance;
