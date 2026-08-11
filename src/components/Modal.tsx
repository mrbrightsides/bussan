import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'md',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const widthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div
        className={`bg-white rounded-2xl shadow-2xl border border-red-100 w-full ${widthClasses} max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Red-White accent */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white px-5 py-4 flex items-center justify-between shrink-0 relative overflow-hidden">
          {/* Subtle decorative background flags */}
          <div className="absolute -right-4 -bottom-6 w-20 h-20 bg-white/10 rounded-full blur-md pointer-events-none" />
          
          <div>
            <h3 className="text-lg font-bold tracking-wide text-white">{title}</h3>
            {subtitle && <p className="text-xs text-red-100 font-medium mt-0.5">{subtitle}</p>}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors focus:outline-none"
            aria-label="Tutup Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-slate-800 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
