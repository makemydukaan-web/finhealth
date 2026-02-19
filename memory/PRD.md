# finHealth — Product Requirements Document

## Project Overview
finHealth is a Financial Health Score web app for Indian salaried professionals. Phase 1 is a production-ready SPA with deterministic scoring, Supabase lead capture, and Cloudflare Pages deployment.

**Last updated:** February 2026

---

## Tech Stack
- **Frontend:** Vite + React 19 + TypeScript + TailwindCSS v4 + Framer Motion + Recharts
- **Database:** Supabase (PostgreSQL) — for lead capture only
- **Deployment:** Cloudflare Pages (SPA with `_redirects`)
- **Design:** Poppins font, Saffron #FF9933, Green #138808, Navy #000080

---

## Core Architecture

```
/app/
├── client/
│   ├── .env                          # VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
│   ├── public/_redirects             # Cloudflare Pages SPA routing
│   └── src/
│       ├── utils/
│       │   ├── scoring.ts            # Deterministic scoring engine
│       │   └── allocation.ts         # Asset allocation logic
│       ├── lib/
│       │   ├── types.ts              # TypeScript interfaces
│       │   ├── quiz-data.ts          # 8 questions
│       │   └── supabaseClient.ts     # Supabase JS client
│       ├── components/
│       │   ├── landing-view.tsx
│       │   ├── question-view.tsx
│       │   └── results-view.tsx      # Score + Pillars + Chart + Workshop Form
│       └── pages/home.tsx            # Quiz state machine (steps 0–10)
├── vite.config.ts                    # outDir: dist (Cloudflare compatible)
└── frontend/package.json             # Supervisor wrapper for port 3000
```

---

## User Personas
- Indian salaried professional, 25–45 years old
- Has some savings but unsure if they're on track
- Wants simple, non-intimidating financial guidance
- Looking for a starting point for wealth building

---

## Core Requirements (Static)

### Quiz Flow
- 8 questions, one per screen
- Progress bar, back button, smooth transitions
- No signup required

### Question List
1. Age (6 options: Under 25, 25-30, 30-35, 35-40, 40-45, 45+)
2. Monthly Salary (4 options)
3. Monthly Expenses (4 options)
4. Total Savings (5 options)
5. EMIs/Loans (4 options)
6. Insurance (3 options)
7. Market reaction (3 options)
8. Primary goal (5 options)

### Deterministic Scoring Engine
- Total: 100 points across 5 pillars
- Savings Rate (25): Based on (income-expenses)/income ratio
- Emergency Fund (25): Savings vs 6x monthly expenses
- Risk Alignment (20): Based on market behavior answer
- Debt Health (15): Type of loans
- Insurance (15): Coverage type

### Asset Allocation
- Equity: 100-age, adjusted for behavior, clamped 35-75%
- Gold: Fixed 10%
- Debt: 100 - equity - 10

### Results Page
- Score circle (color-coded: Red<40, Orange 40-60, Yellow 60-75, Green 75+)
- 5 pillar progress bars
- Recharts pie chart (Equity/Debt/Gold)
- Emergency fund card (6 × monthly expenses)
- 3 action items (weakest pillars)
- Workshop interest form (Supabase INSERT)

### Supabase Lead Capture
- Table: `leads`
- Fields: id, name, email, phone, score, equity_percent, debt_percent, gold_percent, emergency_required, interested, created_at
- RLS: anon can INSERT, cannot SELECT

---

## What's Been Implemented (Phase 1 Complete)

### 2026-02-19 — Initial Implementation
- [x] Landing page with feature pills and CTA
- [x] 8-question quiz flow with progress bar and back button
- [x] Deterministic scoring engine (scoring.ts + allocation.ts)
- [x] Results page with score circle, pillar breakdown, pie chart, emergency fund card
- [x] 3 deterministic action items based on weakest pillars
- [x] Workshop interest form with Supabase client integration
- [x] Graceful error handling for Supabase submissions
- [x] Cloudflare Pages `_redirects` file (correct plain text format)
- [x] Build outDir set to `dist` for Cloudflare Pages
- [x] Accessibility: ARIA roles on progress bar
- [x] All interactive elements have data-testid attributes
- [x] Poppins + Inter fonts loaded from Google Fonts
- [x] Saffron/Green/Navy color scheme

---

## Supabase SQL (Run in Supabase SQL Editor)

```sql
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  score integer,
  equity_percent integer,
  debt_percent integer,
  gold_percent integer,
  emergency_required integer,
  interested boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anon insert" ON leads
  FOR INSERT TO anon
  WITH CHECK (true);
```

---

## Prioritized Backlog

### P0 (Required for Go-Live)
- [ ] Run Supabase SQL to create `leads` table + RLS policies
- [ ] Deploy to Cloudflare Pages (build output: `dist/`)

### P1 (Phase 2 Features)
- [ ] Share score card (PNG/social) feature
- [ ] Email confirmation on workshop signup
- [ ] Admin dashboard to view leads

### P2 (Future)
- [ ] Detailed comparison: "how you rank vs. peers your age"
- [ ] Year-over-year score tracking (with optional auth)
- [ ] Phase 2: AI-powered personalized recommendations
- [ ] Payment integration for ₹999 workshop booking

---

## Deployment Instructions (Cloudflare Pages)

1. Connect GitHub repo to Cloudflare Pages
2. Build command: `npm run build`
3. Build output directory: `dist`
4. Environment variables: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

## Next Action Items
1. Run Supabase SQL (provided above) to enable workshop form submissions
2. Deploy to Cloudflare Pages with build output `dist`
3. Test workshop form submission end-to-end after Supabase table is created
