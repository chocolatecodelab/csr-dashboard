export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stakeholders/categories - Get all stakeholder categories
export async function GET() {
  try {
    const categories = await prisma.stakeholderCategory.findMany({
      include: {
        _count: {
          select: {
            stakeholders: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: categories,
      total: categories.length,
    });
  } catch (error) {
    console.error("Error fetching stakeholder categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch stakeholder categories" },
      { status: 500 },
    );
  }
}

// POST /api/stakeholders/categories - Create new stakeholder category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, type } = body;

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Nama kategori wajib diisi" },
        { status: 400 },
      );
    }

    if (!type || !type.trim()) {
      return NextResponse.json(
        { error: "Tipe kategori wajib dipilih" },
        { status: 400 },
      );
    }

    // Check if category with same name already exists
    const existingCategory = await prisma.stakeholderCategory.findFirst({
      where: { name: name.trim() },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Kategori dengan nama tersebut sudah ada" },
        { status: 400 },
      );
    }

    // Create new category
    const category = await prisma.stakeholderCategory.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        type: type.trim(),
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    console.error("Error creating stakeholder category:", error);
    return NextResponse.json(
      { error: "Failed to create stakeholder category" },
      { status: 500 },
    );
  }
}

