# SKYE PROMPT ENGINE

AI-powered image → perfect prompt. Upload reference → get perfectly formatted prompt for your model. LoRA swap built in.

## Deploy to Vercel (5 minutes, free)

1. Go to github.com → New repository → name it `skye-prompt-engine`
2. Upload all files from this folder into the repo
3. Go to vercel.com → Sign up with GitHub → Add New Project → Import repo → Deploy
4. Done. You get a permanent URL.

## Run Locally

```bash
npm install
npm run dev
```
Open http://localhost:3000 — requires Node.js 18+

## Get Your Free API Key

console.anthropic.com → API Keys → Create Key → paste into app

## What's Baked In

All prompt engineering knowledge lives in src/lib/prompts.js — Z-Image Turbo rules, LoRA swap logic, all 5 model formats. Edit anytime to add models or update rules.
