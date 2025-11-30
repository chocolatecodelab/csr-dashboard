export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ✅ Sort mapping langsung di route
const BUDGET_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  name: "name",
  type: "type",
  category: "category",
  amount: "amount",
  status: "status",
  approvedAmount: "approvedAmount",
  spentAmount: "spentAmount",
  period: "period",
  createdAt: "createdAt",
  updatedAt: "updatedAt",

  // Relation fields
  department: { department: { name: "asc" } },
  program: { program: { name: "asc" } },
  project: { project: { name: "asc" } },
};

// ✅ Simple helper function untuk build orderBy
function buildOrderBy(requestedSort: string, direction: "asc" | "desc"): any {
  const sortConfig = BUDGET_SORT_MAPPING[requestedSort];

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

// GET /api/budgets - Get budgets with pagination and filters
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
    const departmentId = searchParams.get("departmentId") || "";
    const programId = searchParams.get("programId") || "";
    const projectId = searchParams.get("projectId") || "";
    const type = searchParams.get("type") || "";
    const category = searchParams.get("category") || "";
    const status = searchParams.get("status") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { period: { contains: search } },
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (programId) where.programId = programId;
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    // Get total count for pagination
    const totalItems = await prisma.budget.count({ where });

    // Get budgets with relations
    const budgets = await prisma.budget.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        program: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: budgets,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching budgets:", error);
    return NextResponse.json(
      { error: "Failed to fetch budgets" },
      { status: 500 },
    );
  }
}

// POST /api/budgets - Create new budget
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      type,
      category,
      amount,
      currency,
      status,
      approvedAmount,
      spentAmount,
      period,
      departmentId,
      programId,
      projectId,
      approvedBy,
    } = body;

    // Validate required fields
    if (!name || !type || !category || !amount || !period || !departmentId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Validate amount
    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than 0" },
        { status: 400 },
      );
    }

    // Validate approved amount if provided
    if (approvedAmount) {
      const approvedValue = parseFloat(approvedAmount);
      if (approvedValue < 0) {
        return NextResponse.json(
          { error: "Approved amount cannot be negative" },
          { status: 400 },
        );
      }
    }

    // Validate spent amount if provided
    const spentValue = spentAmount ? parseFloat(spentAmount) : 0;
    if (spentValue < 0) {
      return NextResponse.json(
        { error: "Spent amount cannot be negative" },
        { status: 400 },
      );
    }

    // Create budget
    const budget = await prisma.budget.create({
      data: {
        name,
        type,
        category,
        amount: amountValue,
        currency: currency || "IDR",
        status: status || "proposed",
        approvedAmount: approvedAmount ? parseFloat(approvedAmount) : null,
        spentAmount: spentValue,
        period,
        departmentId,
        programId: programId || null,
        projectId: projectId || null,
        approvedBy: approvedBy || null,
        approvedAt:
          status === "approved" && !approvedAmount ? new Date() : null,
      },
      include: {
        department: {
          select: { id: true, name: true, code: true },
        },
        program: {
          select: { id: true, name: true },
        },
        project: {
          select: { id: true, name: true },
        },
      },
    });

    return NextResponse.json(budget, { status: 201 });
  } catch (error) {
    console.error("Error creating budget:", error);
    return NextResponse.json(
      { error: "Failed to create budget" },
      { status: 500 },
    );
  }
}

