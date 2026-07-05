# Ladle AI — Recipe Generator & Meal Planner

An AI-powered recipe generator and meal planner built with Vite + React,
Supabase (auth + database), Groq (text + vision AI), and Resend (email).

## Features

- **Supabase authentication** — email/password sign up and sign in
- **Protected routes** — dashboard, recipes, generator, and meal planner require a session
- **CRUD** — recipes and meal plans can be created, read, updated, and deleted
- **Analytics dashboard** — Recharts visualizations of your saved recipes (cuisine mix, calories, top ingredients, saving frequency)
- **Groq AI** — turns an ingredient list into a full structured recipe
- **Groq Vision** — reads a photo of your fridge/pantry and extracts an ingredient list
- **Resend** — sends a welcome email on signup, and lets you email any saved recipe to yourself
- **Landing page** — public marketing page distinct from the authenticated app

## Architecture

```
src/            Vite + React frontend (client-side only, no secrets here)
api/            Vercel serverless functions (Node) — hold all secret API keys
supabase/       SQL schema + Row Level Security policies
```

The frontend never talks to Groq or Resend directly — it calls `/api/*`
routes, which verify the caller's Supabase session token server-side before
using the secret `GROQ_API_KEY` / `RESEND_API_KEY`. This keeps your keys out
of the browser bundle.

## 1. Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** → paste the contents of `supabase/schema.sql` → **Run**.
   This creates `profiles`, `recipes`, `favorites`, `meal_plans`, and
   `meal_plan_items`, all with Row Level Security enabled so users can only
   ever see their own data.
3. Go to **Project Settings → API** and copy:
   - `Project URL` → `VITE_SUPABASE_URL` and `SUPABASE_URL`
   - `anon public` key → `VITE_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (keep this secret — server-side only)
4. Under **Authentication → Providers**, email/password is enabled by default.
   Optionally disable "Confirm email" for faster local testing.

## 2. Groq setup

1. Get an API key at [console.groq.com](https://console.groq.com).
2. Set it as `GROQ_API_KEY`.
3. The app uses `llama-3.3-70b-versatile` for recipe generation and
   `meta-llama/llama-4-scout-17b-16e-instruct` for vision. If Groq renames or
   deprecates either model, swap the `model:` string in `api/generate-recipe.js`
   / `api/analyze-image.js`.

## 3. Resend setup

1. Get an API key at [resend.com](https://resend.com).
2. Set it as `RESEND_API_KEY`.
3. Verify a sending domain, or use the Resend sandbox address
   (`onboarding@resend.dev`) for testing, as `RESEND_FROM_EMAIL`.

## 4. Environment variables

Copy the example file and fill in your real values:

```bash
cp .env.example .env
```

## 5. Run locally

This project mixes a Vite frontend with Vercel serverless functions, so use
the Vercel CLI for local dev — it runs both together and reads `.env`
automatically.

```bash
npm install -g vercel   # one-time
npm install
vercel dev
```

`vercel dev` serves the Vite app and the `/api` functions on the same port
(usually `http://localhost:3000`), so everything works exactly as it will in
production. On first run it will ask to link the project — choose "no" if
you just want to run locally without linking to a Vercel account yet.

Alternatively, for frontend-only work without the AI endpoints, you can run
`npm run dev` directly (Vite on `http://localhost:5173`), but `/api` calls
will fail until you also run a Vercel/Node backend.

## 6. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit: AI recipe generator & meal planner"
git branch -M main
git remote add origin https://github.com/<your-username>/ladle-ai.git
git push -u origin main
```

## 7. Deploy to Vercel

```bash
vercel login
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add GROQ_API_KEY
vercel env add RESEND_API_KEY
vercel env add RESEND_FROM_EMAIL
vercel --prod
```

Or connect the GitHub repo in the Vercel dashboard (Import Project → select
repo) and add the same environment variables under **Settings → Environment
Variables** — every push to `main` will then auto-deploy.

## Database schema summary

| Table              | Purpose                                          |
|---------------------|---------------------------------------------------|
| `profiles`          | One row per user, auto-created on signup          |
| `recipes`           | User's saved recipes (manual or AI-generated)     |
| `favorites`         | Recipe ↔ user favoriting join table               |
| `meal_plans`        | Named weekly plans per user                       |
| `meal_plan_items`   | Recipe assigned to a day/meal-type within a plan  |

All tables have Row Level Security enabled — a user can only read or write
rows where `user_id = auth.uid()` (or, for `meal_plan_items`, where the
parent `meal_plan` belongs to them).

## Tech stack

- Vite + React + React Router
- Supabase (Postgres, Auth, RLS)
- Groq SDK (`llama-3.3-70b-versatile`, `llama-4-scout` vision)
- Resend (transactional email)
- Recharts (analytics dashboard)
- Vercel (hosting + serverless functions)
