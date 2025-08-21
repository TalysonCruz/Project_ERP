"use client";

import { toast } from "sonner";

type ToastVariant = "default" | "success" | "error" | "info" | "destructive";

interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

export function useToast() {
  const showToast = ({
    title,
    description,
    variant = "default",
    duration = 3000,
  }: ToastProps) => {
    toast(title, {
      description,
      duration,
      className: variantClass[variant],
    });
  };

  const success = (title: string, description?: string, duration?: number) =>
    showToast({ title, description, variant: "success", duration });

  const error = (title: string, description?: string, duration?: number) =>
    showToast({ title, description, variant: "error", duration });

  const info = (title: string, description?: string, duration?: number) =>
    showToast({ title, description, variant: "info", duration });

  const destructive = (
    title: string,
    description?: string,
    duration?: number
  ) => showToast({ title, description, variant: "destructive", duration });

  return { toast: showToast, success, error, info, destructive };
}

const variantClass: Record<ToastVariant, string> = {
  default: "bg-white text-black border shadow-md",
  success: "bg-green-500 text-white border border-green-600",
  error: "bg-red-500 text-white border border-red-600",
  info: "bg-blue-500 text-white border border-blue-600",
  destructive: "bg-red-600 text-white border border-red-800", // estilo custom
};
