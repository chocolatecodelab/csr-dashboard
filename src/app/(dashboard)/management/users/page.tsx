"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataTable, Column, Filter } from "@/components/shared/DataTable";
import { CrudForm } from "@/components/shared/CrudForm";
import { useCrud } from "@/hooks/useCrud";
import { useFormHandlers } from "@/hooks/useFormHandlers";
import { createCrudActions } from "@/components/shared/CrudAction";

export const dynamic = 'force-dynamic';

// Define the User type based on the API response structure
interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  position?: string;
  employeeId?: string;
  status: string;
  lastLogin?: string;
  department: {
    id: string;
    name: string;
    code: string;
  };
  role: {
    id: string;
    name: string;
    level: string;
  };
  _count: {
    createdPrograms: number;
    assignedActivities: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Main Users Page Component
export default function UsersPage() {
  const {
    data: users,
    pagination,
    loading,
    error,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    refetch,
  } = useCrud<User>({
    endpoint: "/api/management/users",
  });

  // Form handlers using the custom hook
  const {
    showForm,
    editingItem: editingUser,
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
  } = useFormHandlers<User>({
    endpoint: "/api/management/users",
    entityName: "User",
    refetch,
  });

  // Form state
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);

  // Load form options
  useEffect(() => {
    const loadFormOptions = async () => {
      try {
        const [departmentsRes, rolesRes] = await Promise.all([
          fetch("/api/master/departments"),
          fetch("/api/management/roles?limit=100"),
        ]);

        if (departmentsRes.ok) {
          const departmentsData = await departmentsRes.json();
          setDepartments(departmentsData.data || []);
        }

        if (rolesRes.ok) {
          const rolesData = await rolesRes.json();
          setRoles(rolesData.data || []);
        }
      } catch (error) {
        console.error("Error loading form options:", error);
      }
    };

    loadFormOptions();
  }, []);

  // Create actions using the reusable function
  const actions = createCrudActions<User>({
    onEdit: handleEdit,
    onDelete: (user) => handleDelete(user, deleteItem),
  });

  // Define columns for the DataTable
  const columns: Column<User>[] = [
    {
      key: "name",
      header: "Nama",
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center gap-3">
          {row.avatar ? (
            <img
              src={row.avatar}
              alt={value}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
              {value.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-medium text-dark dark:text-white">{value}</div>
            <div className="text-sm text-dark-4 dark:text-dark-6">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "employeeId",
      header: "ID Karyawan",
      sortable: true,
      render: (value) => (
        <span className="font-mono text-sm">{value || "-"}</span>
      ),
    },
    {
      key: "position",
      header: "Posisi",
      sortable: true,
      render: (value) => value || "-",
    },
    {
      key: "department",
      header: "Department",
      sortable: true,
      render: (_, row) => (
        <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:bg-blue-900 dark:text-blue-300">
          {row.department?.name || "N/A"}
        </span>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (_, row) => {
        const levelConfig: Record<string, { className: string }> = {
          super_admin: { className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300" },
          admin: { className: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300" },
          manager: { className: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300" },
          user: { className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" },
        };
        const config = levelConfig[row.role?.level] || levelConfig.user;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {row.role?.name || "N/A"}
          </span>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (value) => {
        const statusConfig: Record<string, { label: string; className: string }> = {
          active: {
            label: "Aktif",
            className: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
          },
          inactive: {
            label: "Nonaktif",
            className: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
          },
          suspended: {
            label: "Ditangguhkan",
            className: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
          },
        };
        const config = statusConfig[value] || statusConfig.active;
        return (
          <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${config.className}`}>
            {config.label}
          </span>
        );
      },
    },
    {
      key: "_count",
      header: "Aktivitas",
      render: (_, row) => (
        <div className="text-sm">
          <div>{row._count.createdPrograms} Program</div>
          <div className="text-dark-4 dark:text-dark-6">
            {row._count.assignedActivities} Tugas
          </div>
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Login Terakhir",
      sortable: true,
      render: (value) => {
        if (!value) return <span className="text-dark-4 dark:text-dark-6">Belum pernah</span>;
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
      key: "departmentId",
      label: "Department",
      type: "select",
      options: departments.map((dept) => ({
        value: dept.id,
        label: dept.name,
      })),
    },
    {
      key: "roleId",
      label: "Role",
      type: "select",
      options: roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      options: [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
        { value: "suspended", label: "Ditangguhkan" },
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

  // Form field definitions for user CRUD
  const formFields = [
    {
      name: "name",
      label: "Nama Lengkap",
      type: "text" as const,
      required: true,
      placeholder: "Masukkan nama lengkap",
    },
    {
      name: "email",
      label: "Email",
      type: "email" as const,
      required: true,
      placeholder: "contoh@email.com",
    },
    {
      name: "password",
      label: editingUser ? "Password (kosongkan jika tidak ingin mengubah)" : "Password",
      type: "password" as const,
      required: !editingUser,
      placeholder: "Masukkan password",
      minLength: 6,
    },
    {
      name: "employeeId",
      label: "ID Karyawan",
      type: "text" as const,
      placeholder: "Masukkan ID karyawan",
    },
    {
      name: "position",
      label: "Posisi/Jabatan",
      type: "text" as const,
      placeholder: "Masukkan posisi",
    },
    {
      name: "phone",
      label: "No. Telepon",
      type: "text" as const,
      placeholder: "08123456789",
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
      name: "roleId",
      label: "Role",
      type: "select" as const,
      required: true,
      options: roles.map((role) => ({
        value: role.id,
        label: role.name,
      })),
      placeholder: "Pilih role",
    },
    {
      name: "status",
      label: "Status",
      type: "select" as const,
      required: true,
      options: [
        { value: "active", label: "Aktif" },
        { value: "inactive", label: "Nonaktif" },
        { value: "suspended", label: "Ditangguhkan" },
      ],
      placeholder: "Pilih status",
    },
  ];

  return (
    <>
      <Breadcrumb pageName="Manajemen Pengguna" />

      <DataTable<User>
        title="Daftar Pengguna"
        description="Kelola akun pengguna dan hak akses sistem"
        data={users}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        searchPlaceholder="Cari nama, email, atau ID karyawan..."
        emptyMessage="Belum ada pengguna. Mulai dengan membuat pengguna baru."
        createButton={{
          label: "Tambah Pengguna",
          onClick: handleCreate,
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />

      {showForm && (
        <CrudForm
          title={editingUser ? "Edit Pengguna" : "Tambah Pengguna Baru"}
          fields={formFields}
          initialData={editingUser || undefined}
          onSubmit={handleFormSubmit}
          onClose={closeForm}
          isLoading={false}
        />
      )}
    </>
  );
}
