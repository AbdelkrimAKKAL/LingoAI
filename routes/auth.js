const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { connectDB } = require('../db');

const User = require('../models/User')

// INSCRIPTION
router.post('/register', async (req, res) => {
  const { nom, prenom, email, password } = req.body;
  
  try {
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ error: 'Email déjà utilisé' });

    const hashedPassword = await bcrypt.hash(password, 10);
    
    user = new User({ nom, prenom, email, password: hashedPassword });
    await user.save();

    res.json({ message: 'Compte créé avec succès !' });
  } catch (err) {
    console.error("Erreur d'inscription details:", err);
    res.status(500).json({ error: "Erreur serveur", details: err.message });
  }
});

// CONNEXION
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
  res.json({ token, user: { id: user._id, nom: user.nom, prenom: user.prenom, email: user.email } });
});

module.exports = router;