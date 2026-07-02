import { HeroUser } from '@prisma/client';
import { PublicUser } from '../types';

/** Strip sensitive fields (password, verification token, realm) from a user row. */
export function toPublicUser(u: HeroUser): PublicUser {
  return {
    id: u.id,
    email: u.email,
    firstname: u.firstname,
    lastname: u.lastname,
    username: u.username,
    mobile: u.mobile,
    profileurl: u.profileurl,
    city: u.city,
    country: u.country,
    province: u.province,
    postcode: u.postcode,
    emailverified: u.emailverified,
    isUpdateOffer: u.isUpdateOffer,
    subdomain: u.subdomain,
    role: u.role,
  };
}

/** Generate a 6-digit numeric verification/reset code (matches legacy behaviour). */
export const genCode = (): number => Math.floor(100000 + Math.random() * 900000);
