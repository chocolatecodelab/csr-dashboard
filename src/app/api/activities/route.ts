export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Sort mapping langsung di route
const ACTIVITY_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  name: "name",
  type: "type",
  status: "status",
  priority: "priority",
  progress: "progress",
  participants: "participants",
  budget: "budget",
  actualCost: "actualCost",
  startDate: "startDate",
  endDate: "endDate",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  // Relation fields
  project: { project: { name: "asc" } },
  department: { department: { name: "asc" } },
  assignedTo: { assignedTo: { name: "asc" } },
};

// ✅ Simple helper function untuk build orderBy
function buildOrderBy(requestedSort: string, direction: "asc" | "desc"): any {
  const sortConfig = ACTIVITY_SORT_MAPPING[requestedSort];

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

// GET /api/activities - Get activities with pagination and filters
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
    const projectId = searchParams.get("projectId") || "";
    const departmentId = searchParams.get("departmentId") || "";
    const type = searchParams.get("type") || "";
    const status = searchParams.get("status") || "";
    const priority = searchParams.get("priority") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
      ];
    }

    if (projectId) where.projectId = projectId;
    if (departmentId) where.departmentId = departmentId;
    if (type) where.type = type;
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // Get total count for pagination
    const totalItems = await prisma.activity.count({ where });

    // Get activities with relations
    const activities = await prisma.activity.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        project: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            stakeholders: true,
            reports: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: activities,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json(
      { error: "Failed to fetch activities" },
      { status: 500 },
    );
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      type,
      status,
      priority,
      progress,
      projectId,
      departmentId,
      assignedToId,
      location,
      participants,
      budget,
      actualCost,
      startDate,
      endDate,
    } = body;

    // Validate required fields
    if (!name || !type || !projectId || !departmentId || !startDate || !endDate) {
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

    // Create activity
    const activity = await prisma.activity.create({
      data: {
        name,
        description: description || null,
        type,
        status: status || "planned",
        priority: priority || "medium",
        progress: progressValue,
        projectId,
        departmentId,
        assignedToId: assignedToId || null,
        location: location || null,
        participants: participants ? parseInt(participants) : null,
        budget: budget ? parseFloat(budget) : null,
        actualCost: actualCost ? parseFloat(actualCost) : null,
        startDate: start,
        endDate: end,
      },
      include: {
        project: {
          select: { id: true, name: true },
        },
        department: {
          select: { id: true, name: true, code: true },
        },
        assignedTo: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: {
            stakeholders: true,
            reports: true,
          },
        },
      },
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    console.error("Error creating activity:", error);
    return NextResponse.json(
      { error: "Failed to create activity" },
      { status: 500 },
    );
  }
}

