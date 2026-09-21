import { useState } from 'react';
import { Check, Wallet, Sparkles } from 'lucide-react';
import type { SavedActivityTemplate } from '../../types';
import {
  CATEGORIES, EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORY, MAX_EVENT_DURATION,
} from '../../constants';
import { MONTH_NAMES, fmtHour } from '../../lib/dates';
import { Modal } from '../Shell';

/** 00:00–23:00 arası başlangıç saati seçenekleri. */
export function StartHourOptions() {
  return (
    <>
      {Array.from({ length: 24 }, (_, i) => i).map((h) => (
        <option key={h} value={h}>{fmtHour(h)}</option>
      ))}
    </>
  );
}

/** Başlangıca göre bitiş saati seçenekleri; 24'ü aşanlar "Ertesi Gün" etiketli. */
export function EndHourOptions({ start }: { start: number }) {
  return (
    <>
      {Array.from({ length: MAX_EVENT_DURATION }, (_, i) => start + i + 1).map((end) => {
        const label =
          end < 24 ? fmtHour(end)
            : end === 24 ? '24:00'
            : `${fmtHour(end - 24)} (Ertesi Gün)`;
        return <option key={end} value={end}>{label}</option>;
      })}
    </>
  );
}

export function DropScheduleModal({
  day,
  month,
  template,
  onClose,
  onConfirm,
}: {
  day: number;
  month: number;
  template: SavedActivityTemplate;
  onClose: () => void;
  onConfirm: (args: { startHour: number; endHour: number; cost: number; expenseCategory: string }) => void;
}) {
  const [startHour, setStartHour] = useState(20);
  // "auto" artık şablonun kendi süresini kullanıyor.
  // Eski kodda auto her zaman 1 saat demekti; saate bırakma akışıyla çelişiyordu.
  const [endChoice, setEndChoice] = useState<string>('auto');
  const [cost, setCost] = useState(Math.max(0, template.defaultCost || 0));
  const [expenseCategory, setExpenseCategory] = useState(
    template.expenseCategory || DEFAULT_EXPENSE_CATEGORY
  );

  const autoDuration = Math.min(MAX_EVENT_DURATION, Math.max(1, template.defaultDurationHours || 1));
  const resolvedEnd = endChoice === 'auto' ? startHour + autoDuration : Number(endChoice);

  const cfg = CATEGORIES.find((c) => c.id === template.category);
  const Icon = cfg?.icon ?? Sparkles;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm({
      startHour,
      endHour: resolvedEnd,
      cost: Math.max(0, Number(cost) || 0),
      expenseCategory,
    });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-md" labelledBy="drop-title">
      <div className="flex items-center gap-3 mb-4 pr-10">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
          style={{ backgroundColor: template.themeColor }}
        >
          <Icon size={18} />
        </div>
        <div>
          <h3 id="drop-title" className="text-base font-extrabold text-slate-100">{template.title}</h3>
          <p className="text-xs text-slate-400">
            {day} {MONTH_NAMES[month]} günü için saat ve maliyet belirleyin
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="drop-start" className="text-xs font-bold text-slate-300 mb-1 block">Başlangıç Saati</label>
            <select
              id="drop-start"
              value={startHour}
              onChange={(e) => setStartHour(Number(e.target.value))}
              className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
            >
              <StartHourOptions />
            </select>
          </div>
          <div>
            <label htmlFor="drop-end" className="text-xs font-bold text-slate-300 mb-1 block">Bitiş Saati</label>
            <select
              id="drop-end"
              value={endChoice}
              onChange={(e) => setEndChoice(e.target.value)}
              className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
            >
              <option value="auto">Şablon Süresi ({autoDuration} Saat)</option>
              <EndHourOptions start={startHour} />
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-[#121724] border border-slate-800 rounded-2xl">
          <div>
            <label htmlFor="drop-cost" className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Wallet size={12} /> Maliyet (₺)
            </label>
            <input
              id="drop-cost"
              type="number"
              min={0}
              placeholder="0"
              value={cost}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="drop-exp" className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
            <select
              id="drop-exp"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <p className="text-[11px] text-slate-400 font-mono">
          Seçili aralık: {fmtHour(startHour)} –{' '}
          {resolvedEnd <= 24 ? (resolvedEnd === 24 ? '24:00' : fmtHour(resolvedEnd)) : `${fmtHour(resolvedEnd - 24)} (Ertesi Gün)`}
          {' '}({resolvedEnd - startHour} saat)
        </p>

        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
            Vazgeç
          </button>
          <button type="submit" className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md flex items-center gap-1.5">
            <Check size={16} /> Takvime Yerleştir
          </button>
        </div>
      </form>
    </Modal>
  );
}
