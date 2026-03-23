const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { readDB, writeDB } = require('../db');

// INSCRIPTION
router.post('/register', async (req, res) => {
  const { nom, prenom, email, password } = req.body;

  // Vérifier que tous les champs sont remplis
  if (!nom || !prenom || !email || !password) {
    return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
  }

  const db = readDB();

  const existingUser = db.users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'Email déjà utilisé' });
  }

  // Chiffrer le mot de passe
  const hashedPassword = await bcrypt.hash(password, 10);

  // Créer le User
  const newUser = {
    id: Date.now(),
    nom,
    prenom,
    email,
    password: hashedPassword,
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDB(db);

  res.json({ message: 'Compte créé avec succès !' });
});

// CONNEXION
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email et mot de passe obligatoires' });
  }

  const db = readDB();

  // Chercher l'utilisateur
  const user = db.users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Vérifier le mot de passe
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
  }

  // Générer le token JWT
  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    token,
    user: {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email
    }
  });
});

module.exports = router;