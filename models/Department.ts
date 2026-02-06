// ===========================================
// Department Model - MongoDB Schema
// ===========================================

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  hod?: mongoose.Types.ObjectId;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: {
      type: String,
      required: [true, 'Please provide department name'],
      trim: true,
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Please provide department code'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [10, 'Code cannot be more than 10 characters'],
    },
    hod: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    description: {
      type: String,
      maxlength: [500, 'Description cannot be more than 500 characters'],
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

// Indexes (code already has unique index from schema)
DepartmentSchema.index({ name: 1 });

const Department: Model<IDepartment> =
  mongoose.models.Department ||
  mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;
