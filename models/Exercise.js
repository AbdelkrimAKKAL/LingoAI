const mongoose = require('mongoose');

const ExerciseSchema = new mongoose.Schema({
  station_id: String,
  type: String, // 'traduction', 'gap', 'qcm'
  phrase: String,
  solution: String,
  propositions: [String], //'gap'
  choices: [String],      //'qcm'
});

module.exports = mongoose.model('Exercise', ExerciseSchema);