const express = require('express');
const router  = express.Router();
const Groq    = require('groq-sdk');

const groq  = new Groq({ apiKey: process.env.GROQ_API_KEY });
const cache = {};

const LEVELS = {
  A1: "very simple, daily vocabulary, present simple only",
  A2: "simple, short sentences, present and past tense",
  B1: "intermediate, varied sentences, multiple tenses",
  B2: "upper-intermediate, complex structures",
  C1: "advanced, idiomatic expressions",
  C2: "mastery, sophisticated phrasing"
};

function build_prompt(level, station) {
  return `Generate 9 English exercises for French learners. Level: ${level} (${LEVELS[level]}). Station: ${station}.
Return ONLY this JSON, nothing else:
{
  "traduction": [
    {"id":"t1","phrase":"English sentence","solution":"French translation"},
    {"id":"t2","phrase":"...","solution":"..."},
    {"id":"t3","phrase":"...","solution":"..."}
  ],
  "gap": [
    {"id":"g1","phrase":"Sentence with ___","propositions":["correct","wrong1","wrong2"],"solution":"correct"},
    {"id":"g2","phrase":"...","propositions":["...","...","..."],"solution":"..."},
    {"id":"g3","phrase":"...","propositions":["...","...","..."],"solution":"..."}
  ],
  "qcm": [
    {"id":"q1","phrase":"English sentence","choices":["correct French","wrong1","wrong2","wrong3"],"solution":"correct French"},
    {"id":"q2","phrase":"...","choices":["...","...","...","..."],"solution":"..."},
    {"id":"q3","phrase":"...","choices":["...","...","...","..."],"solution":"..."}
  ]
}`;
}

router.get('/', async (req, res) => {
  const { level = 'A1', station = '1' } = req.query;
  const key = `${level}_${station}`;

  if (cache[key]) return res.json({ challenges: cache[key], cached: true });

  try {
    const completion = await groq.chat.completions.create({
      model          : 'llama-3.3-70b-versatile',
      messages       : [{ role: 'user', content: build_prompt(level, station) }],
      temperature    : 0.7,
      max_tokens     : 1500,
      response_format: { type: 'json_object' }
    });

    const data = JSON.parse(completion.choices[0].message.content);
    cache[key] = data;
    res.json({ level, station, challenges: data });

  } catch (err) {
    console.error('Groq error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;