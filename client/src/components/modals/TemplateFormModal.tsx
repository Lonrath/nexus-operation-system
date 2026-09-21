import { useState } from 'react';
import { Edit3, Sparkles, Check, Trash2, Wallet } from 'lucide-react';
import type { SavedActivityTemplate, CategoryType, PriorityType } from '../../types';
import {
  CATEGORIES, PRESET_GAMES, EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORY,
  CUSTOM_GAME_OPTION, MAX_EVENT_DURATION,
} from '../../constants';
import { newId } from '../../lib/storage';
import { Modal } from '../Shell';

// Eski kodda "yeni şablon" ve "şablon düzenle" iki ayrı modaldı; alanları
// birebir aynıydı ama iki ayrı yerde bakım gerektiriyordu. Tek bileşen oldu.

export function TemplateFormModal({
  initial,
  onClose,
  onSave,
  onDelete,
}: {
  /** null ise yeni şablon modu. */
  initial: SavedActivityTemplate | null;
  onClose: () => void;
  onSave: (tpl: SavedActivityTemplate) => void;
  onDelete?: (id: string) => void;
}) {
  const isEdit = initial !== null;

  const [title, setTitle] = useState(initial?.title ?? '');
  const [category, setCategory] = useState<CategoryType>(initial?.category ?? 'Oyunlar');
  const [gameName, setGameName] = useState(initial?.gameName ?? PRESET_GAMES[0]);
  const [customGame, setCustomGame] = useState('');
  const [duration, setDuration] = useState(initial?.defaultDurationHours ?? 2);
  const [priority, setPriority] = useState<PriorityType>(initial?.priority ?? 'Normal');
  const [cost, setCost] = useState(initial?.defaultCost ?? 0);
  const [expenseCategory, setExpenseCategory] = useState(
    initial?.expenseCategory ?? DEFAULT_EXPENSE_CATEGORY
  );
  const [note, setNote] = useState(initial?.note ?? '');

  const catConfig = CATEGORIES.find((c) => c.id === category)!;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const resolvedGame =
      category === 'Oyunlar'
        ? gameName === CUSTOM_GAME_OPTION
          ? customGame.trim() || 'Özel Oyun'
          : gameName
        : undefined;

    const finalTitle =
      title.trim() || (resolvedGame ? `${resolvedGame} Oturumu` : catConfig.label);
    const validCost = Math.max(0, Number(cost) || 0);

    onSave({
      id: initial?.id ?? newId('tpl'),
      title: finalTitle,
      category,
      gameName: resolvedGame,
      themeColor: catConfig.themeColor,
      defaultDurationHours: Math.min(MAX_EVENT_DURATION, Math.max(1, Number(duration) || 1)),
      priority,
      note: note.trim() || undefined,
      defaultCost: validCost,
      expenseCategory: validCost > 0 ? expenseCategory : undefined,
    });
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg" labelledBy="tpl-title" className="border-amber-500/30 bg-[#0d121c]">
      <div className="flex items-center gap-3 mb-4 pr-10">
        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
          {isEdit ? <Edit3 size={22} /> : <Sparkles size={22} />}
        </div>
        <div>
          <h3 id="tpl-title" className="text-lg font-bold text-slate-100">
            {isEdit ? 'Etkinlik Şablonunu Düzenle' : 'Havuza Yeni Şablon Tanımla'}
          </h3>
          <p className="text-xs text-slate-400">
            {isEdit
              ? 'Havuzdaki bu şablonun özelliklerini güncelleyin'
              : 'Bu şablonu istediğiniz günlere sürükleyebileceksiniz'}
          </p>
        </div>
      </div>

      <form onSubmit={submit} className="flex flex-col gap-3.5">
        <div>
          <span className="text-xs font-bold text-slate-300 mb-1 block">Kategori</span>
          <div className="grid grid-cols-3 gap-1.5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCategory(c.id)}
                aria-pressed={category === c.id}
                className={`p-2 rounded-xl border text-left flex items-center gap-1.5 ${
                  category === c.id ? 'border-amber-400 bg-[#1e1b15]' : 'border-slate-800 bg-[#0d121c] text-slate-400'
                }`}
              >
                <span className="text-xs font-bold truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {category === 'Oyunlar' && (
          <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col gap-2">
            <label htmlFor="tpl-game" className="text-xs font-bold text-red-300">Oyun Adı</label>
            <select
              id="tpl-game"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
            >
              {PRESET_GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
            {gameName === CUSTOM_GAME_OPTION && (
              <input
                type="text"
                placeholder="Oyun adını girin (Örn: Baldur's Gate 3)"
                value={customGame}
                onChange={(e) => setCustomGame(e.target.value)}
                className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
              />
            )}
          </div>
        )}

        <div>
          <label htmlFor="tpl-name" className="text-xs font-bold text-slate-300 mb-1 block">Şablon Başlığı</label>
          <input
            id="tpl-name"
            type="text"
            placeholder="Örn: Aspava veya Diablo Sezon Boss Farmı"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 font-semibold"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tpl-dur" className="text-xs font-bold text-slate-300 mb-1 block">Varsayılan Süre (Saat)</label>
            <input
              id="tpl-dur"
              type="number"
              min={1}
              max={MAX_EVENT_DURATION}
              value={duration}
              onChange={(e) => setDuration(Math.max(1, Number(e.target.value) || 1))}
              className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="tpl-prio" className="text-xs font-bold text-slate-300 mb-1 block">Öncelik</label>
            <select
              id="tpl-prio"
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityType)}
              className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
            >
              <option value="Normal">Normal Plan</option>
              <option value="Yüksek">Yüksek Öncelik</option>
              <option value="Kritik (Raid/Sınav)">Kritik (Raid Boss / Sınav)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 p-3 bg-[#121724] border border-slate-800 rounded-2xl">
          <div>
            <label htmlFor="tpl-cost" className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
              <Wallet size={12} /> Varsayılan Maliyet (₺)
            </label>
            <input
              id="tpl-cost"
              type="number"
              min={0}
              placeholder="0"
              value={cost}
              onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
            />
          </div>
          <div>
            <label htmlFor="tpl-exp" className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
            <select
              id="tpl-exp"
              value={expenseCategory}
              onChange={(e) => setExpenseCategory(e.target.value)}
              className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
            >
              {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="tpl-note" className="text-xs font-bold text-slate-300 mb-1 block">Açıklama / Görev Notu</label>
          <textarea
            id="tpl-note"
            rows={2}
            placeholder="Etkinlikle ilgili notlar..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 resize-none font-sans"
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-1">
          {isEdit && onDelete ? (
            <button
              type="button"
              onClick={() => { onDelete(initial!.id); onClose(); }}
              className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Trash2 size={15} /> Havuzdan Sil
            </button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
              Vazgeç
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md flex items-center gap-1.5">
              <Check size={16} /> {isEdit ? 'Değişiklikleri Kaydet' : 'Havuza Kaydet'}
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
}
