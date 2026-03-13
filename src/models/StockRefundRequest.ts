import mongoose from 'mongoose';

const stockRefundRequestSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  materialName: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  reason: { type: String, required: true },
  requestedBy: { type: String, required: true },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  reviewedBy: { type: String },
  reviewedAt: { type: Date }
}, { timestamps: true });

stockRefundRequestSchema.index({ siteId: 1, status: 1 });

const StockRefundRequest = mongoose.models.StockRefundRequest || mongoose.model('StockRefundRequest', stockRefundRequestSchema);

export default StockRefundRequest;
