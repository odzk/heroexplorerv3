import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { authenticate, signToken } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import { toPublicUser, genCode } from '../lib/user';
import {
  sendMail,
  isEmailEnabled,
  verificationEmailHtml,
  adminNewUserHtml,
} from '../services/emailService';
import { env } from '../config/env';

// ============================================================================
// /api/auth — registration, login, session.
// Rebuild of the legacy HeroUser (LoopBack base `User`) auth against Postgres.
// bcrypt for hashing (LoopBack also used bcrypt, so migrated hashes verify),
// JWT for sessions.
// ============================================================================

const router = Router();

// POST /api/auth/register
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password, firstname, lastname, mobile, subdomain } = req.body ?? {};
    if (!email || !password) throw new HttpError(400, 'Email and password are required');

    const normEmail = String(email).toLowerCase().trim();
    const existing = await prisma.heroUser.findUnique({ where: { email: normEmail } });
    if (existing) throw new HttpError(409, 'Email already registered');

    const hash = await bcrypt.hash(String(password), 12);
    const code = genCode();

    const user = await prisma.heroUser.create({
      data: {
        email: normEmail,
        password: hash,
        firstname: firstname ?? null,
        lastname: lastname ?? null,
        mobile: mobile ?? null,
        subdomain: subdomain ?? null,
        verificationtoken: String(code),
        emailverified: 0,
      },
    });

    // Best-effort emails — never fail registration if SMTP is down/unconfigured.
    if (isEmailEnabled()) {
      Promise.allSettled([
        sendMail({ to: user.email, subject: 'Verify your Hero Explorer account', html: verificationEmailHtml(user.email, code) }),
        sendMail({ to: env.ADMIN_NOTIFY_EMAILS.split(','), subject: 'New user sign up!', html: adminNewUserHtml(user) }),
      ]).catch(() => undefined);
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ token, user: toPublicUser(user) });
  }),
);

// POST /api/auth/login
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) throw new HttpError(400, 'Email and password are required');

    const user = await prisma.heroUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) throw new HttpError(401, 'Invalid credentials');

    const valid = await bcrypt.compare(String(password), user.password);
    if (!valid) throw new HttpError(401, 'Invalid credentials');

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.json({ token, user: toPublicUser(user) });
  }),
);

// GET /api/auth/me
router.get(
  '/me',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const user = await prisma.heroUser.findUnique({ where: { id: req.user!.userId } });
    if (!user) throw new HttpError(404, 'User not found');
    res.json(toPublicUser(user));
  }),
);

// POST /api/auth/logout — JWT is stateless; provided for client symmetry.
router.post('/logout', authenticate, (_req: Request, res: Response) => {
  res.status(204).send();
});

export default router;
