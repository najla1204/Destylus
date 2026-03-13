import mongoose from 'mongoose';

const extraMaterialRequestSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  items: [{
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit: { type: String, required: true }
  }],
  reason: { type: String },
  requestedBy: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  rejectionReason: { type: String },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

extraMaterialRequestSchema.index({ siteId: 1, status: 1 });

const ExtraMaterialRequest = mongoose.models.ExtraMaterialRequest || mongoose.model('ExtraMaterialRequest', extraMaterialRequestSchema);

export default ExtraMaterialRequest;
