import mongoose from 'mongoose';

const LocationSchema = new mongoose.Schema({
    driverId: { type: String, required: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

export const Location = mongoose.model('Location', LocationSchema);

export const connectMongo = async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/driver_tracker';
    try {
        await mongoose.connect(mongoUri);
        console.log(`Connected to MongoDB at ${mongoUri}`);
    } catch (err) {
        console.error('MongoDB connection error:', err);
        setTimeout(connectMongo, 5000); // Retry logic
    }
};
