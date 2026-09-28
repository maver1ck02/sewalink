# SewaLink

**Find trusted people for every job.**

SewaLink is a Nepal-focused local service marketplace. Customers search for verified providers, request work, compare quotes, chat in real time, and leave reviews. Providers manage listings, bookings, and portfolios. Admins moderate the platform from a protected dashboard.

This is a maintainable MERN application (React + Vite, Express, MongoDB), not a disconnected set of demo pages.

## Features

- Customer, provider, and admin apps with role-based routes
- JWT auth in HTTP-only cookies, refresh tokens, email verify / password reset
- Marketplace search with filters, pagination, and **SewaLink Smart Match** (transparent scoring, not ML)
- Location-aware discovery using latitude/longitude and Haversine distance
- **SewaTrust** score from verification, jobs, ratings, reviews, response rate, account age, and reports
- Bookings with a real status machine and quotations
- Favorites, reviews (completed bookings only), reports, portfolio / before-after
- Socket.IO chat and live notifications
- Dashboards and analytics (CSS bar charts, no extra chart library)
- Image uploads stored on disk (swap-ready for cloud storage)

## Tech stack

| Layer | Tools |
| --- | --- |
| Frontend | React, Vite, React Router, Axios, React Icons, CSS |
| Backend | Node.js, Express, Mongoose, JWT, bcryptjs, Helmet, rate limit, Nodemailer, Socket.IO, Multer |
| Database | MongoDB (geospatial `2dsphere` indexes) |
| Tests | Node test runner, Supertest, mongodb-memory-server |

## Architecture

- `client/` talks to `/api` through the Vite proxy and sends cookies (`withCredentials`).
- `server/app.js` mounts REST routes. `server/server.js` attaches Socket.IO.
- Controllers stay out of route files. Matching and trust live in `server/services/` so the formulas stay documented.
- Images never go into MongoDB. `server/services/imageStorage.js` is the upload abstraction.

## Folder structure

```
SewaLink/
  client/          React + Vite UI
  server/          Express API, sockets, seed, tests
  .env.example
  README.md
```

## Installation

Requires Node.js 20+ and MongoDB running locally (or a MongoDB Atlas URI).

```bash
cd SewaLink
copy .env.example .env    # Windows
# cp .env.example .env    # macOS/Linux

npm install --prefix server
npm install --prefix client
```

## Environment variables

See `.env.example`. Used values:

- `PORT`, `MONGODB_URI`
- `JWT_SECRET`, `JWT_REFRESH_SECRET`
- `CLIENT_URL`, `SERVER_URL`, `COOKIE_SECURE`
- `EMAIL_*` (optional; without credentials, emails are logged in development)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SEED_PASSWORD`
- `IMAGE_STORAGE` (`local` now; cloud URL later)

Never commit a real `.env`.

## Database and seed

```bash
npm run seed --prefix server
```

This wipes the `sewalink` database and inserts fictional demo data only.

## Run

Terminal 1:

```bash
npm run dev --prefix server
```

Terminal 2:

```bash
npm run dev --prefix client
```

- UI: http://localhost:5173  
- API: http://localhost:5000/api/health  

## Demo accounts

After seed (passwords from `.env`):

| Role | Email | Password default |
| --- | --- | --- |
| Admin | `admin@sewalink.local` | `AdminPass123!` |
| Customer | `customer@sewalink.local` | `DemoPass123!` |
| Provider | `sajan.provider@sewalink.local` | `DemoPass123!` |

In development, registration responses include a `verifyToken` so you can open `/verify-email?token=...` without SMTP.

## Authentication

- `POST /api/auth/register` — customer or provider
- `POST /api/auth/login` — sets `accessToken` + `refreshToken` cookies
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/auth/me`
- Admin routes live under `/api/admin` and require `role: admin`

## API overview

| Prefix | Purpose |
| --- | --- |
| `/api/auth` | Register, login, verify, reset |
| `/api/users` | Profile |
| `/api/categories` | Public categories |
| `/api/providers` | Search, profile, provider self-service |
| `/api/services` | Public service by id |
| `/api/bookings` | Requests and status transitions |
| `/api/quotations` | Send / accept quotes |
| `/api/reviews` | Reviews |
| `/api/favorites` | Saved providers |
| `/api/messages` | Conversations |
| `/api/notifications` | In-app notifications |
| `/api/reports` | User reports |
| `/api/admin` | Moderation, analytics, settings |

Success: `{ "success": true, "message": "...", "data": {} }`  
Error: `{ "success": false, "message": "..." }`

Booking flow: `REQUESTED → ACCEPTED → SCHEDULED → PROVIDER_ON_THE_WAY → IN_PROGRESS → COMPLETED`  
Also: `REJECTED`, `CANCELLED`, `EXPIRED`, `DISPUTED`.

SewaLink Smart Match: `service 40% + distance 25% + rating 20% + availability 10% + price 5%`.

SewaTrust weights are documented in `server/services/trustScore.js`.

## Tests

```bash
npm test --prefix server
```

Covers registration, login, admin authorization, provider/service/booking creation, status transitions, review rules, and duplicate favorites.

## Deployment

1. Set production `MONGODB_URI`, strong JWT secrets, `CLIENT_URL`, `SERVER_URL`, `COOKIE_SECURE=true`.
2. Configure SMTP for real verification emails.
3. `npm run build --prefix client` and serve `client/dist` (or a host such as Vercel/Netlify).
4. Run `node server.js` on a Node host (Render, Railway, a VPS) behind HTTPS.
5. Point the frontend API base at the production API if you are not using the Vite proxy.
6. Optionally move uploads to a cloud bucket by extending `imageStorage.js`.

## Future improvements

Online payments, coupons, wallet, push notifications, native mobile apps, real map tiles, AI categorization, subscriptions, and dispute workflows can plug into the existing models without a rewrite.

## Note on `sewalLink/`

A leftover Vite starter may exist in `sewalLink/`. The real app is `client/` + `server/` at the repository root.
