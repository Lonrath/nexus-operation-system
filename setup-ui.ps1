Write-Host "Frontend (React + Vite + TypeScript) Olusturuluyor..." -ForegroundColor Cyan

# 1. Vite Projesini Olustur
npm create vite@latest client -- --template react-ts -y
Set-Location client

# 2. Gerekli Paketleri Kur
Write-Host "Paketler yukleniyor (Lucide Icons, Tailwind CSS)..." -ForegroundColor Yellow
npm install
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 3. Tailwind Konfigurasyonunu Guncelle
@'
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0e14',
        cardBg: '#151922',
        borderBg: '#232936',
        wowRed: '#C41E3A',
        goldYellow: '#F59E0B',
        metinPurple: '#9333EA',
        diabloOrange: '#EA580C',
        workBlue: '#2563EB',
        studyEmerald: '#059669'
      }
    },
  },
  plugins: [],
}
'@ | Out-File -FilePath "tailwind.config.js" -Encoding utf8

# 4. Global CSS
@'
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0b0e14;
  color: #f3f4f6;
  font-family: system-ui, -apple-system, sans-serif;
  user-select: none;
}
'@ | Out-File -FilePath "src/index.css" -Encoding utf8

# 5. Ana Takvim ve Surukle-Birak Bilesenini (App.tsx) Olustur
@'
import React, { useState } from 'react';
import { 
  Swords, Coins, Flame, Briefcase, GraduationCap, Skull, 
  ChevronLeft, ChevronRight, Plus, Trash2, Trophy, ShieldAlert 
} from 'lucide-react';

interface GameBadge {
  id: string;
  name: string;
  category: string;
  color: string;
  iconName: string;
  xpReward: number;
}

interface CalendarEventItem {
  id: string;
  day: number;
  badge: GameBadge;
  title: string;
  note?: string;
}

const BADGES: GameBadge[] = [
  { id: 'wow-raid', name: 'WoW Mythic Raid', category: 'WoW', color: 'bg-red-600', iconName: 'Swords', xpReward: 600 },
  { id: 'wow-gold', name: 'WoW 5M Gold Farm', category: 'WoW', color: 'bg-amber-500', iconName: 'Coins', xpReward: 350 },
  { id: 'metin2-boss', name: 'Metin2 Razador/Ejderha', category: 'Metin2', color: 'bg-purple-600', iconName: 'Skull', xpReward: 450 },
  { id: 'diablo-season', name: 'Diablo IV Sezon Kasma', category: 'Diablo', color: 'bg-orange-600', iconName: 'Flame', xpReward: 400 },
  { id: 'work-task', name: 'İş / Sprint / Ofis', category: 'Work', color: 'bg-blue-600', iconName: 'Briefcase', xpReward: 300 },
  { id: 'academic-study', name: 'Yüksek Lisans / Sınav', category: 'Academic', color: 'bg-emerald-600', iconName: 'GraduationCap', xpReward: 500 }
];

export default function App() {
  const [events, setEvents] = useState<CalendarEventItem[]>([
    { id: '1', day: 18, badge: BADGES[0], title: 'Guild Mythic Temizliği' },
    { id: '2', day: 22, badge: BADGES[4], title: 'Sprint Review & Demo' },
    { id: '3', day: 25, badge: BADGES[5], title: 'Tez Literatür Özeti Teslimi' }
  ]);

  const [currentGold, setCurrentGold] = useState(1450000);
  const targetGold = 5000000;
  const remainingGold = targetGold - currentGold;
  const daysLeftInSeason = 32;
  const dailyRequiredGold = Math.ceil(remainingGold / daysLeftInSeason);

  const renderIcon = (name: string, size = 18) => {
    switch (name) {
      case 'Swords': return <Swords size={size} />;
      case 'Coins': return <Coins size={size} />;
      case 'Skull': return <Skull size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Briefcase': return <Briefcase size={size} />;
      case 'GraduationCap': return <GraduationCap size={size} />;
      default: return <Swords size={size} />;
    }
  };

  const handleDragStart = (e: React.DragEvent, badge: GameBadge) => {
    e.dataTransfer.setData('badge', JSON.stringify(badge));
  };

  const handleDrop = (day: number, e: React.DragEvent) => {
    e.preventDefault();
    const badgeData = e.dataTransfer.getData('badge');
    if (!badgeData) return;

    const badge: GameBadge = JSON.parse(badgeData);
    const newEvent: CalendarEventItem = {
      id: Math.random().toString(36).substring(2, 9),
      day,
      badge,
      title: `${badge.name}`
    };

    setEvents((prev) => [...prev, newEvent]);
  };

  const handleDeleteEvent = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEvents((prev) => prev.filter((ev) => ev.id !== id));
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);

  return (
    <div className="min-h-screen bg-[#0b0e14] text-slate-100 flex flex-col">
      {/* Top Header / Gamification Bar */}
      <header className="border-b border-slate-800 bg-[#121620] px-8 py-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-purple-500">
            NEXUS GAMING & LIFE OS
          </h1>
          <p className="text-xs text-slate-400">SOLID Core • Master Calendar & Life Quest Tracker</p>
        </div>

        {/* 5M Gold Mount Goal Tracker */}
        <div className="bg-[#181d2a] border border-slate-700/80 rounded-lg px-4 py-2 flex items-center gap-4">
          <div className="p-2 bg-amber-500/10 text-amber-400 rounded-md border border-amber-500/20">
            <Coins size={22} />
          </div>
          <div>
            <div className="flex items-center justify-between gap-4 text-xs">
              <span className="font-semibold text-amber-300">WoW 5M Gold Mount Hedefi</span>
              <span className="text-slate-400 font-mono">{(currentGold / 1000000).toFixed(2)}M / 5.00M</span>
            </div>
            <div className="w-56 h-2 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-amber-600 to-amber-400 rounded-full transition-all"
                style={{ width: `${(currentGold / targetGold) * 100}%` }}
              />
            </div>
            <p className="text-[10px] text-amber-400/90 mt-1 font-mono">
              Sezon sonuna {daysLeftInSeason} gün kaldı • Günlük gereken: ~{dailyRequiredGold.toLocaleString()}g
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Draggable Badges Stash */}
        <aside className="w-80 border-r border-slate-800 bg-[#0f121a] p-5 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Trophy className="text-amber-400" size={18} />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300">Etkinlik Paleti</h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            İlgili oyun veya yaşam simgesini takvimdeki günün kutucuğuna sürükleyip bırakın:
          </p>

          <div className="flex flex-col gap-2.5 mt-2">
            {BADGES.map((badge) => (
              <div
                key={badge.id}
                draggable
                onDragStart={(e) => handleDragStart(e, badge)}
                className="p-3 bg-[#171b26] hover:bg-[#1e2332] border border-slate-800 hover:border-slate-600 rounded-lg cursor-grab active:cursor-grabbing flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md ${badge.color} text-white shadow-sm`}>
                    {renderIcon(badge.iconName)}
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-slate-200 group-hover:text-white">{badge.name}</h3>
                    <span className="text-[11px] text-slate-400">{badge.category}</span>
                  </div>
                </div>
                <span className="text-[10px] font-mono bg-slate-800/80 px-2 py-0.5 rounded text-amber-400 border border-slate-700">
                  +{badge.xpReward} XP
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto p-3 bg-red-950/20 border border-red-900/40 rounded-lg flex items-start gap-2.5">
            <ShieldAlert className="text-red-400 shrink-0 mt-0.5" size={16} />
            <p className="text-[11px] text-red-300/90 leading-normal">
              Aynı güne hem Mythic Raid hem Sınav bırakılırsa sistem görsel çakışma (Aggro) alarmı verir.
            </p>
          </div>
        </aside>

        {/* Calendar Grid View */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Eylül 2026</h2>
              <p className="text-xs text-slate-400">Aktif Sezon Planlaması ve Günlük Görevler</p>
            </div>
            <div className="flex items-center gap-2">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded text-slate-300 transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold text-slate-400 mb-2">
            <div>Pazartesi</div>
            <div>Salı</div>
            <div>Çarşamba</div>
            <div>Perşembe</div>
            <div>Cuma</div>
            <div className="text-amber-400/90">Cumartesi</div>
            <div className="text-amber-400/90">Pazar</div>
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-2 auto-rows-[120px]">
            {days.map((day) => {
              const dayEvents = events.filter((e) => e.day === day);
              const hasConflict = dayEvents.some(e => e.badge.category === 'Academic' || e.badge.category === 'Work') &&
                                  dayEvents.some(e => e.badge.id === 'wow-raid');

              return (
                <div
                  key={day}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => handleDrop(day, e)}
                  className={`border rounded-lg p-2 flex flex-col justify-between transition-all relative ${
                    hasConflict 
                      ? 'border-red-500/80 bg-red-950/10' 
                      : 'border-slate-800 bg-[#121622] hover:border-slate-600'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`text-xs font-mono font-bold ${day === 18 ? 'bg-blue-600 text-white px-1.5 py-0.5 rounded' : 'text-slate-400'}`}>
                      {day}
                    </span>
                    {hasConflict && (
                      <span className="text-[10px] text-red-400 font-semibold uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                        <ShieldAlert size={12} /> Aggro!
                      </span>
                    )}
                  </div>

                  {/* Dropped Event Badges */}
                  <div className="flex flex-col gap-1 my-1 overflow-y-auto max-h-[80px] pr-1">
                    {dayEvents.map((ev) => (
                      <div
                        key={ev.id}
                        className={`text-[11px] px-2 py-1 rounded ${ev.badge.color} text-white flex items-center justify-between group shadow-sm`}
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {renderIcon(ev.badge.iconName, 13)}
                          <span className="truncate">{ev.title}</span>
                        </div>
                        <button
                          onClick={(e) => handleDeleteEvent(ev.id, e)}
                          className="opacity-0 group-hover:opacity-100 hover:text-red-200 transition-opacity ml-1"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>

                  <div className="text-[10px] text-slate-500 text-right">
                    {dayEvents.length > 0 ? `${dayEvents.length} Etkinlik` : ''}
                  </div>
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
'@ | Out-File -FilePath "src/App.tsx" -Encoding utf8

Write-Host "Frontend hazir! Calistirmak icin terminalde 'npm run dev' komutunu calistirin." -ForegroundColor Green