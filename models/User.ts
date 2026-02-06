// ===========================================
// User Model - MongoDB Schema
// ===========================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'hod' | 'coordinator' | 'faculty' | 'student';
  department?: mongoose.Types.ObjectId;
  year?: number; // For HOD, faculty, students - which year they belong to
  section?: string; // For students - A, B, C
  rollNumber?: string; // For students - e.g., CS1A001
  phone?: string;
  employeeId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't include password by default in queries
    },
    role: {
      type: String,
      enum: ['admin', 'hod', 'coordinator', 'faculty', 'student'],
      default: 'student',
    },
    department: {
      type: Schema.Types.ObjectId,
      ref: 'Department',
    },
    year: {
      type: Number,
      min: 1,
      max: 4,
    },
    section: {
      type: String,
      enum: ['A', 'B', 'C'],
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    employeeId: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries (email already has unique index from schema)
UserSchema.index({ role: 1 });
UserSchema.index({ department: 1 });

const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
