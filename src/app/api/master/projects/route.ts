export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/master/projects - Get all projects for dropdowns/master data
export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      where: {
        status: {
          in: ["planned", "active"], // Only show planned and active projects
        },
      },
      orderBy: {
        name: "asc",
      },
      select: {
        id: true,
        name: true,
        status: true,
        progress: true,
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        startDate: true,
        endDate: true,
        _count: {
          select: {
            activities: true,
            budgets: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: projects,
      count: projects.length,
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }
}

