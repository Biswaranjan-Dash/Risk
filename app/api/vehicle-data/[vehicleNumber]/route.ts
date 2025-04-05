import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import VehicleData from '@/models/VehicleData';

export async function GET(
  request: Request,
  { params }: { params: { vehicleNumber: string } }
) {
  try {
    await dbConnect();

    const vehicleData = await VehicleData.find({ 
      vehicleNumber: params.vehicleNumber 
    })
    .sort({ timestamp: -1 })
    .limit(100);

    return NextResponse.json(vehicleData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch vehicle data' },
      { status: 500 }
    );
  }
}

// This endpoint would receive data from IoT devices
export async function POST(
  request: Request,
  { params }: { params: { vehicleNumber: string } }
) {
  try {
    await dbConnect();
    const data = await request.json();

    // Simple risk score calculation (in production, this would use a proper ML model)
    const riskScore = calculateRiskScore(data);

    const vehicleData = await VehicleData.create({
      ...data,
      vehicleNumber: params.vehicleNumber,
      riskScore,
    });

    return NextResponse.json(vehicleData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save vehicle data' },
      { status: 500 }
    );
  }
}

// Simple risk score calculation (replace with ML model in production)
function calculateRiskScore(data: any): number {
  const speedWeight = 0.4;
  const accelerationWeight = 0.3;
  const brakeForceWeight = 0.3;

  const speedScore = Math.min(100, (data.speed / 120) * 100);
  const accelerationScore = Math.min(100, (Math.abs(data.acceleration) / 10) * 100);
  const brakeForceScore = Math.min(100, (data.brakeForce / 100) * 100);

  return Math.round(
    speedScore * speedWeight +
    accelerationScore * accelerationWeight +
    brakeForceScore * brakeForceWeight
  );
}