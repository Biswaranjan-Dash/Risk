// app/api/vehicle-data/[vehicleNumber]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db'; // Adjusted to match your import
import VehicleData from '@/models/VehicleData';
import RiskEvent from '@/models/RiskEvent';
import PeriodicRiskScore from '@/models/PeriodicRiskScore';
import User from '@/models/User';
import { getPrediction, determineEventType, calculateRiskScore, type MLPredictionInput } from '@/lib/ml-client';

async function updatePeriodicRiskScores(vehicleNumber: string, userId: string) {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Get all risk events in the last 30 days
  const recentEvents = await RiskEvent.find({
    vehicleNumber,
    timestamp: { $gte: thirtyDaysAgo },
  }).sort({ timestamp: -1 });

  if (recentEvents.length === 0) return;

  // Calculate daily average
  const dailyScores = new Map<string, number[]>();
  recentEvents.forEach((event) => {
    const day = event.timestamp.toISOString().split('T')[0];
    if (!dailyScores.has(day)) {
      dailyScores.set(day, []);
    }
    dailyScores.get(day)?.push(event.riskScore);
  });

  // Create/update daily records
  for (const [day, scores] of dailyScores) {
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const startDate = new Date(day);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);

    await PeriodicRiskScore.findOneAndUpdate(
      {
        vehicleNumber,
        period: 'DAILY',
        startDate: {
          $gte: startDate,
          $lt: endDate,
        },
      },
      {
        $set: {
          userId,
          riskScore: Math.round(avgScore),
          endDate,
          dataPoints: scores.length,
        },
      },
      { upsert: true }
    );
  }

  // Calculate and store monthly average
  const monthlyAvg = recentEvents.reduce((acc, event) => acc + event.riskScore, 0) / recentEvents.length;
  await PeriodicRiskScore.findOneAndUpdate(
    {
      vehicleNumber,
      period: 'MONTHLY',
      startDate: thirtyDaysAgo,
    },
    {
      $set: {
        userId,
        riskScore: Math.round(monthlyAvg),
        endDate: now,
        dataPoints: recentEvents.length,
      },
    },
    { upsert: true }
  );
}

export async function GET(req: NextRequest, { params }: { params: { vehicleNumber: string } }) {
  try {
    await dbConnect();

    const vehicleData = await VehicleData.find({
      vehicleNumber: params.vehicleNumber,
    })
      .sort({ timestamp: -1 })
      .limit(100);

    return NextResponse.json(vehicleData);
  } catch (error) {
    console.error('Error fetching vehicle data:', error);
    return NextResponse.json({ error: 'Failed to fetch vehicle data' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { vehicleNumber: string } }) {
  try {
    await dbConnect();
    const data = await req.json();

    // Validate and type the input
    const input: MLPredictionInput = data.input;
    if (!data.timestamp || !input || !data.location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get ML prediction
    const prediction = await getPrediction(input);

    // Calculate risk score
    const riskScore = calculateRiskScore(prediction, input);

    // Save vehicle data
    const vehicleData = await VehicleData.create({
      vehicleNumber: params.vehicleNumber,
      timestamp: new Date(data.timestamp),
      input,
      location: data.location,
      riskScore,
    });

    // If prediction is not "Safe", create a risk event
    if (prediction.predicted_risk !== 'Safe') {
      const user = await User.findOne({ vehicleNumber: params.vehicleNumber });
      if (user) {
        await RiskEvent.create({
          vehicleNumber: params.vehicleNumber,
          userId: user._id,
          riskScore,
          eventType: determineEventType(input),
          speed: input.Speed,
          location: data.location,
          mlPrediction: {
            riskLevel: prediction.predicted_risk,
            confidence: prediction.confidence_score,
          },
          rawData: input,
          timestamp: new Date(data.timestamp),
        });

        // Update periodic risk scores
        await updatePeriodicRiskScores(params.vehicleNumber, user._id.toString());
      }
    }

    // Return only the riskScore to match simulator expectation
    return NextResponse.json({ riskScore });
  } catch (error) {
    console.error('Error processing vehicle data:', error);
    return NextResponse.json({ error: 'Failed to save vehicle data' }, { status: 500 });
  }
}