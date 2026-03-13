
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

import Session from '@/models/Session';
import Site from '@/models/Site';
import Labour from '@/models/Labour';
import Material from '@/models/Material';
import Issue from '@/models/Issue';
import PettyCashTransaction from '@/models/PettyCash';
import AggregateLabourAttendance from '@/models/AggregateLabourAttendance';
import StockRefundRequest from '@/models/StockRefundRequest';
import ExtraMaterialRequest from '@/models/ExtraMaterialRequest';
import User from '@/models/User';
import Attendance from '@/models/Attendance';
import Leave from '@/models/Leave';

export { 
  Attendance, User, Session, Site, Labour, Material, Issue, 
  PettyCashTransaction, AggregateLabourAttendance, StockRefundRequest,
  ExtraMaterialRequest, Leave
};