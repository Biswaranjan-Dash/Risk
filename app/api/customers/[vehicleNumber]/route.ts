import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(
  request: Request,
  { params }: { params: { vehicleNumber: string } }
) {
  try {
    const session = await getServerSession();

    if (!session || session.user.role !== 'insurance') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const customer = await User.findOne({
      vehicleNumber: params.vehicleNumber,
      role: 'customer'
    }).select('-password');

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: customer._id,
      name: customer.name,
      vehicleNumber: customer.vehicleNumber,
      createdAt: customer.createdAt,
    });
  } catch (error) {
    console.error('Error fetching customer details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customer details' },
      { status: 500 }
    );
  }
}