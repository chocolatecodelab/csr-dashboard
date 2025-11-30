import { useState } from 'react';
import { useAlertContext } from '@/providers/alert-provider';

interface UseFormHandlersProps<T> {
  endpoint: string;
  entityName: string; // 'program', 'stakeholder', etc.
  onSuccess?: () => void;
  refetch?: () => void;
}

export function useFormHandlers<T extends { id: string; name: string }>({
  endpoint,
  entityName,
  onSuccess,
  refetch
}: UseFormHandlersProps<T>) {
  const alert = useAlertContext();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);

  const handleCreate = () => {
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: T) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = async (item: T, deleteItem: (id: string) => Promise<boolean>) => {
    const confirmed = await alert.confirm(
      `Konfirmasi Hapus ${entityName}`,
      `Apakah Anda yakin ingin menghapus ${entityName.toLowerCase()} "${item.name}"? Tindakan ini tidak dapat dibatalkan.`,
      {
        confirmText: "Ya, Hapus",
        cancelText: "Batal",
      },
    );

    if (confirmed) {
      const success = await deleteItem(item.id);
      if (success) {
        alert.success(
          `${entityName} Berhasil Dihapus`,
          `${entityName} "${item.name}" telah berhasil dihapus dari sistem.`,
        );
      } else {
        alert.error(
          `Gagal Menghapus ${entityName}`,
          `Terjadi kesalahan saat menghapus ${entityName.toLowerCase()}. Silakan coba lagi.`,
        );
      }
    }
  };

  const handleFormSubmit = async (formData: any) => {
    try {
      const url = editingItem 
        ? `${endpoint}/${editingItem.id}`
        : endpoint;
      
      const method = editingItem ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert.success(
          `${entityName} berhasil ${editingItem ? "diperbarui" : "dibuat"}`,
          `${entityName} "${formData.name}" telah ${editingItem ? "diperbarui" : "dibuat"} dengan sukses.`
        );
        setShowForm(false);
        refetch?.();
        onSuccess?.();
      } else {
        const result = await response.json();
        alert.error(
          `Gagal menyimpan ${entityName.toLowerCase()}`,
          result.error || "Terjadi kesalahan saat menyimpan data"
        );
      }
    } catch (error) {
      alert.error(
        `Gagal menyimpan ${entityName.toLowerCase()}`, 
        "Terjadi kesalahan saat menyimpan data"
      );
    }
  };

  const closeForm = () => setShowForm(false);

  return {
    // State
    showForm,
    editingItem,
    
    // Handlers
    handleCreate,
    handleEdit,
    handleDelete,
    handleFormSubmit,
    closeForm,
    
    // Setters (jika butuh kontrol manual)
    setShowForm,
    setEditingItem,
  };
}