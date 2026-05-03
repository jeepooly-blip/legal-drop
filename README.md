# LegalDrop
> The reverse marketplace for petty legal matters. Anonymity first.

## Stack
- Next.js 15 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Supabase (Postgres, Auth, Storage, Edge Functions)
- Stripe Connect (Phase 5)

## Quick Start (Vercel — no terminal needed)
1. Push this repo to GitHub
2. Run supabase/migrations/001_initial_schema.sql in Supabase SQL Editor
3. Deploy to Vercel — import repo, set env vars (see .env.example)
4. Done.

## Local Dev (optional)
cp .env.example .env.local  # fill in Supabase values
npm install
npm run dev

## Phases
- Phase 0: DB Schema + RLS policies
- Phase 1: Auth (login, register, role routing)
- Phase 2: Case posting wizard + Magic Shield PII detection
- Phase 3: Lawyer Whiteboard (next)
- Phase 4: Bidding
- Phase 5: Stripe payments
- Phase 6: Delivery & escrow release
- Phase 7: Admin dashboard
