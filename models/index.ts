// ===========================================
// Export all models from single entry point
// ===========================================

export { default as User } from './User';
export { default as Department } from './Department';
export { default as Subject } from './Subject';
export { default as Room } from './Room';
export { default as Batch } from './Batch';
export { default as Timetable } from './Timetable';

// Export types
export type { IUser } from './User';
export type { IDepartment } from './Department';
export type { ISubject } from './Subject';
export type { IRoom } from './Room';
export type { IBatch } from './Batch';
export type { ITimetable, ITimetableEntry } from './Timetable';
