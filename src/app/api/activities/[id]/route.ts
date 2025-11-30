import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/activities/[id] - Get single activity
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const activity = await prisma.activity.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            program: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true,
          },
        },
        stakeholders: {
          include: {
            stakeholder: {
              select: {
                id: true,
                name: true,
                type: true,
                contact: true,
              },
            },
          },
        },
        reports: {
          select: {
            id: true,
            impact: true,
            outcomes: true,
            createdAt: true,
          },
        },
      },
    });

    if (!activity) {
      return NextResponse.json(
        { error: "Aktivitas tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(activity);
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Failed to fetch activity" },
      { status: 500 },
    );
  }
}

// PUT /api/activities/[id] - Update activity
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

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Aktivitas tidak ditemukan" },
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

    // Update activity
    const updatedActivity = await prisma.activity.update({
      where: { id },
      data: {
        name: name || existingActivity.name,
        description:
          description !== undefined
            ? description
            : existingActivity.description,
        type: type || existingActivity.type,
        status: status || existingActivity.status,
        priority: priority || existingActivity.priority,
        progress:
          progress !== undefined
            ? parseFloat(progress)
            : existingActivity.progress,
        projectId: projectId || existingActivity.projectId,
        departmentId: departmentId || existingActivity.departmentId,
        assignedToId:
          assignedToId !== undefined ? assignedToId : existingActivity.assignedToId,
        location:
          location !== undefined ? location : existingActivity.location,
        participants:
          participants !== undefined
            ? participants
              ? parseInt(participants)
              : null
            : existingActivity.participants,
        budget:
          budget !== undefined
            ? budget
              ? parseFloat(budget)
              : null
            : existingActivity.budget,
        actualCost:
          actualCost !== undefined
            ? actualCost
              ? parseFloat(actualCost)
              : null
            : existingActivity.actualCost,
        startDate: startDate
          ? new Date(startDate)
          : existingActivity.startDate,
        endDate: endDate ? new Date(endDate) : existingActivity.endDate,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedActivity);
  } catch (error) {
    console.error("Error updating activity:", error);
    return NextResponse.json(
      { error: "Failed to update activity" },
      { status: 500 },
    );
  }
}

// DELETE /api/activities/[id] - Delete activity
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get("force") === "true";

    // Check if activity exists
    const existingActivity = await prisma.activity.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            stakeholders: true,
            reports: true,
          },
        },
      },
    });

    if (!existingActivity) {
      return NextResponse.json(
        { error: "Aktivitas tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check for related records
    const hasRelations =
      existingActivity._count.stakeholders > 0 ||
      existingActivity._count.reports > 0;

    if (hasRelations && !force) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat menghapus aktivitas yang masih memiliki stakeholder atau laporan terkait",
          canForceDelete: true,
          relatedCounts: {
            stakeholders: existingActivity._count.stakeholders,
            reports: existingActivity._count.reports,
          },
        },
        { status: 400 },
      );
    }

    // If force delete or no relations, proceed with deletion
    if (force && hasRelations) {
      // Use transaction to delete related records first
      await prisma.$transaction(async (tx) => {
        // Delete activity stakeholders
        await tx.activityStakeholder.deleteMany({
          where: { activityId: id },
        });

        // Delete activity reports
        await tx.activityReport.deleteMany({
          where: { activityId: id },
        });

        // Delete the activity
        await tx.activity.delete({
          where: { id },
        });
      });
    } else {
      // Simple delete if no relations
      await prisma.activity.delete({
        where: { id },
      });
    }

    return NextResponse.json({
      message: "Aktivitas berhasil dihapus",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting activity:", error);
    return NextResponse.json(
      { error: "Failed to delete activity" },
      { status: 500 },
    );
  }
}
