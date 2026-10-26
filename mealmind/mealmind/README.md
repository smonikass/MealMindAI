# MealMindAI

React (Vite) frontend + Node/Express + MongoDB backend.

## Run locally
1. Backend: `cd backend && cp .env.example .env` (fill MONGO_URI, JWT_SECRET), then `npm install && npm run dev`
2. Frontend: `cd frontend && npm install && npm run dev` → open http://localhost:5173

## Deploy on Render
- Backend: Web Service, root `backend`, build `npm install`, start `npm start`. Set env vars MONGO_URI, JWT_SECRET, CLIENT_URL (your frontend URL).
- Frontend: Static Site, root `frontend`, build `npm install && npm run build`, publish dir `dist`. Set VITE_API_URL to the backend URL.
