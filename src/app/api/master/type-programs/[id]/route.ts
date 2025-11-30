import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// PUT /api/master/type-programs/[id] - Update program type
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
        { error: "Nama tipe program wajib diisi" },
        { status: 400 }
      );
    }

    // Check if type exists
    const existingType = await prisma.typeProgram.findUnique({
      where: { id }
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Tipe program tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if another type with same name already exists (excluding current)
    const duplicateType = await prisma.typeProgram.findFirst({
      where: {
        name: name.trim(),
        id: { not: id }
      }
    });

    if (duplicateType) {
      return NextResponse.json(
        { error: "Tipe program dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Update type
    const updatedType = await prisma.typeProgram.update({
      where: { id },
      data: {
        name: name.trim(),
        updatedAt: new Date()
      }
    });

    return NextResponse.json(updatedType);
  } catch (error) {
    console.error("Error updating program type:", error);
    return NextResponse.json(
      { error: "Failed to update program type" },
      { status: 500 }
    );
  }
}

// DELETE /api/master/type-programs/[id] - Delete program type
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if type exists
    const existingType = await prisma.typeProgram.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            programs: true
          }
        }
      }
    });

    if (!existingType) {
      return NextResponse.json(
        { error: "Tipe program tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check if type is being used by programs
    if (existingType._count.programs > 0) {
      return NextResponse.json(
        { 
          error: "Tidak dapat menghapus tipe program yang sedang digunakan oleh program",
          details: `Tipe program ini digunakan oleh ${existingType._count.programs} program`
        },
        { status: 400 }
      );
    }

    // Delete type
    await prisma.typeProgram.delete({
      where: { id }
    });

    return NextResponse.json({
      message: "Tipe program berhasil dihapus",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting program type:", error);
    return NextResponse.json(
      { error: "Failed to delete program type" },
      { status: 500 }
    );
  }
}