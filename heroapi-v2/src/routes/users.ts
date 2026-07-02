import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/prisma';
import { authenticate } from '../middleware/auth';
import { asyncHandler, HttpError } from '../middleware/error';
import { toPublicUser, genCode } from '../lib/user';
import { sendMail, isEmailEnabled, forgotPasswordHtml } from '../services/emailService';

// ============================================================================
// /api/users — HeroUser custom methods ported from the legacy LoopBack model.
//   Legacy → v2
//   verifyCode / linkVerifyCode          -> POST /verifyCode, GET /linkVerifyCode
//   sentCodeForgotPassword               -> POST /forgot-password
//   recoveryPasswordUseCode              -> POST /recover-password
//   resetPasswordWithEmail               -> POST /reset-password (now AUTH-GATED — see MIGRATION.md)
//   getHeroUserDetailByEmail             -> GET  /detail  (auth-gated, public fields only)
//   (base User profile update)           -> PATCH /profile
// ============================================================================

const router = Router();

const readField = (req: Request, key: string): unknown =>
  (req.body && req.body[key] !== undefined ? req.body[key] : req.query[key]);

// POST /api/users/verifyCode  — confirm email with the 6-digit code
router.post(
  '/verifyCode',
  asyncHandler(async (req: Request, res: Response) => {
    const email = readField(req, 'email');
    const verifyCode = readField(req, 'verifyCode');
    if (!email || verifyCode === undefined) throw new HttpError(400, 'email and verifyCode are required');

    const user = await prisma.heroUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) throw new HttpError(404, 'User not found');
    if (user.verificationtoken !== String(verifyCode)) throw new HttpError(400, 'Invalid verification code');

    const updated = await prisma.heroUser.update({
      where: { id: user.id },
      data: { emailverified: 1, verificationtoken: null },
    });
    res.json({ verified: true, user: toPublicUser(updated) });
  }),
);

// GET /api/users/linkVerifyCode?email=&verifyCode=  — email-link click variant
router.get(
  '/linkVerifyCode',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, verifyCode } = req.query;
    if (!email || verifyCode === undefined) throw new HttpError(400, 'email and verifyCode are required');

    const user = await prisma.heroUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user) throw new HttpError(404, 'User not found');
    if (user.verificationtoken !== String(verifyCode)) throw new HttpError(400, 'Invalid verification code');

    await prisma.heroUser.update({ where: { id: user.id }, data: { emailverified: 1, verificationtoken: null } });
    res.json({ verified: true });
  }),
);

// POST /api/users/forgot-password  (legacy sentCodeForgotPassword)
router.post(
  '/forgot-password',
  asyncHandler(async (req: Request, res: Response) => {
    const email = readField(req, 'email');
    if (!email) throw new HttpError(400, 'email is required');

    const user = await prisma.heroUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    // Do not leak account existence — always respond 200.
    if (user) {
      const code = genCode();
      await prisma.heroUser.update({ where: { id: user.id }, data: { verificationtoken: String(code) } });
      if (isEmailEnabled()) {
        sendMail({ to: user.email, subject: 'Your Hero Explorer reset code', html: forgotPasswordHtml(code) }).catch(
          () => undefined,
        );
      }
    }
    res.json({ message: 'If that account exists, a reset code has been sent.' });
  }),
);

// POST /api/users/recover-password  (legacy recoveryPasswordUseCode)
router.post(
  '/recover-password',
  asyncHandler(async (req: Request, res: Response) => {
    const email = readField(req, 'email');
    const code = readField(req, 'code');
    const password = readField(req, 'password');
    if (!email || !code || !password) throw new HttpError(400, 'email, code and password are required');

    const user = await prisma.heroUser.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!user || user.verificationtoken !== String(code)) throw new HttpError(400, 'Invalid code');

    const hash = await bcrypt.hash(String(password), 12);
    await prisma.heroUser.update({ where: { id: user.id }, data: { password: hash, verificationtoken: null } });
    res.json({ message: 'Password updated successfully' });
  }),
);

// POST /api/users/reset-password  (legacy resetPasswordWithEmail — NOW AUTH-GATED)
// Legacy allowed anyone to reset any password by email alone (critical vuln).
// v2 requires the caller to be authenticated as that user.
router.post(
  '/reset-password',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { password } = req.body ?? {};
    if (!password) throw new HttpError(400, 'password is required');
    const hash = await bcrypt.hash(String(password), 12);
    await prisma.heroUser.update({ where: { id: req.user!.userId }, data: { password: hash } });
    res.json({ message: 'Password updated successfully' });
  }),
);

// GET /api/users/detail?email=  (legacy getHeroUserDetailByEmail — public fields, auth-gated)
router.get(
  '/detail',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.query;
    if (!email) throw new HttpError(400, 'email is required');
    const target = String(email).toLowerCase().trim();

    // Only allow viewing your own record unless you are an admin.
    if (req.user!.email !== target && req.user!.role !== 1) throw new HttpError(403, 'Forbidden');

    const user = await prisma.heroUser.findUnique({ where: { email: target } });
    if (!user) throw new HttpError(404, 'User not found');
    res.json(toPublicUser(user));
  }),
);

// PATCH /api/users/profile  — update own profile (base User parity)
router.patch(
  '/profile',
  authenticate,
  asyncHandler(async (req: Request, res: Response) => {
    const allowed = ['firstname', 'lastname', 'username', 'mobile', 'profileurl', 'city', 'country', 'province', 'postcode', 'isUpdateOffer'] as const;
    const data: Record<string, unknown> = {};
    for (const key of allowed) if (req.body?.[key] !== undefined) data[key] = req.body[key];

    const updated = await prisma.heroUser.update({ where: { id: req.user!.userId }, data });
    res.json(toPublicUser(updated));
  }),
);

export default router;
