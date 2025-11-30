"use client";

import { useState, useCallback } from 'react';

export interface MasterCrudOptions {
  endpoint: string;
  entityName: string;
  nameField?: string;
}

export interface MasterDataItem {
  id: string;
  name: string;
  [key: string]: any;
}

export function useMasterCrud({ endpoint, entityName, nameField = 'name' }: MasterCrudOptions) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createItem = useCallback(async (data: Partial<MasterDataItem>): Promise<MasterDataItem | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal membuat ${entityName.toLowerCase()}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Gagal membuat ${entityName.toLowerCase()}`;
      setError(errorMessage);
      console.error('Create error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, entityName]);

  const updateItem = useCallback(async (id: string, data: Partial<MasterDataItem>): Promise<MasterDataItem | null> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal mengupdate ${entityName.toLowerCase()}`);
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Gagal mengupdate ${entityName.toLowerCase()}`;
      setError(errorMessage);
      console.error('Update error:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, [endpoint, entityName]);

  const deleteItem = useCallback(async (id: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${endpoint}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Gagal menghapus ${entityName.toLowerCase()}`);
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : `Gagal menghapus ${entityName.toLowerCase()}`;
      setError(errorMessage);
      console.error('Delete error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, [endpoint, entityName]);

  return {
    loading,
    error,
    createItem,
    updateItem,
    deleteItem,
    clearError: () => setError(null),
  };
}