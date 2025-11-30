import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// DELETE /api/programs/[id] - Delete program with cascade handling
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check URL parameter for force delete
    const { searchParams } = new URL(request.url);
    const forceDelete = searchParams.get('force') === 'true';

    console.log("Attempting to delete program with ID:", id);
    console.log("Force delete:", forceDelete);

    // Check if program exists and get all related data counts
    const existingProgram = await prisma.program.findUnique({
      where: { id },
      include: {
        projects: {
          include: {
            _count: {
              select: {
                activities: true,
                budgets: true
              }
            }
          }
        },
        _count: {
          select: {
            projects: true,
            stakeholders: true, // ProgramStakeholder
            budgets: true,
            reports: true
          }
        }
      }
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program tidak ditemukan" },
        { status: 404 }
      );
    }

    // Calculate total related records
    const totalActivities = existingProgram.projects.reduce((sum, project) => 
      sum + project._count.activities, 0
    );
    
    const totalProjectBudgets = existingProgram.projects.reduce((sum, project) => 
      sum + project._count.budgets, 0
    );

    const relatedCounts = {
      projects: existingProgram._count.projects,
      programStakeholders: existingProgram._count.stakeholders,
      programBudgets: existingProgram._count.budgets,
      reports: existingProgram._count.reports,
      activities: totalActivities,
      projectBudgets: totalProjectBudgets
    };

    console.log("Related data counts:", relatedCounts);

    // **PERBAIKAN: Ubah logika pemeriksaan relasi**
    // Hanya cek relasi penting, abaikan programStakeholders untuk delete biasa
    if (!forceDelete) {
      const hasImportantRelations = 
        relatedCounts.projects > 0 || 
        relatedCounts.programBudgets > 0 ||
        relatedCounts.reports > 0 ||
        relatedCounts.activities > 0 ||
        relatedCounts.projectBudgets > 0;

      if (hasImportantRelations) {
        return NextResponse.json(
          { 
            error: "Program memiliki data terkait yang harus dihapus terlebih dahulu",
            details: {
              projects: relatedCounts.projects,
              programBudgets: relatedCounts.programBudgets,
              reports: relatedCounts.reports,
              activities: relatedCounts.activities,
              projectBudgets: relatedCounts.projectBudgets,
              programStakeholders: relatedCounts.programStakeholders
            },
            canForceDelete: true
          },
          { status: 400 }
        );
      }
    }

    // **PERBAIKAN: Selalu hapus programStakeholders terlebih dahulu**
    // Bahkan untuk delete biasa, hapus programStakeholders
    await prisma.$transaction(async (tx) => {
      console.log("Starting delete transaction...");

      if (forceDelete && (relatedCounts.projects > 0 || relatedCounts.activities > 0)) {
        // Full cascade delete
        console.log("Performing full cascade delete...");

        // Step 1: Delete ActivityReports for all activities in projects of this program
        const activityReportsDeleted = await tx.activityReport.deleteMany({
          where: {
            activity: {
              project: {
                programId: id
              }
            }
          }
        });
        console.log(`Deleted ${activityReportsDeleted.count} activity reports`);

        // Step 2: Delete ActivityStakeholders for all activities in projects of this program
        const activityStakeholdersDeleted = await tx.activityStakeholder.deleteMany({
          where: {
            activity: {
              project: {
                programId: id
              }
            }
          }
        });
        console.log(`Deleted ${activityStakeholdersDeleted.count} activity stakeholders`);

        // Step 3: Delete Activities in all projects of this program
        const activitiesDeleted = await tx.activity.deleteMany({
          where: {
            project: {
              programId: id
            }
          }
        });
        console.log(`Deleted ${activitiesDeleted.count} activities`);

        // Step 4: Delete Budgets related to projects of this program
        const projectBudgetsDeleted = await tx.budget.deleteMany({
          where: {
            project: {
              programId: id
            }
          }
        });
        console.log(`Deleted ${projectBudgetsDeleted.count} project budgets`);

        // Step 5: Delete Projects of this program
        const projectsDeleted = await tx.project.deleteMany({
          where: { programId: id }
        });
        console.log(`Deleted ${projectsDeleted.count} projects`);

        // Step 6: Delete Reports directly related to this program
        const reportsDeleted = await tx.report.deleteMany({
          where: { programId: id }
        });
        console.log(`Deleted ${reportsDeleted.count} reports`);

        // Step 7: Delete Budgets directly related to this program
        const programBudgetsDeleted = await tx.budget.deleteMany({
          where: { programId: id }
        });
        console.log(`Deleted ${programBudgetsDeleted.count} program budgets`);
      }

      // **SELALU hapus ProgramStakeholders terakhir sebelum program**
      const programStakeholdersDeleted = await tx.programStakeholder.deleteMany({
        where: { programId: id }
      });
      console.log(`Deleted ${programStakeholdersDeleted.count} program stakeholders`);

      // Finally delete the Program
      const deletedProgram = await tx.program.delete({
        where: { id }
      });
      console.log(`Deleted program: ${deletedProgram.name}`);

      return deletedProgram;
    });

    console.log("Program deleted successfully:", id);

    return NextResponse.json(
      { 
        message: "Program berhasil dihapus",
        details: forceDelete ? 
          `Program "${existingProgram.name}" beserta semua data terkait telah dihapus.` :
          `Program "${existingProgram.name}" telah dihapus.`
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error deleting program:", error);
    
    // Handle specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint') || error.message.includes('FOREIGN KEY')) {
        return NextResponse.json(
          { 
            error: "Tidak dapat menghapus program karena masih terhubung dengan data lain",
            details: "Program masih memiliki relasi dengan data lain. Gunakan force delete jika diperlukan."
          },
          { status: 400 }
        );
      }
      
      if (error.message.includes('Record to delete does not exist')) {
        return NextResponse.json(
          { error: "Program tidak ditemukan atau sudah dihapus" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        error: "Gagal menghapus program",
        details: error instanceof Error ? error.message : "Terjadi kesalahan pada server"
      },
      { status: 500 }
    );
  }
}

// GET /api/programs/[id] - Get single program
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    const program = await prisma.program.findUnique({
      where: { id },
      include: {
        department: {
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
        projects: {
          include: {
            _count: {
              select: {
                activities: true
              }
            }
          }
        },
        stakeholders: {
          include: {
            stakeholder: {
              select: {
                id: true,
                name: true,
                type: true
              }
            }
          }
        },
        budgets: true,
        _count: {
          select: {
            projects: true,
            stakeholders: true,
            budgets: true
          }
        }
      }
    });

    if (!program) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(program);
  } catch (error) {
    console.error("Error fetching program:", error);
    return NextResponse.json(
      { error: "Failed to fetch program" },
      { status: 500 }
    );
  }
}

// PUT /api/programs/[id] - Update program
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const {
      name,
      description,
      category,
      type,
      status,
      priority,
      startDate,
      endDate,
      targetBeneficiary,
      targetArea
    } = body;

    // Check if program exists
    const existingProgram = await prisma.program.findUnique({
      where: { id }
    });

    if (!existingProgram) {
      return NextResponse.json(
        { error: "Program not found" },
        { status: 404 }
      );
    }

    // Validate dates if provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start >= end) {
        return NextResponse.json(
          { error: "End date must be after start date" },
          { status: 400 }
        );
      }
    }

    // Update program
    const updatedProgram = await prisma.program.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category && { category }),
        ...(type && { type }),
        ...(status && { status }),
        ...(priority && { priority }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(targetBeneficiary !== undefined && { 
          targetBeneficiary: targetBeneficiary ? parseInt(targetBeneficiary) : null 
        }),
        ...(targetArea !== undefined && { targetArea }),
        updatedAt: new Date()
      },
      include: {
        department: {
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

    return NextResponse.json(updatedProgram);
  } catch (error) {
    console.error("Error updating program:", error);
    return NextResponse.json(
      { error: "Failed to update program" },
      { status: 500 }
    );
  }
}