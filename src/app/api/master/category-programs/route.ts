export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/master/category-programs - Get all program categories
export async function GET() {
  try {
    const categories = await prisma.categoryProgram.findMany({
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      data: categories,
      total: categories.length
    });
  } catch (error) {
    console.error("Error fetching program categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch program categories" },
      { status: 500 }
    );
  }
}

// POST /api/master/category-programs - Create new program category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.categoryProgram.findUnique({
      where: { name: name.trim() }
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 }
      );
    }

    // Create new category
    const category = await prisma.categoryProgram.create({
      data: {
        name: name.trim()
      }
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating program category:", error);
    return NextResponse.json(
      { error: "Failed to create program category" },
      { status: 500 }
    );
  }
}
