import { useMemo } from 'react';
import {
  Shield, Wallet, Database, ArrowUpRight, Clock, CheckCircle2, Trophy, Target,
} from 'lucide-react';
import type { CalendarEventItem, ActiveGoal } from '../types';
import { MONTH_NAMES } from '../lib/dates';
import { GoalIcon } from '../components/GoalIcon';
import { LiveClock } from '../components/LiveClock';

// Eski kodda bu bileşenin bütün propları `any[]` idi; tipler uygulamanın
// içinde tanımlıyken kullanılmıyordu.
export interface NexusHubProps {
  events: CalendarEventItem[];
  activeGoals: ActiveGoal[];
  activeYear: number;
  activeMonth: number;
  onLaunchOS: () => void;
  onOpenFinance: () => void;
  onOpenVault: () => void;
  onOpenGoalPool: () => void;
  onOpenDayDetail: (day: number) => void;
  onToggleComplete: (groupId: string) => void;
  onEditGoal: (goal: ActiveGoal) => void;
}

export function NexusHub({
  events,
  activeGoals,
  activeYear,
  activeMonth,
  onLaunchOS,
  onOpenFinance,
  onOpenVault,
  onOpenGoalPool,
  onOpenDayDetail,
  onToggleComplete,
  onEditGoal,
}: NexusHubProps) {
  // Saniyede bir yeniden render eden setInterval kaldırıldı; saat artık
  // <LiveClock /> yaprağında. Tarih gün içinde değişmediği için bir kez okunur.
  const today = useMemo(() => new Date(), []);
  const todayDay = today.getDate();
  const todayMonth = today.getMonth();
  const todayYear = today.getFullYear();

  const todayEvents = useMemo(
    () =>
      events
        .filter((e) => e.year === todayYear && e.month === todayMonth && e.day === todayDay)
        .sort((a, b) => a.startHour - b.startHour),
    [events, todayYear, todayMonth, todayDay]
  );

  const monthEvents = useMemo(
    () => events.filter((e) => e.year === activeYear && e.month === activeMonth),
    [events, activeYear, activeMonth]
  );

  const monthlyTotalCost = useMemo(
    () => monthEvents.reduce((s, e) => s + (e.cost || 0), 0),
    [monthEvents]
  );

  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of monthEvents) {
      if (e.cost > 0) {
        const cat = e.expenseCategory || 'Genel Yaşam Harcaması';
        totals[cat] = (totals[cat] || 0) + e.cost;
      }
    }
    return totals;
  }, [monthEvents]);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent p-8">
      <div className="flex items-center justify-between pb-6 border-b border-amber-500/20 mb-8 shrink-0 flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-600 to-purple-600 p-[2px] shadow-[0_0_25px_rgba(245,158,11,0.35)] flex items-center justify-center">
            <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
              <Shield className="text-amber-400" size={28} />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black uppercase tracking-widest bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-600 bg-clip-text text-transparent">
                NEXUS HUB
              </h1>
              <span className="text-xs font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-600/40 px-2.5 py-0.5 rounded-md">
                Ana Komuta Merkezi
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium flex items-center gap-2">
              <span className="text-amber-300 font-mono font-bold">
                {todayDay} {MONTH_NAMES[todayMonth]} {todayYear}
              </span>
              <span>•</span>
              <LiveClock className="text-emerald-400 font-mono font-bold" />
              <span>•</span>
              <span>Kişisel İşletim Sistemi</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenGoalPool}
            className="px-4 py-2 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Target size={16} /> Quest Havuzu
          </button>
          <button
            type="button"
            onClick={onLaunchOS}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
          >
            <span>Nexus OS Takvime Geç</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* MODÜL KARTLARI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        <button
          type="button"
          onClick={onLaunchOS}
          className="text-left p-6 rounded-3xl bg-gradient-to-b from-[#0e1424] to-[#0a0f1a] border border-amber-500/40 hover:border-amber-400 shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <span className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <span className="flex items-start justify-between">
            <span className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                <Shield size={24} />
              </span>
              <span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">Zaman & Görev</span>
                <span className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors block">Nexus OS</span>
              </span>
            </span>
            <ArrowUpRight className="text-slate-500 group-hover:text-amber-400 transition-colors" size={20} />
          </span>
          <span className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Bugün: <b className="text-slate-100 font-bold">{todayEvents.length} Etkinlik</b></span>
            <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
              {monthEvents.length} Toplam Plan
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenFinance}
          className="text-left p-6 rounded-3xl bg-gradient-to-b from-[#091717] to-[#071212] border border-emerald-500/40 hover:border-emerald-400 shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <span className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <span className="flex items-start justify-between">
            <span className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Wallet size={24} />
              </span>
              <span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">Bütçe & Harcama</span>
                <span className="text-lg font-black text-slate-100 group-hover:text-emerald-300 transition-colors block">Nexus Finance</span>
              </span>
            </span>
            <ArrowUpRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={20} />
          </span>
          <span className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Takvim Kaynaklı Aylık Gider:</span>
            <span className="text-emerald-300 font-bold text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
              {monthlyTotalCost.toLocaleString('tr-TR')} ₺
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onOpenVault}
          className="text-left p-6 rounded-3xl bg-gradient-to-b from-[#18110b] to-[#0f0a06] border border-amber-600/50 hover:border-amber-400 shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <span className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <span className="flex items-start justify-between">
            <span className="flex items-center gap-3.5">
              <span className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <Database size={24} />
              </span>
              <span>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">Kadim Tomarlar</span>
                <span className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors block">Nexus Vault</span>
              </span>
            </span>
            <ArrowUpRight className="text-slate-500 group-hover:text-amber-400 transition-colors" size={20} />
          </span>
          <span className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Durum:</span>
            <span className="text-amber-300 font-bold bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded">
              Aktif & Parşömen Modülü
            </span>
          </span>
        </button>
      </div>

      {/* CANLI AKIŞ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span>Bugünün Canlı Radarı ({todayDay} {MONTH_NAMES[todayMonth]})</span>
              </h3>
              <button
                type="button"
                onClick={() => onOpenDayDetail(todayDay)}
                className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
              >
                Çizelgede Aç ↗
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {todayEvents.map((ev) => (
                <div
                  key={ev.id}
                  className={`p-3.5 rounded-2xl bg-[#0f1422] border border-slate-800 flex items-center justify-between gap-3 transition-all hover:border-amber-500/50 ${
                    ev.isCompleted ? 'opacity-40' : ''
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ev.gameName && (
                        <span className="text-[9px] font-black uppercase bg-black/60 px-1.5 py-0.5 rounded text-red-300 shrink-0 border border-red-900/40">
                          {ev.gameName}
                        </span>
                      )}
                      <h4 className={`text-sm font-bold text-slate-100 truncate ${ev.isCompleted ? 'line-through' : ''}`}>
                        {ev.title}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1">
                      <span>{ev.timeSlot}</span>
                      {ev.cost > 0 && (
                        <span className="text-amber-300 font-bold bg-amber-950/60 px-1.5 py-0.5 rounded text-[10px]">
                          {ev.cost} ₺
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                      ev.priority === 'Kritik (Raid/Sınav)' ? 'bg-red-950 text-red-300 border border-red-800/50' :
                      ev.priority === 'Yüksek' ? 'bg-amber-950 text-amber-300 border border-amber-800/50' :
                      'bg-slate-800 text-slate-300'
                    }`}>
                      {ev.priority}
                    </span>
                    <button
                      type="button"
                      onClick={() => onToggleComplete(ev.groupId)}
                      title={ev.isCompleted ? 'Tamamlandı olarak işaretli' : 'Tamamla'}
                      aria-pressed={ev.isCompleted}
                      className={`p-1.5 rounded-xl border transition-all ${
                        ev.isCompleted
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : 'bg-[#121826] text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500'
                      }`}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {todayEvents.length === 0 && (
                <p className="py-12 text-center text-xs text-slate-500 font-mono">
                  Bugün için planlanmış bir etkinlik bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <span>Aktif Quest İlerlemeleri</span>
              </h3>
              <button type="button" onClick={onOpenGoalPool} className="text-xs font-mono text-slate-400 hover:text-amber-300">
                Tümü ↗
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {activeGoals.map((goal) => {
                const pct = goal.target > 0
                  ? Math.min(100, Math.round((goal.current / goal.target) * 100))
                  : 0;
                return (
                  <button
                    key={goal.id}
                    type="button"
                    onClick={() => onEditGoal(goal)}
                    title="İlerlemeyi güncellemek için tıkla"
                    className="text-left p-3 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-500/50 transition-all flex items-center gap-3"
                  >
                    <span className={`w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0 ${goal.accentColor}`}>
                      <GoalIcon type={goal.iconType} size={16} />
                    </span>
                    <span className="min-w-0 flex-1 block">
                      <span className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200 truncate">{goal.title}</span>
                        <span className="font-mono text-amber-300 font-bold">%{pct}</span>
                      </span>
                      <span className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800 block">
                        <span className={`h-full block bg-gradient-to-r ${goal.colorGradient} rounded-full`} style={{ width: `${pct}%` }} />
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {goal.current.toLocaleString('tr-TR')} / {goal.target.toLocaleString('tr-TR')} {goal.unit}
                      </span>
                    </span>
                  </button>
                );
              })}

              {activeGoals.length === 0 && (
                <p className="text-center py-4 text-xs text-slate-500 font-mono">
                  Çubukta aktif hedef yok. Quest Havuzu'ndan ekleyin.
                </p>
              )}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Wallet size={16} className="text-emerald-400" />
                <span>Harcama Dağılımı</span>
              </h3>
              <button type="button" onClick={onOpenFinance} className="text-xs font-mono text-emerald-400 hover:underline">
                Gider Defteri ↗
              </button>
            </div>

            <div className="flex flex-col gap-2.5 flex-1 justify-center">
              {Object.entries(categoryTotals).map(([cat, amount]) => {
                const pct = monthlyTotalCost > 0 ? Math.round((amount / monthlyTotalCost) * 100) : 0;
                return (
                  <div key={cat} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300 truncate">{cat}</span>
                      <span className="text-emerald-400 font-bold">
                        {amount.toLocaleString('tr-TR')} ₺ (%{pct})
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              {Object.keys(categoryTotals).length === 0 && (
                <p className="text-center py-4 text-xs text-slate-500 font-mono">
                  Bu ay kaydedilmiş bir harcama bulunmuyor.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
