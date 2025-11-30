/* 
==============================================
🚀 REUSABLE CRUD PATTERN ANALYSIS & TEMPLATES
==============================================

Berdasarkan analisis modul Program, berikut adalah komponen-komponen 
yang sangat reusable untuk implementasi CRUD cepat di modul lain:

## 1. ✅ SUDAH REUSABLE (Bisa langsung pakai):
- DataTable Component (/src/components/shared/DataTable.tsx)
- CrudForm Component (/src/components/shared/CrudForm.tsx) 
- useCrud Hook (/src/hooks/useCrud.ts)
- Alert System (/src/components/ui/alert.tsx)

## 2. 🔄 PERLU TEMPLATE (Copy-paste dengan modifikasi minimal):
- API Routes (route.ts & [id]/route.ts)
- Page Components (Listing & Create pages)
- Interface Definitions

## 3. 🎯 STRATEGY: Buat Generator/Template untuk implementasi cepat

==============================================
*/

// Template untuk modul baru - ganti STAKEHOLDER dengan nama modul
export const REUSABLE_PATTERNS = {
  
  // 📋 1. INTERFACE TEMPLATE
  interface: `
interface Stakeholder {
  id: string;
  name: string;
  type: string;
  email?: string;
  phone?: string;
  address?: string;
  status: string;
  tenant: {
    id: string;
    name: string;
    code: string;
  };
  createdBy: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}
  `,

  // 🏗️ 2. API STRUCTURE TEMPLATE
  apiGetAll: `
// GET /api/stakeholders - dengan pagination, search, filter
// Tinggal ganti 'stakeholder' dengan nama model
const totalItems = await prisma.stakeholder.count({ where });
const stakeholders = await prisma.stakeholder.findMany({
  where, orderBy, skip, take: limit,
  include: { tenant: true, createdBy: true }
});
  `,

  // 📝 3. DATATABLE COLUMNS TEMPLATE  
  columns: `
const columns: Column<Stakeholder>[] = [
  {
    key: 'name',
    header: 'Nama',
    sortable: true,
    render: (value, row) => (
      <div>
        <div className="font-medium">{value}</div>
        <div className="text-sm text-gray-500">{row.type}</div>
      </div>
    )
  },
  {
    key: 'status',
    header: 'Status',
    sortable: true,
    render: (value) => (
      <span className="badge">{value}</span>
    )
  }
];
  `,

  // 🎯 4. ACTIONS TEMPLATE
  actions: `
const actions: Action<Stakeholder>[] = [
  {
    label: "Edit",
    icon: "edit",
    href: (row) => \`/stakeholders/\${row.id}/edit\`,
    variant: "primary"
  },
  {
    label: "Hapus", 
    icon: "trash",
    onClick: async (row) => {
      const confirmed = await alert.confirm(
        "Konfirmasi Hapus",
        \`Apakah Anda yakin ingin menghapus \${row.name}?\`
      );
      if (confirmed) {
        const success = await deleteItem(row.id);
        if (success) {
          alert.success("Berhasil dihapus");
        }
      }
    },
    variant: "danger"
  }
];
  `,

  // 📋 5. CRUD FORM FIELDS TEMPLATE
  formFields: `
const fields: FormField[] = [
  {
    name: 'name',
    label: 'Nama',
    type: 'text',
    required: true,
    gridCols: 8
  },
  {
    name: 'type', 
    label: 'Tipe',
    type: 'select',
    required: true,
    gridCols: 4,
    options: [
      { value: 'individual', label: 'Individual' },
      { value: 'organization', label: 'Organisasi' }
    ]
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email', 
    gridCols: 6
  },
  {
    name: 'phone',
    label: 'Telepon',
    type: 'text',
    gridCols: 6
  }
];
  `,

  // 🏠 6. LISTING PAGE TEMPLATE
  listingPage: `
"use client";

import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { DataTable, Column, Action, Filter } from "@/components/shared/DataTable";
import { useCrud } from "@/hooks/useCrud";
import { useAlertContext } from "@/providers/alert-provider";

export default function StakeholdersPage() {
  const {
    data: stakeholders,
    pagination,
    loading,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem
  } = useCrud<Stakeholder>({
    endpoint: '/api/stakeholders'
  });

  const alert = useAlertContext();

  // Define columns, actions, filters...
  
  return (
    <>
      <Breadcrumb pageName="Data Stakeholder" />
      
      <DataTable<Stakeholder>
        title="Daftar Stakeholder"
        data={stakeholders}
        columns={columns}
        actions={actions}
        filters={filters}
        pagination={pagination}
        loading={loading}
        createButton={{ 
          label: "Tambah Stakeholder", 
          href: "/stakeholders/create" 
        }}
        onPageChange={setPage}
        onSort={setSort}
        onFilter={setFilters}
        onSearch={setSearch}
      />
    </>
  );
}
  `,

  // ➕ 7. CREATE PAGE TEMPLATE
  createPage: `
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";
import { CrudForm, FormField } from "@/components/shared/CrudForm";

export default async function CreateStakeholderPage() {
  // Get options for dropdowns if needed
  const tenants = await prisma.tenant.findMany({
    where: { status: 'active' }
  });

  const fields: FormField[] = [
    // Define form fields...
  ];

  return (
    <>
      <Breadcrumb pageName="Tambah Stakeholder" />
      
      <CrudForm
        title="Form Stakeholder Baru"
        fields={fields}
        mode="create"
        apiEndpoint="/api/stakeholders"
        redirectTo="/stakeholders"
        submitLabel="Simpan"
      />
    </>
  );
}
  `
};

/* 
==============================================
🚀 CHECKLIST IMPLEMENTASI MODUL BARU
==============================================

Untuk membuat CRUD modul baru (contoh: Stakeholders):

□ 1. Copy API template → /api/stakeholders/route.ts
□ 2. Copy API detail → /api/stakeholders/[id]/route.ts  
□ 3. Buat interface → types/stakeholder.ts
□ 4. Copy listing page → /stakeholders/page.tsx
□ 5. Copy create page → /stakeholders/create/page.tsx
□ 6. Update sidebar navigation
□ 7. Sesuaikan columns, actions, dan form fields

⏱️ Estimasi waktu: 15-30 menit per modul!

==============================================
*/