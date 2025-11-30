"use client";

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

export interface MasterDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string }) => Promise<void>;
  title: string;
  initialData?: { id: string; name: string } | null;
  loading?: boolean;
  error?: string | null;
}

export function MasterDataModal({
  isOpen,
  onClose,
  onSubmit,
  title,
  initialData = null,
  loading = false,
  error = null,
}: MasterDataModalProps) {
  const [name, setName] = useState('');
  const [validationError, setValidationError] = useState('');
  const [mounted, setMounted] = useState(false);

  // ✅ Track mounted state for portal
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Update form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setName(initialData.name || '');
    } else {
      setName('');
    }
    setValidationError('');
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!name.trim()) {
      setValidationError('Nama wajib diisi');
      return;
    }

    try {
      await onSubmit({ name: name.trim() });
      // Reset form after successful submission
      setName('');
      setValidationError('');
    } catch (error) {
      // Error will be handled by parent component
    }
  };

  const handleClose = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setName('');
    setValidationError('');
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.target === e.currentTarget) {
      handleClose(e);
    }
  };


  if (!mounted || !isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative mx-4 w-full max-w-md rounded-[10px] bg-white shadow-2xl dark:bg-gray-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h3 className="font-semibold text-dark dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-full text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label 
              htmlFor="master-data-name" 
              className="mb-2.5 block font-medium text-dark dark:text-white"
            >
              Nama <span className="text-red-500">*</span>
            </label>
            <input
              id="master-data-name"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (validationError) setValidationError('');
              }}
              placeholder="Masukkan nama"
              disabled={loading}
              className={`w-full appearance-none rounded-lg border px-5.5 py-3 outline-none transition focus:border-primary active:border-primary dark:bg-dark-2 dark:focus:border-primary ${
                validationError || error
                  ? "border-red-500 dark:border-red-500"
                  : "border-stroke dark:border-dark-3"
              } ${loading ? "bg-gray-2 cursor-not-allowed" : "bg-transparent"}`}
              autoFocus
            />
            {validationError && (
              <p className="mt-1 text-sm text-red-500">{validationError}</p>
            )}
            {error && (
              <p className="mt-1 text-sm text-red-500">{error}</p>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={(e) => handleClose(e)} // ✅ Pass event to prevent bubbling
              disabled={loading}
              className="flex-1 rounded-[7px] border border-stroke bg-white px-4 py-2.5 font-medium text-dark hover:shadow-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:shadow-card"
            >
              Batal
            </button>
            
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex-1 rounded-[7px] bg-primary px-4 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
            >
              {loading ? "Menyimpan..." : initialData ? "Update" : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}