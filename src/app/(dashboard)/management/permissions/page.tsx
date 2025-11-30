"use client";

import { useState, useEffect } from "react";
import Breadcrumb from "@/components/Breadcrumbs/Breadcrumb";

// Define the Permission type
interface Permission {
  id: string;
  name: string;
  category: string;
  description: string;
}

// Main Permissions Page Component (Read-only)
export default function PermissionsPage() {
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [groupedPermissions, setGroupedPermissions] = useState<Record<string, Permission[]>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Load permissions
  useEffect(() => {
    const loadPermissions = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/management/permissions");
        
        if (!response.ok) {
          throw new Error("Failed to fetch permissions");
        }

        const data = await response.json();
        setPermissions(data.data || []);
        setGroupedPermissions(data.grouped || {});
        setCategories(data.categories || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, []);

  // Filter permissions based on search and category
  const filteredPermissions = permissions.filter((perm) => {
    const matchesSearch = 
      searchTerm === "" ||
      perm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      perm.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === "all" || perm.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Group filtered permissions
  const filteredGrouped = filteredPermissions.reduce((acc: any, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[10px] bg-white p-6 shadow-1 dark:bg-gray-dark dark:shadow-card">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <>
      <Breadcrumb pageName="Daftar Permission" />

      <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
        {/* Header */}
        <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-title-md font-bold text-dark dark:text-white">
                Daftar Permission
              </h3>
              <p className="text-sm text-dark-4 dark:text-dark-6">
                Daftar lengkap permissions yang tersedia dalam sistem
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                {filteredPermissions.length} permissions
              </span>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="border-b border-stroke px-7 py-4 dark:border-dark-3">
          <div className="flex flex-col gap-4 md:flex-row">
            {/* Search */}
            <div className="flex-1">
              <input
                type="text"
                placeholder="Cari permission..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              />
            </div>

            {/* Category Filter */}
            <div className="w-full md:w-60">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full rounded-md border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:text-white"
              >
                <option value="all">Semua Kategori</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Permissions List */}
        <div className="p-7">
          {Object.keys(filteredGrouped).length === 0 ? (
            <div className="py-12 text-center">
              <svg
                className="mx-auto h-12 w-12 text-dark-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="mt-4 text-dark-4 dark:text-dark-6">
                Tidak ada permission yang sesuai dengan filter
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(filteredGrouped).map(([category, perms]) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="mb-3 flex items-center gap-3">
                    <h4 className="text-lg font-semibold text-dark dark:text-white">
                      {category}
                    </h4>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                      {(perms as Permission[]).length}
                    </span>
                  </div>

                  {/* Permissions Grid */}
                  <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {(perms as Permission[]).map((perm) => (
                      <div
                        key={perm.id}
                        className="rounded-lg border border-stroke bg-gray-2 p-4 dark:border-dark-3 dark:bg-dark-2"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <div className="flex-1">
                            <h5 className="font-medium text-dark dark:text-white">
                              {perm.name}
                            </h5>
                            <p className="mt-1 font-mono text-xs text-primary">
                              {perm.id}
                            </p>
                          </div>
                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                            <svg
                              className="h-4 w-4 text-primary"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                              />
                            </svg>
                          </span>
                        </div>
                        <p className="text-sm text-dark-4 dark:text-dark-6">
                          {perm.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info Footer */}
        <div className="border-t border-stroke px-7 py-4 dark:border-dark-3">
          <div className="flex items-center gap-2 text-sm text-dark-4 dark:text-dark-6">
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              Permissions digunakan untuk mengatur hak akses pada role. 
              Kelola permissions melalui halaman Role Management.
            </span>
          </div>
        </div>
      </div>
    </>
  );
}
