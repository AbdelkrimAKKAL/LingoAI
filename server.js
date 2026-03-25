const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const { connectDB } = require('./db');

const startApp = async () => {
  try {
    // 1. Force the app to wait for MongoDB
    await connectDB(); 

    // 2. Middleware
    app.use(cors({
      origin: '*',
      methods: ['GET', 'POST', 'PUT', 'DELETE'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());

    // 3. Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/exercises', require('./routes/exercises'));

    app.get('/health', (req, res) => {
      res.json({ status: 'ok', message: 'Serveur en ligne !' });
    });

    // 4. Start Listening
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, () => {
      console.log(`🚀 Serveur démarré sur le port ${PORT}`);
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startApp();