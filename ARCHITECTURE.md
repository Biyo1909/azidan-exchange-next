# AZIDAN EXCHANGE — Architecture, Database & Implementation Plan

## 1. Product understanding

AZIDAN EXCHANGE is a Nigerian crypto and gift-card exchange desk. Customers sell supported assets and receive Naira. The public site exposes live buying rates, a payout calculator, a guided trade flow, and trade-status tracking. A private admin console owns rates, asset availability, trade lifecycle, announcements, and audit history.

Design intent: a serious financial terminal — deep navy surfaces, teal accents, disciplined typography, purposeful motion — never playful or flashy.

## 2. Technology choices

| Layer | Choice | Reason |
| --- | --- | --- |
| Framework | Next.js 16 App Router + React 19 + TypeScript | One codebase for public site, admin, and API routes. |
| Styling | Tailwind CSS 4 with CSS custom properties | Fast responsive UI with instant light/dark theming. |
| Motion | Framer Motion (motion) + CSS keyframes | Controlled, staggered, accessible animation sequences. |
| Icons | lucide-react | Consistent professional iconography. |
| Database | `node:sqlite` (built into Node 26) | Zero native install, durable local file, synchronous transactional writes. |
| Auth | HMAC-signed HttpOnly cookie session + scrypt password hashing | No external auth vendor; secure enough for a private desk; easy to audit. |
| Live updates | Server-Sent Events + short polling fallback | Rate changes appear on public clients immediately without a heavy realtime stack. |

All API routes run on the Node runtime. The database file lives at `data/azidan.db` (configurable via `AZIDAN_DB_PATH`) and is created and seeded automatically on first request.

> Deployment note: the bundled SQLite file assumes a persistent Node process/filesystem (VPS, container with a volume, or a long-running Node host). For serverless, swap `lib/db.ts` for a hosted SQL adapter; the SQL and route contracts stay the same.

## 3. System architecture

```
Browser
 ├─ Public React pages (home, track)
 │    ├─ GET /api/assets          → live asset + rate snapshot
 │    ├─ GET /api/announcements   → published notices
 │    ├─ GET /api/stream          → SSE: 'rates' / 'announcement' events
 │    ├─ POST /api/trades         → create pending trade (server re-reads rate)
 │    └─ GET /api/trades?reference=... → public status lookup
 └─ Admin React pages (/admin/*)
      ├─ POST /api/admin/login, POST /api/admin/logout, GET /api/admin/me
      ├─ GET/PATCH /api/admin/assets[/:id]  → rate + active state, writes audit
      ├─ GET /api/admin/rate-history
      ├─ GET /api/admin/trades, PATCH /api/admin/trades/:id
      ├─ GET /api/admin/overview
      └─ GET/POST/PATCH/DELETE /api/admin/announcements

Route handlers → lib/db.ts (node:sqlite, WAL) → data/azidan.db
              → lib/events.ts (global EventEmitter) → SSE clients
```

### Live-rate propagation
1. Admin PATCHes `/api/admin/assets/:id`.
2. Handler opens a transaction: updates `assets.buy_rate` / `is_active`, inserts a `rate_history` row.
3. After commit, `emitRates()` publishes the fresh asset snapshot on the in-process event bus.
4. Every connected public page receives the event via `/api/stream` and updates state instantly; polling every 15s covers reconnects and multi-process deployments.

### Security
- Passwords hashed with `scrypt` + random salt; never stored in plaintext.
- Sessions are stateless, HMAC-SHA256 signed, HttpOnly, SameSite=Lax, Secure in production, 12-hour expiry.
- Every admin route calls `requireAdmin()`; public trade creation re-reads the rate server-side so client-supplied payouts are ignored.
- Input validation and length/type bounds on all mutation endpoints.
- Public tracking reveals only status, asset, amount, payout, and timestamps — never customer PII.

## 4. Database structure

### `admin_users`
| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| username | TEXT UNIQUE | login handle |
| email | TEXT UNIQUE | |
| password_hash | TEXT | `scrypt$salt$hash` |
| full_name | TEXT | audit display name |
| role | TEXT | `admin` / `super_admin` |
| last_login_at | TEXT | ISO |
| created_at | TEXT | ISO |

### `assets`
| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| kind | TEXT | `crypto` \| `gift_card` |
| code | TEXT UNIQUE | `BTC`, `USDT`, `APPLE`, … |
| name | TEXT | display name |
| network | TEXT | crypto network / card region |
| unit_label | TEXT | `BTC`, `$1 face value`, … |
| icon_key | TEXT | client icon mapping |
| buy_rate | REAL | **NGN paid per 1 unit** |
| is_active | INTEGER | 1 = tradable/public |
| min_amount | REAL | minimum trade size |
| sort_order | INTEGER | display order |
| created_at / updated_at | TEXT | ISO |

### `rate_history`
| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| asset_id | INTEGER | FK → assets |
| asset_code | TEXT | denormalised for durable audit |
| change_type | TEXT | `rate_update` \| `status_change` |
| previous_rate / new_rate | REAL | |
| previous_active / new_active | INTEGER | |
| changed_by / changed_by_id | TEXT / INTEGER | admin identity |
| note | TEXT | optional admin note |
| created_at | TEXT | ISO |

### `trades`
| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| reference | TEXT UNIQUE | `AZD-YYYYMMDD-XXXXXX` |
| kind / asset_id / asset_code / asset_name | TEXT/INTEGER | snapshot of traded asset |
| amount | REAL | units sold |
| rate_snapshot | REAL | rate at submission |
| payout_naira | REAL | `amount × rate_snapshot`, server computed |
| customer_name / email / phone | TEXT | contact |
| payout_method | TEXT | bank / wallet |
| account_number / account_name / bank_name | TEXT | Naira payout destination |
| note | TEXT | customer note |
| status | TEXT | `pending` → `processing` → `paid` / `rejected` |
| admin_note | TEXT | internal/admin message |
| created_at / updated_at / paid_at | TEXT | ISO |

### `announcements`
| Column | Type | Notes |
| --- | --- | --- |
| id | INTEGER PK | |
| title / body | TEXT | public copy |
| tone | TEXT | `info` \| `success` \| `warning` |
| is_published | INTEGER | |
| published_at / created_at / updated_at | TEXT | ISO |
| created_by | TEXT | admin username |

Indexes: `assets(kind, is_active, sort_order)`, `rate_history(asset_id, created_at DESC)`, `trades(status, created_at DESC)`, `trades(reference)`, `announcements(is_published, published_at DESC)`.

## 5. Public rate/calculator rules

- Rate = Naira paid for **one unit** of the asset. For crypto, one coin/token; for gift cards, one unit of face value (e.g. 1 USD of Apple credit).
- Payout = `amount × rate`. No hidden deductions; the calculator shows rate, amount, and payout transparently.
- The trade handler recomputes payout from the database rate at submission time and stores that value as `rate_snapshot`, so a displayed stale rate can never create an incorrect payout.

## 6. Implementation plan

1. **Scaffold** — Next.js 16 project, TypeScript, Tailwind 4, config, `.env.example`, gitignore, README.
2. **Data layer** — `node:sqlite` connection, schema migrations, seed assets + default admin, typed query helpers, event bus.
3. **Auth & API** — signed sessions, public endpoints, SSE stream, full admin CRUD endpoints with validation and audit writes.
4. **Design system** — CSS variables, shared primitives (button, card, badge, input, select, modal, toast, skeleton, empty state), theme toggle.
5. **Public experience** — rocket intro, header, hero, live rates with crypto/gift-card tabs, calculator, multi-step trade drawer with success animation, tracker, how-it-works, trust/FAQ/support, announcements, footer.
6. **Admin experience** — login, protected shell, overview dashboard, rate manager with inline edit + history, trade management, announcements manager.
7. **Polish & verify** — responsive checks, reduced-motion support, keyboard focus states, `npm run build`, smoke-test API flows, README handoff.

## 7. Default access

Seeded admin: **username `admin`, password `Azidan@2026`**. Change `ADMIN_PASSWORD` (and `SESSION_SECRET`) before any real deployment.
