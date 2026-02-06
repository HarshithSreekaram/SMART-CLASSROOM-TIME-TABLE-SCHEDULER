// ===========================================
// Type Definitions for Smart Classroom Scheduler
// ===========================================

// User Roles
export type UserRole = 'admin' | 'hod' | 'coordinator' | 'faculty' | 'student';

// User Type
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  department?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Department Type
export interface Department {
  _id: string;
  name: string;
  code: string;
  hodId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subject Type
export interface Subject {
  _id: string;
  name: string;
  code: string;
  departmentId: string;
  credits: number;
  type: 'theory' | 'practical' | 'both';
  theoryHours: number;
  practicalHours: number;
  createdAt: Date;
  updatedAt: Date;
}

// Room/Classroom Type
export interface Room {
  _id: string;
  name: string;
  building: string;
  floor: string;
  type: 'lecture' | 'lab' | 'seminar' | 'workshop';
  capacity: number;
  facilities: string[];
  departmentId?: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Batch Type (Student Group)
export interface Batch {
  _id: string;
  name: string;
  departmentId: string;
  year: number;
  semester: number;
  division: string;
  studentCount: number;
  createdAt: Date;
  updatedAt: Date;
}

// Faculty Type
export interface Faculty {
  _id: string;
  userId: string;
  departmentId: string;
  specializations: string[];
  maxHoursPerWeek: number;
  currentLoad: number;
  preferences?: {
    preferredSlots?: string[];
    avoidSlots?: string[];
  };
  createdAt: Date;
  updatedAt: Date;
}

// Time Slot Type
export interface TimeSlot {
  _id: string;
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  startTime: string;
  endTime: string;
  slotNumber: number;
  isBreak: boolean;
  breakType?: 'short' | 'lunch';
}

// Timetable Entry Type
export interface TimetableEntry {
  _id: string;
  timetableId: string;
  dayIndex: number;
  slotIndex: number;
  subjectId: string;
  facultyId: string;
  roomId: string;
  batchId: string;
  type: 'theory' | 'practical';
}

// Timetable Type
export interface Timetable {
  _id: string;
  name: string;
  departmentId: string;
  academicYear: string;
  semester: number;
  batchIds: string[];
  status: 'draft' | 'pending' | 'approved' | 'published';
  createdBy: string;
  approvedBy?: string;
  entries: TimetableEntry[];
  optimizationScore?: number;
  createdAt: Date;
  updatedAt: Date;
}

// Leave Request Type
export interface LeaveRequest {
  _id: string;
  facultyId: string;
  fromDate: Date;
  toDate: Date;
  type: 'casual' | 'sick' | 'emergency' | 'academic';
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination Type
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
