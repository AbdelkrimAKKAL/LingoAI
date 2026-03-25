const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn; 
  } catch (err) {
    console.error(`❌ Connection Error: ${err.message}`);
    throw err; 
  }
};

module.exports = { connectDB };