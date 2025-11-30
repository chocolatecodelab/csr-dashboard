export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { ApiResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validation
    if (!email || !password) {
      return ApiResponse.error("Email and password are required", 400);
    }

    // Find user
    const user = await prisma.user.findUnique({ 
      where: { email },
      include: {
        role: true,
        department: true
      }
    });

    if (!user) {
      return ApiResponse.error("Invalid email or password", 401);
    }

    // Check if user is active
    if (user.status !== "active") {
      return ApiResponse.error("Your account is not active. Please contact administrator.", 403);
    }

    // Verify password
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return ApiResponse.error("Invalid email or password", 401);
    }

    // Generate JWT token
    const token = await generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.roleId, 
      department: user.departmentId 
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          department: user.department.name,
        },
      },
      { status: 200 }
    );

    // Set HTTP-only cookie
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return ApiResponse.serverError("An error occurred during login");
  }
}
