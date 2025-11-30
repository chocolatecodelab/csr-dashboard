import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/stakeholders/categories/[id] - Update stakeholder category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    // Check if category exists
    const existingCategory = await prisma.stakeholderCategory.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if another category with same name already exists (excluding current)
    const duplicateCategory = await prisma.stakeholderCategory.findFirst({
      where: {
        name: name.trim(),
        id: { not: id },
      },
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 },
      );
    }

    // Update category
    const updatedCategory = await prisma.stakeholderCategory.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type?.trim() || existingCategory.type,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating stakeholder category:", error);
    return NextResponse.json(
      { error: "Failed to update stakeholder category" },
      { status: 500 },
    );
  }
}

// DELETE /api/stakeholders/categories/[id] - Delete stakeholder category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.stakeholderCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stakeholders: true,
          },
        },
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if category is being used
    if (existingCategory._count.stakeholders > 0) {
      return NextResponse.json(
        {
          error: `Kategori tidak dapat dihapus karena masih digunakan oleh ${existingCategory._count.stakeholders} stakeholder`,
        },
        { status: 400 },
      );
    }

    // Delete category
    await prisma.stakeholderCategory.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
    });
  } catch (error) {
    console.error("Error deleting stakeholder category:", error);
    return NextResponse.json(
      { error: "Failed to delete stakeholder category" },
      { status: 500 },
    );
  }
}
