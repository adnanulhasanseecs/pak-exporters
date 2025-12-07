/**
 * Register API Route
 * POST /api/auth/register - Register a new user
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken } from "@/lib/auth";
import { registerSchema } from "@/lib/validations/auth";
import { checkAuthRateLimit } from "@/lib/rate-limit-auth";
import {
  logSecurityEvent,
  getUserAgent,
  getClientIP as getSecurityIP,
} from "@/lib/security-logging";
import { validateRequestBodySize } from "@/lib/security-enhanced";

// TODO: Import proper password hashing (bcrypt)
// import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    // Check rate limiting
    const rateLimitCheck = checkAuthRateLimit(request);
    if (!rateLimitCheck.allowed) {
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

    // Validate request body size
    const bodyText = await request.text();
    const bodySizeCheck = validateRequestBodySize(bodyText, 2048); // 2KB max
    if (!bodySizeCheck.isValid) {
      return NextResponse.json(
        { error: bodySizeCheck.error },
        { status: 413 }
      );
    }

    const body = JSON.parse(bodyText);

    // Validate input with Zod
    const validationResult = registerSchema.safeParse(body);
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

    const { email, password, name, role, companyName } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    let companyId: string | undefined;

    // If supplier and companyName provided, create or find company
    if (role === "supplier" && companyName) {
      // Check if company exists by name (case-insensitive search)
      // SQLite doesn't support case-insensitive mode, so we'll search by exact match
      // In production with PostgreSQL, you could use mode: "insensitive"
      let company = await prisma.company.findFirst({
        where: {
          name: companyName,
        },
      });

      if (!company) {
        // Create new company
        company = await prisma.company.create({
          data: {
            name: companyName,
            description: `Company for ${name}`,
            email: email.toLowerCase(),
            city: "Unknown",
            province: "Unknown",
            country: "Pakistan",
            verified: false,
            goldSupplier: false,
            productCount: 0,
          },
        });
      }

      companyId = company.id;
    }

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name,
        password: hashedPassword,
        role,
        companyId,
        membershipStatus: role === "supplier" ? "pending" : null,
      },
      include: {
        company: true,
      },
    });

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Log successful registration
    logSecurityEvent("REGISTER_SUCCESS", getSecurityIP(request), {
      userId: user.id,
      email: user.email,
      userAgent: getUserAgent(request),
      details: { role },
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

    return NextResponse.json(
      {
        user: userResponse,
        token,
        expiresIn: 3600, // 1 hour
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error during registration:", error);
    
    // Log registration failure
    logSecurityEvent("REGISTER_FAILURE", getSecurityIP(request), {
      userAgent: getUserAgent(request),
      details: { error: error.message },
    });

    return NextResponse.json(
      { error: "Registration failed", message: error.message },
      { status: 500 }
    );
  }
}

