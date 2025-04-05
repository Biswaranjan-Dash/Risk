import mongoose from 'mongoose';

const VehicleDataSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
  },
  speed: Number,
  acceleration: Number,
  brakeForce: Number,
  location: {
    latitude: Number,
    longitude: Number,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
  },
});

export default mongoose.models.VehicleData || mongoose.model('VehicleData', VehicleDataSchema);