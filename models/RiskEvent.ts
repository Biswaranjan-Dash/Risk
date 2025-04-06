import mongoose from 'mongoose';

const RiskEventSchema = new mongoose.Schema({
  vehicleNumber: {
    type: String,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  riskScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  eventType: {
    type: String,
    enum: ['HARD_BRAKE', 'OVERSPEED', 'AGGRESSIVE_TURN', 'SUDDEN_ACCELERATION'],
    required: true,
  },
  speed: {
    type: Number,
    required: true,
  },
  location: {
    latitude: Number,
    longitude: Number,
  },
  mlPrediction: {
    riskLevel: String,
    confidence: Number,
  },
  rawData: {
    Linear_X: Number,
    Linear_Y: Number,
    Linear_Z: Number,
    Angular_X: Number,
    Angular_Y: Number,
    Angular_Z: Number,
    Traffic_Condition: String,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

// Create indexes for common queries
RiskEventSchema.index({ timestamp: -1, vehicleNumber: 1 });
RiskEventSchema.index({ riskScore: -1 });

export default mongoose.models.RiskEvent || mongoose.model('RiskEvent', RiskEventSchema);