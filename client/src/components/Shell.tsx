import { useEffect, useRef, useState, useCallback } from 'react';
import { X, AlertTriangle } from 'lucide-react';

// ==========================================================================
// ORTAK MODAL KABUĞU
//
// Eski kodda her popup kendi overlay + kapatma butonu + z-index'ini
// elle kuruyordu. Escape ile kapanma ve odak yönetimi hiçbirinde yoktu.
// ==========================================================================

export function Modal({
  onClose,
  children,
  maxWidth = 'max-w-lg',
  labelledBy,
  className = '',
  z = 'z-50',
}: {
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
  labelledBy?: string;
  className?: string;
  z?: string;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    panelRef.current?.focus();
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className={`fixed inset-0 ${z} bg-black/85 backdrop-blur-md flex items-center justify-center p-4`}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={`w-full ${maxWidth} bg-[#0c101a] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative outline-none ${className}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Kapat"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors z-10"
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}

// ==========================================================================
// BİLDİRİM (TOAST)
//
// Eski kodda dokuz ayrı alert() vardı. alert() tarayıcıyı kilitler,
// mobilde çirkin görünür ve stil alamaz.
// ==========================================================================

export interface Notice {
  id: number;
  text: string;
  tone: 'error' | 'success';
}

export function useNotices() {
  const [notices, setNotices] = useState<Notice[]>([]);

  const push = useCallback((text: string, tone: Notice['tone'] = 'error') => {
    const id = Date.now() + Math.random();
    setNotices((prev) => [...prev, { id, text, tone }]);
    setTimeout(() => {
      setNotices((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  return { notices, push };
}

export function NoticeStack({ notices }: { notices: Notice[] }) {
  if (notices.length === 0) return null;
  return (
    <div
      className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none"
      role="status"
      aria-live="polite"
    >
      {notices.map((n) => (
        <div
          key={n.id}
          className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl border shadow-2xl text-xs font-bold max-w-sm ${
            n.tone === 'error'
              ? 'bg-red-950/95 border-red-500/60 text-red-200'
              : 'bg-emerald-950/95 border-emerald-500/60 text-emerald-200'
          }`}
        >
          <AlertTriangle size={16} className="shrink-0" />
          <span>{n.text}</span>
        </div>
      ))}
    </div>
  );
}

/** Arka plandaki dekoratif bulanıklık katmanı. Üç görünümde de aynıydı. */
export function Atmosphere() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0" aria-hidden="true">
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-950/20 rounded-full blur-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(#1a2035_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
    </div>
  );
}
