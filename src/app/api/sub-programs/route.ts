export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Sort mapping langsung di route
const SUBPROGRAM_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  name: "name",
  status: "status",
  progress: "progress",
  budget: "budget",
  actualCost: "actualCost",
  startDate: "startDate",
  endDate: "endDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  // Relation fields
  program: { program: { name: "asc" } },
};

// ✅ Simple helper function untuk build orderBy
function buildOrderBy(requestedSort: string, direction: "asc" | "desc"): any {
  const sortConfig = SUBPROGRAM_SORT_MAPPING[requestedSort];

  if (!sortConfig) {
    // Default fallback
    return { createdAt: "desc" };
  }

  if (typeof sortConfig === "string") {
    // Direct field
    return { [sortConfig]: direction };
  } else {
    // Relation field - clone and update direction
    const orderBy = JSON.parse(JSON.stringify(sortConfig));
    const relationKey = Object.keys(sortConfig)[0];
    const nestedKey = Object.keys(sortConfig[relationKey])[0];
    orderBy[relationKey][nestedKey] = direction;
    return orderBy;
  }
}

// GET /api/sub-programs - Get sub programs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const requestedSort = searchParams.get("sort") || "createdAt";
    const sortDirection = (searchParams.get("order") || "desc") as
      | "asc"
      | "desc";
    const orderBy = buildOrderBy(requestedSort, sortDirection);

    // Filters
    const search = searchParams.get("search") || "";
    const programId = searchParams.get("programId") || "";
    const status = searchParams.get("status") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (programId) where.programId = programId;
    if (status) where.status = status;

    // Get total count for pagination
    const totalItems = await prisma.project.count({ where });

    // Get sub programs with relations
    const subPrograms = await prisma.project.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        program: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            activities: true,
            budgets: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: subPrograms,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching sub programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub programs" },
      { status: 500 },
    );
  }
}

// POST /api/sub-programs - Create new sub program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      programId,
      status,
      progress,
      budget,
      actualCost,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!name || !programId || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return NextResponse.json(
        { error: "End date must be after start date" },
        { status: 400 },
      );
    }

    // Validate progress
    const progressValue = progress ? parseFloat(progress) : 0;
    if (progressValue < 0 || progressValue > 100) {
      return NextResponse.json(
        { error: "Progress must be between 0 and 100" },
        { status: 400 },
      );
    }

    // Create sub program
    const subProgram = await prisma.project.create({
      data: {
        name,
        description: description || null,
        programId,
        status: status || "planned",
        progress: progressValue,
        budget: budget ? parseFloat(budget) : null,
        actualCost: actualCost ? parseFloat(actualCost) : null,
        startDate: start,
        endDate: end,
      },
      include: {
        program: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            activities: true,
            budgets: true,
          },
        },
      },
    });

    return NextResponse.json(subProgram, { status: 201 });
  } catch (error) {
    console.error("Error creating sub program:", error);
    return NextResponse.json(
      { error: "Failed to create sub program" },
      { status: 500 },
    );
  }
}

