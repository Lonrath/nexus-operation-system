import { useState, useEffect } from 'react';
import {
  Clock, Calendar as CalendarIcon, Wallet, FileText, Trash2,
  CheckCircle2, Save, Sparkles,
} from 'lucide-react';
import type { CalendarEventItem } from '../../types';
import { CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORY } from '../../constants';
import { MONTH_NAMES } from '../../lib/dates';
import { Modal } from '../Shell';

export function EventDetailModal({
  event,
  onClose,
  onSave,
  onDelete,
  onToggleComplete,
}: {
  event: CalendarEventItem;
  onClose: () => void;
  onSave: (id: string, patch: Pick<CalendarEventItem, 'cost' | 'expenseCategory' | 'note'>) => void;
  onDelete: (groupId: string) => void;
  onToggleComplete: (groupId: string) => void;
}) {
  const [cost, setCost] = useState(Math.max(0, event.cost || 0));
  const [category, setCategory] = useState(event.expenseCategory || DEFAULT_EXPENSE_CATEGORY);
  const [note, setNote] = useState(event.note || '');
  const [saved, setSaved] = useState(false);

  // Başka bir etkinliğe geçilirse formu tazele.
  useEffect(() => {
    setCost(Math.max(0, event.cost || 0));
    setCategory(event.expenseCategory || DEFAULT_EXPENSE_CATEGORY);
    setNote(event.note || '');
    setSaved(false);
  }, [event.id, event.cost, event.expenseCategory, event.note]);

  const cfg = CATEGORIES.find((c) => c.id === event.category);
  const Icon = cfg?.icon ?? Sparkles;

  const handleSave = () => {
    const validCost = Math.max(0, Number(cost) || 0);
    onSave(event.id, {
      cost: validCost,
      expenseCategory: validCost > 0 ? category : undefined,
      note: note.trim() || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg" labelledBy="evt-title" z="z-[60]">
      <div className="flex items-start gap-3.5 mb-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg mt-0.5 border border-white/20"
          style={{ backgroundColor: cfg?.themeColor || '#f59e0b' }}
        >
          <Icon size={22} />
        </div>
        <div className="flex-1 pr-8">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {event.gameName && (
              <span className="text-[10px] font-black uppercase bg-red-950/80 text-red-300 px-2 py-0.5 rounded-md border border-red-800/50">
                🎮 {event.gameName}
              </span>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
              {event.category}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
              event.priority === 'Kritik (Raid/Sınav)' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
              event.priority === 'Yüksek' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
              'bg-blue-500/20 text-blue-300 border border-blue-500/30'
            }`}>
              {event.priority}
            </span>
          </div>
          <h3 id="evt-title" className="text-lg font-black text-slate-100 leading-snug">{event.title}</h3>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div className="p-3 rounded-2xl bg-[#121724] border border-slate-800 flex items-center gap-3">
          <Clock size={18} className="text-amber-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Zaman Aralığı</span>
            <span className="text-xs font-mono font-extrabold text-slate-100">{event.timeSlot}</span>
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-[#121724] border border-slate-800 flex items-center gap-3">
          <CalendarIcon size={18} className="text-cyan-400 shrink-0" />
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarih</span>
            <span className="text-xs font-mono font-extrabold text-slate-100">
              {event.day} {MONTH_NAMES[event.month]} {event.year}
            </span>
          </div>
        </div>
      </div>

      <div className="p-3.5 rounded-2xl bg-[#121724] border border-amber-500/30 mb-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Wallet size={14} className="text-amber-400" /> Etkinlik Maliyeti & Finans Kategorisi
          </span>
          <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
            Nexus Finance Bağlantılı
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="evt-cost" className="text-[10px] font-bold text-slate-400 block mb-1">Maliyet (₺)</label>
            <input
              id="evt-cost"
              type="number"
              min={0}
              value={cost}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="evt-expcat" className="text-[10px] font-bold text-slate-400 block mb-1">Harcama Kategorisi</label>
            <select
              id="evt-expcat"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500"
            >
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <label htmlFor="evt-note" className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1">
          <FileText size={14} className="text-amber-400" /> Görev Açıklaması & Notlar
        </label>
        <textarea
          id="evt-note"
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Bu etkinlik için not ekleyin..."
          className="w-full bg-[#111624] border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-300 leading-relaxed outline-none focus:border-amber-500 resize-none font-sans"
        />
      </div>

      <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
        <button
          type="button"
          onClick={() => { onDelete(event.groupId); onClose(); }}
          className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
        >
          <Trash2 size={14} /> Etkinliği Sil
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onToggleComplete(event.groupId)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
              event.isCompleted
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <CheckCircle2 size={15} className={event.isCompleted ? 'text-emerald-400' : 'text-slate-400'} />
            <span>{event.isCompleted ? 'Tamamlandı' : 'Tamamla'}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Save size={14} /> {saved ? 'Kaydedildi' : 'Kaydet'}
          </button>

          <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md">
            Kapat
          </button>
        </div>
      </div>
    </Modal>
  );
}
