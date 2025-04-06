// iot-simulator.ts
const { MLPredictionInput } = require('../lib/ml-client');

// Configuration
const VEHICLE_NUMBERS: string[] = ['ABC123', 'XYZ789', 'DEF456'];
const BASE_URL: string = 'http://localhost:3000/api/vehicle-data';
const INTERVAL_MS: number = 3000;

// Realistic ranges for vehicle data
const DATA_RANGES = {
  speed: { min: 0, max: 120 },
  linearAccel: { min: -5, max: 5 },
  angularVel: { min: -2, max: 2 },
  trafficConditions: ['Low', 'Medium', 'High'] as const,
};

// Helper to get random number in range
function getRandomInRange(min: number, max: number): number {
  return Math.round((Math.random() * (max - min) + min) * 1000) / 1000;
}

// Generate random vehicle data
function generateVehicleData(): typeof MLPredictionInput {
  return {
    Speed: getRandomInRange(DATA_RANGES.speed.min, DATA_RANGES.speed.max),
    Traffic_Condition:
      DATA_RANGES.trafficConditions[
        Math.floor(Math.random() * DATA_RANGES.trafficConditions.length)
      ],
    Linear_X: getRandomInRange(DATA_RANGES.linearAccel.min, DATA_RANGES.linearAccel.max),
    Linear_Y: getRandomInRange(DATA_RANGES.linearAccel.min, DATA_RANGES.linearAccel.max),
    Linear_Z: getRandomInRange(DATA_RANGES.linearAccel.min, DATA_RANGES.linearAccel.max),
    Angular_X: getRandomInRange(DATA_RANGES.angularVel.min, DATA_RANGES.angularVel.max),
    Angular_Y: getRandomInRange(DATA_RANGES.angularVel.min, DATA_RANGES.angularVel.max),
    Angular_Z: getRandomInRange(DATA_RANGES.angularVel.min, DATA_RANGES.angularVel.max),
  };
}

// Generate random location near Bangalore
function generateLocation(): { latitude: number; longitude: number } {
  const BANGALORE = {
    lat: 12.9716,
    lng: 77.5946,
  };

  return {
    latitude: BANGALORE.lat + (Math.random() - 0.5) * 0.1,
    longitude: BANGALORE.lng + (Math.random() - 0.5) * 0.1,
  };
}

// Simulate risky behavior occasionally
function simulateRiskyBehavior(data: typeof MLPredictionInput): typeof MLPredictionInput {
  if (Math.random() < 0.1) {
    const riskyBehaviors: Array<() => typeof MLPredictionInput> = [
      () => ({ ...data, Speed: 130 }), // Overspeeding
      () => ({ ...data, Linear_X: -6 }), // Hard braking
      () => ({ ...data, Angular_Z: 2.5 }), // Sharp turn
      () => ({ ...data, Linear_Y: 4 }), // Sudden acceleration
    ];

    const randomBehavior = riskyBehaviors[Math.floor(Math.random() * riskyBehaviors.length)];
    return randomBehavior();
  }
  return data;
}

// Send data for a vehicle
async function sendVehicleData(vehicleNumber: string): Promise<void> {
  try {
    let data: typeof MLPredictionInput = generateVehicleData();
    data = simulateRiskyBehavior(data);

    const payload = {
      timestamp: new Date().toISOString(),
      input: data,
      location: generateLocation(),
    };

    const response = await fetch(`${BASE_URL}/${vehicleNumber}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log(`[${vehicleNumber}] Data sent:`, {
      speed: data.Speed,
      traffic: data.Traffic_Condition,
      riskScore: result.riskScore,
    });
  } catch (error) {
    console.error(`[${vehicleNumber}] Error:`, error);
  }
}

// Main simulation loop
function startSimulation(): void {
  console.log('Starting IoT device simulation...');
  console.log(`Simulating ${VEHICLE_NUMBERS.length} vehicles`);
  console.log('Press Ctrl+C to stop');

  VEHICLE_NUMBERS.forEach((vehicleNumber: string) => {
    setInterval(() => sendVehicleData(vehicleNumber), INTERVAL_MS);
  });
}

// Start the simulation
startSimulation();