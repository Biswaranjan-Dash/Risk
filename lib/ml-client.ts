// ml-client.ts
const ML_API_URL = 'http://localhost:8000';

export interface MLPredictionInput {
  Speed: number;
  Traffic_Condition: 'Low' | 'Medium' | 'High'; // Match simulator's type
  Linear_X: number;
  Linear_Y: number;
  Linear_Z: number;
  Angular_X: number;
  Angular_Y: number;
  Angular_Z: number;
}

export interface MLPredictionResult {
  predicted_risk: 'Safe' | 'Medium' | 'High'; // Explicitly type possible values
  confidence_score: number;
}

export async function getPrediction(data: MLPredictionInput): Promise<MLPredictionResult> {
  try {
    const response = await fetch(`${ML_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`ML prediction failed with status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('ML prediction error:', error);
    throw error;
  }
}

export function determineEventType(data: MLPredictionInput): string {
  const { Speed, Linear_X, Linear_Y, Angular_Z } = data;

  if (Speed > 100) return 'OVERSPEED';
  if (Math.abs(Linear_X) > 5) return 'HARD_BRAKE';
  if (Math.abs(Angular_Z) > 2) return 'AGGRESSIVE_TURN';
  if (Math.abs(Linear_Y) > 3) return 'SUDDEN_ACCELERATION';

  return 'NORMAL'; // More appropriate default for non-risky behavior
}

export function calculateRiskScore(prediction: MLPredictionResult, data: MLPredictionInput): number {
  // Base score from prediction
  let score =
    prediction.predicted_risk === 'High'
      ? 80
      : prediction.predicted_risk === 'Medium'
      ? 50
      : 20; // 'Safe' case

  // Adjust based on ML confidence
  score = score * (prediction.confidence_score / 100);

  // Adjust based on speed
  if (data.Speed > 120) score += 20;
  else if (data.Speed > 100) score += 10;

  // Adjust based on traffic
  if (data.Traffic_Condition === 'High') score += 10;

  // Cap at 100
  return Math.min(100, Math.round(score));
}