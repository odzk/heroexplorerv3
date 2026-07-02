# Migration — LoopBack 3 `heroapi` → `heroapi-v2` (Express + Prisma/PostgreSQL)

This document records how the legacy LoopBack 3 API was ported to the v2 stack, what changed, and what still needs verification before production.

## Summary

- **Framework:** LoopBack 3 (Node 8) → Express 4 + TypeScript (Node ≥ 18).
- **Database:** MySQL (`heroexplorerdb`) → **PostgreSQL via Prisma 5**.
- **HTTP client:** deprecated `request` → `axios` (centralized Viator client).
- **Auth:** LoopBack base `User` + AccessToken → JWT + bcrypt.
- **AWS SDK:** v2 → v3. **Stripe:** `charges.create` → PaymentIntents (+ legacy charge kept for parity).
- Legacy REST base `/api/<Model>/<method>` → `/api/<domain>/<method>` (method names preserved).

## Data model → Prisma (PostgreSQL) mapping

Only genuinely DB-backed models became tables. The pure Viator-proxy "models" (Product, Attraction, Recommendation, Category proxy, Location, UserReview, UserPhoto) carried **no persistence** in the legacy app and are represented as DTOs + the Viator service layer.

| Legacy model (MySQL)         | Prisma model     | Notable type conversions                                            |
| ---------------------------- | ---------------- | ------------------------------------------------------------------- |
| `HeroUser` (base `User`)     | `HeroUser`       | `tinyint` flags → `Int` (0/1); `datetime` → `DateTime`; legacy column names preserved via `@map` (`emailVerified`, `billingAdress`, `profileUrl`) |
| `AccessToken`                | `AccessToken`    | `id` `varchar(255)` PK; `scopes` `text`; FK `userid → HeroUser.id`  |
| `Booker`                     | `Booker`         | tenant registry (`id`, `name`)                                      |
| `Customization`              | `Customization`  | `text`-typed colours/logo → `String`; `user_id → HeroUser.id`       |
| `HeroBooking`                | `HeroBooking`    | 4-part legacy id → surrogate `id` + `@@unique([itineraryId,email,productCode,stripeCode])`; `float(10,0)` money → `Decimal(12,2)`; 6 `tinyint` request flags → `Int` |
| `HeroBookingBooker`          | `HeroBookingBooker` | indexed `itineraryId`, `phone`                                   |
| `HeroBookingDetail`          | `HeroBookingDetail` | indexed `itineraryId`, `itemId`                                  |
| `HeroBookingQuestion`        | `HeroBookingQuestion` | indexed `itemId`                                               |
| `HeroBookingTraveller`       | `HeroBookingTraveller` | indexed `itemId`                                              |
| `Destination`                | `Destination`    | added physical-only cols `isTop` (bool) + `sortOrder` (int) that existed in MySQL but not the model JSON; `destinationId` unique |
| `Category`                   | `Category`       | `subcategories ["object"]` → `Json`                                 |
| `Subcategory`                | `Subcategory`    | `categoryId` indexed                                                |

> **DB migration path:** for a fresh Postgres, `prisma migrate dev`. To carry existing data, migrate MySQL → Postgres first (e.g. pgloader), then `prisma db pull` to reconcile, then `prisma generate`.

## Endpoint mapping (by domain)

Full parity was targeted. Representative mappings:

**Products** (`common/models/product/product.js` → `src/routes/products.ts`)
`searchForProducts`, `searchForProductsByTextAndCode(SB/HP)`, `searchForProductByText`, `searchForProductsByCode`, `searchForProductsByTags`, `getProductsDetails`, `getProductsDetailsPrice`, `getProductsDetailsLocation`, `getProductReviews`, `postProductReviewsV2`, `availabilitySchedule`, `getProductsTagsV2`, `getProductUserPhotos`, `getBookingQuestions`, `getCancelReasons`, `checkStatus`, `loadOptionsOfAProduct`, `cancelAProduct`, `loadAvailableDate(AndPrice)`, `loadAvailableTourGrades`, `loadPriceForAnOptionProduct`, `reclculateThePriceWithPromotionCode` (+ correctly-spelled alias), `getHotelPickupOfProduct`, `getDateAvaliableOfAProduct`, `searchForProductsAvaliableByCodeAndDate`, `searchForProductsByDatePriceDurationAndCategory`, `bookAProductHold`, **`makeApayment`** (Stripe), **`bookAProduct`** (Viator + persist `HeroBooking` + confirmation email).

**Bookings** (`HeroBooking.js` → `src/routes/bookings.ts`) — all 13 exposed methods:
`cancelBookingDB`, `getListAllBookingAdmin`, `getListAllPrevBookingAdmin`, `getListAllBooking`, `getListAllBookingPrev`, `getListMyBooking`, `listPastBooking`, `getCancelBookingReasons`, `cancelABooking`, `getVoucherData`, `requestEditBooking`, `getReportBookings`, `downloadReportBookings` (+ `?format=csv`).

**Destinations / Categories / Locations / Subcategories / Attractions / Recommendations / Reviews / Photos / Bookers / Customizations / Users** — see each `src/routes/*.ts`; legacy method names preserved.

## Security fixes (legacy issues remediated)

1. **Hardcoded secrets removed** — live Viator key, live Stripe secret key, Gmail password, AWS IAM keys, DigitalOcean token were committed in the legacy source. All now come from env vars. **These leaked keys must be rotated.**
2. **SQL injection** — legacy used string-interpolated raw SQL (`Destination`, `HeroBooking`). Replaced with parameterized Prisma queries.
3. **Open ACLs** — legacy exposed admin/booking endpoints to `$everyone`. v2 adds JWT auth + an `requireAdmin` guard (admin reports/lists, subdomain provisioning), and user-scoped checks (you can only read your own bookings unless admin).
4. **Insecure password reset** — legacy `resetPasswordWithEmail` let anyone reset any password by email alone. v2 `reset-password` is **auth-gated** (self-service); the code-gated `forgot-password` → `recover-password` flow is preserved for unauthenticated recovery.
5. **`NODE_TLS_REJECT_UNAUTHORIZED="0"`** (disabled TLS verification) removed.
6. **`cb(null, err)` anti-pattern** (errors returned as HTTP 200 bodies) → centralized error handler with correct status codes.
7. **Sensitive fields no longer leaked** — `getHeroUserDetailByEmail` returned password hash + verification token; v2 returns public fields only.

## Bugs fixed (not faithfully reproduced)

- Attraction & Recommendation `getAllPhotos…` route **path collision** with `getAllReviews…` — given distinct paths.
- Malformed Viator query strings (`&topX` / `&sortOrder` without `=`) — fixed via params objects.
- `loadPriceForAnOptionProduct` defined **twice** — implemented once.
- Duration parsing bug (days treated as seconds) — corrected in `durationToMinutes`.
- `cancelABooking` was an entirely commented-out **no-op** — reimplemented (Viator cancel + DB flag).

## Dropped intentionally

- **JSONP variants** (`getAllDestinationsJsonP`, `…JsonP1`, `getAllCategoriesOfADestinationJsonP`) — obsolete; `myFunc`/`node-jsonp` were dead code.
- `getProductStandardTermsAndConditions` — defunct on Viator ("endpoint doesn't exist anymore").
- Self-referential HTTP calls (`getListCitiesAustralia`, `getDestinationNearYouByCityAndRegion`, `getAllDestinationsJsonP1`) — replaced with direct DB reads.

## ⚠️ Needs verification before production

- **Viator `LEGACY v1` paths** — endpoints marked `// LEGACY v1` in `viatorClient.ts` and the attraction/recommendation/reviews/photos/category routes hit Viator's older `/service/*` and `/v1/*` API. The old code mixed v1 and the partner API. Confirm each path's v2 Partner API equivalent against current Viator docs (https://docs.viator.com/partner-api/technical/). The confirmed-good v2 paths (products/search, destinations, products/tags, availability/schedules, search/freetext, bookings/*) are already used where known.
- **`prisma generate` requires network** — the generated client (and thus a clean `tsc`) needs Prisma's engine download, which was blocked in the build sandbox. On any networked machine, `npm run build` (which runs `prisma generate && tsc`) completes cleanly. The full codebase type-checks with **0 errors** when validated against the schema shapes.
- **Money precision** — legacy `float(10,0)` stored whole numbers; v2 uses `Decimal(12,2)`. Confirm existing amounts migrate as expected (they were effectively integer cents/dollars in the old schema).

## Deploy (when ready — not yet performed)

Target: **mcp-server** droplet (nginx + systemd) per Nuvho conventions for Node APIs.

1. Provision a PostgreSQL database (nuvho-vectordb runs Postgres 17) and set `DATABASE_URL`.
2. `npm ci && npm run build` on the server (engine download works there).
3. `npx prisma migrate deploy`.
4. systemd unit → `node dist/index.js`; nginx reverse-proxy → the chosen port; TLS via certbot.
5. Set all secrets as environment variables (never commit `.env`). Rotate the leaked legacy keys.
6. Verify `GET /health` returns `{ db: "up" }`.
