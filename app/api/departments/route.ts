import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import dbConnect from '@/lib/db';
import { Department, User } from '@/models';

// GET /api/departments - List all departments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const all = searchParams.get('all') === 'true';

    const query: Record<string, unknown> = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { code: { $regex: search, $options: 'i' } },
      ];
    }

    // If 'all' parameter is true, return all departments without pagination
    if (all) {
      const departments = await Department.find(query)
        .populate('hod', 'name email')
        .sort({ name: 1 })
        .lean();
      
      return NextResponse.json({ departments });
    }

    const total = await Department.countDocuments(query);
    const departments = await Department.find(query)
      .populate('hod', 'name email')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return NextResponse.json({
      departments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json({ error: 'Failed to fetch departments' }, { status: 500 });
  }
}

// POST /api/departments - Create new department
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await request.json();
    const { name, code, description, hod, isActive } = body;

    // Validation
    if (!name || !code) {
      return NextResponse.json(
        { error: 'Name and code are required' },
        { status: 400 }
      );
    }

    // Check if code already exists
    const existingDept = await Department.findOne({ code: code.toUpperCase() });
    if (existingDept) {
      return NextResponse.json(
        { error: 'Department code already exists' },
        { status: 400 }
      );
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

    // Create department
    const department = await Department.create({
      name,
      code: code.toUpperCase(),
      description: description || undefined,
      hod: hod || undefined,
      isActive: isActive !== undefined ? isActive : true,
    });

    // Populate HOD for response
    await department.populate('hod', 'name email');

    return NextResponse.json({ department }, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json({ error: 'Failed to create department' }, { status: 500 });
  }
}
