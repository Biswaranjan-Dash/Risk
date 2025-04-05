import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    const session = await getServerSession();

    // Allow insurance company registration without auth
    if (data.role === 'insurance') {
      // Validate required fields
      if (!data.email || !data.password || !data.name) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      const existingUser = await User.findOne({ email: data.email });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }

      const user = await User.create({
        email: data.email,
        password: data.password,
        name: data.name,
        role: 'insurance'
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user.toObject();
      return NextResponse.json(userWithoutPassword);
    }

    // For customer creation, require insurance company authentication
    if (!session || session.user.role !== 'insurance') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Validate required fields for customer
    if (!data.vehicleNumber || !data.password || !data.name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const existingVehicle = await User.findOne({ vehicleNumber: data.vehicleNumber });
    if (existingVehicle) {
      return NextResponse.json(
        { error: 'Vehicle number already registered' },
        { status: 400 }
      );
    }

    const user = await User.create({
      ...data,
      role: 'customer'
    });

    // Remove password from response
    const { password, ...userWithoutPassword } = user.toObject();
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}