import mongoose from 'mongoose';

const materialSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  photo: { type: String },
  lorryNo: { type: String },
  lorryMeasurements: { type: String },
  status: {
    type: String,
    enum: ['Pending', 'Approved'],
    default: 'Pending'
  },
  addedBy: { type: String },
  approvedBy: { type: String },
  approvedAt: { type: Date }
}, { timestamps: true });

materialSchema.index({ siteId: 1 });

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);

export default Material;
