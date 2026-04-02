# FinTrack

> Personal finance tracker with AI-powered transaction entry. Built with React + Vite + Supabase.

![Nothing Design System](https://img.shields.io/badge/design-Nothing_Inspired-000?style=flat-square&labelColor=1F1F1F)
![Vite](https://img.shields.io/badge/vite-8.x-646CFF?style=flat-square&logo=vite&logoColor=white)
![React](https://img.shields.io/badge/react-19.x-61DAFB?style=flat-square&logo=react&logoColor=white)

## Features

- **AI Transaction Entry** — Describe expenses in natural language and let Qwen 3.6 (via OpenRouter) parse and categorize them automatically.
- **Interactive Calendar** — Monthly grid view with per-day income/expense indicators and detail panel.
- **Advanced Reports** — Month-selectable dashboard with KPIs, burn rates, and transaction logs.
- **Budget Tracking** — Set monthly limits per category with visual progress bars and overspend alerts.
- **Category Management** — Custom categories with emoji and color coding.
- **Nothing Design System** — OLED-black, typographically-driven UI inspired by industrial design. Space Grotesk + Space Mono + Doto fonts.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Tailwind CSS 4 |
| Backend | Supabase (Postgres + Auth) |
| AI | OpenRouter API → Qwen 3.6 Plus Preview |
| Fonts | Space Grotesk, Space Mono, Doto (Google Fonts) |

## Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USER/fintrack.git
cd fintrack

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env
# Edit .env with your Supabase and OpenRouter credentials

# 4. Run development server
npm run dev
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key |
| `VITE_OPENROUTER_API_KEY` | OpenRouter API key for AI features |

## Database Schema

The app expects these Supabase tables with RLS enabled:

- `categories` — id, user_id, name, emoji, color
- `transactions` — id, user_id, amount, description, category_id, type, date
- `budgets` — id, user_id, category_id, monthly_limit, month

See `supabase-schema.sql` for the full schema with Row Level Security policies.

## License

MIT
