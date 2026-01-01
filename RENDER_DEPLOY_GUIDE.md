# Render Deployment Guide

Follow these steps to finish moving your backend to Render.

## 1. Connect to Render
1. Go to [Render.com](https://dashboard.render.com/) and sign in with GitHub.
2. Click **New +** → **Blueprint**.
3. Select your repository: `ethio-safeguard.`

## 2. Configuration
- Render will read the `render.yaml` file I created.
- It will ask for a **MONGO_URI**.
- Paste your **MongoDB Atlas** connection string into that box.
- Click **Apply**.

## 3. Final Step for Vercel
1. Once Render says "Live", copy the URL it gives you (e.g., `https://ethio-backend.onrender.com`).
2. Go to your **Vercel Dashboard** → **Settings** → **Environment Variables**.
3. Create/Update the variable `VITE_API_URL` and paste that Render URL.

Your site will now be fully connected with real-time tracking!
