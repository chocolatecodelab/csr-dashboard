export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Sort mapping langsung di route
const PROGRAM_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  'name': 'name',
  'status': 'status',
  'priority': 'priority',
  'startDate': 'startDate',
  'endDate': 'endDate',
  'targetBeneficiary': 'targetBeneficiary',
  'createdAt': 'createdAt',
  'updatedAt': 'updatedAt',
  
  'category': { category: { name: 'asc' } },
  'type': { type: { name: 'asc' } },
  'department': { department: { name: 'asc' } },
  'createdBy': { createdBy: { name: 'asc' } }
};

// ✅ Simple helper function untuk build orderBy
function buildOrderBy(requestedSort: string, direction: 'asc' | 'desc'): any {
  const sortConfig = PROGRAM_SORT_MAPPING[requestedSort];
  
  if (!sortConfig) {
    // Default fallback
    return { createdAt: 'desc' };
  }
  
  if (typeof sortConfig === 'string') {
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

// GET /api/programs - Get programs with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const requestedSort = searchParams.get("sort") || "createdAt";
    const sortDirection = (searchParams.get("order") || "desc") as 'asc' | 'desc';
    const orderBy = buildOrderBy(requestedSort, sortDirection);

    // Filters
    const search = searchParams.get("search") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const typeId = searchParams.get("typeId") || "";
    const status = searchParams.get("status") || "";
    const departmentId = searchParams.get("departmentId") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { targetArea: { contains: search } },
      ];
    }

    if (categoryId) where.categoryId = categoryId;
    if (typeId) where.typeId = typeId;
    if (status) where.status = status;
    if (departmentId) where.departmentId = departmentId;

    // Get total count for pagination
    const totalItems = await prisma.program.count({ where });

    // Get programs with relations
    const programs = await prisma.program.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        createdBy: {
          select: { id: true, name: true, email: true },
        },
        category: {
          select: { id: true, name: true },
        },
        type: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            projects: true,
            stakeholders: true,
            budgets: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: programs,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching programs:", error);
    return NextResponse.json(
      { error: "Failed to fetch programs" },
      { status: 500 },
    );
  }
}

// POST /api/programs - Create new program
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      typeId,
      priority,
      startDate,
      endDate,
      targetBeneficiary,
      targetArea,
      departmentId,
      createdById,
    } = body;

    // Validate required fields
    if (
      !name ||
      !categoryId ||
      !typeId ||
      !startDate ||
      !endDate ||
      !departmentId ||
      !createdById
    ) {
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

    // Create program
    const program = await prisma.program.create({
      data: {
        name,
        description,
        categoryId,
        typeId,
        priority: priority || "medium",
        status: "draft", // Default status for new programs
        startDate: start,
        endDate: end,
        targetBeneficiary: targetBeneficiary
          ? parseInt(targetBeneficiary)
          : null,
        targetArea,
        departmentId,
        createdById,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        type: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(program, { status: 201 });
  } catch (error) {
    console.error("Error creating program:", error);
    return NextResponse.json(
      { error: "Failed to create program" },
      { status: 500 },
    );
  }
}

