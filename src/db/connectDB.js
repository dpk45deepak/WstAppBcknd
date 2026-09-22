// db/connectDB.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/wstapp';
    const connection = await mongoose.connect(mongoUri);
    console.log(`✅ MongoDB Connected | Host: ${connection.connection.host} | DB: ${connection.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;