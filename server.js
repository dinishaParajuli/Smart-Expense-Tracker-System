const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const path = require('path');

const app = express();
const PORT = 5000;

// ────────────────────────────────────────────────
// Database setup
const file = path.join(__dirname, 'db.json');
const adapter = new JSONFile(file);

const defaultData = { goals: [], challenges: [] };
const db = new Low(adapter, defaultData);

// 🟢 Initialize DB properly
async function initDB() {
  await db.read();          // read file
  db.data ||= defaultData;  // fallback if empty
  await db.write();         // ensure file exists
}

initDB();

// ────────────────────────────────────────────────
// Middleware
app.use(cors());
app.use(express.json());

// 🟢 Root route (fixes your "Cannot GET /")
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});

// ────────────────────────────────────────────────
// GOALS ROUTES

app.get('/api/goals', async (req, res) => {
  await db.read();
  res.json(db.data.goals);
});

app.post('/api/goals', async (req, res) => {
  await db.read();

  const newGoal = {
    id: Date.now(),
    ...req.body,
    current: req.body.current || 0
  };

  db.data.goals.push(newGoal);
  await db.write();

  res.status(201).json(newGoal);
});

app.put('/api/goals/:id', async (req, res) => {
  await db.read();

  const id = Number(req.params.id);
  const index = db.data.goals.findIndex(g => g.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Goal not found' });
  }

  db.data.goals[index] = {
    ...db.data.goals[index],
    ...req.body
  };

  await db.write();
  res.json(db.data.goals[index]);
});

app.delete('/api/goals/:id', async (req, res) => {
  await db.read();

  const id = Number(req.params.id);
  db.data.goals = db.data.goals.filter(g => g.id !== id);

  await db.write();
  res.status(204).send();
});

// ────────────────────────────────────────────────
// CHALLENGES ROUTES

app.get('/api/challenges', async (req, res) => {
  await db.read();
  res.json(db.data.challenges);
});

app.post('/api/challenges', async (req, res) => {
  await db.read();

  const newChallenge = {
    id: Date.now(),
    ...req.body
  };

  db.data.challenges.push(newChallenge);
  await db.write();

  res.status(201).json(newChallenge);
});

// ────────────────────────────────────────────────
// Start server
app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});