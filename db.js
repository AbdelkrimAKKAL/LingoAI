const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, 'database.json');


if (!fs.existsSync(DB_PATH)) {
  const initialData = {
    users: [],
    stations: [],
    exercises: [],
    user_progress: []
  };
  fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2));
  console.log('Fichier database.json créé avec la structure complète !');
}

function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

module.exports = { readDB, writeDB };