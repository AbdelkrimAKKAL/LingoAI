const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');

// Créer le fichier si il n'existe pas
if (!fs.existsSync(DB_PATH)) {
  fs.writeFileSync(DB_PATH, JSON.stringify({
    users: [],
    exercises: []
  }, null, 2));
  console.log('Fichier database.json créé !');
}

// Lire la base de données
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

// Sauvegarder la base de données
function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };