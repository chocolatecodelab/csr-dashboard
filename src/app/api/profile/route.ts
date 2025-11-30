import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    // TODO: Get user ID from session/auth token
    // For now, we'll get the first user as example
    // In production, replace this with: const userId = await getServerSession()
    
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        position: true,
        employeeId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            level: true,
            permissions: true,
          },
        },
        _count: {
          select: {
            createdPrograms: true,
            assignedActivities: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 },
    );
  }
}

// PUT /api/profile - Update current user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      name,
      email,
      phone,
      position,
      avatar,
      currentPassword,
      newPassword,
      bio,
    } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Check email uniqueness (if email is being changed)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      name,
      email,
      phone,
      position,
      avatar,
    };

    // Handle password change
    if (currentPassword && newPassword) {
      // Verify current password
      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        existingUser.password,
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { error: "Current password is incorrect" },
          { status: 400 },
        );
      }

      // Hash new password
      updateData.password = await bcrypt.hash(newPassword, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        position: true,
        employeeId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        role: {
          select: {
            id: true,
            name: true,
            level: true,
          },
        },
        _count: {
          select: {
            createdPrograms: true,
            assignedActivities: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      data: user,
      message: "Profile updated successfully" 
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 },
    );
  }
}
