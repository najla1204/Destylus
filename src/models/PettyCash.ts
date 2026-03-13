import mongoose from 'mongoose';

const pettyCashSchema = new mongoose.Schema({
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true },
  title: { type: String, required: true },
  amount: { type: Number, required: true },
  type: {
    type: String,
    enum: ['Allocation', 'Expense'],
    required: true
  },
  loggedBy: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

pettyCashSchema.index({ siteId: 1 });

const PettyCashTransaction = mongoose.models.PettyCashTransaction || mongoose.model('PettyCashTransaction', pettyCashSchema);

export default PettyCashTransaction;
