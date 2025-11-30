"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataTable, Column, Filter } from "@/components/shared/DataTable";
import { CrudForm } from "@/components/shared/CrudForm";
import { useCrud } from "@/hooks/useCrud";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import { createCrudActions } from "@/components/shared/CrudAction";

export const dynamic = 'force-dynamic';

// Define the Role type based on the API response structure
interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string; // JSON string
  level: string;
  _count: {
    users: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main Roles Page Component
export default function RolesPage() {
  const {
    data: roles,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<Role>({
    endpoint: "/api/management/roles",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingRole,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<Role>({
    endpoint: "/api/management/roles",
    entityName: "Role",
    refetch,
  });

  // State for permissions
  const [permissions, setPermissions] = useState<any[]>([]);
  const [permissionCategories, setPermissionCategories] = useState<string[]>([]);

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        const response = await fetch("/api/management/permissions");
        if (response.ok) {
          const data = await response.json();
          setPermissions(data.data || []);
          setPermissionCategories(data.categories || []);
        }
      } catch (error) {
        console.error("Error loading permissions:", error);
      }
    };

    loadPermissions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<Role>({
    onEdit: handleEdit,
    onDelete: (role) => handleDelete(role, deleteItem),
  });

  // Define columns for the DataTable
  const columns: Column<Role>[] = [
    {
      key: "name",
      header: "Nama Role",
      sortable: true,
      render: (value, row) => (
        <div>
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
      key: "level",
      header: "Level",
      sortable: true,
      render: (value) => {
        const levelConfig: Record<string, { label: string; className: string }> = {
          super_admin: {
            label: "Super Admin",
            className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          },
          admin: {
            label: "Admin",
            className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
          },
          manager: {
            label: "Manager",
            className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
          },
          user: {
            label: "User",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
        };
        const config = levelConfig[value] || {
          label: value,
          className: "bg-gray-100 text-gray-800",
        };
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "permissions",
      header: "Permissions",
      render: (value) => {
        try {
          const perms = JSON.parse(value || "[]");
          return (
            <div className="flex flex-wrap gap-1">
              {perms.length > 0 ? (
                <>
                  {perms.slice(0, 3).map((perm: string, idx: number) => (
                    <span
                      key={idx}
                      className="inline-flex items-center rounded bg-blue-50 px-2 py-0.5 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                    >
                      {perm.split(".")[0]}
                    </span>
                  ))}
                  {perms.length > 3 && (
                    <span className="text-xs text-dark-4 dark:text-dark-6">
                      +{perms.length - 3} lainnya
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-dark-4 dark:text-dark-6">Tidak ada</span>
              )}
            </div>
          );
        } catch {
          return <span className="text-sm text-dark-4 dark:text-dark-6">-</span>;
        }
      },
    },
    {
      key: "_count",
      header: "Pengguna",
      render: (_, row) => (
        <div className="text-sm font-medium">
          {row._count.users} pengguna
        </div>
      ),
    },
    {
      key: "createdAt",
      header: "Dibuat",
      sortable: true,
      render: (value) => {
        const date = new Date(value);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString("id-ID")}</div>
            <div className="text-dark-4 dark:text-dark-6">
              {date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        );
      },
    },
  ];

  // Define filters
  const filters: Filter[] = [
    {
      key: "level",
      label: "Level",
      type: "select",
      options: [
        { value: "super_admin", label: "Super Admin" },
        { value: "admin", label: "Admin" },
        { value: "manager", label: "Manager" },
        { value: "user", label: "User" },
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

  // Form field definitions for role CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Role",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama role",
    },
    {
      name: "description",
      label: "Deskripsi",
      type: "textarea" as const,
      placeholder: "Masukkan deskripsi role",
      rows: 2,
    },
    {
      name: "level",
      label: "Level",
      type: "select" as const,
      required: true,
      options: [
        { value: "super_admin", label: "Super Admin - Akses penuh sistem" },
        { value: "admin", label: "Admin - Manajemen penuh CSR" },
        { value: "manager", label: "Manager - Supervisi program" },
        { value: "user", label: "User - Akses terbatas" },
      ],
      placeholder: "Pilih level role",
    },
    {
      name: "permissions",
      label: "Permissions (JSON Array)",
      type: "textarea" as const,
      required: true,
      placeholder: '["dashboard.view", "programs.view", "programs.create"]',
      rows: 6,
      description: "Masukkan permissions dalam format JSON array. Lihat halaman Permissions untuk daftar lengkap.",
    },
  ];

  // Transform data before submit to validate and parse permissions JSON
  const handleSubmit = async (data: any) => {
    try {
      // Parse permissions from textarea if it's a string
      let permissionsArray = [];
      if (typeof data.permissions === 'string') {
        permissionsArray = JSON.parse(data.permissions);
      } else if (Array.isArray(data.permissions)) {
        permissionsArray = data.permissions;
      }

      const transformedData = {
        ...data,
        permissions: JSON.stringify(permissionsArray),
      };
      await handleFormSubmit(transformedData);
    } catch (error) {
      console.error("Invalid permissions format:", error);
      // You can add alert notification here if needed
    }
  };

  // Transform initial data to convert permissions JSON string to formatted string
  const getInitialData = () => {
    if (!editingRole) return undefined;
    try {
      const perms = JSON.parse(editingRole.permissions || "[]");
      return {
        ...editingRole,
        permissions: JSON.stringify(perms, null, 2), // Pretty print for textarea
      };
    } catch {
      return {
        ...editingRole,
        permissions: "[]",
      };
    }
  };

  return (
    <>
      <Breadcrumb pageName="Manajemen Role" />

      <DataTable<Role>
        title="Daftar Role"
        description="Kelola role dan permissions pengguna sistem"
        data={roles}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari nama atau deskripsi role..."
        emptyMessage="Belum ada role. Mulai dengan membuat role baru."
        createButton={{
          label: "Tambah Role",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={editingRole ? "Edit Role" : "Tambah Role Baru"}
          fields={formFields}
          initialData={getInitialData()}
          onSubmit={handleSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
