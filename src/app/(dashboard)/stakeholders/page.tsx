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

// Define the Stakeholder type based on the API response structure
interface Stakeholder {
  id: string;
  name: string;
  type: string;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    type: string;
  };
  contact?: string;
  email?: string;
  phone?: string;
  address?: string;
  description?: string;
  importance: string;
  influence: string;
  relationship: string;
  contactPersonId?: string;
  contactPerson?: {
    id: string;
    name: string;
    email: string;
  };
  _count: {
    programs: number;
    activities: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main Stakeholders Page Component
export default function StakeholdersPage() {
  const {
    data: stakeholders,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<Stakeholder>({
    endpoint: "/api/stakeholders",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingStakeholder,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Stakeholder>({
    endpoint: "/api/stakeholders",
    entityName: "Stakeholder",
    refetch,
  });

  // Form state
  const [users, setUsers] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        // Load users and categories secara parallel
        const [usersRes, categoriesRes] = await Promise.all([
          fetch("/api/master/users"),
          fetch("/api/stakeholders/categories"),
        ]);

        if (usersRes.ok) {
          const usersData = await usersRes.json();
          setUsers(usersData.data || []);
        }

        if (categoriesRes.ok) {
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Stakeholder>({
    onEdit: handleEdit,
    onDelete: (stakeholder) => handleDelete(stakeholder, deleteItem),
  });

  // Define columns for the data table
  const columns: Column<Stakeholder>[] = [
    {
      key: "name",
      header: "Nama Stakeholder",
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-dark dark:text-white">{value}</div>
          {row.category && (
            <div className="text-xs text-dark-4 dark:text-dark-6">
              {row.category.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "type",
      header: "Tipe",
      sortable: true,
      render: (value) => {
        const typeConfig: Record<string, { label: string; className: string }> =
          {
            individual: {
              label: "Individu",
              className:
                "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
            },
            organization: {
              label: "Organisasi",
              className:
                "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
            },
            community: {
              label: "Komunitas",
              className:
                "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
            },
            government: {
              label: "Pemerintah",
              className:
                "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
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
      key: "contact",
      header: "Kontak",
      render: (value, row) => (
        <div className="text-sm">
          {row.email && <div>{row.email}</div>}
          {row.phone && (
            <div className="text-dark-4 dark:text-dark-6">{row.phone}</div>
          )}
          {!row.email && !row.phone && (
            <span className="text-dark-5">-</span>
          )}
        </div>
      ),
    },
    {
      key: "importance",
      header: "Kepentingan",
      sortable: true,
      render: (value) => {
        const importanceConfig: Record<
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
        };
        const config = importanceConfig[value] || {
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
      key: "influence",
      header: "Pengaruh",
      sortable: true,
      render: (value) => {
        const influenceConfig: Record<
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
              "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
          },
          high: {
            label: "Tinggi",
            className:
              "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          },
        };
        const config = influenceConfig[value] || {
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
      key: "relationship",
      header: "Hubungan",
      sortable: true,
      render: (value) => {
        const relationshipConfig: Record<
          string,
          { label: string; className: string }
        > = {
          supporter: {
            label: "Pendukung",
            className:
              "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          neutral: {
            label: "Netral",
            className:
              "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          opponent: {
            label: "Penentang",
            className:
              "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          },
        };
        const config = relationshipConfig[value] || {
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
      key: "_count",
      header: "Keterlibatan",
      render: (value, row) => (
        <div className="text-sm">
          <div>{row._count.programs} Program</div>
          <div className="text-dark-4 dark:text-dark-6">
            {row._count.activities} Aktivitas
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
        value: category.id,
        label: category.name,
      })),
    },
    {
      key: "type",
      label: "Tipe",
      type: "select",
      options: [
        { value: "individual", label: "Individu" },
        { value: "organization", label: "Organisasi" },
        { value: "community", label: "Komunitas" },
        { value: "government", label: "Pemerintah" },
      ],
    },
    {
      key: "relationship",
      label: "Hubungan",
      type: "select",
      options: [
        { value: "supporter", label: "Pendukung" },
        { value: "neutral", label: "Netral" },
        { value: "opponent", label: "Penentang" },
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

  // Form field definitions for stakeholder CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Stakeholder",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama stakeholder",
    },
    {
      name: "type",
      label: "Tipe Stakeholder",
      type: "select" as const,
      required: true,
      options: [
        { value: "individual", label: "Individu" },
        { value: "organization", label: "Organisasi" },
        { value: "community", label: "Komunitas" },
        { value: "government", label: "Pemerintah" },
      ],
      placeholder: "Pilih tipe stakeholder",
    },
    {
      name: "categoryId",
      label: "Kategori",
      type: "select" as const,
      required: true,
      options: categories.map((category) => ({
        value: category.id,
        label: category.name,
      })),
      placeholder: "Pilih kategori",
      enableCrud: {
        endpoint: "/api/stakeholders/categories",
        entityName: "Kategori Stakeholder",
        nameField: "name",
      },
      onDataChange: (action: any, item: any) =>
        handleMasterDataChange("categoryId", action, item),
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      placeholder: "Masukkan email stakeholder",
    },
    {
      name: "phone",
      label: "Nomor Telepon",
      type: "text" as const,
      placeholder: "Masukkan nomor telepon",
    },
    {
      name: "contact",
      label: "Kontak Lainnya",
      type: "text" as const,
      placeholder: "Masukkan informasi kontak lainnya",
    },
    {
      name: "address",
      label: "Alamat",
      type: "textarea" as const,
      placeholder: "Masukkan alamat lengkap",
      rows: 3,
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea" as const,
      placeholder: "Masukkan deskripsi stakeholder",
      rows: 3,
    },
    {
      name: "importance",
      label: "Tingkat Kepentingan",
      type: "select" as const,
      required: true,
      options: [
        { value: "low", label: "Rendah" },
        { value: "medium", label: "Sedang" },
        { value: "high", label: "Tinggi" },
      ],
      placeholder: "Pilih tingkat kepentingan",
    },
    {
      name: "influence",
      label: "Tingkat Pengaruh",
      type: "select" as const,
      required: true,
      options: [
        { value: "low", label: "Rendah" },
        { value: "medium", label: "Sedang" },
        { value: "high", label: "Tinggi" },
      ],
      placeholder: "Pilih tingkat pengaruh",
    },
    {
      name: "relationship",
      label: "Hubungan",
      type: "select" as const,
      required: true,
      options: [
        { value: "supporter", label: "Pendukung" },
        { value: "neutral", label: "Netral" },
        { value: "opponent", label: "Penentang" },
      ],
      placeholder: "Pilih jenis hubungan",
    },
    {
      name: "contactPersonId",
      label: "Contact Person",
      type: "select" as const,
      options: users.map((user) => ({
        value: user.id,
        label: user.name,
      })),
      placeholder: "Pilih contact person (opsional)",
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
      }
    },
    [masterDataTracker],
  );

  // Optional: Show changes indicator
  const showChangesIndicator = masterDataTracker.hasChanges;

  return (
    <>
      <Breadcrumb pageName="Data Stakeholder" />

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

      <DataTable<Stakeholder>
        title="Daftar Stakeholder"
        description="Kelola dan pantau semua stakeholder yang terlibat dalam program CSR"
        data={stakeholders}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari stakeholder, email, atau nomor telepon..."
        emptyMessage="Belum ada stakeholder. Mulai dengan menambahkan stakeholder baru."
        createButton={{
          label: "Tambah Stakeholder",
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
            editingStakeholder ? "Edit Stakeholder" : "Tambah Stakeholder Baru"
          }
          fields={formFields}
          initialData={editingStakeholder || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
