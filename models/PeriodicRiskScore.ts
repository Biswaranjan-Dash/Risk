import mongoose from 'mongoose';

const PeriodicRiskScoreSchema = new mongoose.Schema({
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
  period: {
    type: String,
    enum: ['DAILY', 'WEEKLY', 'MONTHLY'],
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  dataPoints: {
    type: Number,
    required: true,
  },
});

// Create compound indexes for efficient querying
PeriodicRiskScoreSchema.index({ vehicleNumber: 1, period: 1, startDate: -1 });
PeriodicRiskScoreSchema.index({ userId: 1, period: 1, startDate: -1 });

export default mongoose.models.PeriodicRiskScore || mongoose.model('PeriodicRiskScore', PeriodicRiskScoreSchema);