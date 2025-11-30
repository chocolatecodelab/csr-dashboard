"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAlertContext } from "@/providers/alert-provider";
import { Calendar } from "@/components/Layouts/sidebar/icons";
import flatpickr from "flatpickr";
import { SelectWithCrud } from "./SelectWithCrud";

// Generic form field types
export interface FormField {
  name: string;
  label: string;
  type:
    | "text"
    | "email"
    | "password"
    | "number"
    | "textarea"
    | "select"
    | "date"
    | "datetime-local"
    | "checkbox"
    | "radio";
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: { value: string; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    pattern?: string;
  };
  description?: string;
  defaultValue?: any;
  rows?: number; // for textarea
  multiple?: boolean; // for select
  className?: string;
  gridCols?: number; // 1, 2, 3, 4, 6, 12 for responsive grid
  // ✅ Enable inline CRUD for select fields
  enableCrud?: {
    endpoint: string;      // API endpoint for CRUD operations
    entityName: string;    // Display name for the entity
    nameField?: string;    // Field name for the entity name (default: 'name')
  };
  onDataChange?: (action: 'create' | 'update' | 'delete', item: any) => void; // ✅ Callback untuk detect changes
}

export interface CrudFormProps {
  title: string;
  fields: FormField[];
  initialData?: Record<string, any>;
  onSubmit?: (data: Record<string, any>) => Promise<void>;
  onCancel?: () => void;
  onClose?: () => void;
  submitLabel?: string;
  cancelLabel?: string;
  isLoading?: boolean;
  mode?: "create" | "edit";
  apiEndpoint?: string;
  redirectTo?: string;
}

export function CrudForm({
  title,
  fields,
  initialData = {},
  onSubmit,
  onCancel,
  onClose,
  submitLabel = "Simpan",
  cancelLabel = "Batal",
  isLoading = false,
  mode = "create",
  apiEndpoint,
  redirectTo,
}: CrudFormProps) {
  const router = useRouter();
  const alert = useAlertContext();
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    fields.forEach((field) => {
      initial[field.name] = initialData[field.name] ?? field.defaultValue ?? "";
    });
    return initial;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  // ✅ State untuk track options yang bisa berubah dari SelectWithCrud
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, { value: string; label: string }[]>>({});

  // Handle modal overlay effects
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  // ✅ Initialize dynamic options from fields
  useEffect(() => {
    const initialOptions: Record<string, { value: string; label: string }[]> = {};
    fields.forEach((field) => {
      if (field.type === 'select' && field.options) {
        initialOptions[field.name] = field.options;
      }
    });
    setDynamicOptions(initialOptions);
  }, [fields]);

  // Initialize datepickers after component mounts
  useEffect(() => {
    const initDatePickers = () => {
      // Initialize date pickers
      flatpickr(".form-datepicker-date", {
        mode: "single",
        static: true,
        monthSelectorType: "static",
        dateFormat: "Y-m-d",
        onChange: function(selectedDates, dateStr, instance) {
          const fieldName = instance.element.getAttribute('data-field-name');
          if (fieldName) {
            handleChange(fieldName, dateStr);
          }
        }
      });

      // Initialize datetime pickers
      flatpickr(".form-datepicker-datetime", {
        mode: "single",
        static: true,
        monthSelectorType: "static",
        dateFormat: "Y-m-d H:i",
        enableTime: true,
        time_24hr: true,
        onChange: function(selectedDates, dateStr, instance) {
          const fieldName = instance.element.getAttribute('data-field-name');
          if (fieldName) {
            handleChange(fieldName, dateStr);
          }
        }
      });
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initDatePickers, 100);
    return () => clearTimeout(timer);
  }, [fields]);

  const handleChange = (name: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // ✅ Handler untuk update options dari SelectWithCrud
  const handleOptionsChange = (fieldName: string, newOptions: { value: string; label: string }[]) => {
    setDynamicOptions(prev => ({
      ...prev,
      [fieldName]: newOptions
    }));
  };

  // ✅ Add callback handler untuk master data changes
  const handleMasterDataChange = useCallback((
    fieldName: string,
    action: 'create' | 'update' | 'delete',
    item: any
  ) => {
    
    const field = fields.find(f => f.name === fieldName);
    if (field && field.onDataChange) {
      field.onDataChange(action, item);
    }
    
  }, [fields]);

  const validateField = (field: FormField, value: any): string => {
    if (
      field.required &&
      (!value || (typeof value === "string" && value.trim() === ""))
    ) {
      return `${field.label} wajib diisi`;
    }

    if (field.validation) {
      const { min, max, minLength, maxLength, pattern } = field.validation;

      if (typeof value === "string") {
        if (minLength && value.length < minLength) {
          return `${field.label} minimal ${minLength} karakter`;
        }
        if (maxLength && value.length > maxLength) {
          return `${field.label} maksimal ${maxLength} karakter`;
        }
        if (pattern && !new RegExp(pattern).test(value)) {
          return `Format ${field.label} tidak valid`;
        }
      }

      if (typeof value === "number") {
        if (min !== undefined && value < min) {
          return `${field.label} minimal ${min}`;
        }
        if (max !== undefined && value > max) {
          return `${field.label} maksimal ${max}`;
        }
      }
    }

    return "";
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const error = validateField(field, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      if (apiEndpoint) {
        const method = mode === "edit" ? "PUT" : "POST";
        const url =
          mode === "edit" ? `${apiEndpoint}/${initialData.id}` : apiEndpoint;

        const response = await fetch(url, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || "Gagal menyimpan data");
        }

        // Show success message
        const successMessage = mode === 'edit' ? 'Data berhasil diperbarui' : 'Data berhasil dibuat';
        alert.success('Berhasil!', successMessage);

        if (redirectTo) {
          // Add small delay to show the success message before redirect
          setTimeout(() => {
            router.push(redirectTo);
            router.refresh();
          }, 1500);
        } else if (onClose) {
          // Close modal after success
          onClose();
        }
      } else if (onSubmit) {
        await onSubmit(formData);
      } else {
        throw new Error("Tidak ada method submit yang tersedia");
      }
    } catch (error: any) {
      alert.error('Gagal Menyimpan Data', error.message || 'Terjadi kesalahan saat menyimpan data. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    } else if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleCancel();
    }
  };

  const renderField = (field: FormField) => {
    const fieldId = `field-${field.name}`;
    const hasError = !!errors[field.name];
    const baseInputClass = `w-full appearance-none rounded-lg border border-stroke bg-transparent px-5.5 py-3 pl-5.5 outline-none transition focus:border-primary active:border-primary dark:border-dark-3 dark:bg-dark-2 dark:focus:border-primary ${
      hasError
        ? "border-red-500 dark:border-red-500"
        : "border-stroke dark:border-dark-3"
    } ${field.disabled ? "bg-gray-2" : "bg-transparent"}`;

    const getGridClass = (cols: number = 12) => {
      const colsMap: Record<number, string> = {
        1: "col-span-1",
        2: "col-span-2",
        3: "col-span-3",
        4: "col-span-4",
        6: "col-span-6",
        12: "col-span-12",
      };
      return colsMap[cols] || "col-span-12";
    };

    return (
      <div
        key={field.name}
        className={`${getGridClass(field.gridCols)} ${field.className || ""}`}
      >
        <label
          htmlFor={fieldId}
          className="mb-2.5 block font-medium text-dark dark:text-white"
        >
          {field.label}
          {field.required && <span className="ml-1 text-red-500">*</span>}
        </label>

        {field.type === "textarea" ? (
          <textarea
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => handleChange(field.name, e.target.value)}
            placeholder={field.placeholder}
            rows={field.rows || 3}
            disabled={field.disabled}
            className={baseInputClass}
          />
        ) : field.type === "select" ? (
          field.enableCrud ? (
            <SelectWithCrud
              id={fieldId}
              name={field.name}
              value={formData[field.name] || ""}
              options={dynamicOptions[field.name] || field.options || []}
              onValueChange={(value) => handleChange(field.name, value)}
              onOptionsChange={(newOptions) => handleOptionsChange(field.name, newOptions)}
              placeholder={field.placeholder || `-- Pilih ${field.label} --`}
              disabled={field.disabled}
              required={field.required}
              className={hasError ? "border-red-500 dark:border-red-500" : ""}
              crudConfig={field.enableCrud}
              onDataChange={(action, item) => handleMasterDataChange(field.name, action, item)}
            />
          ) : (
            <div className="relative">
              <select
                id={fieldId}
                name={field.name}
                value={formData[field.name] || ""}
                onChange={(e) => handleChange(field.name, e.target.value)}
                disabled={field.disabled}
                multiple={field.multiple}
                className={baseInputClass}
              >
                <option value="">-- Pilih {field.label} --</option>
                {(dynamicOptions[field.name] || field.options || []).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          )
        ) : field.type === "checkbox" ? (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={fieldId}
              name={field.name}
              checked={!!formData[field.name]}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              disabled={field.disabled}
              className="h-4 w-4 rounded border-stroke text-primary focus:ring-primary"
            />
            {field.description && (
              <label
                htmlFor={fieldId}
                className="ml-2 text-sm text-dark-4 dark:text-dark-6"
              >
                {field.description}
              </label>
            )}
          </div>
        ) : field.type === "date" || field.type === "datetime-local" ? (
          <div className="relative">
            <input
              type="text"
              id={fieldId}
              name={field.name}
              value={formData[field.name] || ""}
              onChange={(e) => handleChange(field.name, e.target.value)}
              placeholder={field.type === "date" ? "YYYY-MM-DD" : "YYYY-MM-DD HH:mm"}
              disabled={field.disabled}
              data-field-name={field.name}
              className={`${baseInputClass} ${
                field.type === "date" 
                  ? "form-datepicker-date" 
                  : "form-datepicker-datetime"
              } pr-12`}
              data-class="flatpickr-right"
            />
            <div className="pointer-events-none absolute inset-0 left-auto right-5 flex items-center">
              <Calendar className="size-5 text-[#9CA3AF]" />
            </div>
          </div>
        ) : (
          <input
            type={field.type}
            id={fieldId}
            name={field.name}
            value={formData[field.name] || ""}
            onChange={(e) => {
              const value =
                field.type === "number"
                  ? parseFloat(e.target.value) || ""
                  : e.target.value;
              handleChange(field.name, value);
            }}
            placeholder={field.placeholder}
            disabled={field.disabled}
            min={field.validation?.min}
            max={field.validation?.max}
            minLength={field.validation?.minLength}
            maxLength={field.validation?.maxLength}
            pattern={field.validation?.pattern}
            className={baseInputClass}
          />
        )}

        {hasError && (
          <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
        )}

        {field.description && field.type !== "checkbox" && (
          <p className="mt-1 text-sm text-dark-4 dark:text-dark-6">
            {field.description}
          </p>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      <div 
        className="relative mx-auto w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-[10px] bg-white shadow-2xl dark:bg-gray-dark"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stroke px-6 py-4 dark:border-dark-3">
          <h3 className="font-semibold text-dark dark:text-white">{title}</h3>
          <button
            type="button"
            onClick={handleCancel}
            className="flex h-8 w-8 items-center justify-center rounded-full text-dark-4 hover:bg-gray-2 hover:text-dark dark:text-dark-6 dark:hover:bg-dark-3 dark:hover:text-white"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto">
          <form id="crud-form" onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-12 gap-4 md:gap-6">
              {fields.map(renderField)}
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex gap-4 border-t border-stroke bg-gray-1 px-6 py-4 dark:border-dark-3 dark:bg-dark-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={submitting || isLoading}
            className="flex w-full justify-center rounded-[7px] border border-stroke bg-white px-6 py-2.5 font-medium text-dark hover:shadow-1 disabled:cursor-not-allowed disabled:opacity-50 dark:border-dark-3 dark:bg-gray-dark dark:text-white dark:hover:shadow-card"
          >
            {cancelLabel}
          </button>
          
          <button
            type="submit"
            form="crud-form"
            onClick={handleSubmit}
            disabled={submitting || isLoading}
            className="flex w-full justify-center rounded-[7px] bg-primary px-6 py-2.5 font-medium text-white hover:bg-opacity-90 disabled:cursor-not-allowed disabled:bg-opacity-50"
          >
            {submitting ? "Menyimpan..." : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
