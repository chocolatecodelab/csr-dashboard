"use client";

import React, { useState } from "react";
import Link from "next/link";
import { getActionIcon } from "@/components/ui/icons";     

// Generic interfaces untuk DataTable
export interface Column<T = any> {
  key: string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

export interface Action<T = any> {
  label: string;
  href?: (row: T) => string;
  onClick?: (row: T) => void;
  className?: string;
  icon?: string | React.ReactNode; // Support both string dan ReactNode
  variant?: "primary" | "secondary" | "danger" | "success";
}

export interface Filter {
  key: string;
  label: string;
  type: "text" | "select" | "date" | "daterange";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  filters?: Filter[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onPageChange?: (page: number) => void;
  onSort?: (column: string, direction: "asc" | "desc") => void;
  onFilter?: (filters: Record<string, any>) => void;
  onSearch?: (query: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  title?: string;
  description?: string;
  createButton?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  filters = [],
  searchable = true,
  searchPlaceholder = "Cari data...",
  pagination,
  onPageChange,
  onSort,
  onFilter,
  onSearch,
  loading = false,
  emptyMessage = "Tidak ada data tersedia",
  title,
  description,
  createButton,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortColumn, setSortColumn] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [showFilters, setShowFilters] = useState(false);

  const handleSort = (columnKey: string) => {
    if (!columns.find((col) => col.key === columnKey)?.sortable) return;

    let newDirection: "asc" | "desc" = "asc";
    if (sortColumn === columnKey && sortDirection === "asc") {
      newDirection = "desc";
    }

    setSortColumn(columnKey);
    setSortDirection(newDirection);
    onSort?.(columnKey, newDirection);
  };

  const handleSearch = (value: string) => {
    setSearchQuery(value);
    onSearch?.(value);
  };

  const handleFilterChange = (filterKey: string, value: any) => {
    const newFilters = { ...filterValues, [filterKey]: value };
    setFilterValues(newFilters);
    onFilter?.(newFilters);
  };

  const getActionButtonClass = (variant: Action["variant"] = "primary") => {
    const baseClass =
      "inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md transition-colors";
    switch (variant) {
      case "primary":
        return `${baseClass} text-primary bg-primary/10 hover:bg-primary/20`;
      case "secondary":
        return `${baseClass} text-secondary bg-secondary/10 hover:bg-secondary/20`;
      case "danger":
        return `${baseClass} text-red-600 bg-red-50 hover:bg-red-100 dark:text-red-400 dark:bg-red-900/20 dark:hover:bg-red-900/30`;
      case "success":
        return `${baseClass} text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 dark:hover:bg-green-900/30`;
      default:
        return `${baseClass} text-primary bg-primary/10 hover:bg-primary/20`;
    }
  };

  const getSortIcon = (columnKey: string) => {
    if (sortColumn !== columnKey) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === "asc" ? (
      <span className="text-primary">↑</span>
    ) : (
      <span className="text-primary">↓</span>
    );
  };

  // Function untuk render icon berdasarkan string atau ReactNode
  const renderActionIcon = (icon?: string | React.ReactNode) => {
    if (!icon) return null;

    // Jika icon adalah string, gunakan getActionIcon untuk mendapatkan komponen
    if (typeof icon === "string") {
      const IconComponent = getActionIcon(icon);
      return <IconComponent className="w-4 h-4" />;
    }

    // Jika sudah ReactNode, return langsung
    return icon;
  };

  return (
    <div className="rounded-[10px] bg-white shadow-1 dark:bg-gray-dark dark:shadow-card">
      {/* Header */}
      {(title || createButton) && (
        <div className="flex flex-col gap-4 border-b border-stroke p-4 dark:border-dark-3 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="min-w-0 flex-1">
            {title && (
              <h3 className="text-lg font-bold text-dark dark:text-white sm:text-body-2xlg">
                {title}
              </h3>
            )}
            {description && (
              <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
                {description}
              </p>
            )}
          </div>
          {createButton && (
            <div className="w-full sm:ml-4 sm:w-auto sm:flex-shrink-0">
              {createButton.href ? (
                <Link
                  href={createButton.href}
                  className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-[5px] bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90 sm:w-auto"
                >
                  {createButton.label}
                </Link>
              ) : (
                <button
                  onClick={createButton.onClick}
                  className="inline-flex w-full items-center justify-center whitespace-nowrap rounded-[5px] bg-primary px-4 py-2 text-center text-sm font-medium text-white hover:bg-opacity-90 sm:w-auto"
                >
                  {createButton.label}
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Search and Filters */}
      <div className="border-b border-stroke p-6 dark:border-dark-3">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          {searchable && (
            <div className="max-w-md flex-1">
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full rounded-[7px] border border-stroke bg-transparent px-4 py-2.5 text-dark outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-gray-2 dark:border-dark-3 dark:bg-dark-2 dark:text-white dark:focus:border-primary"
              />
            </div>
          )}

          {/* Filter Toggle */}
          {filters.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center gap-2 rounded-[7px] border border-stroke px-4 py-2.5 text-sm font-medium text-dark hover:bg-gray-1 dark:border-dark-3 dark:text-white dark:hover:bg-dark-2"
            >
              <span>Filter</span>
              <span
                className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
              >
                ▼
              </span>
            </button>
          )}
        </div>

        {/* Filters */}
        {showFilters && filters.length > 0 && (
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {filters.map((filter) => (
              <div key={filter.key} className="min-w-0">
                <label className="mb-1 block text-sm font-medium text-dark dark:text-white">
                  {filter.label}
                </label>
                {filter.type === "select" ? (
                  <div className="relative">
                    <select
                      value={filterValues[filter.key] || ""}
                      onChange={(e) =>
                        handleFilterChange(filter.key, e.target.value)
                      }
                      id="filter-select"
                      className="w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary [&>option]:text-dark-5 dark:[&>option]:text-dark-6 pl-11.5"
                    >
                      <option value="">Semua</option>
                      {filter.options?.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <input
                    type={filter.type}
                    placeholder={filter.placeholder}
                    value={filterValues[filter.key] || ""}
                    onChange={(e) =>
                      handleFilterChange(filter.key, e.target.value)
                    }
                    className="w-full rounded-[7px] border border-stroke bg-transparent px-3 py-2 text-dark outline-none transition focus:border-primary dark:border-dark-3 dark:bg-dark-2 dark:text-white"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-pulse text-dark-4 dark:text-dark-6">
              Loading...
            </div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-dark-4 dark:text-dark-6">{emptyMessage}</p>
          </div>
        ) : (
          <div className="min-w-full">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-1 dark:bg-dark-2">
                  {columns.map((column) => (
                    <th
                      key={column.key}
                      className={`whitespace-nowrap px-4 py-4 text-left font-medium text-dark dark:text-white ${
                        column.sortable
                          ? "cursor-pointer hover:bg-gray-2 dark:hover:bg-dark-3"
                          : ""
                      } ${column.width ? `w-${column.width}` : ""}`}
                      onClick={() => column.sortable && handleSort(column.key)}
                    >
                      <div className="flex items-center gap-2">
                        <span>{column.header}</span>
                        {column.sortable && getSortIcon(column.key)}
                      </div>
                    </th>
                  ))}
                  {actions.length > 0 && (
                    <th className="whitespace-nowrap px-4 py-4 text-center font-medium text-dark dark:text-white">
                      Aksi
                    </th>
                  )}
                </tr>
              </thead>
              <tbody>
                {data.map((row, index) => (
                  <tr
                    key={row.id || index}
                    className="border-b border-stroke hover:bg-gray-1/50 dark:border-dark-3 dark:hover:bg-dark-2/50"
                  >
                    {columns.map((column) => (
                      <td
                        key={column.key}
                        className="px-4 py-4 text-dark dark:text-white"
                      >
                        {column.render
                          ? column.render(row[column.key], row)
                          : row[column.key]}
                      </td>
                    ))}
                    {actions.length > 0 && (
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2 whitespace-nowrap">
                          {actions.map((action, actionIndex) =>
                            action.href ? (
                              <Link
                                key={actionIndex}
                                href={action.href(row)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${getActionButtonClass(
                                  action.variant,
                                )} ${action.className || ""}`}
                              >
                                {renderActionIcon(action.icon)}
                                <span className="hidden sm:inline">{action.label}</span>
                              </Link>
                            ) : (
                              <button
                                key={actionIndex}
                                onClick={() => action.onClick?.(row)}
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${getActionButtonClass(
                                  action.variant,
                                )} ${action.className || ""}`}
                              >
                                {renderActionIcon(action.icon)}
                                <span className="hidden sm:inline">{action.label}</span>
                              </button>
                            ),
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="flex items-center justify-between border-t border-stroke p-6 dark:border-dark-3">
          <div className="text-sm text-dark-4 dark:text-dark-6">
            Menampilkan{" "}
            {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} -{" "}
            {Math.min(
              pagination.currentPage * pagination.itemsPerPage,
              pagination.totalItems,
            )}{" "}
            dari {pagination.totalItems} data
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange?.(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1}
              className="rounded-md border border-stroke px-3 py-2 text-sm hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-2"
            >
              Previous
            </button>

            {/* Page Numbers */}
            {Array.from(
              { length: Math.min(5, pagination.totalPages) },
              (_, i) => {
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.currentPage <= 3) {
                  pageNum = i + 1;
                } else if (
                  pagination.currentPage >=
                  pagination.totalPages - 2
                ) {
                  pageNum = pagination.totalPages - 4 + i;
                } else {
                  pageNum = pagination.currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange?.(pageNum)}
                    className={`rounded-md border px-3 py-2 text-sm ${
                      pageNum === pagination.currentPage
                        ? "border-primary bg-primary text-white"
                        : "border-stroke hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              },
            )}

            <button
              onClick={() => onPageChange?.(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= pagination.totalPages}
              className="rounded-md border border-stroke px-3 py-2 text-sm hover:bg-gray-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:hover:bg-dark-2"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
