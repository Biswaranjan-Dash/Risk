import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import PeriodicRiskScore from '@/models/PeriodicRiskScore';
import { authOptions } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { vehicleNumber: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Parse query parameters
    const url = new URL(request.url);
    const period = url.searchParams.get('period') || 'DAILY';
    const limit = parseInt(url.searchParams.get('limit') || '30');

    const riskScores = await PeriodicRiskScore.find({
      vehicleNumber: params.vehicleNumber,
      period
    })
    .sort({ startDate: -1 })
    .limit(limit);

    // Calculate trend
    const trend = riskScores.length > 1 
      ? (riskScores[0].riskScore - riskScores[riskScores.length - 1].riskScore) 
      : 0;

    return NextResponse.json({
      scores: riskScores,
      trend: {
        direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
        change: Math.abs(trend)
      }
    });
  } catch (error) {
    console.error('Error fetching periodic risk scores:', error);
    return NextResponse.json(
      { error: 'Failed to fetch periodic risk scores' },
      { status: 500 }
    );
  }
}