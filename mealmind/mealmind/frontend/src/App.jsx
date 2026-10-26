import { useEffect, useState } from 'react';

const API = import.meta.env.VITE_API_URL || '';
const IDEAS = ['rice', 'egg', 'onion', 'tomato', 'potato', 'garlic', 'chilli', 'dal'];
const store = () => localStorage.getItem('mm_token') || sessionStorage.getItem('mm_token');

async function api(path, { method = 'GET', body, token } = {}) {
  const res = await fetch(API + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || 'Something went wrong.'), { status: res.status });
  return data;
}

const PATHS = {
  search: <><circle cx="11" cy="11" r="6" /><path d="M16 16l5 5" /></>,
  ring: <><circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="3.5" /></>,
  leaf: <><path d="M5 19C5 10 10 5 19 5c0 9-5 14-14 14z" /><path d="M5 19l8-8" /></>,
  list: <path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" />,
  lock: <><rect x="5" y="11" width="14" height="9" rx="2" /><path d="M8 11V8a4 4 0 018 0v3" /></>,
  mail: <><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></>,
  eye: <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>,
};
const Icon = ({ n }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{PATHS[n]}</svg>;

const Logo = ({ big }) => (
  <span className={big ? 'logo big' : 'logo'}>
    <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 40C6 20 18 6 30 6c2 16-6 32-22 34z" fill="#1f7a56" /><circle cx="32" cy="27" r="11" fill="#f08a3c" /><path d="M28 22c3 1 3 4 0 5m4 0c3 1 3 4 0 5" stroke="#fff" strokeWidth="1.6" fill="none" strokeLinecap="round" /></svg>
    <b>MealMind<em> AI</em></b>
  </span>
);

const Bowl = () => (
  <svg className="bowl" viewBox="0 0 300 300" role="img" aria-label="A healthy salad bowl">
    <circle cx="150" cy="150" r="145" fill="#f4efe4" stroke="#d9d2bd" strokeWidth="3" /><circle cx="150" cy="150" r="115" fill="#e5efd6" />
    {[[100,90,38],[150,70,34],[205,95,36],[85,160,34],[215,170,30],[130,215,32]].map(([x,y,r],i)=><ellipse key={i} cx={x} cy={y} rx={r} ry={r*.7} fill={i%2?'#5aa469':'#3f8f55'} transform={`rotate(${i*30} ${x} ${y})`} />)}
    <ellipse cx="170" cy="150" rx="46" ry="30" fill="#e8c98e" transform="rotate(-25 170 150)" /><ellipse cx="120" cy="130" rx="40" ry="26" fill="#dcb67a" transform="rotate(15 120 130)" />
    <ellipse cx="200" cy="130" rx="26" ry="38" fill="#b9d56a" /><circle cx="200" cy="132" r="10" fill="#6b4a2f" />
    <ellipse cx="105" cy="195" rx="30" ry="22" fill="#7c3f78" />
    {[[150,110],[85,205],[215,200],[140,185],[110,100]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="13" fill="#d8402f" />)}
    {[[160,175],[185,190],[95,150],[175,100]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="4" fill="#f0c24a" />)}
  </svg>
);

const FEATURES = [
  ['search', 'Find by Ingredients', 'Type what is in your kitchen and get recipes instantly.'],
  ['ring', 'Match Score', 'See how many ingredients you already have for every recipe.'],
  ['leaf', 'Waste Less Food', 'Cook with what you have before it goes to waste.'],
  ['list', 'Easy Cooking Steps', 'Simple steps you can tick off as you cook.'],
  ['lock', 'Safe & Secure', 'Hashed passwords and a private login for every user.'],
];

function Home({ go }) {
  return (
    <>
      <section className="hero">
        <div>
          <h1>Smarter Meals.<br /><span>Healthier You.</span></h1>
          <p>MealMindAI helps you cook delicious meals from the ingredients you already have, and waste less food.</p>
          <button className="btn" onClick={() => go('register')}>Start Your Journey →</button>
        </div>
        <div className="art"><Bowl /><span className="script">Good Food<br />Good Mood ♡</span></div>
      </section>
      <section id="features" className="strip">
        {FEATURES.map(([i, t, d]) => <div key={t}><span className="ico"><Icon n={i} /></span><h4>{t}</h4><p>{d}</p></div>)}
      </section>
      <section id="about" className="assist">
        <div>
          <small>YOUR PERSONAL</small><h2>Food Assistant</h2>
          <p>Not sure what to cook? Tell MealMindAI what is in your kitchen and it finds the meal for you.</p>
          <a className="btn sm" href="#features">Explore Features →</a>
        </div>
        <div className="phone">
          <p>Hi! What's in your kitchen?</p>
          <div className="chips"><span>rice</span><span>egg</span><span>onion</span></div>
          {[['Egg Fried Rice', '60%'], ['Veg Omelette', '40%'], ['Bread Toast Egg', '40%']].map(([t, p]) => <div key={t} className="row"><i />{t}<b>{p}</b></div>)}
        </div>
      </section>
    </>
  );
}

function AuthCard({ mode, setMode, onAuth }) {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState('');
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const login = mode === 'login';

  async function submit(e) {
    e.preventDefault(); setError('');
    try { onAuth(await api(login ? '/api/login' : '/api/register', { method: 'POST', body: form }), remember); }
    catch (err) { setError(err.message); }
  }
  return (
    <div className="authbg">
      <form className="authcard" onSubmit={submit}>
        <Logo big />
        <h2>{login ? 'Welcome Back!' : 'Create your account'}</h2>
        <p className="sub">{login ? 'Log in to continue your healthy journey' : 'Start cooking smarter today'}</p>
        {!login && <label className="field"><input placeholder="Full name" value={form.name} onChange={set('name')} required aria-label="Name" /></label>}
        <label className="field"><Icon n="mail" /><input type="email" placeholder="Email address" value={form.email} onChange={set('email')} required aria-label="Email" /></label>
        <label className="field"><Icon n="lock" /><input type={show ? 'text' : 'password'} placeholder="Password" value={form.password} onChange={set('password')} minLength={login ? undefined : 6} required aria-label="Password" />
          <button type="button" className="eye" onClick={() => setShow(!show)} aria-label="Show password"><Icon n="eye" /></button></label>
        {login && <label className="remember"><input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} /> Remember me</label>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn full">{login ? 'Log In' : 'Create Account'}</button>
        <p className="swap">{login ? "Don't have an account?" : 'Already have an account?'} <button type="button" onClick={() => { setMode(login ? 'register' : 'login'); setError(''); }}>{login ? 'Sign Up' : 'Log In'}</button></p>
      </form>
      <span className="script low">Good Food<br />Better Days ♡</span>
    </div>
  );
}

function Shelf({ items, setItems }) {
  const [v, setV] = useState('');
  const add = (t) => { const x = t.trim().toLowerCase(); if (x && !items.includes(x)) setItems([...items, x]); setV(''); };
  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(v); }
    else if (e.key === 'Backspace' && !v && items.length) setItems(items.slice(0, -1));
  };
  return (
    <div className="shelf">
      {items.map((i) => <button type="button" key={i} className="jar" onClick={() => setItems(items.filter((x) => x !== i))} aria-label={`Remove ${i}`}>{i} <span>×</span></button>)}
      <input value={v} onChange={(e) => setV(e.target.value)} onKeyDown={onKey} onBlur={() => add(v)} placeholder={items.length ? 'add more…' : 'type an ingredient, press Enter'} aria-label="Ingredient" />
    </div>
  );
}

function Steps({ steps }) {
  const [done, setDone] = useState([]);
  const toggle = (i) => setDone(done.includes(i) ? done.filter((x) => x !== i) : [...done, i]);
  return (
    <ol className="steps">{steps.map((s, i) => (
      <li key={i} className={done.includes(i) ? 'done' : ''}><button type="button" onClick={() => toggle(i)} aria-pressed={done.includes(i)}><b>{i + 1}</b><span>{s}</span></button></li>
    ))}</ol>
  );
}

function Recipe({ r, best }) {
  const pct = Math.round((r.have / r.total) * 100);
  return (
    <article className="card recipe">
      {best && <span className="ribbon">Best match</span>}
      <header>
        <div><h3>{r.title}</h3><p className="count">You have {r.have} of {r.total} ingredients</p></div>
        <div className="ring" style={{ '--p': pct }} role="img" aria-label={`${pct} percent match`}><b>{pct}%</b></div>
      </header>
      <div className="tags">{r.ingredients.map((i) => <span key={i} className={r.missing.includes(i) ? 'tag need' : 'tag have'}>{r.missing.includes(i) ? '+ ' : '✓ '}{i}</span>)}</div>
      <Steps steps={r.steps} />
    </article>
  );
}

function Finder({ token, onExpired }) {
  const [items, setItems] = useState([]);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  async function search(e) {
    e.preventDefault(); setError('');
    try { setResults((await api('/api/meals/search', { method: 'POST', body: { ingredients: items }, token })).results); }
    catch (err) { if (err.status === 401) return onExpired(); setError(err.message); }
  }
  return (
    <div className="finder">
      <form className="card pantry" onSubmit={search}>
        <h2>What’s in your kitchen?</h2>
        <Shelf items={items} setItems={setItems} />
        {!items.length && <p className="ideas">Try: {IDEAS.map((i) => <button type="button" key={i} onClick={() => setItems([...items, i])}>{i}</button>)}</p>}
        {error && <p className="error" role="alert">{error}</p>}
        <button className="btn full">Find meals</button>
      </form>
      {results && results.length === 0 && <p className="empty">Nothing matches yet. Add another ingredient.</p>}
      {results?.map((r, i) => <Recipe key={r._id} r={r} best={i === 0} />)}
    </div>
  );
}

export default function App() {
  const [token, setToken] = useState(store);
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(!!token);
  const [view, setView] = useState('home');

  const logout = () => { localStorage.removeItem('mm_token'); sessionStorage.removeItem('mm_token'); setToken(null); setUser(null); setView('home'); };
  const onAuth = ({ token, user }, remember = true) => { (remember ? localStorage : sessionStorage).setItem('mm_token', token); setToken(token); setUser(user); };
  useEffect(() => {
    if (!token) return setChecking(false);
    api('/api/me', { token }).then((d) => setUser(d.user)).catch(logout).finally(() => setChecking(false));
  }, []);

  if (checking) return <p className="empty">Loading…</p>;
  if (!user && (view === 'login' || view === 'register')) return <AuthCard mode={view} setMode={setView} onAuth={onAuth} />;
  return (
    <div className="site">
      <nav className="nav">
        <button className="brand" onClick={() => setView('home')} aria-label="Home"><Logo /></button>
        {!user && <div className="links"><a href="#" onClick={() => setView('home')}>Home</a><a href="#features">Features</a><a href="#about">About</a></div>}
        {user ? <div className="who"><span>Hi, {user.name}</span><button className="btn sm" onClick={logout}>Log out</button></div>
          : <div className="who"><button className="textbtn" onClick={() => setView('login')}>Log in</button><button className="btn sm" onClick={() => setView('register')}>Get Started</button></div>}
      </nav>
      {user ? <Finder token={token} onExpired={logout} /> : <Home go={setView} />}
      <footer className="foot"><Logo /><span>Better Food &nbsp;•&nbsp; Better Choices &nbsp;•&nbsp; A Healthier You</span></footer>
    </div>
  );
}
