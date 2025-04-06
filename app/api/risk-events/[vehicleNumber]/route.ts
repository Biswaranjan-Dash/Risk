import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import dbConnect from '@/lib/db';
import RiskEvent from '@/models/RiskEvent';
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
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');
    const eventType = url.searchParams.get('eventType');
    const minRiskScore = parseInt(url.searchParams.get('minRiskScore') || '0');

    // Build query
    const query: any = { vehicleNumber: params.vehicleNumber };
    
    if (startDate && endDate) {
      query.timestamp = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    
    if (eventType) {
      query.eventType = eventType;
    }
    
    if (minRiskScore) {
      query.riskScore = { $gte: minRiskScore };
    }

    const riskEvents = await RiskEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(100);

    // Calculate statistics
    const stats = await RiskEvent.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          avgRiskScore: { $avg: '$riskScore' },
          maxRiskScore: { $max: '$riskScore' },
          totalEvents: { $sum: 1 },
          eventTypes: {
            $push: '$eventType'
          }
        }
      }
    ]);

    const eventTypeCounts = stats[0]?.eventTypes.reduce((acc: any, type: string) => {
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});

    return NextResponse.json({
      events: riskEvents,
      statistics: {
        averageRiskScore: Math.round(stats[0]?.avgRiskScore || 0),
        maxRiskScore: stats[0]?.maxRiskScore || 0,
        totalEvents: stats[0]?.totalEvents || 0,
        eventTypeCounts: eventTypeCounts || {},
      }
    });
  } catch (error) {
    console.error('Error fetching risk events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch risk events' },
      { status: 500 }
    );
  }
}