import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// ==============================================
// API TEMPLATE untuk CRUD Operations
// ==============================================
// Ganti [MODEL_NAME] dengan nama model yang sesuai
// Ganti [RELATION_INCLUDES] dengan relasi yang diperlukan
// Ganti [SEARCH_FIELDS] dengan field yang bisa di-search
// ==============================================

// GET /api/[module] - Get all records with pagination and filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;
    
    // Sorting
    const sortColumn = searchParams.get('sort') || 'createdAt';
    const sortDirection = searchParams.get('order') || 'desc';
    
    // Filters
    const search = searchParams.get('search') || '';
    // Add more filters as needed
    const status = searchParams.get('status') || '';
    const category = searchParams.get('category') || '';
    const tenantId = searchParams.get('tenantId') || '';
    
    // Build where clause
    const where: any = {};
    
    // Search logic - UPDATE THESE FIELDS for each model
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        // Add more searchable fields
      ];
    }
    
    // Additional filters
    if (status) where.status = status;
    if (category) where.category = category;
    if (tenantId) where.tenantId = tenantId;

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortColumn] = sortDirection;

    // Get total count
    // @ts-ignore - Template placeholder, replace [MODEL_NAME] with actual model
    const totalItems = await prisma["[MODEL_NAME]"].count({ where });
    
    // Get records with relations - UPDATE INCLUDES for each model
    // @ts-ignore - Template placeholder, replace [MODEL_NAME] with actual model
    const records = await prisma["[MODEL_NAME]"].findMany({
      where,
      orderBy,
      skip,
      take: limit,
      include: {
        // ADD RELATIONS HERE
        tenant: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            // ADD COUNT RELATIONS HERE
          }
        }
      }
    });

    const totalPages = Math.ceil(totalItems / limit);

    return NextResponse.json({
      data: records,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error("Error fetching records:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

// POST /api/[module] - Create new record
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields - UPDATE for each model
    const { name, /* other required fields */ } = body;
    
    if (!name /* || !otherRequired */) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    // Create record - UPDATE fields for each model
    // @ts-ignore - Template placeholder, replace [MODEL_NAME] with actual model
    const newRecord = await prisma["[MODEL_NAME]"].create({
      data: {
        name,
        description: body.description,
        // Add other fields
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        // Same includes as GET
        tenant: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("Error creating record:", error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}