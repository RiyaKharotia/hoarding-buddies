
import { toast as sonnerToast } from "sonner";

type ToastOptions = {
  description?: string;
  variant?: "default" | "destructive";
  [key: string]: any;
}

// Create a wrapper function for toast that handles variants and provides methods
function toast(message: string, options?: ToastOptions) {
  if (options?.variant === "destructive") {
    return sonnerToast.error(message, {
      description: options.description,
      ...options
    });
  }
  
  return sonnerToast(message, options);
}

// Add additional toast methods for compatibility
toast.success = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return sonnerToast.success(message, options);
};

toast.error = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return sonnerToast.error(message, options);
};

toast.info = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return sonnerToast.info(message, options);
};

toast.warning = (message: string, options?: Omit<ToastOptions, 'variant'>) => {
  return sonnerToast.warning(message, options);
};

// Simulate the useToast hook API for backward compatibility
function useToast() {
  return {
    toast
  };
}

export { useToast, toast };
