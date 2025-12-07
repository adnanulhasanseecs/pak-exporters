/**
 * Reset Password API Route
 * POST /api/auth/reset-password - Reset password with token
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, hashPassword } from "@/lib/auth";
import { passwordResetSchema } from "@/lib/validations/auth";
import {
  logSecurityEvent,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";
import { validateRequestBodySize } from "@/lib/security-enhanced";

export async function POST(request: NextRequest) {
  try {
    // Validate request body size
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
    const validationResult = passwordResetSchema.safeParse(body);
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

    const { token, newPassword } = validationResult.data;

    // Verify token
    let payload;
    try {
      payload = verifyToken(token);
    } catch (error) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // Log successful password reset
    logSecurityEvent("PASSWORD_RESET_SUCCESS", getSecurityIP(request), {
      userId: user.id,
      email: user.email,
      userAgent: getUserAgent(request),
    });

    // In a real app, you would:
    // 1. Invalidate the reset token
    // 2. Optionally invalidate all existing sessions
    // 3. Send confirmation email

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error: any) {
    console.error("Error resetting password:", error);
    
    // Log password reset failure
    logSecurityEvent("PASSWORD_RESET_FAILURE", getSecurityIP(request), {
      userAgent: getUserAgent(request),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Failed to reset password", message: error.message },
      { status: 500 }
    );
  }
}

