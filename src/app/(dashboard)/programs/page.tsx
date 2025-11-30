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

// Define the Program type based on the API response structure
interface Program {
  id: string;
  name: string;
  description?: string;
  categoryId?: string;
  typeId?: string;
  category?: {
    id: string;
    name: string;
  };
  type?: {
    id: string;
    name: string;
  };
  status: string;
  priority: string;
  startDate: string;
  endDate: string;
  targetBeneficiary?: number;
  targetArea?: string;
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    projects: number;
    stakeholders: number;
    budgets: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main Programs Page Component
export default function ProgramsPage() {
  const {
    data: programs,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<Program>({
    endpoint: "/api/programs",
  });

  // Alert context for notifications
  // const alert = useAlertContext();

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingProgram,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Program>({
    endpoint: "/api/programs",
    entityName: "Program",
    refetch,
  });
  // Form state
  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        // Load users, departments, categories, dan types secara parallel
        const [usersRes, departmentsRes, categoriesRes, typesRes] =
          await Promise.all([
            fetch("/api/master/users"),
            fetch("/api/master/departments"),
            fetch("/api/master/category-programs"), // ✅ Fetch categories
            fetch("/api/master/type-programs"), // ✅ Fetch types
          ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData.data || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }

        if (typesRes.ok) {
          const typesData = await typesRes.json();
          setTypes(typesData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Program>({
    onEdit: handleEdit,
    onDelete: (program) => handleDelete(program, deleteItem),
    // extraActions: [
    //   // Add any extra actions specific to programs here
    //   {
    //     label: "Lihat Detail",
    //     icon: "eye",
    //     onClick: (row) => console.log("View details:", row),
    //     variant: "secondary",
    //   }
    // ]
  });

  // Define columns for the DataTable
  const columns: Column<Program>[] = [
    {
      key: "name",
      header: "Nama Program",
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
      key: "category",
      header: "Kategori",
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {row.category?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      sortable: true,
      render: (
        _,
        row, // ✅ Update render untuk relasi
      ) => (
        <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
          {row.type?.name || "N/A"}
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
          draft: {
            label: "Draft",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          approved: {
            label: "Disetujui",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          active: {
            label: "Aktif",
            className:
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          },
          completed: {
            label: "Selesai",
            className:
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
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
              "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          },
          critical: {
            label: "Kritis",
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
      key: "targetBeneficiary",
      header: "Target Penerima",
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
      header: "Progress",
      render: (_, row) => (
        <div className="text-sm">
          <div>{row._count.projects} Project</div>
          <div className="text-dark-4 dark:text-dark-6">
            {row._count.stakeholders} Stakeholder
          </div>
        </div>
      ),
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "categoryId",
      label: "Kategori",
      type: "select",
      options: categories.map((category) => ({
        // ✅ Dynamic options
        value: category.id,
        label: category.name,
      })),
    },
    {
      key: "typeId", // ✅ Ubah dari 'type' ke 'typeId'
      label: "Tipe",
      type: "select",
      options: types.map((type) => ({
        // ✅ Dynamic options
        value: type.id,
        label: type.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "draft", label: "Draft" },
        { value: "approved", label: "Disetujui" },
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
  // Form field definitions for program CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Program",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama program",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea" as const,
      placeholder: "Masukkan deskripsi program",
      rows: 3,
    },
    {
      name: "categoryId",
      label: "Kategori",
      type: "select" as const,
      required: true,
      options: categories.map((category) => ({
        // ✅ Dynamic options
        value: category.id,
        label: category.name,
      })),
      placeholder: "Pilih kategori",
      enableCrud: {
        endpoint: "/api/master/category-programs",
        entityName: "Kategori Program",
        nameField: "name",
      },
      onDataChange: (action: any, item: any) =>
        handleMasterDataChange("categoryId", action, item), 
    },
    {
      name: "typeId",
      label: "Tipe Program",
      type: "select" as const,
      required: true,
      options: types.map((type) => ({
        value: type.id,
        label: type.name,
      })),
      placeholder: "Pilih tipe program",
      enableCrud: {
        endpoint: "/api/master/type-programs",
        entityName: "Tipe Program",
        nameField: "name",
      },
      onDataChange: (action: any, item: any) =>
        handleMasterDataChange("typeId", action, item), 
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "draft", label: "Draft" },
        { value: "approved", label: "Disetujui" },
        { value: "active", label: "Aktif" },
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
        { value: "critical", label: "Kritis" },
      ],
      placeholder: "Pilih prioritas",
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
      name: "createdById",
      label: "Penanggung Jawab",
      type: "select" as const,
      required: true,
      options: users.map((user) => ({
        value: user.id,
        label: user.name,
      })),
      placeholder: "Pilih penanggung jawab",
    },
    {
      name: "targetBeneficiary",
      label: "Target Penerima Manfaat",
      type: "number" as const,
      placeholder: "Masukkan jumlah target penerima manfaat",
      min: 0,
    },
    {
      name: "targetArea",
      label: "Target Area",
      type: "text" as const,
      placeholder: "Masukkan area target program",
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
      if (fieldName === "categoryId") {
        if (action === "create") {
          setCategories((prev) => [...prev, item]);
        } else if (action === "update") {
          setCategories((prev) =>
            prev.map((cat) =>
              cat.id === item.id ? { ...cat, name: item.name } : cat,
            ),
          );
        } else if (action === "delete") {
          setCategories((prev) => prev.filter((cat) => cat.id !== item.id));
        }
      } else if (fieldName === "typeId") {
        if (action === "create") {
          setTypes((prev) => [...prev, item]);
        } else if (action === "update") {
          setTypes((prev) =>
            prev.map((type) =>
              type.id === item.id ? { ...type, name: item.name } : type,
            ),
          );
        } else if (action === "delete") {
          setTypes((prev) => prev.filter((type) => type.id !== item.id));
        }
      }

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
      <Breadcrumb pageName="Data Program CSR" />

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

      <DataTable<Program>
        title="Daftar Program CSR"
        description="Kelola dan pantau semua program Corporate Social Responsibility"
        data={programs}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari program, deskripsi, atau area target..."
        emptyMessage="Belum ada program CSR. Mulai dengan membuat program baru."
        createButton={{
          label: "Buat Program Baru",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={editingProgram ? "Edit Program" : "Buat Program Baru"}
          fields={formFields}
          initialData={editingProgram || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
