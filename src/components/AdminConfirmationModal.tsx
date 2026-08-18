import React, { useState, useEffect } from 'react';
import { ShieldAlert, Trash2, AlertTriangle, X, Lock, CheckCircle2 } from 'lucide-react';

export const ADMIN_RT_PIN = '2222'; // Default PIN Pengurus RT 22

interface AdminConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  itemName?: string;
  confirmButtonText?: string;
  isBulkAction?: boolean; // If true, requires PIN or typing confirmation
  requirePin?: boolean;
}

export const AdminConfirmationModal: React.FC<AdminConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmButtonText = 'Ya, Hapus Permanen',
  isBulkAction = false,
  requirePin = false,
}) => {
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const needsPin = isBulkAction || requirePin;

  useEffect(() => {
    if (isOpen) {
      setPinInput('');
      setPinError(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (needsPin) {
      if (pinInput.trim() !== ADMIN_RT_PIN && pinInput.trim().toUpperCase() !== 'HAPUS') {
        setPinError(true);
        return;
      }
    }
    onConfirm();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Danger Accent */}
        <div className="bg-rose-50 border-b border-rose-100 p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Konfirmasi Keamanan Pengurus
              </div>
              <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-white/80 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 leading-relaxed">{message}</p>

          {itemName && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                Target Data:
              </div>
              <div className="text-sm font-bold text-slate-800 break-words mt-0.5">
                "{itemName}"
              </div>
            </div>
          )}

          {/* Warning badge */}
          <div className="flex items-start gap-2.5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Tindakan ini permanen dan akan menghapus data langsung dari server database RT.
            </span>
          </div>

          {/* PIN Input if bulk/critical */}
          {needsPin && (
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="block text-xs font-bold text-slate-700">
                Masukkan PIN Pengurus RT (Default: <span className="font-mono text-emerald-700">{ADMIN_RT_PIN}</span>) atau ketik <span className="font-mono text-rose-600">HAPUS</span>:
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  placeholder={`Ketik ${ADMIN_RT_PIN} atau HAPUS`}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(false);
                  }}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                    pinError
                      ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-200 focus:outline-none'
                      : 'border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 focus:outline-none'
                  }`}
                  autoFocus
                />
              </div>
              {pinError && (
                <p className="text-xs text-rose-600 font-medium">
                  PIN atau teks konfirmasi tidak sesuai. Masukkan {ADMIN_RT_PIN} untuk menyetujui.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-200/80 transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            {confirmButtonText}
          </button>
        </div>
      </div>
    </div>
  );
};
