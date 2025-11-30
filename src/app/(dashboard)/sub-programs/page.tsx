"use client";

import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataTable, Column, Filter } from "@/components/shared/DataTable";
import { CrudForm } from "@/components/shared/CrudForm";
import { useCrud } from "@/hooks/useCrud";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import { createCrudActions } from "@/components/shared/CrudAction";
import { getDefaultDateRange } from "@/utils/format-date-for-input";
import { useMasterDataTracker } from "@/hooks/useMasterDataTracker";

export const dynamic = 'force-dynamic';

// Define the SubProgram type based on the API response structure
interface SubProgram {
  id: string;
  name: string;
  description?: string;
  programId: string;
  program?: {
    id: string;
    name: string;
  };
  status: string;
  progress: number;
  startDate: string;
  endDate: string;
  budget?: number;
  actualCost?: number;
  _count: {
    activities: number;
    budgets: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main SubPrograms Page Component
export default function SubProgramsPage() {
  const {
    data: subPrograms,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<SubProgram>({
    endpoint: "/api/sub-programs",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingSubProgram,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<SubProgram>({
    endpoint: "/api/sub-programs",
    entityName: "Sub Program",
    refetch,
  });

  // Form state
  const [programs, setPrograms] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        // Load programs
        const programsRes = await fetch("/api/master/programs");

        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setPrograms(programsData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<SubProgram>({
    onEdit: handleEdit,
    onDelete: (subProgram) => handleDelete(subProgram, deleteItem),
  });

  // Define columns for the DataTable
  const columns: Column<SubProgram>[] = [
    {
      key: "name",
      header: "Nama Sub Program",
      sortable: true,
      render: (value, row) => (
        <div className="min-w-[200px] max-w-[300px]">
          <div className="font-medium text-dark dark:text-white">{value}</div>
          {row.description && (
            <div className="max-w-xs truncate text-sm text-dark-4 dark:text-dark-6">
              {row.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "program",
      header: "Program Induk",
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {row.program?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const statusConfig: Record<
          string,
          { label: string; className: string }
        > = {
          planned: {
            label: "Direncanakan",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          active: {
            label: "Aktif",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          },
          completed: {
            label: "Selesai",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          cancelled: {
            label: "Dibatalkan",
            className:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          },
        };
        const config = statusConfig[value] || {
          label: value,
          className: "bg-gray-100 text-gray-800",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    {
      key: "progress",
      header: "Progress",
      sortable: true,
      render: (value) => (
        <div className="w-full">
          <div className="mb-1 flex items-center justify-between text-xs">
            <span className="text-dark-4 dark:text-dark-6">{value}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{ width: `${value}%` }}
            />
          </div>
        </div>
      ),
    },
    {
      key: "budget",
      header: "Anggaran",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">
            {value
              ? `Rp ${value.toLocaleString("id-ID")}`
              : "-"}
          </div>
          {row.actualCost && (
            <div className="text-dark-4 dark:text-dark-6">
              Realisasi: Rp {row.actualCost.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "startDate",
      header: "Periode",
      sortable: true,
      render: (_, row) => {
        const startDate = new Date(row.startDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        const endDate = new Date(row.endDate).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
        return (
          <div className="text-sm">
            <div>{startDate}</div>
            <div className="text-dark-4 dark:text-dark-6">s/d {endDate}</div>
          </div>
        );
      },
    },
    {
      key: "_count",
      header: "Progress",
      render: (_, row) => (
        <div className="text-sm">
          <div>{row._count.activities} Aktivitas</div>
          <div className="text-dark-4 dark:text-dark-6">
            {row._count.budgets} Anggaran
          </div>
        </div>
      ),
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "programId",
      label: "Program Induk",
      type: "select",
      options: programs.map((program) => ({
        value: program.id,
        label: program.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "planned", label: "Direncanakan" },
        { value: "active", label: "Aktif" },
        { value: "completed", label: "Selesai" },
        { value: "cancelled", label: "Dibatalkan" },
      ],
    },
  ];

  if (error) {
    return (
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  // Form field definitions for sub program CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Sub Program",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama sub program",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea" as const,
      placeholder: "Masukkan deskripsi sub program",
      rows: 3,
    },
    {
      name: "programId",
      label: "Program Induk",
      type: "select" as const,
      required: true,
      options: programs.map((program) => ({
        value: program.id,
        label: program.name,
      })),
      placeholder: "Pilih program induk",
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "planned", label: "Direncanakan" },
        { value: "active", label: "Aktif" },
        { value: "completed", label: "Selesai" },
        { value: "cancelled", label: "Dibatalkan" },
      ],
      placeholder: "Pilih status",
    },
    {
      name: "progress",
      label: "Progress (%)",
      type: "number" as const,
      placeholder: "Masukkan progress (0-100)",
      min: 0,
      max: 100,
    },
    {
      name: "budget",
      label: "Anggaran (Rp)",
      type: "number" as const,
      placeholder: "Masukkan anggaran",
      min: 0,
    },
    {
      name: "actualCost",
      label: "Realisasi Biaya (Rp)",
      type: "number" as const,
      placeholder: "Masukkan realisasi biaya",
      min: 0,
    },
    {
      name: "startDate",
      label: "Tanggal Mulai",
      type: "date" as const,
      required: true,
      defaultValue: getDefaultDateRange().startDate,
    },
    {
      name: "endDate",
      label: "Tanggal Selesai",
      type: "date" as const,
      defaultValue: getDefaultDateRange().endDate,
      required: true,
    },
  ];

  // Add master data tracker
  const masterDataTracker = useMasterDataTracker();

  const handleMasterDataChange = useCallback(
    (fieldName: string, action: "create" | "update" | "delete", item: any) => {
      // Record the change
      masterDataTracker.recordChange(fieldName, action, item);

      // Show notification
      const actionText = {
        create: "ditambahkan",
        update: "diperbarui",
        delete: "dihapus",
      };
    },
    [masterDataTracker],
  );

  // Optional: Show changes indicator
  const showChangesIndicator = masterDataTracker.hasChanges;

  return (
    <>
      <Breadcrumb pageName="Data Sub Program" />

      {/* ✅ Optional: Changes indicator */}
      {showChangesIndicator && (
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg
                className="h-5 w-5 text-blue-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Ada {masterDataTracker.changes.length} perubahan data master
              </span>
            </div>
            <button
              onClick={masterDataTracker.clearChanges}
              className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-300"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <DataTable<SubProgram>
        title="Daftar Sub Program"
        description="Kelola dan pantau semua sub program (project) dari program CSR"
        data={subPrograms}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari sub program, deskripsi..."
        emptyMessage="Belum ada sub program. Mulai dengan membuat sub program baru."
        createButton={{
          label: "Buat Sub Program Baru",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={
            editingSubProgram ? "Edit Sub Program" : "Buat Sub Program Baru"
          }
          fields={formFields}
          initialData={editingSubProgram || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
