import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/sub-programs/[id] - Get single sub program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const subProgram = await prisma.project.findUnique({
      where: { id },
      include: {
        program: {
          select: {
            id: true,
            name: true,
            category: true,
            status: true,
            startDate: true,
            endDate: true,
          },
        },
        activities: {
          select: {
            id: true,
            name: true,
            type: true,
            status: true,
            startDate: true,
            endDate: true,
            progress: true,
          },
        },
        budgets: {
          select: {
            id: true,
            name: true,
            amount: true,
            spentAmount: true,
            category: true,
          },
        },
      },
    });

    if (!subProgram) {
      return NextResponse.json(
        { error: "Sub program tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(subProgram);
  } catch (error) {
    console.error("Error fetching sub program:", error);
    return NextResponse.json(
      { error: "Failed to fetch sub program" },
      { status: 500 },
    );
  }
}

// PUT /api/sub-programs/[id] - Update sub program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const { id } = await params;
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

    // Check if sub program exists
    const existingSubProgram = await prisma.project.findUnique({
      where: { id },
    });

    if (!existingSubProgram) {
      return NextResponse.json(
        { error: "Sub program tidak ditemukan" },
        { status: 404 },
      );
    }

    // Validate required fields if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 },
        );
      }
    }

    // Validate progress if provided
    if (progress !== undefined) {
      const progressValue = parseFloat(progress);
      if (progressValue < 0 || progressValue > 100) {
        return NextResponse.json(
          { error: "Progress must be between 0 and 100" },
          { status: 400 },
        );
      }
    }

    // Update sub program
    const updatedSubProgram = await prisma.project.update({
      where: { id },
      data: {
        name: name || existingSubProgram.name,
        description: description !== undefined ? description : existingSubProgram.description,
        programId: programId || existingSubProgram.programId,
        status: status || existingSubProgram.status,
        progress: progress !== undefined ? parseFloat(progress) : existingSubProgram.progress,
        budget: budget !== undefined ? (budget ? parseFloat(budget) : null) : existingSubProgram.budget,
        actualCost: actualCost !== undefined ? (actualCost ? parseFloat(actualCost) : null) : existingSubProgram.actualCost,
        startDate: startDate ? new Date(startDate) : existingSubProgram.startDate,
        endDate: endDate ? new Date(endDate) : existingSubProgram.endDate,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedSubProgram);
  } catch (error) {
    console.error("Error updating sub program:", error);
    return NextResponse.json(
      { error: "Failed to update sub program" },
      { status: 500 },
    );
  }
}

// DELETE /api/sub-programs/[id] - Delete sub program
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Check if sub program exists
    const existingSubProgram = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            activities: true,
            budgets: true,
          },
        },
      },
    });

    if (!existingSubProgram) {
      return NextResponse.json(
        { error: "Sub program tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check for related records
    const hasRelations =
      existingSubProgram._count.activities > 0 ||
      existingSubProgram._count.budgets > 0;

    if (hasRelations && !force) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat menghapus sub program yang masih memiliki aktivitas atau anggaran terkait",
          canForceDelete: true,
          relatedCounts: {
            activities: existingSubProgram._count.activities,
            budgets: existingSubProgram._count.budgets,
          },
        },
        { status: 400 },
      );
    }

    // If force delete or no relations, proceed with deletion
    if (force && hasRelations) {
      // Use transaction to delete related records first
      await prisma.$transaction(async (tx) => {
        // Delete related activity stakeholders first
        await tx.activityStakeholder.deleteMany({
          where: {
            activity: {
              projectId: id,
            },
          },
        });

        // Delete related activity reports
        await tx.activityReport.deleteMany({
          where: {
            activity: {
              projectId: id,
            },
          },
        });

        // Delete activities
        await tx.activity.deleteMany({
          where: { projectId: id },
        });

        // Delete budgets
        await tx.budget.deleteMany({
          where: { projectId: id },
        });

        // Delete the sub program
        await tx.project.delete({
          where: { id },
        });
      });
    } else {
      // Simple delete if no relations
      await prisma.project.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      message: "Sub program berhasil dihapus",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting sub program:", error);
    return NextResponse.json(
      { error: "Failed to delete sub program" },
      { status: 500 },
    );
  }
}
