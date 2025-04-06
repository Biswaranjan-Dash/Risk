import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import VehicleData from '@/models/VehicleData';
import { authOptions } from '@/lib/auth';

export async function GET() {
  try {
    // const session = await getServerSession();
    const session = await getServerSession(authOptions); 

    console.log('Session in /api/customers:', session);

    if (!session || session.user.role !== 'insurance') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const customers = await User.find({ role: 'customer' }).select('-password');

    console.log('Found customers:', customers.length);

    const customersWithData = await Promise.all(
      customers.map(async (customer) => {
        const latestData = await VehicleData.findOne({ vehicleNumber: customer.vehicleNumber })
          .sort({ timestamp: -1 });

        const recentData = await VehicleData.find({ vehicleNumber: customer.vehicleNumber })
          .sort({ timestamp: -1 })
          .limit(100);

        const avgRiskScore = recentData.length > 0
          ? Math.round(recentData.reduce((acc, curr) => acc + curr.riskScore, 0) / recentData.length)
          : 0;

        return {
          id: customer._id,
          name: customer.name,
          vehicleNumber: customer.vehicleNumber,
          riskScore: avgRiskScore,
          lastActive: latestData?.timestamp || customer.createdAt,
        };
      })
    );

    return NextResponse.json(customersWithData);
  } catch (error: any) {
    console.error('Error fetching customers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch customers', details: error?.message || String(error) },
      { status: 500 }
    );
  }
}  
