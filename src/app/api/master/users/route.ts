export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/master/users - Get all users
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      include: {
        department: true,
        role: true
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      data: users,
      total: users.length
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

// POST /api/master/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, password, departmentId, roleId, position, phone } = body;

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: "Email user wajib diisi" },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama user wajib diisi" },
        { status: 400 }
      );
    }

    if (!departmentId || !roleId) {
      return NextResponse.json(
        { error: "Department dan Role wajib dipilih" },
        { status: 400 }
      );
    }

    // Check if user with same email already exists
    const existingUser = await prisma.user.findFirst({
      where: { email: email.trim() }
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User dengan email tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email: email.trim(),
        name: name.trim(),
        password: password || "password123", // Default password
        departmentId,
        roleId,
        position: position?.trim() || null,
        phone: phone?.trim() || null
      },
      include: {
        department: true,
        role: true
      }
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 }
    );
  }
}
