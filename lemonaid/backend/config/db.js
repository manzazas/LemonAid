import mongoose from 'mongoose';

export async function connectDB() {
  const uri = process.env.MONGO_URI || process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/lemonaid';
  try {
    if (mongoose.connection.readyState === 1) {
      console.log('MongoDB already connected');
      return mongoose.connection;
    }
    await mongoose.connect(uri);
    console.log('Connected to MongoDB:', uri);
    return mongoose.connection;
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message || err);
    throw err;
  }
}

export default mongoose;
