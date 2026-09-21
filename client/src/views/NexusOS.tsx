import { useState, useMemo, useCallback } from 'react';
import {
  Shield, Target, Sparkles, Plus, Edit3, Trash2, MousePointerClick,
  ChevronLeft, ChevronRight, Sun, Wallet, CalendarDays,
} from 'lucide-react';
import type {
  CalendarEventItem, SavedActivityTemplate, ActiveGoal, GoalDefinition, GoalProgress,
} from '../types';
import { CATEGORIES } from '../constants';
import { MONTH_NAMES, WEEKDAY_NAMES, getDayHolidayInfo, mondayFirstWeekday } from '../lib/dates';
import { buildEvents, type EventDraft } from '../lib/eventFactory';
import { GoalIcon } from '../components/GoalIcon';
import { DayDetailModal } from '../components/modals/DayDetailModal';
import { DropScheduleModal } from '../components/modals/DropScheduleModal';
import { EventDetailModal } from '../components/modals/EventDetailModal';
import { TemplateFormModal } from '../components/modals/TemplateFormModal';
import { GoalPoolModal } from '../components/modals/GoalPoolModal';
import { GoalProgressModal } from '../components/modals/GoalProgressModal';

interface Props {
  events: CalendarEventItem[];
  setEvents: React.Dispatch<React.SetStateAction<CalendarEventItem[]>>;
  deleteEventGroup: (groupId: string) => void;
  toggleEventGroupComplete: (groupId: string) => void;
  activityPool: SavedActivityTemplate[];
  setActivityPool: React.Dispatch<React.SetStateAction<SavedActivityTemplate[]>>;
  activeGoals: ActiveGoal[];
  goalPool: GoalDefinition[];
  setGoalPool: React.Dispatch<React.SetStateAction<GoalDefinition[]>>;
  goalProgress: GoalProgress[];
  goalCategories: string[];
  setGoalCategories: React.Dispatch<React.SetStateAction<string[]>>;
  setGoalCurrent: (goalId: string, current: number) => void;
  toggleGoalInBar: (goalId: string) => void;
  removeGoalFromPool: (goalId: string) => void;
  showHolidays: boolean;
  setShowHolidays: React.Dispatch<React.SetStateAction<boolean>>;
  customHolidays: Record<string, boolean>;
  setCustomHolidays: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  currentDate: Date;
  setCurrentDate: (d: Date) => void;
  initialDay?: number | null;
  goalPoolOpen: boolean;
  setGoalPoolOpen: (v: boolean) => void;
  notify: (text: string, tone?: 'error' | 'success') => void;
}

export function NexusOS(props: Props) {
  const {
    events, setEvents, deleteEventGroup, toggleEventGroupComplete,
    activityPool, setActivityPool, activeGoals, goalPool, setGoalPool,
    goalProgress, goalCategories, setGoalCategories, setGoalCurrent,
    toggleGoalInBar, removeGoalFromPool, showHolidays, setShowHolidays,
    customHolidays, setCustomHolidays, currentDate, setCurrentDate,
    initialDay, goalPoolOpen, setGoalPoolOpen, notify,
  } = props;

  const [selectedDay, setSelectedDay] = useState<number | null>(initialDay ?? null);
  const [draggedTemplate, setDraggedTemplate] = useState<SavedActivityTemplate | null>(null);
  const [dropTarget, setDropTarget] = useState<{ day: number; template: SavedActivityTemplate } | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEventItem | null>(null);
  const [templateModal, setTemplateModal] = useState<
    { mode: 'new' } | { mode: 'edit'; tpl: SavedActivityTemplate } | null
  >(null);
  const [editingGoal, setEditingGoal] = useState<ActiveGoal | null>(null);

  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDayIndex = mondayFirstWeekday(new Date(activeYear, activeMonth, 1));

  // Ay değişmedikçe yeniden hesaplanmaz. Eski kodda her tuş vuruşunda
  // tüm takvim yeniden filtreleniyordu.
  const monthEvents = useMemo(
    () => events.filter((e) => e.year === activeYear && e.month === activeMonth),
    [events, activeYear, activeMonth]
  );

  const eventsByDay = useMemo(() => {
    const map = new Map<number, CalendarEventItem[]>();
    for (const ev of monthEvents) {
      const list = map.get(ev.day) ?? [];
      list.push(ev);
      map.set(ev.day, list);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);
    }
    return map;
  }, [monthEvents]);

  const monthlyTotalCost = useMemo(
    () => monthEvents.reduce((sum, e) => sum + (e.cost || 0), 0),
    [monthEvents]
  );

  // Takvimdeki etkinlik görünen hâliyle senkron kalsın diye modal da
  // doğrudan events dizisinden okuyor.
  const liveViewingEvent = viewingEvent
    ? events.find((e) => e.id === viewingEvent.id) ?? null
    : null;

  /** Tek giriş noktası: form, güne bırakma ve saate bırakma buradan geçer. */
  const createEvent = useCallback((draft: EventDraft): boolean => {
    const result = buildEvents(draft, events);
    if (!result.ok) {
      notify(result.error);
      return false;
    }
    setEvents((prev) => [...prev, ...result.events]);
    notify('Etkinlik takvime eklendi.', 'success');
    return true;
  }, [events, setEvents, notify]);

  const handleDropOnHour = useCallback((day: number, hour: number) => {
    const tpl = draggedTemplate;
    setDraggedTemplate(null);
    if (!tpl) return;
    createEvent({
      year: activeYear, month: activeMonth, day,
      startHour: hour,
      endHour: hour + Math.max(1, tpl.defaultDurationHours || 1),
      category: tpl.category,
      gameName: tpl.gameName,
      title: tpl.title,
      priority: tpl.priority,
      note: tpl.note,
      cost: Math.max(0, tpl.defaultCost || 0),
      expenseCategory: tpl.expenseCategory,
    });
  }, [draggedTemplate, activeYear, activeMonth, createEvent]);

  const handleDropOnDay = useCallback((day: number) => {
    if (!draggedTemplate) return;
    setDropTarget({ day, template: draggedTemplate });
    setDraggedTemplate(null);
  }, [draggedTemplate]);

  const toggleDayHoliday = useCallback((day: number) => {
    const { isHoliday, dateKey } = getDayHolidayInfo(activeYear, activeMonth, day, customHolidays);
    setCustomHolidays((prev) => ({ ...prev, [dateKey]: !isHoliday }));
  }, [activeYear, activeMonth, customHolidays, setCustomHolidays]);

  const saveEventPatch = useCallback((
    id: string,
    patch: Pick<CalendarEventItem, 'cost' | 'expenseCategory' | 'note'>
  ) => {
    setEvents((prev) => prev.map((ev) => (ev.id === id ? { ...ev, ...patch } : ev)));
  }, [setEvents]);

  const saveTemplate = useCallback((tpl: SavedActivityTemplate) => {
    setActivityPool((prev) =>
      prev.some((t) => t.id === tpl.id)
        ? prev.map((t) => (t.id === tpl.id ? tpl : t))
        : [tpl, ...prev]
    );
  }, [setActivityPool]);

  const deleteTemplate = useCallback((id: string) => {
    setActivityPool((prev) => prev.filter((t) => t.id !== id));
  }, [setActivityPool]);

  return (
    <>
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* ÜST KOMUTA BARI */}
        <header className="min-h-[84px] border-b border-amber-500/25 bg-[#0a0e17]/95 px-7 py-3 flex items-center justify-between gap-5 sticky top-0 z-30 backdrop-blur-xl shadow-[0_6px_35px_rgba(0,0,0,0.85)]">
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-red-600 p-[2px] shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                  <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
                    <Shield className="text-amber-400" size={22} />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080c14]" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
                    NEXUS OS
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/50 tracking-wider">
                    QUEST CORE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Kişisel Komuta & Hardcore RPG Hub</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setGoalPoolOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 border border-amber-300/60 shrink-0"
            >
              <Target size={17} className="stroke-[2.5]" /> <span>Hedef Ekle</span>
            </button>
          </div>

          <div className="flex items-center gap-3.5 flex-1 justify-end overflow-x-auto py-1 pl-2">
            {activeGoals.map((goal) => {
              const pct = goal.target > 0
                ? Math.min(100, Math.round((goal.current / goal.target) * 100))
                : 0;
              return (
                <button
                  key={goal.id}
                  type="button"
                  onClick={() => setEditingGoal(goal)}
                  title="İlerlemeyi güncellemek için tıkla"
                  className={`group text-left bg-[#0e131f]/95 hover:bg-[#131929] border ${goal.borderColor} hover:border-amber-400 rounded-2xl px-4 py-2.5 flex items-center gap-3 transition-all shadow-md shrink-0 hover:scale-[1.02]`}
                >
                  <span className={`w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center ${goal.accentColor} group-hover:scale-110 transition-transform shrink-0`}>
                    <GoalIcon type={goal.iconType} size={20} />
                  </span>
                  <span className="flex flex-col min-w-[155px] max-w-[195px]">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors truncate text-xs">
                        {goal.title}
                      </span>
                      <span className="font-mono text-xs font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                        %{pct}
                      </span>
                    </span>
                    <span className="w-full h-2 bg-slate-900/90 rounded-full mt-1.5 overflow-hidden border border-slate-800 block">
                      <span
                        className={`h-full block bg-gradient-to-r ${goal.colorGradient} rounded-full transition-all duration-500`}
                        style={{ width: `${pct}%` }}
                      />
                    </span>
                    <span className="flex items-center justify-between text-[11px] text-slate-300 mt-1 font-mono font-medium">
                      <span className="truncate">
                        {goal.current >= 1_000_000 ? `${(goal.current / 1_000_000).toFixed(2)}M` : goal.current.toLocaleString('tr-TR')}
                        {' / '}
                        {goal.target >= 1_000_000 ? `${(goal.target / 1_000_000).toFixed(1)}M` : goal.target.toLocaleString('tr-TR')} {goal.unit}
                      </span>
                      {goal.deadlineDays && (
                        <span className="text-amber-400 font-bold shrink-0 ml-1.5">{goal.deadlineDays}g</span>
                      )}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* ETKİNLİK HAVUZU */}
          <aside className="w-80 border-r border-slate-800/80 bg-[#090d16]/90 backdrop-blur-md p-4 flex flex-col gap-3 shrink-0 shadow-2xl">
            <div>
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-black uppercase tracking-wider text-amber-300/90 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" /> Etkinlik Havuzu
                </h2>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  {activityPool.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                Kartın üstüne gelince <b>detayları açılır</b>, sürükleyerek takvime bırakabilirsin.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setTemplateModal({ mode: 'new' })}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Plus size={15} /> Yeni Şablon Tanımla
            </button>

            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
              {activityPool.map((act) => {
                const cat = CATEGORIES.find((c) => c.id === act.category);
                const Icon = cat?.icon ?? Sparkles;
                return (
                  <div
                    key={act.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTemplate(act);
                      e.dataTransfer.setData('text/plain', act.id);
                    }}
                    onDragEnd={() => setDraggedTemplate(null)}
                    className="p-3 rounded-2xl bg-[#0f1422] border border-slate-800/90 hover:border-amber-500/70 cursor-grab active:cursor-grabbing flex flex-col group shadow-md transition-all duration-300 relative"
                  >
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform" style={{ backgroundColor: act.themeColor }}>
                          <Icon size={18} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {act.gameName && (
                              <span className="text-[9px] font-black uppercase bg-black/60 px-1.5 py-0.5 rounded text-red-300 shrink-0 border border-red-900/40">
                                {act.gameName}
                              </span>
                            )}
                            <h4 className="text-xs font-bold text-slate-100 truncate leading-snug group-hover:text-amber-300 transition-colors">
                              {act.title}
                            </h4>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono mt-0.5">
                            <span>~{act.defaultDurationHours} saat</span>
                            {!!act.defaultCost && act.defaultCost > 0 && (
                              <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.5 rounded text-[10px]">
                                {act.defaultCost} ₺
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={() => setTemplateModal({ mode: 'edit', tpl: act })}
                          title="Şablonu Düzenle"
                          aria-label={`${act.title} şablonunu düzenle`}
                          className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-amber-500 hover:text-black text-slate-400 transition-all border border-slate-700/60"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTemplate(act.id)}
                          title="Havuzdan Kaldır"
                          aria-label={`${act.title} şablonunu sil`}
                          className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-red-500 hover:text-white text-slate-400 transition-all border border-slate-700/60"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="max-h-0 opacity-0 overflow-hidden group-hover:max-h-48 group-hover:opacity-100 transition-all duration-300 ease-in-out border-t border-transparent group-hover:border-slate-800/80 group-hover:pt-2.5 group-hover:mt-2.5 flex flex-col gap-1.5 text-left pointer-events-none">
                      <div className="flex items-center justify-between text-[10px]">
                        <span className={`font-bold px-1.5 py-0.5 rounded ${
                          act.priority === 'Kritik (Raid/Sınav)' ? 'bg-red-950/80 text-red-300 border border-red-800/60' :
                          act.priority === 'Yüksek' ? 'bg-amber-950/80 text-amber-300 border border-amber-800/60' :
                          'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}>
                          {act.priority}
                        </span>
                        {act.expenseCategory && (
                          <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]">{act.expenseCategory}</span>
                        )}
                      </div>
                      {act.note ? (
                        <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-3 bg-black/40 p-2 rounded-xl border border-white/5 font-sans">
                          “{act.note}”
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic">Not girilmemiş.</p>
                      )}
                      <div className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5 font-bold">
                        <MousePointerClick size={11} /> Takvim gününe veya saate sürükle
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>

          {/* TAKVİM */}
          <main className="flex-1 p-6 overflow-y-auto bg-transparent flex flex-col">
            <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-100">
                  {MONTH_NAMES[activeMonth]} {activeYear}
                </h2>
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-600/30">
                  {monthEvents.length} Plan Kayıtlı
                </span>
                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5">
                  <Wallet size={13} className="text-emerald-400" />
                  <span>{monthlyTotalCost.toLocaleString('tr-TR')} ₺ Aylık Harcama</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowHolidays((v) => !v)}
                  aria-pressed={showHolidays}
                  title="Haftasonu ve resmi tatilleri yeşil vurgular"
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                    showHolidays
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-[#0f1422] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Sun size={14} className={showHolidays ? 'text-emerald-400' : 'text-slate-500'} />
                  <span>Tatilleri Vurgula: {showHolidays ? 'Açık' : 'Kapalı'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date(activeYear, activeMonth - 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronLeft size={15} /> Önceki Ay
                  </button>
                  {/* Eski kodda bu buton "Eylül 2026"ya sabitlenmişti. */}
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date())}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-semibold flex items-center gap-1.5"
                  >
                    <CalendarDays size={14} className="text-amber-400" /> Bu Ay
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrentDate(new Date(activeYear, activeMonth + 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    Sonraki Ay <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              {WEEKDAY_NAMES.map((name, i) => (
                <div key={name} className={i >= 5 ? 'text-emerald-400' : undefined}>{name}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-3.5 flex-1 auto-rows-[minmax(135px,1fr)]">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="rounded-2xl border border-slate-900/40 bg-[#070a10]/20 opacity-30 pointer-events-none" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayEvents = eventsByDay.get(day) ?? [];
                const { isHoliday, label } = getDayHolidayInfo(activeYear, activeMonth, day, customHolidays);
                const green = showHolidays && isHoliday;
                const today = new Date();
                const isToday =
                  today.getDate() === day &&
                  today.getMonth() === activeMonth &&
                  today.getFullYear() === activeYear;

                return (
                  <div
                    key={day}
                    role="button"
                    tabIndex={0}
                    aria-label={`${day} ${MONTH_NAMES[activeMonth]}, ${dayEvents.length} etkinlik`}
                    onClick={() => setSelectedDay(day)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setSelectedDay(day); }
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-amber-400', 'bg-[#141b2b]');
                    }}
                    onDragLeave={(e) => e.currentTarget.classList.remove('border-amber-400', 'bg-[#141b2b]')}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-amber-400', 'bg-[#141b2b]');
                      handleDropOnDay(day);
                    }}
                    className={`rounded-2xl p-3 flex flex-col justify-between border cursor-pointer transition-all duration-200 relative group/cell backdrop-blur-sm shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                      green
                        ? 'border-emerald-500/60 bg-gradient-to-b from-[#061912]/90 to-[#091512]/90 hover:border-emerald-400'
                        : 'border-slate-800/80 bg-[#0a0f18]/80 hover:border-amber-500/50 hover:bg-[#0e1524]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-black px-2 py-0.5 rounded-lg ${
                          isToday ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                            : green ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40'
                            : 'text-slate-300'
                        }`}>
                          {String(day).padStart(2, '0')}
                        </span>
                        {green && label && (
                          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded truncate max-w-[110px]" title={label}>
                            {label}
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); toggleDayHoliday(day); }}
                        title={isHoliday ? 'Çalışma gününe çevir' : 'Tatil gününe çevir'}
                        className={`opacity-0 group-hover/cell:opacity-100 focus:opacity-100 p-1 rounded-md text-[10px] font-mono font-bold transition-opacity border ${
                          isHoliday
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                        }`}
                      >
                        {isHoliday ? '🌴 Tatil' : '💼 İş'}
                      </button>
                    </div>

                    <div className="flex flex-col gap-1.5 my-1.5 overflow-y-auto max-h-[90px] pr-1">
                      {dayEvents.map((ev) => {
                        const cat = CATEGORIES.find((c) => c.id === ev.category);
                        const Icon = cat?.icon ?? Sparkles;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => { e.stopPropagation(); setViewingEvent(ev); }}
                            className={`px-2.5 py-1.5 rounded-lg text-white flex items-center justify-between text-xs font-semibold shadow-md transition-all border border-white/10 hover:border-amber-400 cursor-pointer ${
                              ev.isCompleted ? 'opacity-40 line-through' : ''
                            }`}
                            style={{ backgroundColor: cat?.themeColor || '#475569' }}
                          >
                            <span className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                              <Icon size={12} className="shrink-0" />
                              <span className="truncate font-semibold">{ev.title}</span>
                              {ev.cost > 0 && (
                                <span className="text-[10px] font-mono text-amber-300 bg-black/40 px-1 rounded shrink-0">
                                  {ev.cost}₺
                                </span>
                              )}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); deleteEventGroup(ev.groupId); }}
                              aria-label={`${ev.title} etkinliğini sil`}
                              className="opacity-0 group-hover/cell:opacity-100 focus:opacity-100 hover:text-red-200 ml-1.5 transition-opacity shrink-0"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-xs text-slate-400 flex items-center justify-between font-mono pt-1 border-t border-slate-800/60">
                      <span>{dayEvents.length > 0 ? `${dayEvents.length} Etkinlik` : 'Boş Gün'}</span>
                      <span className="text-amber-400 opacity-0 group-hover/cell:opacity-100 transition-opacity font-bold">
                        + Sürükle / Aç
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </main>
        </div>
      </div>

      {/* MODALLAR */}
      {selectedDay !== null && (
        <DayDetailModal
          day={selectedDay}
          year={activeYear}
          month={activeMonth}
          events={events}
          activityPool={activityPool}
          customHolidays={customHolidays}
          onClose={() => setSelectedDay(null)}
          onToggleHoliday={toggleDayHoliday}
          onCreateEvent={createEvent}
          onRegisterTemplate={saveTemplate}
          onViewEvent={setViewingEvent}
          onDragTemplate={setDraggedTemplate}
          onDropOnHour={handleDropOnHour}
        />
      )}

      {dropTarget && (
        <DropScheduleModal
          day={dropTarget.day}
          month={activeMonth}
          template={dropTarget.template}
          onClose={() => setDropTarget(null)}
          onConfirm={({ startHour, endHour, cost, expenseCategory }) => {
            const ok = createEvent({
              year: activeYear, month: activeMonth, day: dropTarget.day,
              startHour, endHour,
              category: dropTarget.template.category,
              gameName: dropTarget.template.gameName,
              title: dropTarget.template.title,
              priority: dropTarget.template.priority,
              note: dropTarget.template.note,
              cost,
              expenseCategory,
            });
            if (ok) setDropTarget(null);
          }}
        />
      )}

      {liveViewingEvent && (
        <EventDetailModal
          event={liveViewingEvent}
          onClose={() => setViewingEvent(null)}
          onSave={saveEventPatch}
          onDelete={deleteEventGroup}
          onToggleComplete={toggleEventGroupComplete}
        />
      )}

      {templateModal && (
        <TemplateFormModal
          initial={templateModal.mode === 'edit' ? templateModal.tpl : null}
          onClose={() => setTemplateModal(null)}
          onSave={saveTemplate}
          onDelete={deleteTemplate}
        />
      )}

      {goalPoolOpen && (
        <GoalPoolModal
          goalPool={goalPool}
          goalProgress={goalProgress}
          goalCategories={goalCategories}
          onClose={() => setGoalPoolOpen(false)}
          onToggleInBar={toggleGoalInBar}
          onRemoveFromPool={removeGoalFromPool}
          onCreate={(g) => setGoalPool((prev) => [g, ...prev])}
          onAddCategory={(name) =>
            setGoalCategories((prev) => (prev.includes(name) ? prev : [...prev, name]))
          }
        />
      )}

      {editingGoal && (
        <GoalProgressModal
          // Havuz/ilerleme değişince kart da güncel kalsın.
          goal={activeGoals.find((g) => g.id === editingGoal.id) ?? editingGoal}
          onClose={() => setEditingGoal(null)}
          onSetCurrent={setGoalCurrent}
          onRemoveFromBar={toggleGoalInBar}
        />
      )}
    </>
  );
}
