require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || true }));
app.use(express.json());

// ---------- Models ----------
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true }, // bcrypt hash only
}));
const Recipe = mongoose.model('Recipe', new mongoose.Schema({
  title: String, ingredients: [String], steps: [String],
}));

// ---------- Helpers ----------
const sign = (u) => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
const safe = (u) => ({ id: u._id, name: u.name, email: u.email });
const norm = (s) => s.toLowerCase().trim().replace(/oes$/, 'o').replace(/s$/, '');

const auth = async (req, res, next) => {
  try {
    const token = (req.headers.authorization || '').replace('Bearer ', '');
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(id);
    if (!req.user) throw new Error('no user');
    next();
  } catch {
    res.status(401).json({ error: 'Please log in again.' });
  }
};

// ---------- Auth routes ----------
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: 'Enter your name.' });
  if (!/^\S+@\S+\.\S+$/.test(email || '')) return res.status(400).json({ error: 'Enter a valid email.' });
  if (!password || password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  try {
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
    res.status(201).json({ token: sign(user), user: safe(user) });
  } catch (e) {
    if (e.code === 11000) return res.status(409).json({ error: 'That email is already registered.' });
    res.status(500).json({ error: 'Could not create account.' });
  }
});

app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
    return res.status(401).json({ error: 'Wrong email or password.' });
  res.json({ token: sign(user), user: safe(user) });
});

app.get('/api/me', auth, (req, res) => res.json({ user: safe(req.user) }));

// ---------- Meal finder (logged-in only) ----------
app.post('/api/meals/search', auth, async (req, res) => {
  const have = new Set((req.body.ingredients || []).map(norm).filter(Boolean));
  if (!have.size) return res.status(400).json({ error: 'Enter at least one ingredient.' });
  const recipes = await Recipe.find().lean();
  const results = recipes
    .map((r) => {
      const total = r.ingredients.length;
      const owned = r.ingredients.filter((i) => have.has(norm(i)));
      return { ...r, have: owned.length, total, missing: r.ingredients.filter((i) => !have.has(norm(i))) };
    })
    .filter((r) => r.have > 0)
    .sort((a, b) => b.have / b.total - a.have / a.total || b.have - a.have);
  res.json({ results });
});

// ---------- Seed + start ----------
const seed = [
  { title: 'Egg Fried Rice', ingredients: ['rice', 'egg', 'onion', 'soy sauce', 'oil'], steps: ['Heat oil and fry chopped onion until soft.', 'Push aside, scramble the eggs.', 'Add cooked rice and soy sauce; toss on high heat for 3 minutes.'] },
  { title: 'Tomato Rasam', ingredients: ['tomato', 'tamarind', 'garlic', 'cumin', 'pepper', 'oil'], steps: ['Boil tomato, tamarind water, and crushed garlic with salt.', 'Add ground cumin and pepper; simmer 10 minutes.', 'Temper with oil and mustard seeds.'] },
  { title: 'Veg Omelette', ingredients: ['egg', 'onion', 'tomato', 'chilli', 'oil'], steps: ['Beat eggs with salt.', 'Mix in chopped onion, tomato, and chilli.', 'Cook in hot oil, 2 minutes per side.'] },
  { title: 'Lemon Rice', ingredients: ['rice', 'lemon', 'peanut', 'mustard', 'turmeric', 'oil'], steps: ['Heat oil; pop mustard and fry peanuts.', 'Add turmeric and cooked rice.', 'Turn off heat, stir in lemon juice and salt.'] },
  { title: 'Potato Masala', ingredients: ['potato', 'onion', 'turmeric', 'chilli', 'mustard', 'oil'], steps: ['Boil and mash potatoes.', 'Fry mustard, onion, chilli, turmeric.', 'Mix in potato and salt; cook 5 minutes.'] },
  { title: 'Dal Tadka', ingredients: ['dal', 'onion', 'tomato', 'garlic', 'cumin', 'turmeric'], steps: ['Pressure cook dal with turmeric.', 'Fry cumin, garlic, onion, tomato.', 'Mix into dal and simmer 5 minutes.'] },
  { title: 'Curd Rice', ingredients: ['rice', 'curd', 'mustard', 'chilli', 'ginger'], steps: ['Mash cooked rice with curd and salt.', 'Temper mustard, chilli, ginger in oil.', 'Mix and chill before serving.'] },
  { title: 'Bread Toast Egg', ingredients: ['bread', 'egg', 'onion', 'pepper', 'butter'], steps: ['Beat egg with chopped onion, pepper, salt.', 'Dip bread slices.', 'Toast in butter until golden.'] },
];

mongoose.connect(process.env.MONGO_URI).then(async () => {
  if (!(await Recipe.countDocuments())) await Recipe.insertMany(seed);
  app.listen(process.env.PORT || 5000, () => console.log('MealMindAI API running'));
}).catch((e) => { console.error('DB connection failed:', e.message); process.exit(1); });
