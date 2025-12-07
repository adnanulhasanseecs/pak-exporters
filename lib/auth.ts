/**
 * Authentication utilities
 * JWT token generation, password hashing, and auth helpers
 */

import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

// JWT_SECRET must be set in environment variables for security
// In development, we allow it to be optional (with a warning) for public endpoints
const JWT_SECRET = process.env.JWT_SECRET;

// Only throw error in production or when actually using auth functions
if (process.env.NODE_ENV === "production" && !JWT_SECRET) {
  throw new Error(
    "JWT_SECRET environment variable is required in production. Please set it in your .env file."
  );
}

// Warn in development if JWT_SECRET is missing
if (process.env.NODE_ENV !== "production" && !JWT_SECRET) {
  console.warn(
    "⚠️  JWT_SECRET is not set. Authentication features will not work. Set JWT_SECRET in your .env file for full functionality."
  );
}

// Validate JWT_SECRET strength in production
if (process.env.NODE_ENV === "production" && JWT_SECRET && JWT_SECRET.length < 32) {
  throw new Error(
    "JWT_SECRET must be at least 32 characters long in production for security."
  );
}

const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
export function generateToken(payload: TokenPayload): string {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file."
    );
  }
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): TokenPayload {
  if (!JWT_SECRET) {
    throw new Error(
      "JWT_SECRET is not configured. Please set JWT_SECRET in your .env file."
    );
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "object" && decoded !== null && "userId" in decoded) {
      return decoded as TokenPayload;
    }
    throw new Error("Invalid token payload");
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

/**
 * Extract token from Authorization header
 */
export function getTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

/**
 * Get current user from request headers
 */
export async function getCurrentUserFromRequest(
  headers: Headers
): Promise<TokenPayload | null> {
  const authHeader = headers.get("authorization");
  const token = getTokenFromHeader(authHeader);

  if (!token) {
    return null;
  }

  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

