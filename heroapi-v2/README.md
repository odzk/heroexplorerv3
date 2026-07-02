# Hero Explorer API v2

Express + TypeScript + Prisma (PostgreSQL) rebuild of the legacy LoopBack 3 `heroapi`, with the Viator Partner API integration carried forward.

## Stack

| Layer      | Choice                                             |
| ---------- | -------------------------------------------------- |
| Runtime    | Node.js ≥ 18, TypeScript 5                         |
| Framework  | Express 4                                          |
| Database   | PostgreSQL via **Prisma 5**                        |
| Auth       | JWT (bcrypt password hashing)                      |
| Cache      | Redis (optional, `ioredis`)                        |
| Payments   | Stripe (PaymentIntents + legacy charge parity)     |
| Email      | nodemailer (SMTP)                                  |
| Storage    | AWS S3 (SDK v3) — white-label logos                |
| DNS        | DigitalOcean API — subdomain provisioning          |
| External   | Viator Partner API (axios)                         |
| Validation | zod                                                |

## Project structure

```
heroapi-v2/
├── prisma/
│   └── schema.prisma          # All DB-backed models (Postgres)
├── src/
│   ├── index.ts               # App bootstrap + router wiring
│   ├── config/                # env (zod), prisma client, redis
│   ├── middleware/            # auth (JWT + admin), error handler, zod validate
│   ├── services/              # viatorClient, stripe, email, storage (S3), dns (DO)
│   ├── lib/                   # serializers / helpers
│   ├── routes/                # one router per domain (see Endpoints)
│   └── types/                 # shared DTOs
├── .env.example
├── README.md
└── MIGRATION.md               # LoopBack → v2 mapping + parity notes
```

## Getting started

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env          # fill in DATABASE_URL + secrets

# 3. Generate the Prisma client (requires internet — downloads the query engine)
npx prisma generate

# 4a. Fresh database — create tables from the schema
npx prisma migrate dev --name init
#     OR
# 4b. Existing heroexplorerdb migrated to Postgres — introspect instead
#     npx prisma db pull && npx prisma generate

# 5. Run
npm run dev                    # ts-node-dev, hot reload
# or
npm run build && npm start     # compiled (runs `prisma generate && tsc`)
```

Health check: `GET /health` → `{ status, version, env, db }`.

## Scripts

| Script                    | Purpose                                    |
| ------------------------- | ------------------------------------------ |
| `npm run dev`             | Dev server with hot reload                 |
| `npm run build`           | `prisma generate` + `tsc` → `dist/`        |
| `npm start`               | Run compiled `dist/index.js`               |
| `npm run typecheck`       | `tsc --noEmit`                             |
| `npm run prisma:migrate`  | Create/apply a dev migration               |
| `npm run prisma:pull`     | Introspect an existing database            |
| `npm run prisma:studio`   | Prisma Studio (DB browser)                 |

## Endpoints (by domain)

All mounted under `/api`. Legacy method names are preserved as sub-paths for parity.

| Domain          | Base                    | Highlights                                                                 |
| --------------- | ----------------------- | -------------------------------------------------------------------------- |
| Auth            | `/api/auth`             | `register`, `login`, `me`, `logout`                                        |
| Users           | `/api/users`            | `verifyCode`, `forgot-password`, `recover-password`, `reset-password`, `detail`, `profile` |
| Products        | `/api/products`         | 30+ Viator search/detail/availability + `makeApayment` (Stripe) + `bookAProduct` |
| Destinations    | `/api/destinations`     | Viator taxonomy + DB (`getTopDestinations`, `preSearch…`, admin sync)      |
| Categories      | `/api/categories`       | `getAllCategoriesOfADestination`, `getProductTags`                         |
| Locations       | `/api/locations`        | `getAllLocation`                                                           |
| Subcategories   | `/api/subcategories`    | CRUD (Prisma)                                                             |
| Attractions     | `/api/attractions`      | attraction lists / products / reviews / photos / panoramas                 |
| Recommendations | `/api/recommendations`  | recommendation lists / products / reviews / photos / panoramas             |
| Reviews         | `/api/reviews`          | `getUserReviewOfAProductOrDestination`                                     |
| Photos          | `/api/photos`           | `getUserPhotosOfAProductOrDestination`                                     |
| Bookings        | `/api/bookings`         | 13 ported HeroBooking methods (Prisma + Viator), CSV report export         |
| Bookers         | `/api/bookers`          | `getBookerId` (tenant registry)                                            |
| Customizations  | `/api/customizations`   | white-label settings, logo upload (S3), subdomain provisioning (DO DNS)    |
| Experiences     | `/api/experiences`      | Existing v2 Viator experience search/detail                                |

Full legacy → v2 mapping in [MIGRATION.md](./MIGRATION.md).

## Deployment

Per Nuvho infrastructure conventions, a Node.js/Express API deploys to the **mcp-server** droplet (nginx + systemd), not DigitalOcean App Platform. This repo is a **local rebuild** — no deploy has been performed. See MIGRATION.md → *Deploy* for the checklist.

## Security

All third-party credentials come from environment variables — nothing is hardcoded. See MIGRATION.md → *Security fixes* for the full list of legacy issues remediated (hardcoded keys, SQL injection, open ACLs, insecure password reset).
