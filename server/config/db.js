// server/config/db.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/skillforge';

async function connectDB() {
  try {
    const conn = await mongoose.connect(MONGO_URI, {
      // these options are defaults in mongoose 6+; left here for clarity
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    process.exit(1);
  }
}

export default connectDB;