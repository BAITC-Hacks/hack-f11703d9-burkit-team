import React, { createContext, useContext, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, description?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const showToast = useCallback((message: string, type: ToastType = 'success', description?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    const newToast: ToastItem = { id, type, message, description };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            style={{ zIndex: 1300 }}
            className="fixed top-5 right-5 flex flex-col gap-2.5 max-w-sm pointer-events-none"
          >
            <AnimatePresence>
              {toasts.map((t) => (
                <motion.div
                  key={t.id}
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, y: -8 }}
                  transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  className="pointer-events-auto bg-white rounded-2xl p-4 border border-[#E2E5EE] shadow-[0_12px_32px_rgba(23,23,28,0.12)] flex items-start gap-3 w-84"
                >
                  <div className="shrink-0 mt-0.5">
                    {t.type === 'success' && (
                      <CheckCircle2 className="w-5 h-5 text-[#38BB78] stroke-[2.5]" />
                    )}
                    {t.type === 'error' && (
                      <AlertCircle className="w-5 h-5 text-[#FF6266] stroke-[2.5]" />
                    )}
                    {t.type === 'info' && (
                      <Info className="w-5 h-5 text-[#7047EB] stroke-[2.5]" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-black text-[#17171C] leading-snug">{t.message}</p>
                    {t.description && (
                      <p className="text-[11px] font-medium text-[#667085] mt-0.5 leading-relaxed">
                        {t.description}
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeToast(t.id)}
                    className="shrink-0 text-[#8C93A4] hover:text-[#17171C] transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>,
          document.body
        )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};
