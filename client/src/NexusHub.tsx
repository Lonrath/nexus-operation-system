import React from 'react';
import { 
  Shield, Wallet, Database, ArrowUpRight, Clock, 
  CheckCircle2, Trophy, Target, Sparkles, Activity
} from 'lucide-react';

export interface NexusHubProps {
  events: any[];
  activeGoals: any[];
  monthlyTotalCost: number;
  activeYear: number;
  activeMonth: number;
  onLaunchOS: () => void;
  onOpenFinance: () => void;
  onOpenVault: () => void;
  onOpenGoalPool: () => void;
  onOpenDayDetail: (day: number) => void;
  onToggleComplete: (id: string) => void;
  onEditGoal: (goal: any) => void;
  renderGoalIcon: (type: string, size?: number) => React.ReactNode;
}

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

export const NexusHub: React.FC<NexusHubProps> = ({
  events,
  activeGoals,
  monthlyTotalCost,
  activeYear,
  activeMonth,
  onLaunchOS,
  onOpenFinance,
  onOpenVault,
  onOpenGoalPool,
  onOpenDayDetail,
  onToggleComplete,
  onEditGoal,
  renderGoalIcon,
}) => {
  const todayDayNumber = 18;
  const todayEvents = events
    .filter((e: any) => e.year === activeYear && e.month === activeMonth && e.day === todayDayNumber)
    .sort((a: any, b: any) => a.startHour - b.startHour);

  const categoryTotals: Record<string, number> = {};
  events
    .filter((e: any) => e.cost > 0 && e.year === activeYear && e.month === activeMonth)
    .forEach((e: any) => {
      const cat = e.expenseCategory || 'Genel Yaşam Harcaması';
      categoryTotals[cat] = (categoryTotals[cat] || 0) + e.cost;
    });

  return (
    <main className="flex-1 flex flex-col h-screen overflow-y-auto bg-transparent p-8">
      {/* Üst Karşılama Barı */}
      <div className="flex items-center justify-between pb-6 border-b border-amber-500/20 mb-8 shrink-0">
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
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {todayDayNumber} {MONTH_NAMES[activeMonth]} {activeYear} • Kişisel İşletim Sistemi ve Modül Yöneticisi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenGoalPool}
            className="px-4 py-2 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-amber-300 border border-amber-500/40 text-xs font-bold flex items-center gap-2 shadow-sm transition-all"
          >
            <Target size={16} /> Quest Havuzu
          </button>
          <button
            onClick={onLaunchOS}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.35)] transition-all active:scale-95"
          >
            <span>Nexus OS Takvime Geç</span>
            <ArrowUpRight size={16} />
          </button>
        </div>
      </div>

      {/* 3'lü Modül Başlatıcı Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 shrink-0">
        {/* Kart 1: Nexus OS */}
        <div 
          onClick={onLaunchOS}
          className="p-6 rounded-3xl bg-gradient-to-b from-[#0e1424] to-[#0a0f1a] border border-amber-500/40 hover:border-amber-400 cursor-pointer shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-md">
                <Shield size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">Zaman & Görev</span>
                <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors">Nexus OS</h3>
              </div>
            </div>
            <ArrowUpRight className="text-slate-500 group-hover:text-amber-400 transition-colors" size={20} />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Bugün: <b className="text-slate-100 font-bold">{todayEvents.length} Etkinlik</b></span>
            <span className="text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded border border-amber-700/40">
              {events.filter((e: any) => e.year === activeYear && e.month === activeMonth).length} Toplam Plan
            </span>
          </div>
        </div>

        {/* Kart 2: Nexus Finance */}
        <div 
          onClick={onOpenFinance}
          className="p-6 rounded-3xl bg-gradient-to-b from-[#091717] to-[#071212] border border-emerald-500/40 hover:border-emerald-400 cursor-pointer shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                <Wallet size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">Bütçe & Nakit Akışı</span>
                <h3 className="text-lg font-black text-slate-100 group-hover:text-emerald-300 transition-colors">Nexus Finance</h3>
              </div>
            </div>
            <ArrowUpRight className="text-slate-500 group-hover:text-emerald-400 transition-colors" size={20} />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Eylül Harcaması:</span>
            <span className="text-emerald-300 font-bold text-sm bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40">
              {monthlyTotalCost.toLocaleString('tr-TR')} ₺
            </span>
          </div>
        </div>

        {/* Kart 3: Nexus Vault (Artık Canlı!) */}
        <div 
          onClick={onOpenVault}
          className="p-6 rounded-3xl bg-gradient-to-b from-[#18110b] to-[#0f0a06] border border-amber-600/50 hover:border-amber-400 cursor-pointer shadow-xl group transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between min-h-[190px] relative overflow-hidden"
        >
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
                <Database size={24} />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold block">Kadim Tomarlar & To-Do</span>
                <h3 className="text-lg font-black text-slate-100 group-hover:text-amber-300 transition-colors">Nexus Vault</h3>
              </div>
            </div>
            <ArrowUpRight className="text-slate-500 group-hover:text-amber-400 transition-colors" size={20} />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-4 border-t border-slate-800/80">
            <span>Durum:</span>
            <span className="text-amber-300 font-bold bg-amber-950/80 border border-amber-800/50 px-2 py-0.5 rounded">
              Aktif & Parşömen Modülü
            </span>
          </div>
        </div>
      </div>

      {/* 2 Sütunlu Canlı Akış */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        {/* Sol Kolon: Bugünün Radarı */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" />
                <span>Bugünün Canlı Radarı ({todayDayNumber} {MONTH_NAMES[activeMonth]})</span>
              </h3>
              <button 
                onClick={() => onOpenDayDetail(todayDayNumber)}
                className="text-xs font-mono text-amber-400 hover:underline flex items-center gap-1"
              >
                Çizelgede Aç ↗
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-[380px] overflow-y-auto pr-1">
              {todayEvents.map((ev: any) => (
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
                      onClick={() => onToggleComplete(ev.id)}
                      className={`p-1.5 rounded-xl border transition-all ${
                        ev.isCompleted
                          ? 'bg-emerald-500 text-black border-emerald-400'
                          : 'bg-[#121826] text-slate-400 border-slate-700 hover:text-emerald-400 hover:border-emerald-500'
                      }`}
                      title={ev.isCompleted ? "Tamamlandı olarak işaretli" : "Tamamla"}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  </div>
                </div>
              ))}

              {todayEvents.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500 font-mono">
                  Bugün için planlanmış bir etkinlik bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sağ Kolon: Aktif Hedefler & Finansal Dağılım */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-amber-300 flex items-center gap-2">
                <Trophy size={16} className="text-amber-400" />
                <span>Aktif Quest İlerlemeleri</span>
              </h3>
              <button 
                onClick={onOpenGoalPool}
                className="text-xs font-mono text-slate-400 hover:text-amber-300"
              >
                Tümü ↗
              </button>
            </div>

            <div className="flex flex-col gap-3">
              {activeGoals.map((goal: any) => {
                const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));
                return (
                  <div 
                    key={goal.id} 
                    onClick={() => onEditGoal(goal)}
                    className="p-3 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-500/50 cursor-pointer transition-all flex items-center justify-between gap-3"
                    title="İlerlemeyi güncellemek için tıkla"
                  >
                    <div className="w-8 h-8 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center shrink-0">
                      {renderGoalIcon(goal.iconType, 16)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200 truncate">{goal.title}</span>
                        <span className="font-mono text-amber-300 font-bold">%{pct}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                        <div 
                          className={`h-full bg-gradient-to-r ${goal.colorGradient || 'from-amber-500 to-yellow-300'} rounded-full`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                        {goal.current?.toLocaleString('tr-TR')} / {goal.target?.toLocaleString('tr-TR')} {goal.unit}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-[#0a0f18]/90 border border-slate-800/90 shadow-xl flex flex-col flex-1">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-sm font-black uppercase tracking-wider text-emerald-300 flex items-center gap-2">
                <Wallet size={16} className="text-emerald-400" />
                <span>Harcama Dağılımı</span>
              </h3>
              <button 
                onClick={onOpenFinance}
                className="text-xs font-mono text-emerald-400 hover:underline"
              >
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
                      <span className="text-emerald-400 font-bold">{amount.toLocaleString('tr-TR')} ₺ (%{pct})</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}

              {Object.keys(categoryTotals).length === 0 && (
                <div className="text-center py-4 text-xs text-slate-500 font-mono">
                  Bu ay kaydedilmiş bir harcama bulunmuyor.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};