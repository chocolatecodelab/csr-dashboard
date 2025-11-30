import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// GET /api/budgets/[id] - Get single budget
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const budget = await prisma.budget.findUnique({
      where: { id },
      include: {
        department: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        program: {
          select: {
            id: true,
            name: true,
            status: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
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
      },
    });

    if (!budget) {
      return NextResponse.json(
        { error: "Anggaran tidak ditemukan" },
        { status: 404 },
      );
    }

    return NextResponse.json(budget);
  } catch (error) {
    console.error("Error fetching budget:", error);
    return NextResponse.json(
      { error: "Failed to fetch budget" },
      { status: 500 },
    );
  }
}

// PUT /api/budgets/[id] - Update budget
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const body = await request.json();
    const { id } = await params;
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

    // Check if budget exists
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Anggaran tidak ditemukan" },
        { status: 404 },
      );
    }

    // Validate amount if provided
    if (amount !== undefined) {
      const amountValue = parseFloat(amount);
      if (amountValue <= 0) {
        return NextResponse.json(
          { error: "Amount must be greater than 0" },
          { status: 400 },
        );
      }
    }

    // Validate approved amount if provided
    if (approvedAmount !== undefined && approvedAmount !== null) {
      const approvedValue = parseFloat(approvedAmount);
      if (approvedValue < 0) {
        return NextResponse.json(
          { error: "Approved amount cannot be negative" },
          { status: 400 },
        );
      }
    }

    // Validate spent amount if provided
    if (spentAmount !== undefined) {
      const spentValue = parseFloat(spentAmount);
      if (spentValue < 0) {
        return NextResponse.json(
          { error: "Spent amount cannot be negative" },
          { status: 400 },
        );
      }
    }

    // Determine if approvedAt should be updated
    const shouldUpdateApprovedAt =
      status === "approved" &&
      existingBudget.status !== "approved" &&
      !existingBudget.approvedAt;

    // Update budget
    const updatedBudget = await prisma.budget.update({
      where: { id },
      data: {
        name: name || existingBudget.name,
        type: type || existingBudget.type,
        category: category || existingBudget.category,
        amount: amount ? parseFloat(amount) : existingBudget.amount,
        currency: currency || existingBudget.currency,
        status: status || existingBudget.status,
        approvedAmount:
          approvedAmount !== undefined
            ? approvedAmount
              ? parseFloat(approvedAmount)
              : null
            : existingBudget.approvedAmount,
        spentAmount:
          spentAmount !== undefined
            ? parseFloat(spentAmount)
            : existingBudget.spentAmount,
        period: period || existingBudget.period,
        departmentId: departmentId || existingBudget.departmentId,
        programId:
          programId !== undefined ? programId : existingBudget.programId,
        projectId:
          projectId !== undefined ? projectId : existingBudget.projectId,
        approvedBy:
          approvedBy !== undefined ? approvedBy : existingBudget.approvedBy,
        approvedAt: shouldUpdateApprovedAt
          ? new Date()
          : existingBudget.approvedAt,
        updatedAt: new Date(),
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

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error("Error updating budget:", error);
    return NextResponse.json(
      { error: "Failed to update budget" },
      { status: 500 },
    );
  }
}

// DELETE /api/budgets/[id] - Delete budget
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    // Check if budget exists
    const existingBudget = await prisma.budget.findUnique({
      where: { id },
    });

    if (!existingBudget) {
      return NextResponse.json(
        { error: "Anggaran tidak ditemukan" },
        { status: 404 },
      );
    }

    // Check if budget can be deleted (prevent deletion if status is 'spent')
    if (existingBudget.status === "spent" && existingBudget.spentAmount > 0) {
      return NextResponse.json(
        {
          error:
            "Tidak dapat menghapus anggaran yang sudah terpakai. Ubah status terlebih dahulu.",
        },
        { status: 400 },
      );
    }

    // Delete the budget
    await prisma.budget.delete({
      where: { id },
    });

    return NextResponse.json({
      message: "Anggaran berhasil dihapus",
      deletedId: id,
    });
  } catch (error) {
    console.error("Error deleting budget:", error);
    return NextResponse.json(
      { error: "Failed to delete budget" },
      { status: 500 },
    );
  }
}
