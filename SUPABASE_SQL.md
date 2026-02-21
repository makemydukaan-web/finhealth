# Supabase SQL for Ignite Dashboard

Run this in your Supabase SQL Editor to create the `detailed_leads` table.

## Create Table + RLS Policies

```sql
-- Create the detailed_leads table for Ignite Dashboard
CREATE TABLE IF NOT EXISTS detailed_leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- User contact info
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  
  -- Core scores & metrics
  wealth_score integer,
  net_worth bigint,
  liquid_net_worth bigint,
  retirement_gap bigint,
  savings_rate integer, -- as percentage (e.g., 25 = 25%)
  
  -- Protection gaps
  life_cover_gap bigint, -- amount needed to fill gap
  health_cover_gap bigint,
  
  -- Allocation metrics
  equity_alignment integer, -- -100 to 100 (negative = under, positive = over)
  emergency_months integer, -- current emergency fund months
  
  -- Profile data
  primary_goal text,
  risk_profile text, -- 'Conservative', 'Moderate', 'Aggressive'
  investable_bracket text, -- e.g., '10L-25L', '25L-50L'
  income_bracket text, -- e.g., '1L-2L', '2L-5L'
  
  -- Special assets flags
  has_rsu boolean DEFAULT false,
  has_personal_loan boolean DEFAULT false,
  real_estate_concentration integer, -- as percentage of total assets
  
  -- Behavioral tracking (CRITICAL for sales qualification)
  simulator_interacted boolean DEFAULT false, -- Did user interact with salary simulator?
  scenario_cards_used integer DEFAULT 0, -- How many what-if scenarios did user explore?
  
  -- Lead qualification
  interested_1to1 boolean DEFAULT false, -- Interested in 1:1 consultation?
  
  -- Timestamps
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE detailed_leads ENABLE ROW LEVEL SECURITY;

-- Policy: Allow anonymous users to INSERT leads (for form submissions)
CREATE POLICY "Allow anon insert on detailed_leads" ON detailed_leads
  FOR INSERT TO anon
  WITH CHECK (true);

-- Optional: Index for common queries
CREATE INDEX IF NOT EXISTS idx_detailed_leads_created_at ON detailed_leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_detailed_leads_wealth_score ON detailed_leads(wealth_score);
```

## Verify Table Creation

After running the above SQL, verify with:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'detailed_leads'
ORDER BY ordinal_position;
```

## Notes

- `wealth_score`: 0-100 composite score
- `simulator_interacted`: TRUE if user played with the salary increment slider
- `scenario_cards_used`: Count of "What-If" cards the user clicked on
- All monetary values stored as bigint (in INR, no decimals)
- Percentages stored as integers (25 = 25%)
