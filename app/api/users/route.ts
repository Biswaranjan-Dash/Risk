import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { authOptions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const data = await request.json();
    // const session = await getServerSession();
    const session = await getServerSession(authOptions); 

    // Allow insurance company registration without auth
    if (data.role === 'insurance') {
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

      // ✅ Hash the password before saving
      const hashedPassword = await bcrypt.hash(data.password, 10);

      const user = await User.create({
        email: data.email,
        password: hashedPassword,
        name: data.name,
        role: 'insurance'
      });

      const { password, ...userWithoutPassword } = user.toObject();
      return NextResponse.json(userWithoutPassword);
    }

    // Customer creation — require authenticated insurance session
    if (!session || session.user.role !== 'insurance') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

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

    // ✅ Hash customer password too
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await User.create({
      ...data,
      password: hashedPassword,
      role: 'customer'
    });

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
