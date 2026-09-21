import { useState } from 'react';
import { Trophy, Plus, X, Check, Target, Sparkles, Trash2 } from 'lucide-react';
import type { GoalDefinition, GoalProgress } from '../../types';
import { ALL_QUEST_ICONS, GOAL_PALETTES, DEFAULT_GOAL_PALETTE } from '../../constants';
import { newId } from '../../lib/storage';
import { Modal } from '../Shell';
import { GoalIcon } from '../GoalIcon';

export function GoalPoolModal({
  goalPool,
  goalProgress,
  goalCategories,
  onClose,
  onToggleInBar,
  onRemoveFromPool,
  onCreate,
  onAddCategory,
}: {
  goalPool: GoalDefinition[];
  goalProgress: GoalProgress[];
  goalCategories: string[];
  onClose: () => void;
  onToggleInBar: (goalId: string) => void;
  onRemoveFromPool: (goalId: string) => void;
  onCreate: (goal: GoalDefinition) => void;
  onAddCategory: (name: string) => void;
}) {
  // Form state'i artık App() içinde değil, sahibi olan bileşende.
  const [isCreating, setIsCreating] = useState(false);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryInput, setCategoryInput] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(goalCategories[0] ?? 'Yaşam');
  const [target, setTarget] = useState(10);
  const [unit, setUnit] = useState('adet');
  const [iconType, setIconType] = useState('Target');
  const [days, setDays] = useState<number | ''>('');
  const [showAllIcons, setShowAllIcons] = useState(false);

  const resetForm = () => {
    setTitle('');
    setTarget(10);
    setUnit('adet');
    setDays('');
    setShowAllIcons(false);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const palette = GOAL_PALETTES[category] ?? DEFAULT_GOAL_PALETTE;
    onCreate({
      id: newId('goal'),
      title: title.trim(),
      category,
      metricName: title.trim(),
      target: Math.max(1, Number(target) || 1),
      unit: unit.trim() || 'adet',
      deadlineDays: days === '' ? undefined : Number(days),
      iconType,
      colorGradient: palette.gradient,
      accentColor: palette.accent,
      borderColor: palette.border,
      isCustom: true,
    });
    resetForm();
    setIsCreating(false);
  };

  const commitCategory = () => {
    const trimmed = categoryInput.trim();
    if (!trimmed) return;
    onAddCategory(trimmed);
    setCategory(trimmed);
    setCategoryInput('');
    setIsAddingCategory(false);
  };

  const icons = showAllIcons ? ALL_QUEST_ICONS : ALL_QUEST_ICONS.slice(0, 8);

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl" labelledBy="goalpool-title" className="flex flex-col max-h-[88vh]">
      <div className="flex items-center justify-between mb-3 shrink-0 pr-10">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <Trophy size={24} />
          </div>
          <div>
            <h3 id="goalpool-title" className="text-lg font-black text-slate-100">
              Kişisel Hedef & Quest Havuzu
            </h3>
            <p className="text-xs text-slate-400">Üst çubuğa ekle veya sıfırdan kendi hedefini tanımla</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => { setIsCreating((v) => !v); setIsAddingCategory(false); }}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
            isCreating
              ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
          }`}
        >
          {isCreating ? <X size={14} /> : <Plus size={14} />}
          <span>{isCreating ? 'Listeye Dön' : 'Yeni Hedef Tanımla'}</span>
        </button>
      </div>

      {isCreating ? (
        <form onSubmit={submit} className="p-4 rounded-2xl bg-[#111726] border border-amber-500/30 flex flex-col gap-3 my-2 overflow-y-auto">
          <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
            <Target size={14} /> Sıfırdan Özel Hedef / Quest Oluştur
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="goal-title" className="text-[11px] font-bold text-slate-300 mb-1 block">Hedef Başlığı</label>
              <input
                id="goal-title"
                type="text"
                placeholder="Örn: Günde 3 Litre Su, 50 LeetCode..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="goal-cat" className="text-[11px] font-bold text-slate-300">Kategori</label>
                <button
                  type="button"
                  onClick={() => setIsAddingCategory((v) => !v)}
                  className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                >
                  <Plus size={11} /> Kategori Ekle
                </button>
              </div>

              {isAddingCategory ? (
                <div className="flex items-center gap-1.5">
                  <input
                    type="text"
                    placeholder="Yeni kategori adı..."
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') { e.preventDefault(); commitCategory(); }
                    }}
                    className="flex-1 bg-[#0b0f17] border border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none"
                    autoFocus
                  />
                  <button type="button" onClick={commitCategory} title="Kategoriyi Kaydet" className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black shrink-0">
                    <Check size={14} />
                  </button>
                  <button type="button" onClick={() => { setIsAddingCategory(false); setCategoryInput(''); }} title="Vazgeç" className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 shrink-0">
                    <X size={14} />
                  </button>
                </div>
              ) : (
                <select
                  id="goal-cat"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                >
                  {goalCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label htmlFor="goal-target" className="text-[11px] font-bold text-slate-300 mb-1 block">Hedeflenen Miktar</label>
              <input
                id="goal-target"
                type="number"
                min={1}
                value={target}
                onChange={(e) => setTarget(Math.max(1, Number(e.target.value) || 1))}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="goal-unit" className="text-[11px] font-bold text-slate-300 mb-1 block">Birim</label>
              <input
                id="goal-unit"
                type="text"
                placeholder="adım, soru, sayfa..."
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label htmlFor="goal-days" className="text-[11px] font-bold text-slate-300 mb-1 block">Kalan Gün (Ops.)</label>
              <input
                id="goal-days"
                type="number"
                min={1}
                placeholder="Örn: 30"
                value={days}
                onChange={(e) => setDays(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold text-slate-300">İkon Seçimi</span>
              <button
                type="button"
                onClick={() => setShowAllIcons((v) => !v)}
                className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
              >
                <Sparkles size={12} />
                <span>{showAllIcons ? 'Daha Az Göster' : `Tüm İkonları Gör (${ALL_QUEST_ICONS.length} Adet)`}</span>
              </button>
            </div>

            <div className="grid grid-cols-8 gap-2 p-2 bg-[#0b0f17] border border-slate-800 rounded-2xl max-h-40 overflow-y-auto">
              {icons.map((ic) => {
                const Icon = ic.icon;
                const selected = iconType === ic.id;
                return (
                  <button
                    key={ic.id}
                    type="button"
                    onClick={() => setIconType(ic.id)}
                    aria-pressed={selected}
                    title={ic.label}
                    className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                      selected
                        ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md scale-105'
                        : 'bg-[#121724] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="text-[8px] uppercase truncate w-full text-center">{ic.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button type="button" onClick={() => { setIsCreating(false); setIsAddingCategory(false); }} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700">
              İptal
            </button>
            <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-md flex items-center gap-1.5">
              <Check size={15} /> Hedefi Havuza Ekle
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2 overflow-y-auto pr-1 flex-1">
          {goalPool.map((g) => {
            const isAdded = goalProgress.some((p) => p.goalId === g.id);
            return (
              <div
                key={g.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  isAdded ? 'bg-[#121927] border-amber-500/60 shadow-lg' : 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${g.accentColor}`}>
                      <GoalIcon type={g.iconType} size={20} />
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">{g.category}</span>
                      <h4 className="text-sm font-extrabold text-slate-100">{g.title}</h4>
                    </div>
                  </div>

                  {g.isCustom && (
                    <button
                      type="button"
                      onClick={() => onRemoveFromPool(g.id)}
                      className="p-1 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                      title="Havuzdan Kalıcı Sil"
                      aria-label={`${g.title} hedefini havuzdan sil`}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                  <span>Hedef: <b className="text-slate-200">{g.target.toLocaleString('tr-TR')} {g.unit}</b></span>
                  {g.deadlineDays && <span className="text-amber-400">~{g.deadlineDays} Gün</span>}
                </div>

                <button
                  type="button"
                  onClick={() => onToggleInBar(g.id)}
                  className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                    isAdded
                      ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                      : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                  }`}
                >
                  {isAdded ? <><Check size={14} /> Çubuktan Kaldır</> : <><Plus size={14} /> Çubuğa Ekle</>}
                </button>
              </div>
            );
          })}

          {goalPool.length === 0 && (
            <p className="col-span-full text-center text-xs text-slate-500 font-mono py-8">
              Havuz boş. Sağ üstten yeni bir hedef tanımlayın.
            </p>
          )}
        </div>
      )}
    </Modal>
  );
}
