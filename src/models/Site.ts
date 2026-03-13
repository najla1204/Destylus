import mongoose from 'mongoose';

const siteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  locationName: { type: String, required: true },
  locationLink: { type: String },
  status: {
    type: String,
    enum: ['Active', 'Completed', 'Planning', 'Pending'],
    default: 'Active'
  },
  budget: { type: Number, default: 0 },
  managers: [{ type: String }],
  engineers: [{ type: String }]
}, { timestamps: true });

const Site = mongoose.models.Site || mongoose.model('Site', siteSchema);

export default Site;
