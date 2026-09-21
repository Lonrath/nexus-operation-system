import { useRef } from 'react';
import {
  Radio, LayoutGrid, Shield, Wallet, ScrollText, Activity,
  Download, Upload, Trophy,
} from 'lucide-react';
import type { AppView } from '../types';

// ==========================================================================
// PAYLAŞILAN KENAR MENÜ
//
// Eski kodda bu <aside> bloğu Hub, Vault ve OS görünümlerine ayrı ayrı
// kopyalanmıştı. Tek kopya kaldı.
// ==========================================================================

interface NavItem {
  view: AppView;
  label: string;
  badge: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  hover: string;
}

const NAV: NavItem[] = [
  { view: 'hub', label: 'Nexus Hub', badge: 'Merkez', icon: LayoutGrid, hover: 'hover:text-amber-300 hover:bg-amber-500/10' },
  { view: 'os', label: 'Nexus OS', badge: 'Takvim', icon: Shield, hover: 'hover:text-amber-300 hover:bg-amber-500/10' },
  { view: 'finance', label: 'Nexus Finance', badge: 'Bütçe', icon: Wallet, hover: 'hover:text-emerald-300 hover:bg-emerald-500/10' },
  { view: 'vault', label: 'Nexus Vault', badge: 'Tomar', icon: ScrollText, hover: 'hover:text-amber-300 hover:bg-amber-950/20' },
];

export function Sidebar({
  activeView,
  onNavigate,
  onExport,
  onImport,
  onOpenGoalPool,
  goalCount,
}: {
  activeView: AppView;
  onNavigate: (view: AppView) => void;
  onExport: () => void;
  onImport: (file: File) => void;
  onOpenGoalPool?: () => void;
  goalCount?: number;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  return (
    <aside className="w-20 hover:w-72 transition-all duration-300 ease-in-out bg-[#080c14]/95 border-r border-amber-500/25 z-40 flex flex-col justify-between p-3.5 group/nav backdrop-blur-2xl shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.85)]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center gap-3.5 px-1 py-1 overflow-hidden">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-red-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
              <Radio className="text-amber-400 animate-pulse" size={20} />
            </div>
          </div>
          <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
            <span className="text-xs font-black tracking-widest text-amber-300 uppercase block">
              NEXUS GATEWAY
            </span>
            <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
              Suite v2.5 • Online
            </span>
          </div>
        </div>

        <nav className="flex flex-col gap-2 border-t border-slate-800/80 pt-4" aria-label="Modüller">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
            Uygulamalar & Modüller
          </span>

          {NAV.map(({ view, label, badge, icon: Icon, hover }) => {
            const isActive = activeView === view;
            return (
              <button
                key={view}
                type="button"
                onClick={() => onNavigate(view)}
                aria-current={isActive ? 'page' : undefined}
                title={label}
                className={`w-full flex items-center gap-3.5 p-2.5 rounded-xl transition-all overflow-hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 ${
                  isActive
                    ? 'bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-l-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                    : `text-slate-300 ${hover}`
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? 'bg-amber-500/20 text-amber-400' : 'bg-black/40 text-slate-400'}`}>
                  <Icon size={19} />
                </div>
                <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                  <span className={`text-xs ${isActive ? 'font-black' : 'font-bold'}`}>{label}</span>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-amber-950 text-amber-300 border border-amber-600/40' : 'bg-slate-800 text-slate-400'}`}>
                    {badge}
                  </span>
                </div>
              </button>
            );
          })}
        </nav>

        <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
            Sistem Araçları
          </span>

          <button
            type="button"
            onClick={onExport}
            title="Verileri Dışa Aktar (JSON)"
            className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all group/item overflow-hidden"
          >
            <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-cyan-400 shrink-0">
              <Download size={19} />
            </div>
            <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
              <span className="text-xs font-semibold">Veri Yedekle</span>
              <span className="text-[9px] font-mono text-cyan-400">JSON</span>
            </div>
          </button>

          {/* Eski kodda dışa aktarma vardı, geri yükleme yoktu. */}
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            title="Yedeği Geri Yükle (JSON)"
            className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-purple-300 hover:bg-purple-500/10 transition-all group/item overflow-hidden"
          >
            <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-purple-400 shrink-0">
              <Upload size={19} />
            </div>
            <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
              <span className="text-xs font-semibold">Yedeği Yükle</span>
              <span className="text-[9px] font-mono text-purple-400">Geri Al</span>
            </div>
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onImport(f);
              e.target.value = '';
            }}
          />

          {onOpenGoalPool && (
            <button
              type="button"
              onClick={onOpenGoalPool}
              title="Quest Havuzunu Aç"
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all group/item overflow-hidden"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-amber-400 shrink-0">
                <Trophy size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-semibold">Quest Havuzu</span>
                <span className="text-[9px] font-mono text-amber-400">{goalCount ?? 0} Görev</span>
              </div>
            </button>
          )}
        </div>
      </div>

      <div className="border-t border-slate-800/80 pt-3">
        <div className="flex items-center gap-3 p-1.5 rounded-xl bg-black/40 border border-slate-800/60 overflow-hidden">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
            <Activity size={17} />
          </div>
          <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
            <span className="text-xs font-bold text-slate-200 block truncate">Nexus Suite Core</span>
            <span className="text-[10px] font-mono text-slate-400 truncate block">Tüm Kanallar Aktif</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
