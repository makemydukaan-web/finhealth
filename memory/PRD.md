# finHealth — Product Requirements Document

## Original Problem Statement
Build finHealth, a financial health score web app for Indian salaried professionals. The application has evolved from a simple 8-question quiz to a comprehensive "Ignite Dashboard" experience.

## Target Users
- Indian salaried professionals (age 25-50)
- Users seeking financial clarity and retirement planning
- Individuals interested in personalized wealth building advice

## Core User Flow
1. **Landing Page** → User starts free assessment
2. **Stage 1 Quiz** (8 questions) → Quick financial snapshot
3. **Basic Results** → Score, allocation recommendations
4. **Teaser Dashboard** → Estimated metrics, CTA to unlock full report
5. **Stage 2 Questionnaire** (5 detailed screens) → Deep dive into finances
6. **Ignite Dashboard** (5 tabs) → Comprehensive wealth analysis
7. **Lead Capture** → Workshop sign-up / 1:1 consultation request

---

## What's Been Implemented

### Phase 1 (COMPLETE) - Basic Quiz
- [x] 8-question financial health quiz
- [x] Deterministic scoring engine
- [x] Results page with score, pillar breakdown, allocation pie chart
- [x] Workshop interest form (Supabase `leads` table)
- [x] Responsive design with light theme

### Phase 2 - Ignite Dashboard (COMPLETE as of 2026-02-21)
- [x] **Teaser Dashboard** (`/teaser`)
  - Estimated score based on Stage 1 answers
  - Dark theme (`#0A0F1E`) with gradient effects
  - DM fonts (Serif/Sans/Mono) loaded
  - Blurred insights preview with unlock CTA

- [x] **Stage 2 Questionnaire** (`/stage2`)
  - 5-step detailed form:
    - Step 1: Income (monthly income, secondary income, job stability, dependents)
    - Step 2: Assets (equity/MF, FDs, EPF/PPF/NPS, gold, real estate, RSU)
    - Step 3: Liabilities (loans, EMIs, credit card debt)
    - Step 4: Protection (term life, health cover, emergency fund)
    - Step 5: Goals (retirement age, risk profile, top 3 goals)
  - Progress indicator with step colors
  - Dark theme styling

- [x] **Ignite Dashboard** (`/ignite`)
  - **Overview Tab**: Wealth Identity Card, key metrics grid, Wealth Mirror (current vs optimized), Peer Benchmarks, Asset Composition
  - **Retirement Tab**: Retirement Readiness Meter, **Salary Increment Simulator** (interactive slider 3-20%), What-If Scenarios (clickable cards), Corpus Comparison
  - **Portfolio Tab**: **Asset Class Terrain Map** (Treemap visualization), Real Estate Concentration Warning, Allocation Alignment, Debt vs Invest Analysis, EMI Load Analysis
  - **Protection Tab**: Life Cover Analyzer, Health Cover Analyzer, Emergency Fund Gauge, Liquid Net Worth, Protection Checklist
  - **Goals Tab**: Goals Overview, Quick Wins, FIRE Calculator, Wealth Milestones, Blurred Advisor Insights CTA

- [x] **Lead Capture Modal**
  - Opens via "Talk to Expert" CTA
  - Captures: name, email, phone
  - Saves to `detailed_leads` Supabase table

- [x] **Behavioral Tracking**
  - `simulatorInteracted` flag when user uses salary slider
  - `scenarioCardsUsed` array when user clicks What-If cards
  - Saved with lead data for sales qualification

- [x] **Calculation Engine** (`/app/client/src/utils/igniteEngine.ts`)
  - `calculateIgniteMetrics()` - Full metrics calculation
  - `calculateTeaserScore()` - Estimated score from Stage 1
  - `simulateSalaryIncrements()` - Retirement projections
  - `formatINR()`, `formatPercent()` - Formatting utilities

---

## Tech Stack
- **Frontend**: React 18, TypeScript, Vite 7.3
- **Styling**: Tailwind CSS, Custom CSS (ignite-theme)
- **Animation**: Framer Motion
- **Charts**: Recharts (Line, Pie, Treemap, ComposedChart)
- **Routing**: Wouter
- **State**: React Query, SessionStorage
- **Backend/DB**: Supabase (PostgreSQL)
- **Fonts**: Poppins, Inter (quiz), DM Serif/Sans/Mono (dashboard)

---

## Supabase Tables Required

### `leads` (Phase 1)
```sql
id, name, email, phone, score, equity_percent, debt_percent, gold_percent, 
emergency_required, interested, created_at
```

### `detailed_leads` (Ignite Dashboard)
```sql
-- See /app/SUPABASE_SQL.md for full schema
id, name, email, phone, wealth_score, net_worth, liquid_net_worth,
retirement_gap, savings_rate, life_cover_gap, health_cover_gap,
equity_alignment, emergency_months, primary_goal, risk_profile,
investable_bracket, income_bracket, has_rsu, has_personal_loan,
real_estate_concentration, simulator_interacted, scenario_cards_used,
interested_1to1, created_at
```

---

## Prioritized Backlog

### P0 - DONE
All core Ignite Dashboard features implemented

### P1 - Secondary Features
- [ ] FIRE Calculator (full implementation)
- [ ] Debt Payoff vs. Invest module (detailed analysis)
- [ ] Bonus/RSU deployment section
- [ ] URL shareability (base64 encoded answers in hash)

### P2 - Polish & Enhancements
- [ ] Peer Benchmark comparisons (real data integration)
- [ ] Interactive What-If scenario cards (expanded scenarios)
- [ ] Collapsible Year-by-Year projection table
- [ ] PDF report generation
- [ ] Email report delivery

---

## Key Files Reference
- `/app/client/src/App.tsx` - Router
- `/app/client/src/pages/home.tsx` - Quiz page
- `/app/client/src/pages/TeaserDashboard.tsx` - Teaser
- `/app/client/src/pages/Stage2Questionnaire.tsx` - Detailed form
- `/app/client/src/pages/IgniteDashboard.tsx` - Main dashboard
- `/app/client/src/components/ignite/` - Tab components
- `/app/client/src/utils/igniteEngine.ts` - Calculations
- `/app/client/src/lib/types.ts` - TypeScript types
- `/app/SUPABASE_SQL.md` - Database schema

---

## Testing Status
- **Test Report**: `/app/test_reports/iteration_3.json`
- **Frontend Tests**: 100% pass rate
- **Flows Verified**: All 12 test cases passed
- **Known Issues**: Supabase tables need to be created manually

---

## Notes for Future Development
1. The preview URL tunnel may need restart if showing "Preview Unavailable"
2. Supabase credentials are in `/app/client/.env`
3. Dark theme uses `ignite-theme` CSS class
4. Data passes between pages via `sessionStorage` (keys: `stage1Data`, `stage2Data`)
