import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/master/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { email, name, departmentId, roleId, position, phone, status } = body;

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

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if another user with same email already exists (excluding current)
    const duplicateUser = await prisma.user.findFirst({
      where: {
        email: email.trim(),
        id: { not: id }
      }
    });

    if (duplicateUser) {
      return NextResponse.json(
        { error: "User dengan email tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        email: email.trim(),
        name: name.trim(),
        departmentId: departmentId || existingUser.departmentId,
        roleId: roleId || existingUser.roleId,
        position: position?.trim() || null,
        phone: phone?.trim() || null,
        status: status || existingUser.status,
        updatedAt: new Date()
      },
      include: {
        department: true,
        role: true
      }
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

// DELETE /api/master/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            createdPrograms: true,
            assignedActivities: true,
            stakeholderLinks: true
          }
        }
      }
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if user is being used by programs, activities, or stakeholders
    const totalUsage = existingUser._count.createdPrograms + 
                      existingUser._count.assignedActivities + 
                      existingUser._count.stakeholderLinks;

    if (totalUsage > 0) {
      const usageDetails = [];
      if (existingUser._count.createdPrograms > 0) {
        usageDetails.push(`${existingUser._count.createdPrograms} Program`);
      }
      if (existingUser._count.assignedActivities > 0) {
        usageDetails.push(`${existingUser._count.assignedActivities} Activity`);
      }
      if (existingUser._count.stakeholderLinks > 0) {
        usageDetails.push(`${existingUser._count.stakeholderLinks} Stakeholder`);
      }

      return NextResponse.json(
        { 
          error: "Tidak dapat menghapus user yang sedang digunakan",
          details: `User ini terkait dengan: ${usageDetails.join(', ')}`
        },
        { status: 400 }
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "User berhasil dihapus",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}