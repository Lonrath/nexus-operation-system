import { useState } from 'react';
import {
  X, Clock, Check, Wallet, Gamepad2, Sparkles, GripVertical,
  MousePointerClick, Eye,
} from 'lucide-react';
import type {
  CalendarEventItem, SavedActivityTemplate, CategoryType, PriorityType,
} from '../../types';
import {
  CATEGORIES, PRESET_GAMES, EXPENSE_CATEGORIES, DEFAULT_EXPENSE_CATEGORY,
  CUSTOM_GAME_OPTION, MAX_EVENT_DURATION,
} from '../../constants';
import { MONTH_NAMES, TIMELINE_HOURS, fmtHour, getDayHolidayInfo } from '../../lib/dates';
import type { EventDraft } from '../../lib/eventFactory';
import { StartHourOptions, EndHourOptions } from './DropScheduleModal';

// ==========================================================================
// GÜN YÖNETİM MERKEZİ
//
// Tüm form state'i artık burada yaşıyor; eski kodda App() içindeydi ve
// modal kapansa bile orada duruyordu.
// ==========================================================================

export function DayDetailModal({
  day,
  year,
  month,
  events,
  activityPool,
  customHolidays,
  onClose,
  onToggleHoliday,
  onCreateEvent,
  onRegisterTemplate,
  onViewEvent,
  onDragTemplate,
  onDropOnHour,
}: {
  day: number;
  year: number;
  month: number;
  events: CalendarEventItem[];
  activityPool: SavedActivityTemplate[];
  customHolidays: Record<string, boolean>;
  onClose: () => void;
  onToggleHoliday: (day: number) => void;
  /** false dönerse (kapasite dolu vb.) form temizlenmez. */
  onCreateEvent: (draft: EventDraft) => boolean;
  onRegisterTemplate: (tpl: SavedActivityTemplate) => void;
  onViewEvent: (ev: CalendarEventItem) => void;
  onDragTemplate: (tpl: SavedActivityTemplate | null) => void;
  onDropOnHour: (day: number, hour: number) => void;
}) {
  const [category, setCategory] = useState<CategoryType>('Oyunlar');
  const [game, setGame] = useState('Metin2');
  const [customGame, setCustomGame] = useState('');
  const [title, setTitle] = useState('');
  const [startHour, setStartHour] = useState(20);
  const [endHour, setEndHour] = useState(23);
  const [priority, setPriority] = useState<PriorityType>('Yüksek');
  const [note, setNote] = useState('');
  const [cost, setCost] = useState(0);
  const [expenseCategory, setExpenseCategory] = useState(DEFAULT_EXPENSE_CATEGORY);

  const holiday = getDayHolidayInfo(year, month, day, customHolidays);
  const catConfig = CATEGORIES.find((c) => c.id === category)!;

  const resolvedGame =
    category === 'Oyunlar'
      ? game === CUSTOM_GAME_OPTION ? (customGame.trim() || 'Özel Oyun') : game
      : undefined;

  const finalTitle = title.trim() || (resolvedGame ? `${resolvedGame} Oturumu` : catConfig.label);

  /** Başlangıcı değiştirirken bitişi geçerli tutar. */
  const changeStart = (s: number) => {
    setStartHour(s);
    if (endHour <= s || endHour - s > MAX_EVENT_DURATION) setEndHour(s + 1);
  };

  const handleTimelineClick = (hour: number) => {
    if (hour <= startHour) changeStart(hour);
    else setEndHour(hour);
  };

  const loadTemplate = (tpl: SavedActivityTemplate) => {
    setCategory(tpl.category);
    if (tpl.gameName) setGame(tpl.gameName);
    setTitle(tpl.title);
    setNote(tpl.note || '');
    setCost(tpl.defaultCost || 0);
    if (tpl.expenseCategory) setExpenseCategory(tpl.expenseCategory);
    setEndHour(Math.min(startHour + MAX_EVENT_DURATION, startHour + (tpl.defaultDurationHours || 1)));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const validCost = Math.max(0, Number(cost) || 0);

    const created = onCreateEvent({
      year, month, day,
      startHour, endHour,
      category,
      gameName: resolvedGame,
      title: finalTitle,
      priority,
      note,
      cost: validCost,
      expenseCategory,
    });

    if (!created) return;

    // Havuzda aynı şablon yoksa ekle.
    const duplicate = activityPool.some(
      (t) =>
        t.title.toLowerCase() === finalTitle.toLowerCase() &&
        t.category === category &&
        t.gameName === resolvedGame
    );
    if (!duplicate) {
      onRegisterTemplate({
        id: `pool-${finalTitle}-${Date.now()}`,
        title: finalTitle,
        category,
        gameName: resolvedGame,
        themeColor: catConfig.themeColor,
        // min(24, endHour) — gece yarısını aşan kayıtlarda şablon süresi
        // eskiden 16'dan büyük çıkabiliyordu.
        defaultDurationHours: Math.min(MAX_EVENT_DURATION, endHour - startHour),
        priority,
        note: note.trim() || undefined,
        defaultCost: validCost,
        expenseCategory: validCost > 0 ? expenseCategory : undefined,
      });
    }

    setTitle('');
    setNote('');
    setCost(0);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="day-title"
        className="w-full max-w-7xl h-[92vh] bg-[#090d16] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative flex flex-col"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl border ${
              holiday.isHoliday
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
            }`}>
              {String(day).padStart(2, '0')}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 id="day-title" className="text-xl font-bold text-slate-100">
                  {day} {MONTH_NAMES[month]} {year} — Günlük Zaman Çizelgesi
                </h3>
                <button
                  type="button"
                  onClick={() => onToggleHoliday(day)}
                  aria-pressed={holiday.isHoliday}
                  className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                    holiday.isHoliday
                      ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  {holiday.isHoliday ? '🌴 Tatil Günü' : '💼 Çalışma Günü'}
                </button>
              </div>
              <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-1">
                <MousePointerClick size={14} className="text-amber-400" />
                <span>Şablona tıklayarak formu doldurun veya sağdaki saate sürükleyin.</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Kapat"
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden mt-4 gap-6">
          {/* SOL: FORM + ŞABLONLAR */}
          <div className="w-[420px] flex flex-col gap-4 border-r border-slate-800/80 pr-6 overflow-y-auto shrink-0">
            <form onSubmit={submit} className="flex flex-col gap-3">
              <div>
                <span className="text-xs font-bold text-slate-300 mb-1.5 block">Etkinlik Türü</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setCategory(c.id)}
                        aria-pressed={category === c.id}
                        className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                          category === c.id ? 'border-amber-400 bg-[#1e1b15]' : 'border-slate-800 bg-[#0d121c] text-slate-400'
                        }`}
                      >
                        <div className="p-1 rounded text-white" style={{ backgroundColor: c.themeColor }}>
                          <Icon size={12} />
                        </div>
                        <span className="text-xs font-bold text-slate-200 truncate">{c.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {category === 'Oyunlar' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col gap-2">
                  <label htmlFor="day-game" className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                    <Gamepad2 size={14} /> Hangi Oyunu Oynayacaksın?
                  </label>
                  <select
                    id="day-game"
                    value={game}
                    onChange={(e) => setGame(e.target.value)}
                    className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    {PRESET_GAMES.map((g) => <option key={g} value={g}>{g}</option>)}
                  </select>
                  {game === CUSTOM_GAME_OPTION && (
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
                <label htmlFor="day-title-in" className="text-xs font-bold text-slate-300 mb-1 block">Etkinlik Başlığı</label>
                <input
                  id="day-title-in"
                  type="text"
                  placeholder="Örn: Aspava Akşamı veya Tez Yazımı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label htmlFor="day-start" className="text-xs font-bold text-slate-300 mb-1 block">Başlangıç Saati</label>
                  <select
                    id="day-start"
                    value={startHour}
                    onChange={(e) => changeStart(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  >
                    <StartHourOptions />
                  </select>
                </div>
                <div>
                  <label htmlFor="day-end" className="text-xs font-bold text-slate-300 mb-1 block">Bitiş Saati</label>
                  <select
                    id="day-end"
                    value={endHour}
                    onChange={(e) => setEndHour(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  >
                    <EndHourOptions start={startHour} />
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-[#121724] border border-slate-800 rounded-xl">
                <div>
                  <label htmlFor="day-cost" className="text-[11px] font-bold text-amber-300 mb-1 flex items-center gap-1">
                    <Wallet size={12} /> Maliyet (₺)
                  </label>
                  <input
                    id="day-cost"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={cost}
                    onChange={(e) => setCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label htmlFor="day-exp" className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
                  <select
                    id="day-exp"
                    value={expenseCategory}
                    onChange={(e) => setExpenseCategory(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="day-prio" className="text-xs font-bold text-slate-300 mb-1 block">Öncelik</label>
                <select
                  id="day-prio"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityType)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                >
                  <option value="Normal">Normal Plan</option>
                  <option value="Yüksek">Yüksek Öncelik</option>
                  <option value="Kritik (Raid/Sınav)">Kritik (Raid Boss / Sınav)</option>
                </select>
              </div>

              <div>
                <label htmlFor="day-note" className="text-xs font-bold text-slate-300 mb-1 block">Açıklama / Görev Notu</label>
                <textarea
                  id="day-note"
                  rows={2}
                  placeholder="Raid taktikleri, toplantı gündemi..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={16} /> Takvime Kaydet & Havuza Ekle
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 flex flex-col gap-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" /> Hızlı Şablonlar
                </span>
                <span className="text-xs text-amber-400 font-mono font-bold bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                  Tıkla: Doldur | Sürükle: Saate Bırak
                </span>
              </div>

              <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                {activityPool.map((act) => {
                  const cat = CATEGORIES.find((c) => c.id === act.category);
                  const Icon = cat?.icon ?? Sparkles;
                  return (
                    <button
                      key={`modal-pool-${act.id}`}
                      type="button"
                      draggable
                      onDragStart={(e) => {
                        onDragTemplate(act);
                        e.dataTransfer.setData('text/plain', act.id);
                      }}
                      onDragEnd={() => onDragTemplate(null)}
                      onClick={() => loadTemplate(act)}
                      title="Forma doldurmak için tıkla veya saate sürükle"
                      className="w-full text-left p-3 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-400 hover:bg-[#131a2b] cursor-pointer flex items-center justify-between group shadow-sm transition-all"
                    >
                      <span className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                        <span className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner" style={{ backgroundColor: act.themeColor }}>
                          <Icon size={18} />
                        </span>
                        <span className="min-w-0 flex-1 block">
                          <span className="flex items-center gap-1.5 flex-wrap">
                            {act.gameName && (
                              <span className="text-[9px] font-black uppercase bg-black/60 px-1.5 py-0.5 rounded text-red-300 shrink-0 border border-red-900/40">
                                {act.gameName}
                              </span>
                            )}
                            <span className="text-sm font-bold text-slate-100 truncate leading-snug">{act.title}</span>
                          </span>
                          <span className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1 font-medium">
                            <span>~{act.defaultDurationHours} saat</span>
                            {!!act.defaultCost && act.defaultCost > 0 && (
                              <span className="text-amber-400 font-bold bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded text-[11px]">
                                {act.defaultCost} ₺
                              </span>
                            )}
                          </span>
                        </span>
                      </span>
                      <GripVertical size={18} className="text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* SAĞ: 24 SAATLİK ÇİZELGE */}
          <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" /> 00:00 - 24:00 Çizelgesi
              </span>
              <span className="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-md font-bold">
                Seçili: {fmtHour(startHour)} - {endHour <= 24 ? (endHour === 24 ? '24:00' : fmtHour(endHour)) : `${fmtHour(endHour - 24)} (Ertesi)`} ({endHour - startHour} Saat)
              </span>
            </div>

            {TIMELINE_HOURS.map((hour) => {
              const hourEvents = events.filter(
                (e) => e.year === year && e.month === month && e.day === day &&
                  hour >= e.startHour && hour < e.endHour
              );
              const inRange = hour >= startHour && hour < endHour;

              return (
                <div
                  key={hour}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleTimelineClick(hour)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTimelineClick(hour); }
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.add('border-amber-400', 'bg-amber-950/40');
                  }}
                  onDragLeave={(e) => e.currentTarget.classList.remove('border-amber-400', 'bg-amber-950/40')}
                  onDrop={(e) => {
                    e.preventDefault();
                    e.currentTarget.classList.remove('border-amber-400', 'bg-amber-950/40');
                    onDropOnHour(day, hour);
                  }}
                  className={`flex items-center gap-3 p-2 rounded-2xl border transition-all min-h-[60px] cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                    inRange
                      ? 'border-amber-500/70 bg-amber-950/20 shadow-inner'
                      : 'border-slate-800/80 bg-[#0d121c]/60 hover:border-slate-700 hover:bg-[#101624]'
                  }`}
                >
                  <div className="w-14 shrink-0 font-mono text-sm font-bold text-slate-400 text-center">
                    {fmtHour(hour)}
                  </div>

                  <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                    {hourEvents.slice(0, 3).map((ev) => {
                      const cat = CATEGORIES.find((c) => c.id === ev.category);
                      const Icon = cat?.icon ?? Sparkles;
                      return (
                        <button
                          key={ev.id}
                          type="button"
                          onClick={(e) => { e.stopPropagation(); onViewEvent(ev); }}
                          title="Tıkla: detayı ve maliyeti gör/düzenle"
                          className={`group/item flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-white shadow-md border border-white/10 min-w-0 h-[48px] overflow-hidden transition-all hover:scale-[1.02] hover:border-amber-400/80 text-left ${
                            ev.isCompleted ? 'opacity-40 line-through' : ''
                          }`}
                          style={{ backgroundColor: cat?.themeColor || '#334155' }}
                        >
                          <span className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                              <Icon size={13} />
                            </span>
                            <span className="min-w-0 flex-1 flex flex-col justify-center">
                              <span className="flex items-center gap-1 min-w-0">
                                {ev.gameName && (
                                  <span className="text-[9px] font-black uppercase bg-black/50 px-1 py-0.5 rounded text-red-200 shrink-0">
                                    {ev.gameName.length > 7 ? `${ev.gameName.slice(0, 6)}..` : ev.gameName}
                                  </span>
                                )}
                                <span className="text-xs font-bold truncate leading-tight">{ev.title}</span>
                              </span>
                              <span className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono truncate">
                                <span>{ev.timeSlot}</span>
                                {ev.cost > 0 && (
                                  <span className="text-amber-300 font-bold bg-black/40 px-1 rounded">{ev.cost}₺</span>
                                )}
                              </span>
                            </span>
                          </span>
                          <Eye size={14} className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1 text-white/90" />
                        </button>
                      );
                    })}

                    {hourEvents.length === 0 && (
                      <div className="col-span-3 text-xs font-mono text-slate-500 py-1 flex items-center gap-2">
                        <span>— Boş Saat Dilimi</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
