export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from "next/server";

// Predefined permissions list (master data)
const PERMISSIONS = [
  // Dashboard
  { id: 'dashboard.view', name: 'View Dashboard', category: 'Dashboard', description: 'Can view dashboard and statistics' },
  
  // Programs
  { id: 'programs.view', name: 'View Programs', category: 'Programs', description: 'Can view CSR programs' },
  { id: 'programs.create', name: 'Create Programs', category: 'Programs', description: 'Can create new CSR programs' },
  { id: 'programs.edit', name: 'Edit Programs', category: 'Programs', description: 'Can edit existing programs' },
  { id: 'programs.delete', name: 'Delete Programs', category: 'Programs', description: 'Can delete programs' },
  
  // Stakeholders
  { id: 'stakeholders.view', name: 'View Stakeholders', category: 'Stakeholders', description: 'Can view stakeholders' },
  { id: 'stakeholders.create', name: 'Create Stakeholders', category: 'Stakeholders', description: 'Can create new stakeholders' },
  { id: 'stakeholders.edit', name: 'Edit Stakeholders', category: 'Stakeholders', description: 'Can edit existing stakeholders' },
  { id: 'stakeholders.delete', name: 'Delete Stakeholders', category: 'Stakeholders', description: 'Can delete stakeholders' },
  
  // Sub Programs (Projects)
  { id: 'projects.view', name: 'View Sub Programs', category: 'Sub Programs', description: 'Can view sub programs/projects' },
  { id: 'projects.create', name: 'Create Sub Programs', category: 'Sub Programs', description: 'Can create new sub programs' },
  { id: 'projects.edit', name: 'Edit Sub Programs', category: 'Sub Programs', description: 'Can edit existing sub programs' },
  { id: 'projects.delete', name: 'Delete Sub Programs', category: 'Sub Programs', description: 'Can delete sub programs' },
  
  // Activities
  { id: 'activities.view', name: 'View Activities', category: 'Activities', description: 'Can view activities' },
  { id: 'activities.create', name: 'Create Activities', category: 'Activities', description: 'Can create new activities' },
  { id: 'activities.edit', name: 'Edit Activities', category: 'Activities', description: 'Can edit existing activities' },
  { id: 'activities.delete', name: 'Delete Activities', category: 'Activities', description: 'Can delete activities' },
  
  // Budgets
  { id: 'budgets.view', name: 'View Budgets', category: 'Budgets', description: 'Can view budget information' },
  { id: 'budgets.create', name: 'Create Budgets', category: 'Budgets', description: 'Can create budget allocations' },
  { id: 'budgets.edit', name: 'Edit Budgets', category: 'Budgets', description: 'Can edit budget allocations' },
  { id: 'budgets.delete', name: 'Delete Budgets', category: 'Budgets', description: 'Can delete budget allocations' },
  
  // Reports
  { id: 'reports.view', name: 'View Reports', category: 'Reports', description: 'Can view program reports' },
  { id: 'reports.create', name: 'Create Reports', category: 'Reports', description: 'Can create reports' },
  { id: 'reports.edit', name: 'Edit Reports', category: 'Reports', description: 'Can edit reports' },
  { id: 'reports.delete', name: 'Delete Reports', category: 'Reports', description: 'Can delete reports' },
  { id: 'reports.export', name: 'Export Reports', category: 'Reports', description: 'Can export reports to various formats' },
  
  // Analytics
  { id: 'analytics.view', name: 'View Analytics', category: 'Analytics', description: 'Can view analytics and insights' },
  
  // User Management
  { id: 'users.view', name: 'View Users', category: 'User Management', description: 'Can view user list' },
  { id: 'users.create', name: 'Create Users', category: 'User Management', description: 'Can create new users' },
  { id: 'users.edit', name: 'Edit Users', category: 'User Management', description: 'Can edit user information' },
  { id: 'users.delete', name: 'Delete Users', category: 'User Management', description: 'Can delete users' },
  
  // Role Management
  { id: 'roles.view', name: 'View Roles', category: 'Role Management', description: 'Can view roles' },
  { id: 'roles.create', name: 'Create Roles', category: 'Role Management', description: 'Can create new roles' },
  { id: 'roles.edit', name: 'Edit Roles', category: 'Role Management', description: 'Can edit role permissions' },
  { id: 'roles.delete', name: 'Delete Roles', category: 'Role Management', description: 'Can delete roles' },
  
  // Master Data
  { id: 'master.tenants', name: 'Manage Tenants', category: 'Master Data', description: 'Can manage tenant/subsidiary data' },
  { id: 'master.departments', name: 'Manage Departments', category: 'Master Data', description: 'Can manage department data' },
  { id: 'master.categories', name: 'Manage Categories', category: 'Master Data', description: 'Can manage program categories' },
  { id: 'master.types', name: 'Manage Types', category: 'Master Data', description: 'Can manage program types' },
  
  // Settings
  { id: 'settings.view', name: 'View Settings', category: 'Settings', description: 'Can view system settings' },
  { id: 'settings.edit', name: 'Edit Settings', category: 'Settings', description: 'Can edit system settings' },
];

// GET /api/management/permissions - Get all permissions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Optional filters
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";

    let filteredPermissions = PERMISSIONS;

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredPermissions = filteredPermissions.filter(
        (perm) =>
          perm.name.toLowerCase().includes(searchLower) ||
          perm.id.toLowerCase().includes(searchLower) ||
          perm.description.toLowerCase().includes(searchLower)
      );
    }

    // Apply category filter
    if (category) {
      filteredPermissions = filteredPermissions.filter(
        (perm) => perm.category === category
      );
    }

    // Group by category
    const groupedPermissions = filteredPermissions.reduce((acc: any, perm) => {
      if (!acc[perm.category]) {
        acc[perm.category] = [];
      }
      acc[perm.category].push(perm);
      return acc;
    }, {});

    return NextResponse.json({
      data: filteredPermissions,
      grouped: groupedPermissions,
      categories: [...new Set(PERMISSIONS.map(p => p.category))],
      total: filteredPermissions.length,
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json(
      { error: "Failed to fetch permissions" },
      { status: 500 },
    );
  }
}

