"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAlert } from "@/hooks/useAlert";
import { AlertConfig } from "@/components/ui/alert";
import { Alert } from "@/components/ui/alert";

type AlertContextType = {
  success: (title: string, message?: string, options?: Partial<AlertConfig>) => void;
  error: (title: string, message?: string, options?: Partial<AlertConfig>) => void;
  warning: (title: string, message?: string, options?: Partial<AlertConfig>) => void;
  info: (title: string, message?: string, options?: Partial<AlertConfig>) => void;
  confirm: (
    title: string,
    message?: string,
    options?: {
      confirmText?: string;
      cancelText?: string;
      onConfirm?: () => void | Promise<void>;
      onCancel?: () => void;
    }
  ) => Promise<boolean>;
};

const AlertContext = createContext<AlertContextType | null>(null);

export function AlertProvider({ children }: { children: ReactNode }) {
  const alertInstance = useAlert();

  return (
    <AlertContext.Provider value={{
      success: alertInstance.success,
      error: alertInstance.error,
      warning: alertInstance.warning,
      info: alertInstance.info,
      confirm: alertInstance.confirm
    }}>
      {children}
      <Alert
        {...alertInstance.alertState}
        onClose={alertInstance.closeAlert}
      />
    </AlertContext.Provider>
  );
}

export function useAlertContext() {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlertContext must be used within an AlertProvider');
  }
  return context;
}

// Global alert methods (alternative approach)
export const globalAlert = {
  success: (title: string, message?: string) => {
    console.warn('Global alert used without provider. Consider using useAlertContext() hook instead.');
    window.alert(`✓ ${title}${message ? `\n${message}` : ''}`);
  },
  error: (title: string, message?: string) => {
    console.warn('Global alert used without provider. Consider using useAlertContext() hook instead.');
    window.alert(`✗ ${title}${message ? `\n${message}` : ''}`);
  },
  warning: (title: string, message?: string) => {
    console.warn('Global alert used without provider. Consider using useAlertContext() hook instead.');
    window.alert(`⚠ ${title}${message ? `\n${message}` : ''}`);
  },
  info: (title: string, message?: string) => {
    console.warn('Global alert used without provider. Consider using useAlertContext() hook instead.');
    window.alert(`ℹ ${title}${message ? `\n${message}` : ''}`);
  },
  confirm: (title: string, message?: string) => {
    console.warn('Global alert used without provider. Consider using useAlertContext() hook instead.');
    return Promise.resolve(window.confirm(`${title}${message ? `\n${message}` : ''}`));
  }
};