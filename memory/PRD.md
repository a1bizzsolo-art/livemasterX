# A1A1 (AQAS) — Landing Page PRD

## Original Problem Statement
Build a landing page for an enterprise precision-agriculture / defense-grade
operational intelligence SaaS. Brand: **A1A1 (AQAS)** — trademark branded by
Duane Clevenger E.I.R Technology. Powered by 10 to the 4th power of agents
(10,000). Primary CTA theme: "Everything Overstep of Ariah".

## User Personas
- **Operator / Field Lead** — large-acreage farm decision maker exploring
  defense-grade operational intelligence.
- **Enterprise Buyer** — precision-ag co-op, ag insurance, gov/defense logistics.
- **Investor / Partner** — evaluating the platform's architecture and roadmap.

## Architecture
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + lucide-react + sonner toasts.
- **Backend**: FastAPI + Motor (MongoDB async). All routes under `/api`.
- **DB**: MongoDB collection `waitlist` (email lowercased, dedup-enforced).
- **Hosting**: Supervisor-managed (frontend :3000, backend :8001), Kubernetes ingress.

## Core Requirements (static)
- Defense-grade / tactical aesthetic (obsidian + tactical amber, sharp 1px borders).
- Sections: Nav → Hero → Telemetry Ticker → AQAS Systems → Ariah Pipeline →
  Architecture (6 layers) → Stack Showcase → Roadmap (W1–W4) → Waitlist → Footer.
- Waitlist captured to MongoDB; live stats endpoint feeds Hero KPIs.

## Implemented (2025-12)
- Backend: `GET /api/`, `POST /api/waitlist`, `GET /api/waitlist/stats`,
  `GET /api/status`, `POST /api/status`. Case-insensitive dedup, 409 on dup,
  422 on invalid email. Response email lowercased.
- Frontend: All landing sections built. Live UTC clock in nav, radar sweep over
  NDVI satellite hero visual, terminal-styled AQAS reasoning console, Ariah live
  pipeline telemetry, 6-layer architecture diagram, 12-tool stack grid, 4-phase
  roadmap, terminal-styled waitlist form with success panel + sonner toasts.
- Typography: Chivo (display), JetBrains Mono (body/telemetry).
- All interactive elements have `data-testid`.

## Tested (iteration_1)
- Frontend e2e: **100%** (hero copy, brand, CTA, KPIs, nav scroll, waitlist
  submit success, duplicate error).
- Backend: 10/10 after lowercasing fix.

## Backlog
### P1
- Real `Book demo` modal (calendar/Calendly link) separate from waitlist.
- Admin-only `/api/waitlist` list endpoint w/ basic auth.
- AQAS interactive demo (ask question → GPT/Claude response).
### P2
- Mobile dashboard mockup screen / `/dashboard` preview route.
- Pricing tiers section + Stripe checkout.
- SEO meta tags, OpenGraph card, sitemap.
- Mapbox interactive field selector demo.

## Next Tasks
1. Decide whether to enable AQAS AI demo (needs Emergent LLM key).
2. Wire real lead notification (Resend/SendGrid email on submit).
3. Add `/dashboard` preview route for investor demos.
