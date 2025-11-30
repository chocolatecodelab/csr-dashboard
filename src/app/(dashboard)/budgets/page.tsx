"use client";

import { useState, useEffect, useCallback } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataTable, Column, Filter } from "@/components/shared/DataTable";
import { CrudForm } from "@/components/shared/CrudForm";
import { useCrud } from "@/hooks/useCrud";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import { createCrudActions } from "@/components/shared/CrudAction";
import { useMasterDataTracker } from "@/hooks/useMasterDataTracker";

export const dynamic = 'force-dynamic';

// Define the Budget type based on the API response structure
interface Budget {
  id: string;
  name: string;
  type: string;
  category: string;
  amount: number;
  currency: string;
  status: string;
  approvedAmount?: number;
  spentAmount: number;
  period: string;
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  programId?: string;
  program?: {
    id: string;
    name: string;
  };
  projectId?: string;
  project?: {
    id: string;
    name: string;
  };
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt: string;
}

// Main Budgets Page Component
export default function BudgetsPage() {
  const {
    data: budgets,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<Budget>({
    endpoint: "/api/budgets",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingBudget,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Budget>({
    endpoint: "/api/budgets",
    entityName: "Anggaran",
    refetch,
  });

  // Form state
  const [departments, setDepartments] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        // Load departments, programs, projects secara parallel
        const [departmentsRes, programsRes, projectsRes] = await Promise.all([
          fetch("/api/master/departments"),
          fetch("/api/master/programs"),
          fetch("/api/master/projects"),
        ]);

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData.data || []);
        }

        if (programsRes.ok) {
          const programsData = await programsRes.json();
          setPrograms(programsData.data || []);
        }

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Budget>({
    onEdit: handleEdit,
    onDelete: (budget) => handleDelete(budget, deleteItem),
  });

  // Define columns for the DataTable
  const columns: Column<Budget>[] = [
    {
      key: "name",
      header: "Nama Anggaran",
      sortable: true,
      render: (value, row) => (
        <div className="min-w-[200px]">
          <div className="font-medium text-dark dark:text-white">{value}</div>
          <div className="text-sm text-dark-4 dark:text-dark-6">
            {row.period}
          </div>
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      sortable: true,
      render: (value) => {
        const typeConfig: Record<string, { label: string; className: string }> = {
          program: {
            label: "Program",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          },
          project: {
            label: "Sub Program",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          activity: {
            label: "Aktivitas",
            className:
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          },
        };
        const config = typeConfig[value] || {
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
      key: "category",
      header: "Kategori",
      sortable: true,
      render: (value) => {
        const categoryConfig: Record<
          string,
          { label: string; className: string }
        > = {
          operational: {
            label: "Operasional",
            className:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          },
          capital: {
            label: "Modal",
            className:
              "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
          },
          personnel: {
            label: "Personel",
            className:
              "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
          },
          materials: {
            label: "Material",
            className:
              "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          },
          services: {
            label: "Jasa",
            className:
              "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
          },
        };
        const config = categoryConfig[value] || {
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
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const statusConfig: Record<
          string,
          { label: string; className: string }
        > = {
          proposed: {
            label: "Diajukan",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          approved: {
            label: "Disetujui",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          allocated: {
            label: "Dialokasikan",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          },
          spent: {
            label: "Terpakai",
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
      key: "amount",
      header: "Jumlah Anggaran",
      sortable: true,
      render: (value, row) => (
        <div className="text-sm">
          <div className="font-medium">
            {row.currency} {value.toLocaleString("id-ID")}
          </div>
          {row.approvedAmount && (
            <div className="text-dark-4 dark:text-dark-6">
              Disetujui: {row.currency}{" "}
              {row.approvedAmount.toLocaleString("id-ID")}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "spentAmount",
      header: "Realisasi",
      sortable: true,
      render: (value, row) => {
        const percentage = row.amount > 0 ? (value / row.amount) * 100 : 0;
        return (
          <div className="w-full">
            <div className="mb-1 flex items-center justify-between text-xs">
              <span className="font-medium">
                {row.currency} {value.toLocaleString("id-ID")}
              </span>
              <span className="text-dark-4 dark:text-dark-6">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
              <div
                className={`h-2 rounded-full transition-all ${
                  percentage >= 100
                    ? "bg-red-600"
                    : percentage >= 80
                      ? "bg-yellow-600"
                      : "bg-green-600"
                }`}
                style={{ width: `${Math.min(percentage, 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800 dark:bg-gray-900 dark:text-gray-300">
          {row.department?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "program",
      header: "Relasi",
      render: (_, row) => (
        <div className="text-sm">
          {row.program && (
            <div className="truncate">Program: {row.program.name}</div>
          )}
          {row.project && (
            <div className="truncate text-dark-4 dark:text-dark-6">
              Project: {row.project.name}
            </div>
          )}
          {!row.program && !row.project && <div>-</div>}
        </div>
      ),
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "departmentId",
      label: "Department",
      type: "select",
      options: departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    },
    {
      key: "type",
      label: "Tipe",
      type: "select",
      options: [
        { value: "program", label: "Program" },
        { value: "project", label: "Sub Program" },
        { value: "activity", label: "Aktivitas" },
      ],
    },
    {
      key: "category",
      label: "Kategori",
      type: "select",
      options: [
        { value: "operational", label: "Operasional" },
        { value: "capital", label: "Modal" },
        { value: "personnel", label: "Personel" },
        { value: "materials", label: "Material" },
        { value: "services", label: "Jasa" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "proposed", label: "Diajukan" },
        { value: "approved", label: "Disetujui" },
        { value: "allocated", label: "Dialokasikan" },
        { value: "spent", label: "Terpakai" },
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

  // Form field definitions for budget CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Anggaran",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama anggaran",
    },
    {
      name: "type",
      label: "Tipe Anggaran",
      type: "select" as const,
      required: true,
      options: [
        { value: "program", label: "Program" },
        { value: "project", label: "Sub Program" },
        { value: "activity", label: "Aktivitas" },
      ],
      placeholder: "Pilih tipe anggaran",
    },
    {
      name: "category",
      label: "Kategori",
      type: "select" as const,
      required: true,
      options: [
        { value: "operational", label: "Operasional" },
        { value: "capital", label: "Modal" },
        { value: "personnel", label: "Personel" },
        { value: "materials", label: "Material" },
        { value: "services", label: "Jasa" },
      ],
      placeholder: "Pilih kategori",
    },
    {
      name: "departmentId",
      label: "Department",
      type: "select" as const,
      required: true,
      options: departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
      placeholder: "Pilih department",
    },
    {
      name: "programId",
      label: "Program (Opsional)",
      type: "select" as const,
      options: programs.map((program) => ({
        value: program.id,
        label: program.name,
      })),
      placeholder: "Pilih program",
    },
    {
      name: "projectId",
      label: "Sub Program (Opsional)",
      type: "select" as const,
      options: projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
      placeholder: "Pilih sub program",
    },
    {
      name: "amount",
      label: "Jumlah Anggaran (Rp)",
      type: "number" as const,
      required: true,
      placeholder: "Masukkan jumlah anggaran",
      min: 0,
    },
    {
      name: "approvedAmount",
      label: "Jumlah Disetujui (Rp)",
      type: "number" as const,
      placeholder: "Masukkan jumlah yang disetujui",
      min: 0,
    },
    {
      name: "spentAmount",
      label: "Jumlah Terpakai (Rp)",
      type: "number" as const,
      placeholder: "Masukkan jumlah yang sudah terpakai",
      min: 0,
    },
    {
      name: "period",
      label: "Periode",
      type: "text" as const,
      required: true,
      placeholder: "Contoh: Q1-2024, 2024, Jan-Mar 2024",
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "proposed", label: "Diajukan" },
        { value: "approved", label: "Disetujui" },
        { value: "allocated", label: "Dialokasikan" },
        { value: "spent", label: "Terpakai" },
      ],
      placeholder: "Pilih status",
    },
    {
      name: "currency",
      label: "Mata Uang",
      type: "select" as const,
      options: [
        { value: "IDR", label: "IDR (Rupiah)" },
        { value: "USD", label: "USD (Dollar)" },
        { value: "EUR", label: "EUR (Euro)" },
      ],
      placeholder: "Pilih mata uang",
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
      <Breadcrumb pageName="Data Anggaran" />

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

      <DataTable<Budget>
        title="Daftar Anggaran"
        description="Kelola dan pantau semua anggaran CSR berdasarkan program, sub program, dan aktivitas"
        data={budgets}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari nama anggaran, periode..."
        emptyMessage="Belum ada anggaran. Mulai dengan membuat anggaran baru."
        createButton={{
          label: "Buat Anggaran Baru",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={editingBudget ? "Edit Anggaran" : "Buat Anggaran Baru"}
          fields={formFields}
          initialData={editingBudget || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
