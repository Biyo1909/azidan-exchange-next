# AZIDAN EXCHANGE

A professional crypto and gift-card exchange desk for Nigerian users. Customers see live Naira buying rates, calculate payouts, submit trades and track status. A private admin console manages rates, availability, trades, audit history and public announcements.

## Quick start

Requirements: **Node.js 22.5+** (Node 26 recommended — this app uses the built-in `node:sqlite` module).

```bash
npm install
cp .env.example .env.local   # optional but recommended
npm run dev
```

Open:

- Public site: http://localhost:3000
- Admin console: http://localhost:3000/admin
- Trade tracker: http://localhost:3000/track

Default admin login (seeded on first run):

```
username: admin
password: Azidan@2026
```

Set `ADMIN_PASSWORD` and `SESSION_SECRET` in `.env.local` before deploying.

### Production

```bash
npm run build
npm run start
```

The build uses webpack (`next build --webpack`) because Next 16's Turbopack native binary is unavailable on some Windows environments. The app runs fine in either mode on supported platforms.

## What's included

### Public
- Realistic rocket-launch intro with crypto and gift-card patches (skippable; respects reduced-motion; once per browser session)
- Clean, modern light-first interface with a restrained blue accent; dark mode remains available
- Live rate board for 10 cryptocurrencies and 8 gift cards, with search and animated category switching
- Interactive payout calculator with transparent rate breakdown
- Four-step trade submission drawer with validation, confirmation animation and reference number
- Public trade tracking: Pending → Processing → Paid, plus rejected state
- Announcements, how-it-works, FAQ, trust signals and support links
- Light/dark theme, responsive layouts, keyboard focus states and polished loading/empty states

### Admin
- Signed, HttpOnly cookie session with scrypt password hashing
- Overview dashboard: pending/processing/paid counts, settled volume, desk health, recent activity
- Rate manager: edit any individual buying rate, activate/deactivate any asset
- Immediate propagation: rate/availability changes are broadcast over Server-Sent Events and appear on open public pages without refresh
- Complete rate history with old/new values, administrator, note and timestamp
- Trade management with approve, mark paid, reject, reopen and internal notes
- Announcement composer with tone, publish/draft state and instant public updates

## Key files

| Path | Purpose |
| --- | --- |
| `ARCHITECTURE.md` | Full architecture, database schema and implementation plan |
| `src/lib/db.ts` | SQLite schema, seed data and typed queries/mutations |
| `src/lib/security.ts` | Password hashing and signed session tokens |
| `src/lib/events.ts` | In-process event bus for live updates |
| `src/app/api/**` | Public and admin API routes, including the SSE stream |
| `src/components/home/**` | Public site experience |
| `src/components/admin/**` | Admin console shell |
| `data/azidan.db` | Runtime database (created automatically; gitignored) |

## Rate model

One `buy_rate` per asset means **Naira paid for one unit**:

- Crypto: one coin/token (e.g. BTC = ₦14,850,000 per BTC)
- Gift card: one unit of USD face value (e.g. Apple = ₦1,480 per $1 of card value)

`payout = amount × buy_rate`. The API recomputes the payout from the database at submission time and stores it as a rate snapshot, so a stale browser rate can never create an incorrect payout record.

## Configuration

| Variable | Default | Notes |
| --- | --- | --- |
| `SESSION_SECRET` | generated in `data/.session-secret` | Set a long random value in production |
| `ADMIN_USERNAME` | `admin` | Seeded once |
| `ADMIN_EMAIL` | `admin@azidanexchange.com` | Seeded once |
| `ADMIN_PASSWORD` | `Azidan@2026` | Change before deployment |
| `ADMIN_NAME` | `AZIDAN Administrator` | Audit display name |
| `AZIDAN_DB_PATH` | `./data/azidan.db` | Persistent local SQLite path |

To change seeded credentials after the first run, either delete `data/azidan.db` and restart, or update the `admin_users` row directly.

## Customisation notes

- Support email/WhatsApp links are in `src/components/home/TrustSection.tsx` and `SiteFooter.tsx`.
- Brand colours are CSS variables in `src/app/globals.css` (`--accent`, `--bg`, `--surface`, etc.).
- Add or rename assets by editing the `seedAssets` array in `src/lib/db.ts`, then reset the database.

## Deployment note

The bundled SQLite database assumes a persistent filesystem and a single long-running Node process (VPS/container with a volume). For serverless or multi-instance deployments, replace `src/lib/db.ts` with a hosted SQL adapter; route contracts and UI remain unchanged. For multi-instance realtime updates, replace `src/lib/events.ts` with Redis pub/sub or similar while keeping the `/api/stream` contract.
