"use client";

import { useState, useCallback } from "react";
import { AlertConfig } from "@/components/ui/alert";

interface AlertState extends AlertConfig {
  isOpen: boolean;
}

export function useAlert() {
  const [alertState, setAlertState] = useState<AlertState>({
    isOpen: false,
    type: 'info',
    title: '',
    message: '',
    showIcon: true,
    autoClose: false,
    duration: 3000
  });

  const closeAlert = useCallback(() => {
    setAlertState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const showAlert = useCallback((config: AlertConfig) => {
    setAlertState({
      ...config,
      isOpen: true,
      confirmText: config.confirmText || 'OK',
      cancelText: config.cancelText || 'Batal',
      showIcon: config.showIcon !== false,
      autoClose: config.autoClose || false,
      duration: config.duration || 3000
    });
  }, []);

  // Convenience methods for different alert types
  const success = useCallback((title: string, message?: string, options?: Partial<AlertConfig>) => {
    showAlert({
      type: 'success',
      title,
      message,
      autoClose: true,
      duration: 3000,
      ...options
    });
  }, [showAlert]);

  const error = useCallback((title: string, message?: string, options?: Partial<AlertConfig>) => {
    showAlert({
      type: 'danger',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const warning = useCallback((title: string, message?: string, options?: Partial<AlertConfig>) => {
    showAlert({
      type: 'warning',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const info = useCallback((title: string, message?: string, options?: Partial<AlertConfig>) => {
    showAlert({
      type: 'info',
      title,
      message,
      ...options
    });
  }, [showAlert]);

  const confirm = useCallback((
    title: string,
    message?: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void | Promise<void>;
      onCancel?: () => void;
    }
  ) => {
    return new Promise<boolean>((resolve) => {
      showAlert({
        type: 'confirm',
        title,
        message,
        confirmText: options?.confirmText || 'Ya, Lanjutkan',
        cancelText: options?.cancelText || 'Batal',
        onConfirm: async () => {
          if (options?.onConfirm) {
            await options.onConfirm();
          }
          resolve(true);
        },
        onCancel: () => {
          if (options?.onCancel) {
            options.onCancel();
          }
          resolve(false);
        }
      });
    });
  }, [showAlert]);

  return {
    // State
    isOpen: alertState.isOpen,
    alertState,
    
    // Methods
    showAlert,
    closeAlert,
    
    // Convenience methods
    success,
    error,
    warning,
    info,
    confirm
  };
}