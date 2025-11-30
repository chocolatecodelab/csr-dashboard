export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET /api/master/departments - Get all departments
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        parent: {
          select: {
            id: true,
            name: true,
            code: true,
          }
        },
        _count: {
          select: {
            users: true,
            programs: true,
            activities: true,
            budgets: true,
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json({
      data: departments,
      total: departments.length
    });
  } catch (error) {
    console.error("Error fetching departments:", error);
    return NextResponse.json(
      { error: "Failed to fetch departments" },
      { status: 500 }
    );
  }
}

