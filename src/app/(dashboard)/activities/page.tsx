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

// Define the Activity type based on the API response structure
interface Activity {
  id: string;
  name: string;
  description?: string;
  type: string;
  status: string;
  priority: string;
  progress: number;
  startDate: string;
  endDate: string;
  location?: string;
  participants?: number;
  budget?: number;
  actualCost?: number;
  projectId: string;
  project?: {
    id: string;
    name: string;
  };
  departmentId: string;
  department?: {
    id: string;
    name: string;
  };
  assignedToId?: string;
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    stakeholders: number;
    reports: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main Activities Page Component
export default function ActivitiesPage() {
  const {
    data: activities,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<Activity>({
    endpoint: "/api/activities",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingActivity,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Activity>({
    endpoint: "/api/activities",
    entityName: "Aktivitas",
    refetch,
  });

  // Form state
  const [projects, setProjects] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        // Load projects, departments, users secara parallel
        const [projectsRes, departmentsRes, usersRes] = await Promise.all([
          fetch("/api/master/projects"),
          fetch("/api/master/departments"),
          fetch("/api/master/users"),
        ]);

        if (projectsRes.ok) {
          const projectsData = await projectsRes.json();
          setProjects(projectsData.data || []);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData.data || []);
        }

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Activity>({
    onEdit: handleEdit,
    onDelete: (activity) => handleDelete(activity, deleteItem),
  });

  // Define columns for the DataTable
  const columns: Column<Activity>[] = [
    {
      key: "name",
      header: "Nama Aktivitas",
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
      key: "project",
      header: "Sub Program",
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {row.project?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      sortable: true,
      render: (value) => {
        const typeConfig: Record<string, { label: string; className: string }> = {
          workshop: {
            label: "Workshop",
            className:
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          },
          training: {
            label: "Pelatihan",
            className:
              "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
          },
          donation: {
            label: "Donasi",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          campaign: {
            label: "Kampanye",
            className:
              "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          },
          construction: {
            label: "Pembangunan",
            className:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          },
          other: {
            label: "Lainnya",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
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
          ongoing: {
            label: "Berlangsung",
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
      key: "priority",
      header: "Prioritas",
      sortable: true,
      render: (value) => {
        const priorityConfig: Record<
          string,
          { label: string; className: string }
        > = {
          low: {
            label: "Rendah",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          medium: {
            label: "Sedang",
            className:
              "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
          },
          high: {
            label: "Tinggi",
            className:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          },
        };
        const config = priorityConfig[value] || {
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
      key: "assignedTo",
      header: "Penanggung Jawab",
      sortable: true,
      render: (_, row) => (
        <div className="text-sm">
          <div className="font-medium">
            {row.assignedTo?.name || "Belum ditugaskan"}
          </div>
          {row.assignedTo?.email && (
            <div className="text-dark-4 dark:text-dark-6">
              {row.assignedTo.email}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "participants",
      header: "Partisipan",
      sortable: true,
      render: (value) => (value ? value.toLocaleString("id-ID") : "-"),
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
      header: "Data Terkait",
      render: (_, row) => (
        <div className="text-sm">
          <div>{row._count.stakeholders} Stakeholder</div>
          <div className="text-dark-4 dark:text-dark-6">
            {row._count.reports} Laporan
          </div>
        </div>
      ),
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "projectId",
      label: "Sub Program",
      type: "select",
      options: projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
    },
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
        { value: "workshop", label: "Workshop" },
        { value: "training", label: "Pelatihan" },
        { value: "donation", label: "Donasi" },
        { value: "campaign", label: "Kampanye" },
        { value: "construction", label: "Pembangunan" },
        { value: "other", label: "Lainnya" },
      ],
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "planned", label: "Direncanakan" },
        { value: "ongoing", label: "Berlangsung" },
        { value: "completed", label: "Selesai" },
        { value: "cancelled", label: "Dibatalkan" },
      ],
    },
    {
      key: "priority",
      label: "Prioritas",
      type: "select",
      options: [
        { value: "low", label: "Rendah" },
        { value: "medium", label: "Sedang" },
        { value: "high", label: "Tinggi" },
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

  // Form field definitions for activity CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Aktivitas",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama aktivitas",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea" as const,
      placeholder: "Masukkan deskripsi aktivitas",
      rows: 3,
    },
    {
      name: "projectId",
      label: "Sub Program",
      type: "select" as const,
      required: true,
      options: projects.map((project) => ({
        value: project.id,
        label: project.name,
      })),
      placeholder: "Pilih sub program",
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
      name: "type",
      label: "Tipe Aktivitas",
      type: "select" as const,
      required: true,
      options: [
        { value: "workshop", label: "Workshop" },
        { value: "training", label: "Pelatihan" },
        { value: "donation", label: "Donasi" },
        { value: "campaign", label: "Kampanye" },
        { value: "construction", label: "Pembangunan" },
        { value: "other", label: "Lainnya" },
      ],
      placeholder: "Pilih tipe aktivitas",
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "planned", label: "Direncanakan" },
        { value: "ongoing", label: "Berlangsung" },
        { value: "completed", label: "Selesai" },
        { value: "cancelled", label: "Dibatalkan" },
      ],
      placeholder: "Pilih status",
    },
    {
      name: "priority",
      label: "Prioritas",
      type: "select" as const,
      required: true,
      options: [
        { value: "low", label: "Rendah" },
        { value: "medium", label: "Sedang" },
        { value: "high", label: "Tinggi" },
      ],
      placeholder: "Pilih prioritas",
    },
    {
      name: "assignedToId",
      label: "Penanggung Jawab",
      type: "select" as const,
      options: users.map((user) => ({
        value: user.id,
        label: user.name,
      })),
      placeholder: "Pilih penanggung jawab",
    },
    {
      name: "location",
      label: "Lokasi",
      type: "text" as const,
      placeholder: "Masukkan lokasi aktivitas",
    },
    {
      name: "participants",
      label: "Jumlah Partisipan",
      type: "number" as const,
      placeholder: "Masukkan jumlah partisipan",
      min: 0,
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
      <Breadcrumb pageName="Data Aktivitas" />

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

      <DataTable<Activity>
        title="Daftar Aktivitas"
        description="Kelola dan pantau semua aktivitas dari sub program CSR"
        data={activities}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari aktivitas, deskripsi, lokasi..."
        emptyMessage="Belum ada aktivitas. Mulai dengan membuat aktivitas baru."
        createButton={{
          label: "Buat Aktivitas Baru",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={editingActivity ? "Edit Aktivitas" : "Buat Aktivitas Baru"}
          fields={formFields}
          initialData={editingActivity || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
