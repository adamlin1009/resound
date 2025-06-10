import prisma from "@/lib/prismadb";
import bcrypt from "bcrypt";
import { NextRequest, NextResponse } from "next/server";
import { withRateLimit, rateLimiters } from "@/lib/rateLimiter";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Password validation: min 8 chars, 1 uppercase, 1 lowercase, 1 number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.register, async () => {
  try {
    const body = await request.json();
    const { email, name, password } = body;

    // Input validation
    if (!email || !name || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate name (min 2 chars, max 50 chars)
    if (name.trim().length < 2 || name.trim().length > 50) {
      return NextResponse.json(
        { error: "Name must be between 2 and 50 characters" },
        { status: 400 }
      );
    }

    // Validate password strength
    if (!PASSWORD_REGEX.test(password)) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters with 1 uppercase, 1 lowercase, and 1 number" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Registration failed" },
        { status: 400 }
      );
    }

    // Hash password and create user
    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        hashedPassword,
      },
      select: {
        id: false,
        email: true,
        name: true,
        image: true,
        createdAt: true,
      }
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
  });
}
