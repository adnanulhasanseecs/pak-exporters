/**
 * Forgot Password API Route
 * POST /api/auth/forgot-password - Request password reset
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { passwordResetRequestSchema } from "@/lib/validations/auth";
import { checkPasswordResetRateLimit } from "@/lib/rate-limit-auth";
import {
  logSecurityEvent,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";
import { validateRequestBodySize } from "@/lib/security-enhanced";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting for password reset
    const rateLimitCheck = checkPasswordResetRateLimit(request);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { error: rateLimitCheck.error },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimitCheck.retryAfter || 3600),
          },
        }
      );
    }

    // Validate request body size
    const bodyText = await request.text();
    const bodySizeCheck = validateRequestBodySize(bodyText, 512); // 512 bytes max
    if (!bodySizeCheck.isValid) {
      return NextResponse.json(
        { error: bodySizeCheck.error },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);

    // Validate input with Zod
    const validationResult = passwordResetRequestSchema.safeParse(body);
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

    const { email } = validationResult.data;

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    // Don't reveal if user exists (security best practice)
    // Always return success message
    if (user) {
      // Generate password reset token
      const resetToken = generateToken({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      // In a real app, you would:
      // 1. Store reset token in database with expiration
      // 2. Send email with reset link containing token
      // 3. Token should expire in 1 hour

      // Log password reset request
      logSecurityEvent("PASSWORD_RESET_REQUEST", getSecurityIP(request), {
        userId: user.id,
        email: user.email,
        userAgent: getUserAgent(request),
      });

      // For now, just log (in production, send email)
      console.log(`Password reset token for ${user.email}: ${resetToken}`);
    }

    // Always return success (don't reveal if user exists)
    return NextResponse.json({
      message: "If an account exists with this email, a password reset link has been sent",
    });
  } catch (error: any) {
    console.error("Error processing forgot password:", error);
    return NextResponse.json(
      { error: "Failed to process request", message: error.message },
      { status: 500 }
    );
  }
}

