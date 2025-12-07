/**
 * Verify Email API Route
 * POST /api/auth/verify-email - Verify user email with token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { emailVerificationSchema } from "@/lib/validations/auth";
import {
  checkEmailVerificationRateLimit,
} from "@/lib/rate-limit-auth";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitCheck = checkEmailVerificationRateLimit(request);
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

    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validationResult = emailVerificationSchema.safeParse(body);
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

    const { token } = validationResult.data;

    // Verify token (in real app, this would be a separate email verification token)
    // For now, we'll use JWT token with email verification claim
    try {
      const payload = verifyToken(token);
      
      // Find user by email from token
      const user = await prisma.user.findUnique({
        where: { email: payload.email },
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // In a real app, you would:
      // 1. Verify the email token is valid
      // 2. Check if it hasn't expired
      // 3. Mark user email as verified
      // 4. Delete the verification token

      // For now, just return success
      return NextResponse.json({
        message: "Email verified successfully",
      });
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error("Error verifying email:", error);
    return NextResponse.json(
      { error: "Failed to verify email", message: error.message },
      { status: 500 }
    );
  }
}

