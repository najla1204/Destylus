// src/lib/db.ts
import mongoose from 'mongoose';

// MongoDB connection with caching
let cached = (global as any).mongoose || { conn: null, promise: null };

if (!(global as any).mongoose) {
  (global as any).mongoose = { conn: null, promise: null };
}

export async function connectToDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      throw new Error('Please define the MONGODB_URI environment variable');
    }

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log('Connected to MongoDB');
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    console.error('MongoDB connection error:', e);
    throw e;
  }

  return cached.conn;
}

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

// User schema for authentication
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['engineer', 'project_manager', 'hr'],
    required: true
  },
  employeeId: { type: String, required: true, unique: true },
  site: { type: String },
  allocatedSites: [{ type: String }], // For PMs to track which sites they manage
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  currentStatus: {
    type: String,
    enum: ['available', 'checked-in', 'checked-out', 'on-leave'],
    default: 'available'
  }
}, { timestamps: true });

// Create indexes for faster lookups
userSchema.index({ email: 1 });
userSchema.index({ employeeId: 1 });
userSchema.index({ role: 1 });

// Create the model if it doesn't exist
const User = mongoose.models.User || mongoose.model('User', userSchema);

// Real-time session tracking schema
const sessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  employeeId: { type: String, required: true },
  loginTime: { type: Date, required: true },
  logoutTime: { type: Date },
  isActive: { type: Boolean, default: true },
  lastActivity: { type: Date, default: Date.now },
  ipAddress: { type: String },
  userAgent: { type: String }
}, { timestamps: true });

// Create indexes
sessionSchema.index({ userId: 1, isActive: 1 });
sessionSchema.index({ employeeId: 1, isActive: 1 });

const Session = mongoose.models.Session || mongoose.model('Session', sessionSchema);

// Site schema
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

// Labour schema
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

// Material schema
const materialSchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }
}, { timestamps: true });

materialSchema.index({ siteId: 1 });

const Material = mongoose.models.Material || mongoose.model('Material', materialSchema);

// Issue schema
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
  siteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Site', required: true }
}, { timestamps: true });

issueSchema.index({ siteId: 1 });

const Issue = mongoose.models.Issue || mongoose.model('Issue', issueSchema);

// PettyCash schema
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

export { Attendance, User, Session, Site, Labour, Material, Issue, PettyCashTransaction };