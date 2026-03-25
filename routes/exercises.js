const express = require('express');
const router  = require('express').Router();
const Groq    = require('groq-sdk');
const Exercise = require('../models/Exercise');
require('dotenv').config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const LEVELS = {
  A1: "very simple, daily vocabulary, present simple only",
  A2: "simple, short sentences, present and past tense",
  B1: "intermediate, varied sentences, multiple tenses",
  B2: "upper-intermediate, complex structures",
  C1: "advanced, idiomatic expressions",
  C2: "mastery, sophisticated phrasing"
};

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function build_prompt(type, level, theme) {
  const desc = LEVELS[level];
  const prompts = {
    traduction: `Generate exactly 9 English-to-French translation exercises. Level: ${level} (${desc}). Topic: ${theme}. All exercises must be about this topic. Return ONLY this JSON:
{"exercises":[{"phrase":"English sentence","solution":"French translation"},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."},{"phrase":"...","solution":"..."}]}`,

    gap: `Generate exactly 9 fill-in-the-gap exercises in English. Level: ${level} (${desc}). Topic: ${theme}. All exercises must be about this topic. Return ONLY this JSON:
{"exercises":[{"phrase":"Sentence with ___","propositions":["correct","wrong1","wrong2"],"solution":"correct"},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."},{"phrase":"...","propositions":["...","...","..."],"solution":"..."}]}`,

    qcm: `Generate exactly 9 multiple choice exercises. English sentence, choose the correct French translation. Level: ${level} (${desc}). Topic: ${theme}. All exercises must be about this topic. Return ONLY this JSON:
{"exercises":[{"phrase":"English sentence","choices":["correct French","wrong1","wrong2","wrong3"],"solution":"correct French"},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."},{"phrase":"...","choices":["...","...","...","..."],"solution":"..."}]}`
  };
  return prompts[type];
}

async function generate_type(type, level, station_id, theme) {
  try {
    const completion = await groq.chat.completions.create({
      model          : 'llama-3.3-70b-versatile',
      messages       : [{ role: 'user', content: build_prompt(type, level, theme) }],
      temperature    : 0.7,
      max_tokens     : 2000,
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.choices[0].message.content);

    if (!data.exercises || !Array.isArray(data.exercises)) {
      throw new Error(`Format invalide pour ${type}`);
    }

    return data.exercises.map((ex) => ({
      ...ex,
      station_id,
      type
    }));

  } catch (err) {
    console.error(`Erreur génération ${type}:`, err.message, err.stack);
    return [];
  }
}


const fs = require('fs');
const path = require('path');

function readStations() {
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '../database.json'), 'utf8'));
  return data.stations;
}

router.get('/', async (req, res) => {
  const { level, station } = req.query;

  if (!level || !station) {
    return res.status(400).json({ error: 'Paramètres level et station requis' });
  }

  const station_id = `${level}_${station}`;

  try {
    const stations = readStations();
    const station_info = stations.find(s => s.id === station_id);
    if (!station_info) {
      return res.status(404).json({ error: `Station ${station_id} introuvable` });
    }

    const pool = await Exercise.find({ station_id });
    const pool_t = pool.filter(e => e.type === 'traduction');
    const pool_g = pool.filter(e => e.type === 'gap');
    const pool_q = pool.filter(e => e.type === 'qcm');

    const pool_ready = pool_t.length >= 9 && pool_g.length >= 9 && pool_q.length >= 9;

    console.log(`Pool ${station_id}: traduction=${pool_t.length}, gap=${pool_g.length}, qcm=${pool_q.length}, ready=${pool_ready}`);

    if (!pool_ready) {
      console.log(` Génération du pool ${station_id} — thème: ${station_info.theme}`);

      const promises = [];
      if (pool_t.length < 9) promises.push(generate_type('traduction', level, station_id, station_info.theme));
      if (pool_g.length < 9) promises.push(generate_type('gap',        level, station_id, station_info.theme));
      if (pool_q.length < 9) promises.push(generate_type('qcm',        level, station_id, station_info.theme));

      console.log(` Appel Groq en cours pour ${promises.length} type(s)...`);
      const results = await Promise.all(promises);
      const new_exercises = results.flat();

      if (new_exercises.length === 0) {
        console.error(' Aucun exercice généré — vérifiez la clé GROQ_API_KEY');
        return res.status(500).json({ error: 'Impossible de générer les exercices' });
      }

      // Sauvegarder dans MongoDB
      await Exercise.insertMany(new_exercises);
      console.log(` ${new_exercises.length} exercices sauvegardés.`);

      // Re-fetch pool complet
      const final_pool = await Exercise.find({ station_id });
      const final_t = final_pool.filter(e => e.type === 'traduction');
      const final_g = final_pool.filter(e => e.type === 'gap');
      const final_q = final_pool.filter(e => e.type === 'qcm');

      const selected = shuffle([
        ...shuffle(final_t).slice(0, 3),
        ...shuffle(final_g).slice(0, 3),
        ...shuffle(final_q).slice(0, 3)
      ]);

      return res.json({ station: station_info, challenges: selected, generated: true });
    }

    const selected = shuffle([
      ...shuffle(pool_t).slice(0, 3),
      ...shuffle(pool_g).slice(0, 3),
      ...shuffle(pool_q).slice(0, 3)
    ]);

    res.json({ station: station_info, challenges: selected, generated: false });

  } catch (err) {
    console.error('Erreur exercises:', err.message);
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;