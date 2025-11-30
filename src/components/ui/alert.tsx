"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

// Types for different alert variants
export type AlertType = 'success' | 'danger' | 'warning' | 'info' | 'confirm';

export interface AlertConfig {
  type: AlertType;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  showIcon?: boolean;
  autoClose?: boolean;
  duration?: number; // in milliseconds
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertProps extends AlertConfig {
  isOpen: boolean;
  onClose: () => void;
}

// Alert Icons
const AlertIcons = {
  success: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  danger: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  warning: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  info: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  confirm: (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
};

// Alert styles based on type
const getAlertStyles = (type: AlertType) => {
  const styles = {
    success: {
      iconBg: 'bg-green-100 dark:bg-green-900/30',
      iconColor: 'text-green-600 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      confirmBtn: 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
    },
    danger: {
      iconBg: 'bg-red-100 dark:bg-red-900/30',
      iconColor: 'text-red-600 dark:text-red-400',
      border: 'border-red-200 dark:border-red-800',
      confirmBtn: 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
    },
    warning: {
      iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      border: 'border-yellow-200 dark:border-yellow-800',
      confirmBtn: 'bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500'
    },
    info: {
      iconBg: 'bg-blue-100 dark:bg-blue-900/30',
      iconColor: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
    },
    confirm: {
      iconBg: 'bg-gray-100 dark:bg-gray-900/30',
      iconColor: 'text-gray-600 dark:text-gray-400',
      border: 'border-gray-200 dark:border-gray-800',
      confirmBtn: 'bg-primary hover:bg-primary/90 focus:ring-primary'
    }
  };
  return styles[type];
};

export function Alert({
  isOpen,
  type,
  title,
  message,
  confirmText = 'OK',
  cancelText = 'Batal',
  showIcon = true,
  autoClose = false,
  duration = 3000,
  onConfirm,
  onCancel,
  onClose
}: AlertProps) {
  const [isLoading, setIsLoading] = useState(false);
  const styles = getAlertStyles(type);
  const isConfirmType = type === 'confirm';
  const showButtons = isConfirmType || onConfirm;

  useEffect(() => {
    if (isOpen && autoClose && !isConfirmType) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoClose, isConfirmType, duration, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleConfirm = async () => {
    if (onConfirm) {
      setIsLoading(true);
      try {
        await onConfirm();
      } catch (error) {
        console.error('Error in alert confirm:', error);
      } finally {
        setIsLoading(false);
      }
    }
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isConfirmType) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div 
        className={cn(
          "relative mx-4 w-full max-w-md rounded-[10px] bg-white p-6 shadow-2xl dark:bg-gray-dark",
          "transform transition-all duration-300 ease-out",
          "border-2",
          styles.border
        )}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon and Content */}
        <div className="flex items-start gap-4">
          {showIcon && (
            <div className={cn(
              "flex-shrink-0 rounded-full p-2",
              styles.iconBg
            )}>
              <div className={styles.iconColor}>
                {AlertIcons[type]}
              </div>
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-dark dark:text-white mb-2">
              {title}
            </h3>
            {message && (
              <p className="text-sm text-dark-4 dark:text-dark-6 mb-4">
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Buttons */}
        {showButtons && (
          <div className="flex items-center justify-end gap-3 mt-6">
            {isConfirmType && (
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                className="px-4 py-2 text-sm font-medium text-dark dark:text-white border border-stroke rounded-[7px] hover:bg-gray-1 dark:border-dark-3 dark:hover:bg-dark-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {cancelText}
              </button>
            )}
            
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isLoading}
              className={cn(
                "px-4 py-2 text-sm font-medium text-white rounded-[7px] transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed min-w-[80px]",
                styles.confirmBtn
              )}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Loading...</span>
                </div>
              ) : (
                confirmText
              )}
            </button>
          </div>
        )}

        {/* Auto-close progress bar */}
        {autoClose && !isConfirmType && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-700 rounded-b-[10px] overflow-hidden">
            <div 
              className={cn("h-full transition-all ease-linear", {
                'bg-green-500': type === 'success',
                'bg-red-500': type === 'danger',
                'bg-yellow-500': type === 'warning',
                'bg-blue-500': type === 'info'
              })}
              style={{
                animation: `shrink ${duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
}