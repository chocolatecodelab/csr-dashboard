import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/stakeholders/[id] - Get single stakeholder
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const stakeholder = await prisma.stakeholder.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true,
            description: true
          }
        },
        contactPerson: {
          select: {
            id: true,
            name: true,
            email: true,
            position: true
          }
        },
        programs: {
          include: {
            program: {
              select: {
                id: true,
                name: true,
                category: true,
                status: true,
                startDate: true,
                endDate: true
              }
            }
          }
        },
        activities: {
          include: {
            activity: {
              select: {
                id: true,
                name: true,
                type: true,
                status: true,
                startDate: true,
                endDate: true
              }
            }
          }
        }
      }
    });

    if (!stakeholder) {
      return NextResponse.json(
        { error: "Stakeholder tidak ditemukan" },
        { status: 404 }
      );
    }

    return NextResponse.json(stakeholder);
  } catch (error) {
    console.error("Error fetching stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to fetch stakeholder" },
      { status: 500 }
    );
  }
}

// PUT /api/stakeholders/[id] - Update stakeholder
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // Check if stakeholder exists
    const existingStakeholder = await prisma.stakeholder.findUnique({
      where: { id }
    });

    if (!existingStakeholder) {
      return NextResponse.json(
        { error: "Stakeholder tidak ditemukan" },
        { status: 404 }
      );
    }

    // Update stakeholder
    const updatedStakeholder = await prisma.stakeholder.update({
      where: { id },
      data: {
        name: body.name,
        type: body.type,
        categoryId: body.categoryId,
        contact: body.contact,
        email: body.email,
        phone: body.phone,
        address: body.address,
        description: body.description,
        importance: body.importance,
        influence: body.influence,
        relationship: body.relationship,
        contactPersonId: body.contactPersonId,
        updatedAt: new Date()
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        contactPerson: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedStakeholder);
  } catch (error) {
    console.error("Error updating stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to update stakeholder" },
      { status: 500 }
    );
  }
}

// DELETE /api/stakeholders/[id] - Delete stakeholder
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const { searchParams } = new URL(request.url);
    const force = searchParams.get('force') === 'true';

    // Check if stakeholder exists
    const existingStakeholder = await prisma.stakeholder.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            programs: true,
            activities: true
          }
        }
      }
    });

    if (!existingStakeholder) {
      return NextResponse.json(
        { error: "Stakeholder tidak ditemukan" },
        { status: 404 }
      );
    }

    // Check for related records
    const hasRelations = existingStakeholder._count.programs > 0 || 
                        existingStakeholder._count.activities > 0;

    if (hasRelations && !force) {
      return NextResponse.json(
        {
          error: "Tidak dapat menghapus stakeholder yang masih memiliki program atau aktivitas terkait",
          canForceDelete: true,
          relatedCounts: {
            programs: existingStakeholder._count.programs,
            activities: existingStakeholder._count.activities
          }
        },
        { status: 400 }
      );
    }

    // If force delete or no relations, proceed with deletion
    if (force && hasRelations) {
      // Use transaction to delete related records first
      await prisma.$transaction(async (tx) => {
        // Delete program stakeholder relationships
        await tx.programStakeholder.deleteMany({
          where: { stakeholderId: id}
        });

        // Delete activity stakeholder relationships
        await tx.activityStakeholder.deleteMany({
          where: { stakeholderId: id }
        });

        // Delete the stakeholder
        await tx.stakeholder.delete({
          where: { id }
        });
      });
    } else {
      // Simple delete if no relations
      await prisma.stakeholder.delete({
        where: { id }
      });
    }

    return NextResponse.json({ 
      message: "Stakeholder berhasil dihapus",
      deletedId: id
    });
  } catch (error) {
    console.error("Error deleting stakeholder:", error);
    return NextResponse.json(
      { error: "Failed to delete stakeholder" },
      { status: 500 }
    );
  }
}