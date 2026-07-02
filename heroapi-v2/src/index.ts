import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { env, isProd } from './config/env';
import prisma from './config/prisma';
import { notFound, errorHandler } from './middleware/error';

import authRouter from './routes/auth';
import usersRouter from './routes/users';
import productsRouter from './routes/products';
import destinationsRouter from './routes/destinations';
import categoriesRouter from './routes/categories';
import locationsRouter from './routes/locations';
import subcategoriesRouter from './routes/subcategories';
import attractionsRouter from './routes/attractions';
import recommendationsRouter from './routes/recommendations';
import reviewsRouter from './routes/reviews';
import photosRouter from './routes/photos';
import bookingsRouter from './routes/bookings';
import bookersRouter from './routes/bookers';
import customizationsRouter from './routes/customizations';
import experiencesRouter from './routes/experiences';

const app = express();

// ── Security & core middleware ────────────────
app.use(helmet());
app.use(compression());
app.use(morgan(isProd ? 'combined' : 'dev'));
app.use(express.json({ limit: '10mb' })); // logo uploads arrive as base64
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── CORS ──────────────────────────────────────
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
    credentials: true,
  }),
);

// ── Rate limiting ─────────────────────────────
app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please try again later.' },
  }),
);

// ── Routes ────────────────────────────────────
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/products', productsRouter);
app.use('/api/destinations', destinationsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/locations', locationsRouter);
app.use('/api/subcategories', subcategoriesRouter);
app.use('/api/attractions', attractionsRouter);
app.use('/api/recommendations', recommendationsRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/photos', photosRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/bookers', bookersRouter);
app.use('/api/customizations', customizationsRouter);
app.use('/api/experiences', experiencesRouter);

// ── Health check ──────────────────────────────
app.get('/health', async (_req, res) => {
  let db = 'unknown';
  try {
    await prisma.$queryRaw`SELECT 1`;
    db = 'up';
  } catch {
    db = 'down';
  }
  res.json({ status: 'ok', version: '2.0.0', env: env.NODE_ENV, db });
});

// ── 404 + error handling ──────────────────────
app.use(notFound);
app.use(errorHandler);

// ── Start ─────────────────────────────────────
const server = app.listen(env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`\n🚀 Hero Explorer API v2 running on http://localhost:${env.PORT}`);
  // eslint-disable-next-line no-console
  console.log(`   ENV: ${env.NODE_ENV}`);
  // eslint-disable-next-line no-console
  console.log(`   Viator: ${env.VIATOR_API_URL}\n`);
});

// ── Graceful shutdown ─────────────────────────
const shutdown = async (signal: string): Promise<void> => {
  // eslint-disable-next-line no-console
  console.log(`\n${signal} received — shutting down…`);
  server.close();
  await prisma.$disconnect();
  process.exit(0);
};
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));

export default app;
