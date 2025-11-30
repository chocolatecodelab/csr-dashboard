"use client";

import React, { useState } from 'react';
import { MasterDataModal } from './MasterDataModal';
import { useMasterCrud } from '@/hooks/useMasterCrud';
import { useAlertContext } from '@/providers/alert-provider';

export interface SelectWithCrudProps {
  id: string;
  name: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  onOptionsChange: (newOptions: { value: string; label: string }[]) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  crudConfig: {
    endpoint: string;
    entityName: string;
    nameField?: string;
  };
  onDataChange?: (action: 'create' | 'update' | 'delete', item: any) => void; // ✅ Callback untuk detect changes
}

export function SelectWithCrud({
  id,
  name,
  value,
  options,
  onValueChange,
  onOptionsChange,
  placeholder = "-- Pilih --",
  disabled = false,
  required = false,
  className = "",
  crudConfig,
  onDataChange,
}: SelectWithCrudProps) {
  const alert = useAlertContext();
  const { loading, error, createItem, updateItem, deleteItem, clearError } = useMasterCrud(crudConfig);
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingItem, setEditingItem] = useState<{ id: string; name: string } | null>(null);

  // Get selected option for edit/delete actions
  const selectedOption = options.find(option => option.value === value);

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault(); // ✅ Prevent form submission
    e.stopPropagation(); // ✅ Stop event bubbling
    
    setModalMode('create');
    setEditingItem(null);
    setShowModal(true);
    clearError();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault(); // ✅ Prevent form submission
    e.stopPropagation(); // ✅ Stop event bubbling
    
    if (selectedOption) {
      setModalMode('edit');
      setEditingItem({
        id: selectedOption.value,
        name: selectedOption.label
      });
      setShowModal(true);
      clearError();
    }
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault(); // ✅ Prevent form submission
    e.stopPropagation(); // ✅ Stop event bubbling
    
    if (!selectedOption) return;

    const confirmed = await alert.confirm(
      `Hapus ${crudConfig.entityName}`,
      `Apakah Anda yakin ingin menghapus "${selectedOption.label}"?`,
      {
        confirmText: "Ya, Hapus",
        cancelText: "Batal",
      }
    );

    if (confirmed) {
      const success = await deleteItem(selectedOption.value);
      if (success) {
        const deletedItem = selectedOption;
        const newOptions = options.filter(option => option.value !== selectedOption.value);
        onOptionsChange(newOptions);
        
        // Clear selection if deleted item was selected
        if (value === selectedOption.value) {
          onValueChange('');
        }

        onDataChange?.('delete', { id: deletedItem.value, name: deletedItem.label });

        alert.success(
          `${crudConfig.entityName} Berhasil Dihapus`,
          `"${selectedOption.label}" telah dihapus.`
        );
      } else {
        alert.error(
          `Gagal Menghapus ${crudConfig.entityName}`,
          error || 'Terjadi kesalahan saat menghapus data.'
        );
      }
    }
  };

  const handleModalSubmit = async (data: { name: string }) => {
    try {
      if (modalMode === 'create') {
        // Create new item
        const newItem = await createItem({ name: data.name });
        if (newItem) {
          // Add new item to options
          const newOption = { value: newItem.id, label: newItem.name };
          const newOptions = [...options, newOption];
          onOptionsChange(newOptions);
          onValueChange(newItem.id);
          
          onDataChange?.('create', newItem);
          
          setShowModal(false);
          alert.success(
            `${crudConfig.entityName} Berhasil Dibuat`,
            `"${newItem.name}" telah ditambahkan dan dipilih.`
          );
        }
      } else if (modalMode === 'edit' && editingItem) {
        // Update existing item
        const updatedItem = await updateItem(editingItem.id, { name: data.name });
        if (updatedItem) {
          // Update option in the list
          const newOptions = options.map(option =>
            option.value === editingItem.id
              ? { value: updatedItem.id, label: updatedItem.name }
              : option
          );
          onOptionsChange(newOptions);
          
          // ✅ Notify parent about data change
          onDataChange?.('update', updatedItem);
          
          setShowModal(false);
          alert.success(
            `${crudConfig.entityName} Berhasil Diperbarui`,
            `Data telah diperbarui menjadi "${updatedItem.name}".`
          );
        }
      }
    } catch (error) {
      // Error handling is done in useMasterCrud hook
    }
  };

  const baseInputClass = `w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 pl-5.5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary ${
    disabled ? "bg-gray-2" : "bg-transparent"
  } ${className}`;

  return (
    <>
      {/* Select Field and Buttons Container */}
      <div className="space-y-3">
        {/* Select Field */}
        <div className="relative">
          <select
            id={id}
            name={name}
            value={value}
            onChange={(e) => onValueChange(e.target.value)}
            disabled={disabled}
            required={required}
            className={baseInputClass}
          >
            <option value="">{placeholder}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          {/* Add Button */}
          <button
            type="button" // ✅ Explicit button type
            onClick={handleAdd}
            disabled={disabled || loading}
            className="flex items-center gap-2 rounded-md border border-primary bg-transparent px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-primary dark:text-primary dark:hover:bg-primary dark:hover:text-white"
            title={`Tambah ${crudConfig.entityName} Baru`}
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Tambah</span>
          </button>

          {/* Edit Button */}
          {selectedOption && (
            <button
              type="button" // ✅ Explicit button type
              onClick={handleEdit}
              disabled={disabled || loading}
              className="flex items-center gap-2 rounded-md border border-orange-500 bg-transparent px-3 py-1.5 text-sm font-medium text-orange-500 hover:bg-orange-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-orange-500 dark:text-orange-500 dark:hover:bg-orange-500 dark:hover:text-white"
              title={`Edit "${selectedOption.label}"`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              <span>Edit</span>
            </button>
          )}

          {/* Delete Button */}
          {selectedOption && (
            <button
              type="button" // ✅ Explicit button type
              onClick={handleDelete}
              disabled={disabled || loading}
              className="flex items-center gap-2 rounded-md border border-red-500 bg-transparent px-3 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500 dark:text-red-500 dark:hover:bg-red-500 dark:hover:text-white"
              title={`Hapus "${selectedOption.label}"`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Hapus</span>
            </button>
          )}
        </div>

        {/* Loading Indicator */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-dark-4 dark:text-dark-6">
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Memproses...</span>
          </div>
        )}
      </div>

      {/* ✅ Modal rendered via Portal (outside form hierarchy) */}
      <MasterDataModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSubmit={handleModalSubmit}
        title={modalMode === 'create' ? `Tambah ${crudConfig.entityName}` : `Edit ${crudConfig.entityName}`}
        initialData={editingItem}
        loading={loading}
        error={error}
      />
    </>
  );
}