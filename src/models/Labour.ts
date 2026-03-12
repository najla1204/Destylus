import mongoose from 'mongoose';

const labourSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String },
  workerType: {
    type: String,
    enum: ['Skilled', 'Unskilled', 'Supervisor'],
    required: true
  },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }
}, { timestamps: true });

labourSchema.index({ siteId: 1 });

const Labour = mongoose.models.Labour || mongoose.model('Labour', labourSchema);

export default Labour;
