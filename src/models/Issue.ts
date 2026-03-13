import mongoose from 'mongoose';

const issueSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Resolved'],
    default: 'Open'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  raisedBy: { type: String },
  raisedByRole: { type: String },
  sentTo: [{ type: String }],
  statusChangedBy: { type: String },
  statusChangedByRole: { type: String },
  resolvedBy: { type: String },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }
}, { timestamps: true });

issueSchema.index({ siteId: 1 });

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

export default Issue;
