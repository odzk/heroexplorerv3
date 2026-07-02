import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthPayload } from '../types';

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/** Role value that grants admin access (legacy HeroUser.role: 1 = admin). */
export const ADMIN_ROLE = 1;

export const signToken = (payload: { userId: number; email: string; role?: number }): string =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN } as jwt.SignOptions);

const extractToken = (req: Request): string | null => {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return null;
};

/** Require a valid JWT; 401 otherwise. */
export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    req.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};

/** Attach req.user if a valid token is present; never blocks. */
export const optionalAuthenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    } catch {
      /* ignore invalid token — treat as anonymous */
    }
  }
  next();
};

/** Require an authenticated admin (role === ADMIN_ROLE). Use after authenticate, or standalone. */
export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  const token = extractToken(req);
  if (!token) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  try {
    const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
    req.user = payload;
    if (payload.role !== ADMIN_ROLE) {
      res.status(403).json({ message: 'Admin access required' });
      return;
    }
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
