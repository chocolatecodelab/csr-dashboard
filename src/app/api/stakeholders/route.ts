export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Sort mapping langsung di route
const STAKEHOLDER_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  name: "name",
  type: "type",
  importance: "importance",
  influence: "influence",
  relationship: "relationship",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  category: { category: { name: "asc" } },
  contactPerson: { contactPerson: { name: "asc" } },
};

// ✅ Simple helper function untuk build orderBy
function buildOrderBy(requestedSort: string, direction: "asc" | "desc"): any {
  const sortConfig = STAKEHOLDER_SORT_MAPPING[requestedSort];

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

// GET /api/stakeholders - Get all stakeholders with pagination and filters
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
    const type = searchParams.get("type") || "";
    const categoryId = searchParams.get("categoryId") || "";
    const relationship = searchParams.get("relationship") || "";

    // Build where clause
    const where: any = {};

    // Search logic
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { address: { contains: search } },
        { contact: { contains: search } },
      ];
    }

    // Additional filters
    if (type) where.type = type;
    if (categoryId) where.categoryId = categoryId;
    if (relationship) where.relationship = relationship;

    // Get total count
    const totalItems = await prisma.stakeholder.count({ where });

    // Get stakeholders with relations
    const stakeholders = await prisma.stakeholder.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        contactPerson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            programs: true,
            activities: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: stakeholders,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching stakeholders:", error);
    return NextResponse.json(
      { error: "Failed to fetch stakeholders" },
      { status: 500 },
    );
  }
}

// POST /api/stakeholders - Create new stakeholder
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      categoryId,
      contact,
      email,
      phone,
      address,
      description,
      importance,
      influence,
      relationship,
      contactPersonId,
    } = body;

    // Validate required fields
    if (!name || !type || !categoryId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Create stakeholder
    const stakeholder = await prisma.stakeholder.create({
      data: {
        name,
        type,
        categoryId,
        contact: contact || null,
        email: email || null,
        phone: phone || null,
        address: address || null,
        description: description || null,
        importance: importance || "medium",
        influence: influence || "medium",
        relationship: relationship || "neutral",
        contactPersonId: contactPersonId || null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
        contactPerson: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(stakeholder, { status: 201 });
  } catch (error) {
    console.error("Error creating stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to create stakeholder" },
      { status: 500 }
    );
  }
}
