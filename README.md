# AI Travel Planner ✈️

The **AI Travel Planner** is a full-stack web application that allows users to generate, customize, and manage detailed travel itineraries, hotel suggestions, and budget estimates using AI.

## 🚀 Public Repository URL
Codebase pushed to: **[https://github.com/SureshGopi17/ai-travel-planner](https://github.com/SureshGopi17/ai-travel-planner)**

## 🌐 Deploy to Vercel (Frontend Client)
Deploy the Next.js frontend in one click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSureshGopi17%2Fai-travel-planner&root-directory=client)

---

## 🛠️ Tech Stack
- **Frontend**: Next.js (App Router, TypeScript) + Tailwind CSS + Lucide React
- **Backend**: Node.js + Express + TypeScript + Mongoose
- **Database**: MongoDB (runs in-memory via `mongodb-memory-server` for instant local development, supports `MONGO_URI` env for production)
- **AI Engine**: Google Gemini API (`@google/generative-ai`) with a smart offline mock generator fallback

---

## ✨ Features
1. **Secure Authentication & Isolation**: JWT token-based auth. Users can only view, edit, or delete their own travel data.
2. **AI Itinerary Generator**: Generates day-by-day activities based on interests, destination, and budget level.
3. **Editable Days**: Add custom activities, delete plans, or regenerate a specific day with a tailored AI prompt.
4. **Hotel Suggestions**: Curated hotel listings divided into Budget, Mid Range, and Luxury tiers.
5. **Interactive Packing Checklist**: (Custom Feature) Custom check-off checklist generated based on trip duration and selected interests, synced to the database.
6. **Travel Expense Tracker**: (Custom Feature) Add and delete actual spending records, comparing actual spent vs. AI estimate category-by-category in a progress gauge panel.

---

## 💻 Local Development Setup

### Prerequisites
Make sure you have Node.js (v18+) and npm installed.

### 1. Set up the Backend Server
1. Navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```env
   PORT=5000
   JWT_SECRET=your_jwt_secret_key
   MONGO_URI=                   # Leave empty to auto-launch the local in-memory DB
   GEMINI_API_KEY=              # Optional: Add your Gemini API key to use live AI
   ```
4. Start the server in development mode:
   ```bash
   npm run dev
   ```
   The backend will be running at `http://localhost:5000`.

### 2. Set up the Frontend Client
1. Navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   The client will be running at `http://localhost:3000`.

---

## 🌐 Public Deployment Guidelines

### Frontend (Next.js)
Deploy the `client/` directory to **Vercel**:
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project** and import your `ai-travel-planner` repository.
3. Under **Root Directory**, select **`client`**.
4. Click **Deploy**. Vercel will build and provide a public URL for your frontend!

### Backend (Express)
Deploy the `server/` directory to **Render**, **Railway**, or **Fly.io**:
1. Log in to [Render](https://render.com/).
2. Create a new **Web Service** and connect your GitHub repository.
3. Set the **Root Directory** to `server`.
4. Set the **Build Command** to `npm run build` (runs the TypeScript compiler).
5. Set the **Start Command** to `npm start`.
6. Add your environment variables:
   - `JWT_SECRET`
   - `MONGO_URI` (Use a free MongoDB cluster from MongoDB Atlas)
   - `GEMINI_API_KEY` (Your Gemini API key)
