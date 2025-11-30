import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// GET /api/settings - Get company settings
export async function GET(request: NextRequest) {
  try {
    // Get the first (and only) company record
    const company = await prisma.company.findFirst({
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        logo: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!company) {
      // Create default company if not exists
      const newCompany = await prisma.company.create({
        data: {
          name: "PT CSR Dashboard",
          code: "CSR-001",
          status: "active",
        },
        select: {
          id: true,
          name: true,
          code: true,
          address: true,
          phone: true,
          email: true,
          website: true,
          logo: true,
          description: true,
          status: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return NextResponse.json({ data: newCompany });
    }

    return NextResponse.json({ data: company });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

// PUT /api/settings - Update company settings
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      code,
      address,
      phone,
      email,
      website,
      logo,
      description,
      status,
    } = body;

    // Get the first company (single tenant)
    const existingCompany = await prisma.company.findFirst();

    if (!existingCompany) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 },
      );
    }

    // Validate required fields
    if (!name || !code) {
      return NextResponse.json(
        { error: "Name and code are required" },
        { status: 400 },
      );
    }

    // Update company
    const company = await prisma.company.update({
      where: { id: existingCompany.id },
      data: {
        name,
        code,
        address,
        phone,
        email,
        website,
        logo,
        description,
        status: status || "active",
      },
      select: {
        id: true,
        name: true,
        code: true,
        address: true,
        phone: true,
        email: true,
        website: true,
        logo: true,
        description: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      data: company,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 },
    );
  }
}
