import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    sparse: true,
  },
  vehicleNumber: {
    type: String,
    unique: true,
    sparse: true,
  },
  password: String,
  role: {
    type: String,
    enum: ['customer', 'insurance'],
    required: true,
  },
  name: String,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);