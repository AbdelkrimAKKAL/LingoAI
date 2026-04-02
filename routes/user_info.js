const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { connectDB } = require('../db');

const UserProgress = require('../models/UserProgress')

// Get User Info
router.get('/get_user_info/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        let user_info = await UserProgress.findOne({ userId });

        if (!user_info) {
            return res.json({ user_info: null }); // pas encore de progress
        }

        res.json({
            user_info: {
                current_level: user_info.current_level,
                current_station: user_info.current_station,
                completed_stations: user_info.completed_stations,
                scoreByLevel: user_info.scoreByLevel,
                completed_levels: user_info.completed_levels
            }
        });
    } catch (err) {
        res.status(500).json({ error: "Erreur serveur", details: err.message });
    }
});

// Set User Info

router.post('/set_user_info', async (req, res) => {
    const {
        email,
        current_level,
        current_station,
        completed_stations,
        scoreByLevel,
        completed_levels } = req.body;

    if (!email) {
        return res.status(400).json({ error: "email est requis" });
    }

    try {

        const user_info = await UserProgress.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    current_level,
                    current_station,
                    completed_stations,
                    scoreByLevel,
                    completed_levels
                }
            },
            {
                upsert: true,
                new: true,
                runValidators: true
            }
        );

        res.json({ success: true, data: user_info });

    } catch (err) {
        console.error("Erreur de SET des donnees:", err);
        res.status(500).json({ error: "Erreur serveur", details: err.message });
    }
});


// Get Stations by Level
router.get('/stations/:level', (req, res) => {
    const level = req.params.level;
    try {
        const databasePath = path.join(__dirname, '../database.json');
        const data = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        const stations = data.stations.filter(s => s.level === level);
        res.json({ stations });
    } catch (err) {
        console.error("Erreur lecture database.json:", err);
        res.status(500).json({ error: "Erreur lecture database", details: err.message });
    }
});


module.exports = router;