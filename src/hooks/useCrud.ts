"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export interface UseCrudOptions {
  endpoint: string;
  initialPage?: number;
  initialLimit?: number;
  initialSort?: string;
  initialFilters?: Record<string, any>;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UseCrudReturn<T> {
  data: T[];
  pagination: PaginationData;
  loading: boolean;
  error: string | null;
  filters: Record<string, any>;
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  searchQuery: string;
  
  // Actions
  refetch: () => Promise<void>;
  setPage: (page: number) => void;
  setFilters: (filters: Record<string, any>) => void;
  setSort: (column: string, direction: 'asc' | 'desc') => void;
  setSearch: (query: string) => void;
  deleteItem: (id: string) => Promise<boolean>;
  
  // URL state management
  updateURLParams: () => void;
}

export function useCrud<T = any>({
  endpoint,
  initialPage = 1,
  initialLimit = 10,
  initialSort = 'createdAt',
  initialFilters = {}
}: UseCrudOptions): UseCrudReturn<T> {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [data, setData] = useState<T[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    currentPage: parseInt(searchParams.get('page') || initialPage.toString()),
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: parseInt(searchParams.get('limit') || initialLimit.toString())
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [filters, setFiltersState] = useState<Record<string, any>>(() => {
    const urlFilters: Record<string, any> = { ...initialFilters };
    searchParams.forEach((value, key) => {
      if (!['page', 'limit', 'sort', 'order', 'search'].includes(key)) {
        urlFilters[key] = value;
      }
    });
    return urlFilters;
  });
  
  const [sortColumn, setSortColumn] = useState(
    searchParams.get('sort') || initialSort
  );
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(
    (searchParams.get('order') as 'asc' | 'desc') || 'desc'
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get('search') || ''
  );

  // Build query parameters
  const buildQueryParams = useCallback(() => {
    const params = new URLSearchParams();
    
    params.set('page', pagination.currentPage.toString());
    params.set('limit', pagination.itemsPerPage.toString());
    params.set('sort', sortColumn);
    params.set('order', sortDirection);
    
    if (searchQuery) {
      params.set('search', searchQuery);
    }
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        params.set(key, value.toString());
      }
    });
    
    return params.toString();
  }, [pagination.currentPage, pagination.itemsPerPage, sortColumn, sortDirection, searchQuery, filters]);

  // Update URL without triggering navigation
  const updateURLParams = useCallback(() => {
    const params = buildQueryParams();
    const newUrl = `${window.location.pathname}?${params}`;
    window.history.replaceState({}, '', newUrl);
  }, [buildQueryParams]);

  // Fetch data
  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const queryString = buildQueryParams();
      const response = await fetch(`${endpoint}?${queryString}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Assume API returns { data, pagination } structure
      if (result.data && result.pagination) {
        setData(result.data);
        setPagination(prev => ({
          ...prev,
          totalPages: result.pagination.totalPages,
          totalItems: result.pagination.totalItems
        }));
      } else {
        // Fallback if API returns array directly
        setData(Array.isArray(result) ? result : []);
        setPagination(prev => ({
          ...prev,
          totalPages: 1,
          totalItems: Array.isArray(result) ? result.length : 0
        }));
      }
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setData([]);
    } finally {
      setLoading(false);
    }
  }, [endpoint, buildQueryParams]);

  // Effect to fetch data when dependencies change
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Effect to update URL when state changes
  useEffect(() => {
    updateURLParams();
  }, [updateURLParams]);

  // Actions
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  }, []);

  const setFilters = useCallback((newFilters: Record<string, any>) => {
    setFiltersState(newFilters);
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const setSort = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
    // Reset to first page when sort changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const setSearch = useCallback((query: string) => {
    setSearchQuery(query);
    // Reset to first page when search changes
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  }, []);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete item: ${response.statusText}`);
      }
      
      // Refresh data after successful deletion
      await fetchData();
      return true;
    } catch (err) {
      console.error('Delete error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      return false;
    }
  }, [endpoint, fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    pagination,
    loading,
    error,
    filters,
    sortColumn,
    sortDirection,
    searchQuery,
    refetch,
    setPage,
    setFilters,
    setSort,
    setSearch,
    deleteItem,
    updateURLParams
  };
}