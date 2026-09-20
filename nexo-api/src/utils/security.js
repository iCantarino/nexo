import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

const SALT_ROUNDS = 10;

export async function hashPassword(plainPassword) {
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
}

export async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

export function createAccessToken(subject, extraClaims = {}) {
  return jwt.sign({ sub: String(subject), ...extraClaims }, env.jwt.secret, {
    expiresIn: env.jwt.expiresIn,
  });
}

export function decodeAccessToken(token) {
  try {
    return jwt.verify(token, env.jwt.secret);
  } catch {
    return null;
  }
}
