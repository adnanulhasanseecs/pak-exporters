/**
 * Login API Route
 * POST /api/auth/login - Authenticate user and return token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPassword, generateToken } from "@/lib/auth";
import { loginSchema } from "@/lib/validations/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit-auth";
import {
  logAuthAttempt,
  logRateLimitExceeded,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";
import { validateRequestBodySize } from "@/lib/security-enhanced";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitCheck = checkAuthRateLimit(request);
    if (!rateLimitCheck.allowed) {
      logRateLimitExceeded(
        getSecurityIP(request),
        "/api/auth/login",
        { userAgent: getUserAgent(request) }
      );
      return NextResponse.json(
        { error: rateLimitCheck.error },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitCheck.retryAfter || 900),
          },
        }
      );
    }

    // Validate request body size (prevent DoS)
    const bodyText = await request.text();
    const bodySizeCheck = validateRequestBodySize(bodyText, 1024); // 1KB max
    if (!bodySizeCheck.isValid) {
      return NextResponse.json(
        { error: bodySizeCheck.error },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);
    
    // Validate input with Zod
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      const errors = validationResult.error.issues.map((issue) => ({
        field: issue.path.join("."),
        message: issue.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", errors },
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
      },
    });

    const clientIP = getSecurityIP(request);
    const userAgent = getUserAgent(request);

    if (!user) {
      // Log failed login attempt
      logAuthAttempt(false, clientIP, email, {
        userAgent,
        reason: "User not found",
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password hash
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      // Log failed login attempt
      logAuthAttempt(false, clientIP, email, {
        userId: user.id,
        userAgent,
        reason: "Invalid password",
      });
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Log successful login
    logAuthAttempt(true, clientIP, email, {
      userId: user.id,
      userAgent,
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user data (without password)
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      companyId: user.companyId || undefined,
      avatar: user.avatar || undefined,
      membershipStatus: user.membershipStatus || undefined,
      membershipTier: user.membershipTier || undefined,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };

    return NextResponse.json({
      user: userResponse,
      token,
      expiresIn: 3600, // 1 hour
    });
  } catch (error: any) {
    console.error("Error during login:", error);
    return NextResponse.json(
      { error: "Login failed", message: error.message },
      { status: 500 }
    );
  }
}

