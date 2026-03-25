const mongoose = require('mongoose');

const connectDB = async () => {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LingoApp';
  console.log(`Connecting to MongoDB at: ${mongoUri}...`);
  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000, 
    });
    console.log(`MongoDB Connected: ${conn.connection.host} ---`);
  } catch (err) {
    console.error(`MongoDB Connection Error: ${err.message}`);

  }
};

module.exports = { connectDB };