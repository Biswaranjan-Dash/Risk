import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/db'; // Your db.ts file
import User from '@/models/User'; // Make sure you have this model defined

export async function POST(req: NextRequest) {
  try {
    await dbConnect(); // Connect to MongoDB

    const { vehicleNumber, password } = await req.json();

    if (!vehicleNumber || !password) {
      return NextResponse.json(
        { message: 'Vehicle number and password are required' },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ vehicleNumber });

    if (existingUser) {
      return NextResponse.json(
        { message: 'A user with this vehicle number already exists' },
        { status: 409 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      vehicleNumber,
      password: hashedPassword,
      role: 'customer',
      name: vehicleNumber, // or customize
    });

    await newUser.save();

    return NextResponse.json({ message: 'Customer registration successful' }, { status: 201 });
  } catch (error) {
    console.error('Customer registration error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
