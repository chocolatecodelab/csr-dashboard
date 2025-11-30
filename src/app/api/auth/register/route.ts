export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateToken } from "@/lib/jwt";
import { ApiResponse } from "@/lib/api-response";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validation
    if (!name || !email || !password) {
      return ApiResponse.error("Name, email, and password are required", 400);
    }

    if (password.length < 8) {
      return ApiResponse.error("Password must be at least 8 characters", 400);
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ 
      where: { email } 
    });

    if (existingUser) {
      return ApiResponse.error("Email already registered", 409);
    }

    // Get default role (user level)
    let defaultRole = await prisma.role.findFirst({
      where: { level: "user" }
    });

    // If no role exists, create default user role
    if (!defaultRole) {
      defaultRole = await prisma.role.create({
        data: {
          name: "User",
          description: "Default user role",
          level: "user",
          permissions: JSON.stringify([
            "view_programs",
            "view_stakeholders"
          ])
        }
      });
    }

    // Get default department or create one
    let defaultDepartment = await prisma.department.findFirst();

    if (!defaultDepartment) {
      defaultDepartment = await prisma.department.create({
        data: {
          name: "General",
          code: "GEN",
          description: "General department"
        }
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        roleId: defaultRole.id,
        departmentId: defaultDepartment.id,
        status: "active",
      },
      include: {
        role: true,
        department: true
      }
    });

    // Generate JWT token
    const token = await generateToken({ 
      id: user.id, 
      email: user.email, 
      role: user.roleId, 
      department: user.departmentId 
    });

    // Create response with user data
    const response = NextResponse.json(
      {
        success: true,
        message: "Registration successful",
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role.name,
          department: user.department.name,
        },
      },
      { status: 201 }
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
    console.error("Registration error:", error);
    return ApiResponse.serverError("An error occurred during registration");
  }
}

