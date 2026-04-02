const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
    userId: String,
    email: String,
    current_level: String,
    current_station: String,
    completed_stations: [String],
    scoreByLevel: [Number],
    completed_levels: [String]
});

module.exports = mongoose.model('UserProgress', UserProgressSchema);