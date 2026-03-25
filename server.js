const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

const { connectDB } = require('./db');

connectDB(); // Add this before your routes

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());


// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/exercises', require('./routes/exercises'));

// Test — pour vérifier que le serveur tourne
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Serveur en ligne !' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Serveur démarré sur le port ${PORT}`);
});