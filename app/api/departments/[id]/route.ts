import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Department, User } from '@/models';

// GET /api/departments/[id] - Get single department
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const department = await Department.findById(id)
      .populate('hod', 'name email')
      .lean();

    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    return NextResponse.json({ department });
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json({ error: 'Failed to fetch department' }, { status: 500 });
  }
}

// PUT /api/departments/[id] - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const body = await request.json();
    const { name, code, description, hod, isActive } = body;

    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if code is being changed and if new code already exists
    if (code && code.toUpperCase() !== department.code) {
      const existingDept = await Department.findOne({ code: code.toUpperCase() });
      if (existingDept) {
        return NextResponse.json(
          { error: 'Department code already exists' },
          { status: 400 }
        );
      }
    }

    // Validate HOD if provided
    if (hod) {
      const hodUser = await User.findById(hod);
      if (!hodUser) {
        return NextResponse.json(
          { error: 'Invalid HOD user' },
          { status: 400 }
        );
      }
      if (hodUser.role !== 'hod') {
        return NextResponse.json(
          { error: 'Selected user must have HOD role' },
          { status: 400 }
        );
      }
    }

    // Update fields
    if (name) department.name = name;
    if (code) department.code = code.toUpperCase();
    if (description !== undefined) department.description = description || undefined;
    if (hod !== undefined) department.hod = hod || undefined;
    if (isActive !== undefined) department.isActive = isActive;

    await department.save();

    // Populate HOD for response
    await department.populate('hod', 'name email');

    return NextResponse.json({ department });
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json({ error: 'Failed to update department' }, { status: 500 });
  }
}

// DELETE /api/departments/[id] - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    const department = await Department.findById(id);
    if (!department) {
      return NextResponse.json({ error: 'Department not found' }, { status: 404 });
    }

    // Check if there are users in this department
    const usersInDept = await User.countDocuments({ department: id });
    if (usersInDept > 0) {
      return NextResponse.json(
        { error: `Cannot delete department with ${usersInDept} assigned users` },
        { status: 400 }
      );
    }

    await Department.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Department deleted successfully' });
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json({ error: 'Failed to delete department' }, { status: 500 });
  }
}
