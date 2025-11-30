import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/master/category-programs/[id] - Update program category
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Check if category exists
    const existingCategory = await prisma.categoryProgram.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if another category with same name already exists (excluding current)
    const duplicateCategory = await prisma.categoryProgram.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Update category
    const updatedCategory = await prisma.categoryProgram.update({
      where: { id },
      data: {
        name: name.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error("Error updating program category:", error);
    return NextResponse.json(
      { error: "Failed to update program category" },
      { status: 500 }
    );
  }
}

// DELETE /api/master/category-programs/[id] - Delete program category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if category exists
    const existingCategory = await prisma.categoryProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            programs: true
          }
        }
      }
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Kategori tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if category is being used by programs
    if (existingCategory._count.programs > 0) {
      return NextResponse.json(
        { 
          error: "Tidak dapat menghapus kategori yang sedang digunakan oleh program",
          details: `Kategori ini digunakan oleh ${existingCategory._count.programs} program`
        },
        { status: 400 }
      );
    }

    // Delete category
    await prisma.categoryProgram.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Kategori berhasil dihapus",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting program category:", error);
    return NextResponse.json(
      { error: "Failed to delete program category" },
      { status: 500 }
    );
  }
}