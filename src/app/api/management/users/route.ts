export const dynamic = 'force-dynamic';

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// Sort mapping for users
const USER_SORT_MAPPING: { [key: string]: any } = {
  // Direct fields
  'name': 'name',
  'email': 'email',
  'position': 'position',
  'employeeId': 'employeeId',
  'status': 'status',
  'lastLogin': 'lastLogin',
  'createdAt': 'createdAt',
  'updatedAt': 'updatedAt',
  
  // Relation fields
  'department': { department: { name: 'asc' } },
  'role': { role: { name: 'asc' } },
};

// Build orderBy helper
function buildOrderBy(requestedSort: string, direction: 'asc' | 'desc'): any {
  const sortConfig = USER_SORT_MAPPING[requestedSort];
  
  if (!sortConfig) {
    return { createdAt: 'desc' };
  }
  
  if (typeof sortConfig === 'string') {
    return { [sortConfig]: direction };
  } else {
    const orderBy = JSON.parse(JSON.stringify(sortConfig));
    const relationKey = Object.keys(sortConfig)[0];
    const nestedKey = Object.keys(sortConfig[relationKey])[0];
    orderBy[relationKey][nestedKey] = direction;
    return orderBy;
  }
}

// GET /api/management/users - Get users with pagination and filters
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
    const departmentId = searchParams.get("departmentId") || "";
    const roleId = searchParams.get("roleId") || "";
    const status = searchParams.get("status") || "";

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { email: { contains: search } },
        { employeeId: { contains: search } },
        { position: { contains: search } },
      ];
    }

    if (departmentId) where.departmentId = departmentId;
    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    // Get total count for pagination
    const totalItems = await prisma.user.count({ where });

    // Get users with relations
    const users = await prisma.user.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        position: true,
        employeeId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        role: {
          select: { id: true, name: true, level: true },
        },
        _count: {
          select: {
            createdPrograms: true,
            assignedActivities: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit,
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 },
    );
  }
}

// POST /api/management/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      password,
      name,
      avatar,
      phone,
      position,
      employeeId,
      departmentId,
      roleId,
      status,
    } = body;

    // Validate required fields
    if (!email || !password || !name || !departmentId || !roleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 400 },
      );
    }

    // Check if employeeId already exists (if provided)
    if (employeeId) {
      const existingEmployee = await prisma.user.findUnique({
        where: { employeeId },
      });

      if (existingEmployee) {
        return NextResponse.json(
          { error: "Employee ID already exists" },
          { status: 400 },
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        avatar,
        phone,
        position,
        employeeId,
        departmentId,
        roleId,
        status: status || "active",
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        position: true,
        employeeId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        role: {
          select: { id: true, name: true, level: true },
        },
      },
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json(
      { error: "Failed to create user" },
      { status: 500 },
    );
  }
}

// PUT /api/management/users - Update user
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      email,
      password,
      name,
      avatar,
      phone,
      position,
      employeeId,
      departmentId,
      roleId,
      status,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Check email uniqueness (if email is being changed)
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email already exists" },
          { status: 400 },
        );
      }
    }

    // Check employeeId uniqueness (if employeeId is being changed)
    if (employeeId && employeeId !== existingUser.employeeId) {
      const employeeExists = await prisma.user.findUnique({
        where: { employeeId },
      });

      if (employeeExists) {
        return NextResponse.json(
          { error: "Employee ID already exists" },
          { status: 400 },
        );
      }
    }

    // Prepare update data
    const updateData: any = {
      email,
      name,
      avatar,
      phone,
      position,
      employeeId,
      departmentId,
      roleId,
      status,
    };

    // Hash new password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        phone: true,
        position: true,
        employeeId: true,
        status: true,
        lastLogin: true,
        createdAt: true,
        updatedAt: true,
        department: {
          select: { id: true, name: true, code: true },
        },
        role: {
          select: { id: true, name: true, level: true },
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 },
    );
  }
}

// DELETE /api/management/users - Delete user
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            createdPrograms: true,
            assignedActivities: true,
          },
        },
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 },
      );
    }

    // Check if user has related data
    if (existingUser._count.createdPrograms > 0 || existingUser._count.assignedActivities > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete user with existing programs or activities. Please reassign them first." 
        },
        { status: 400 },
      );
    }

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ 
      message: "User deleted successfully",
      id 
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 },
    );
  }
}

