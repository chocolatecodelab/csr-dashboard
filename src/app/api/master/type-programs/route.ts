export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/master/type-programs - Get all program types
export async function GET() {
  try {
    const types = await prisma.typeProgram.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      data: types,
      total: types.length
    });
  } catch (error) {
    console.error("Error fetching program types:", error);
    return NextResponse.json(
      { error: "Failed to fetch program types" },
      { status: 500 }
    );
  }
}

// POST /api/master/type-programs - Create new program type
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama tipe program wajib diisi" },
        { status: 400 }
      );
    }

    // Check if type with same name already exists
    const existingType = await prisma.typeProgram.findUnique({
      where: { name: name.trim() }
    });

    if (existingType) {
      return NextResponse.json(
        { error: "Tipe program dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Create new type
    const type = await prisma.typeProgram.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(type, { status: 201 });
  } catch (error) {
    console.error("Error creating program type:", error);
    return NextResponse.json(
      { error: "Failed to create program type" },
      { status: 500 }
    );
  }
}
