export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Sort mapping for roles
const ROLE_SORT_MAPPING: { [key: string]: any } = {
  'name': 'name',
  'level': 'level',
  'createdAt': 'createdAt',
  'updatedAt': 'updatedAt',
};

// Build orderBy helper
function buildOrderBy(requestedSort: string, direction: 'asc' | 'desc'): any {
  const sortConfig = ROLE_SORT_MAPPING[requestedSort];
  
  if (!sortConfig) {
    return { createdAt: 'desc' };
  }
  
  if (typeof sortConfig === 'string') {
    return { [sortConfig]: direction };
  }
  
  return { createdAt: 'desc' };
}

// GET /api/management/roles - Get roles with pagination and filters
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
    const level = searchParams.get("level") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
      ];
    }

    if (level) where.level = level;

    // Get total count for pagination
    const totalItems = await prisma.role.count({ where });

    // Get roles with relations
    const roles = await prisma.role.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: roles,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching roles:", error);
    return NextResponse.json(
      { error: "Failed to fetch roles" },
      { status: 500 },
    );
  }
}

// POST /api/management/roles - Create new role
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      permissions,
      level,
    } = body;

    // Validate required fields
    if (!name || !level) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if role name already exists
    const existingRole = await prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      return NextResponse.json(
        { error: "Role name already exists" },
        { status: 400 },
      );
    }

    // Validate level
    const validLevels = ['super_admin', 'admin', 'manager', 'user'];
    if (!validLevels.includes(level)) {
      return NextResponse.json(
        { error: "Invalid level. Must be one of: super_admin, admin, manager, user" },
        { status: 400 },
      );
    }

    // Create role
    const role = await prisma.role.create({
      data: {
        name,
        description,
        permissions: permissions || '[]', // Store as JSON string
        level,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json(role, { status: 201 });
  } catch (error) {
    console.error("Error creating role:", error);
    return NextResponse.json(
      { error: "Failed to create role" },
      { status: 500 },
    );
  }
}

// PUT /api/management/roles - Update role
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      name,
      description,
      permissions,
      level,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 },
      );
    }

    // Check name uniqueness (if name is being changed)
    if (name && name !== existingRole.name) {
      const nameExists = await prisma.role.findUnique({
        where: { name },
      });

      if (nameExists) {
        return NextResponse.json(
          { error: "Role name already exists" },
          { status: 400 },
        );
      }
    }

    // Validate level
    if (level) {
      const validLevels = ['super_admin', 'admin', 'manager', 'user'];
      if (!validLevels.includes(level)) {
        return NextResponse.json(
          { error: "Invalid level. Must be one of: super_admin, admin, manager, user" },
          { status: 400 },
        );
      }
    }

    // Update role
    const role = await prisma.role.update({
      where: { id },
      data: {
        name,
        description,
        permissions: permissions !== undefined ? permissions : existingRole.permissions,
        level,
      },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.error("Error updating role:", error);
    return NextResponse.json(
      { error: "Failed to update role" },
      { status: 500 },
    );
  }
}

// DELETE /api/management/roles - Delete role
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      );
    }

    // Check if role exists
    const existingRole = await prisma.role.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            users: true,
          },
        },
      },
    });

    if (!existingRole) {
      return NextResponse.json(
        { error: "Role not found" },
        { status: 404 },
      );
    }

    // Check if role has users
    if (existingRole._count.users > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete role with existing users. Please reassign them first." 
        },
        { status: 400 },
      );
    }

    // Delete role
    await prisma.role.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "Role deleted successfully",
      id 
    });
  } catch (error) {
    console.error("Error deleting role:", error);
    return NextResponse.json(
      { error: "Failed to delete role" },
      { status: 500 },
    );
  }
}

