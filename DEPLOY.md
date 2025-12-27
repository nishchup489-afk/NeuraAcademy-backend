Frontend (Vercel)

- Connect your GitHub repository to Vercel.
- When creating the project, set the Root Directory to `frontend`.
- Build command: `npm run build` (or `pnpm build`).
- Output Directory: `dist`.
- Add an environment variable in Vercel: `VITE_API_URL` = `https://<your-backend-url>` (the Render URL for your backend).
- Deploy. Vercel will serve the static site from `/frontend/dist`.

Backend (Render)

- Create a new Web Service on Render and connect the same GitHub repo.
- Set the Root Directory to `backend`.
- Runtime: Python 3.x matching your environment (e.g., 3.11).
- Build command: leave empty or `pip install -r requirements.txt`.
- Start command: `gunicorn run:app` (Procfile already contains this).
- Add environment variables on Render:
  - `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_URL` (set to your Vercel URL), mail and OAuth keys (do NOT commit these to the repo).
  - `CORS_ORIGINS` = `https://<your-vercel-domain>` (or a comma-separated list).
- Deploy. Render will build and run your Flask app.

CORS & Client API URLs

- The frontend now reads the backend base URL from `import.meta.env.VITE_API_URL`.
- In Render, set `FRONTEND_URL` and `CORS_ORIGINS` to your Vercel domain so the backend accepts requests.

Security & GitHub push protection

- Ensure `.env` is not committed (it's already in `.gitignore`).
- If secrets were previously committed, rotate those secrets (Google OAuth client, API keys, etc.) and remove them from git history before pushing (we started this cleanup earlier).

Monorepo deployment note

- Both Render and Vercel support monorepos: configure each service to use the correct subdirectory (`backend` / `frontend`).

If you want, I can:
- Finish removing `.env` from git history and force-push cleaned history.
- Create sample Render and Vercel environment variable settings for you to copy.
- Deploy a test build locally to verify configuration.
