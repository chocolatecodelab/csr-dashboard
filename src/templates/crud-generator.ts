/**
 * 🚀 CRUD GENERATOR HELPER
 * 
 * Script helper untuk generate struktur CRUD modul baru
 * Tinggal ganti konfigurasi di bawah dan copy-paste template
 */

export const CRUD_CONFIG = {
  // 📋 Konfigurasi untuk modul STAKEHOLDERS
  stakeholders: {
    moduleName: 'stakeholders',           // nama folder & route
    modelName: 'stakeholder',             // nama di Prisma
    displayName: 'Stakeholder',           // nama tampilan
    displayNamePlural: 'Data Stakeholder', // nama plural
    
    // 🔍 Field yang bisa di-search
    searchFields: ['name', 'email', 'phone', 'address'],
    
    // 📊 Relasi yang di-include
    includes: {
      tenant: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true, email: true } },
    },
    
    // 🏷️ Filter yang tersedia
    filters: [
      { key: 'type', label: 'Tipe', type: 'select', options: [
        { value: 'individual', label: 'Individual' },
        { value: 'organization', label: 'Organisasi' },
        { value: 'government', label: 'Pemerintah' },
      ]},
      { key: 'status', label: 'Status', type: 'select', options: [
        { value: 'active', label: 'Aktif' },
        { value: 'inactive', label: 'Tidak Aktif' },
      ]},
      { key: 'tenantId', label: 'Cabang', type: 'select' }
    ],
    
    // 📝 Form fields untuk Create/Edit
    formFields: [
      { name: 'name', label: 'Nama', type: 'text', required: true, gridCols: 8 },
      { name: 'type', label: 'Tipe', type: 'select', required: true, gridCols: 4 },
      { name: 'email', label: 'Email', type: 'email', gridCols: 6 },
      { name: 'phone', label: 'Telepon', type: 'text', gridCols: 6 },
      { name: 'address', label: 'Alamat', type: 'textarea', gridCols: 12, rows: 3 },
      { name: 'description', label: 'Deskripsi', type: 'textarea', gridCols: 12, rows: 3 },
      { name: 'status', label: 'Status', type: 'select', required: true, gridCols: 4 },
      { name: 'tenantId', label: 'Cabang', type: 'select', required: true, gridCols: 8 },
    ]
  },

  // 📋 Konfigurasi untuk modul PROJECTS  
  projects: {
    moduleName: 'projects',
    modelName: 'project', 
    displayName: 'Project',
    displayNamePlural: 'Data Project',
    
    searchFields: ['name', 'description', 'location'],
    
    includes: {
      program: { select: { id: true, name: true } },
      tenant: { select: { id: true, name: true, code: true } },
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { activities: true, budgets: true } }
    },
    
    filters: [
      { key: 'status', label: 'Status', type: 'select' },
      { key: 'programId', label: 'Program', type: 'select' },
      { key: 'tenantId', label: 'Cabang', type: 'select' }
    ],
    
    formFields: [
      { name: 'name', label: 'Nama Project', type: 'text', required: true, gridCols: 8 },
      { name: 'programId', label: 'Program', type: 'select', required: true, gridCols: 4 },
      { name: 'description', label: 'Deskripsi', type: 'textarea', gridCols: 12, rows: 4 },
      { name: 'location', label: 'Lokasi', type: 'text', gridCols: 6 },
      { name: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true, gridCols: 3 },
      { name: 'endDate', label: 'Tanggal Selesai', type: 'date', required: true, gridCols: 3 },
      { name: 'budget', label: 'Budget', type: 'number', gridCols: 4 },
      { name: 'targetBeneficiary', label: 'Target Penerima', type: 'number', gridCols: 4 },
      { name: 'status', label: 'Status', type: 'select', required: true, gridCols: 4 },
      { name: 'tenantId', label: 'Cabang', type: 'select', required: true, gridCols: 8 }
    ]
  },

  // 📋 Konfigurasi untuk modul ACTIVITIES
  activities: {
    moduleName: 'activities',
    modelName: 'activity',
    displayName: 'Activity',
    displayNamePlural: 'Data Activity',
    
    searchFields: ['name', 'description', 'location'],
    
    includes: {
      project: { 
        select: { id: true, name: true, program: { select: { name: true } } }
      },
      createdBy: { select: { id: true, name: true, email: true } },
      _count: { select: { stakeholders: true, reports: true } }
    },
    
    filters: [
      { key: 'status', label: 'Status', type: 'select' },
      { key: 'type', label: 'Tipe', type: 'select' },
      { key: 'projectId', label: 'Project', type: 'select' }
    ],
    
    formFields: [
      { name: 'name', label: 'Nama Activity', type: 'text', required: true, gridCols: 8 },
      { name: 'projectId', label: 'Project', type: 'select', required: true, gridCols: 4 },
      { name: 'description', label: 'Deskripsi', type: 'textarea', gridCols: 12, rows: 4 },
      { name: 'type', label: 'Tipe Activity', type: 'select', required: true, gridCols: 4 },
      { name: 'status', label: 'Status', type: 'select', required: true, gridCols: 4 },
      { name: 'priority', label: 'Prioritas', type: 'select', required: true, gridCols: 4 },
      { name: 'startDate', label: 'Tanggal Mulai', type: 'date', required: true, gridCols: 3 },
      { name: 'endDate', label: 'Tanggal Selesai', type: 'date', required: true, gridCols: 3 },
      { name: 'location', label: 'Lokasi', type: 'text', gridCols: 6 },
      { name: 'budget', label: 'Budget', type: 'number', gridCols: 4 },
      { name: 'targetParticipants', label: 'Target Peserta', type: 'number', gridCols: 4 }
    ]
  }
};

/**
 * 🎯 USAGE EXAMPLE:
 * 
 * 1. Pilih config yang mau di-generate
 * 2. Copy template API routes
 * 3. Copy template pages
 * 4. Sesuaikan field-field spesifik
 * 
 * const config = CRUD_CONFIG.stakeholders;
 * console.log(generateApiRoute(config));
 * console.log(generateListingPage(config));
 */

export function generateApiSearchLogic(config: any) {
  const searchFields = config.searchFields.map((field: string) => 
    `{ ${field}: { contains: search } }`
  ).join(',\n        ');
  
  return `
    if (search) {
      where.OR = [
        ${searchFields}
      ];
    }
  `;
}

export function generateIncludeClause(config: any) {
  return JSON.stringify(config.includes, null, 8);
}

export function generateFiltersArray(config: any) {
  return `
  const filters: Filter[] = ${JSON.stringify(config.filters, null, 4)};
  `;
}

export function generateFormFields(config: any) {
  return `
  const fields: FormField[] = ${JSON.stringify(config.formFields, null, 4)};
  `;
}