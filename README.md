# SarkariJobs Hub (Safe Edition)

Production-ready Next.js 14 full-stack application for Indian government jobs aggregation using only legal and safe sources:

- RSS feeds from allowed/public endpoints
- Public APIs
- Manual admin entry
- Optional compliant HTML adapter (only for explicitly permitted domains)

Restricted or protected websites must not be scraped.

## Tech Stack

- Frontend: Next.js 14, Tailwind CSS, ShadCN-style UI components
- Backend: Next.js App Router API routes
- Database: MongoDB with Mongoose
- Scheduler: node-cron (every 6 hours by default)

## Features

- Public jobs listing with search + filters + pagination
- SEO-friendly job detail pages (`/jobs/[slug]`)
- Dynamic metadata, `sitemap.xml`, and `robots.txt`
- Admin login (JWT cookie auth)
- Admin add/edit/delete + approve workflow for RSS-imported jobs
- RSS auto-import to pending queue (duplicate-safe)
- Optional compliant HTML import with domain allowlist + `robots.txt` checks
- Rate limiting + input validation (Zod)
- Optional Telegram posting + email alerts
- Google AdSense slot placement (top, in-content, sidebar)
- Trending jobs by view count
- Dark/light mode

## Folder Structure

```text
.
├─ scripts/
│  ├─ run-rss-sync.ts
│  └─ seed-admin.ts
├─ src/
│  ├─ app/
│  │  ├─ api/
│  │  │  ├─ jobs/
│  │  │  ├─ admin/
│  │  │  └─ alerts/
│  │  ├─ admin/
│  │  ├─ jobs/[slug]/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  ├─ page.tsx
│  │  ├─ robots.ts
│  │  └─ sitemap.ts
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ ads/
│  │  ├─ jobs/
│  │  ├─ layout/
│  │  └─ ui/
│  ├─ lib/
│  ├─ models/
│  ├─ types/
│  ├─ instrumentation.ts
│  └─ middleware.ts
├─ .env.example
└─ package.json
```

## Setup Guide

1. Install dependencies:

```bash
npm install
```

2. Create environment file:

```bash
cp .env.example .env.local
```

3. Update `.env.local`:

- Set `MONGODB_URI`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`
- Configure safe RSS feed URLs in `RSS_FEED_URLS`
- Optionally add JSON endpoints in `PUBLIC_API_SOURCES` (comma-separated)
- Optional compliant HTML adapter:
- `ENABLE_HTML_SOURCE_IMPORT=true`
- `ALLOWED_HTML_SOURCE_DOMAINS=example.gov,careers.example.gov`
- `HTML_SOURCE_CONFIG_JSON=[{"name":"Example Jobs","listingUrl":"https://example.gov/jobs","itemSelector":".job-item","titleSelector":"h3","linkSelector":"a","descriptionSelector":".summary","publishedDateSelector":"time","maxItems":25}]`
- Add optional AdSense/Telegram/SMTP values

4. Optional: generate a bcrypt hash for admin password:

```bash
npm run seed:admin -- MySecurePassword123
```

Use the generated hash as `ADMIN_PASSWORD`.

5. Run development server:

```bash
npm run dev
```

6. Visit:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## API Reference

### Public

- `GET /api/jobs?page=1&limit=10&category=&state=&qualification=&q=`
- `GET /api/jobs/:id`

### Admin

- `POST /api/admin/login`
- `POST /api/admin/logout`
- `POST /api/admin/add-job`
- `GET /api/admin/jobs?status=pending&page=1&limit=50`
- `PATCH /api/admin/jobs/:id`
- `DELETE /api/admin/jobs/:id`
- `POST /api/admin/jobs/:id/approve`
- `POST /api/admin/rss-sync` (admin session or `x-cron-key`)

### Alerts

- `POST /api/alerts/subscribe`

## Scheduler and Automation

- `node-cron` runs in the Next.js Node runtime using `src/instrumentation.ts`
- Default schedule is every 6 hours (`0 */6 * * *`)
- RSS/API/HTML-adapter imports are saved as `pending`
- Admin approves pending jobs for publishing

For platforms where in-process cron is not reliable (serverless), call:

`POST /api/admin/rss-sync` via an external scheduler and include `x-cron-key`.

## Security and Compliance

- Legal sources only; no scraping of restricted websites
- HTML adapter runs only for allowlisted domains and checks `robots.txt` permission
- Zod request validation
- Basic API rate limiting per IP + route
- Admin protected with signed JWT cookie
- Raw HTML stripped from imported descriptions

## Production Notes

- Use managed MongoDB (Atlas) with network restrictions
- Replace in-memory rate limit with Redis for multi-instance deployments
- Configure HTTPS and secure cookie settings in production
- Add monitoring/alerting for cron sync and API failures
