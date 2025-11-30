export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/master/programs - Get all programs for dropdowns/master data
export async function GET() {
  try {
    const programs = await prisma.program.findMany({
      where: {
        status: {
          in: ["approved", "active"], // Only show approved and active programs
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        _count: {
          select: {
            projects: true,
            stakeholders: true,
            budgets: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: programs,
      count: programs.length,
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}

