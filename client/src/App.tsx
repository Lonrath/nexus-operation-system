import React, { useState, useEffect } from 'react';
import { 
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, X, Trash2, 
  CheckCircle2, Circle, Clock, Dumbbell, Briefcase, BookOpen, GraduationCap, 
  Award, Compass, Gamepad2, Coins, Sparkles, Settings2, Check, 
  MousePointerClick, GripVertical, Edit3, Shield, FileText, Eye, 
  Target, Footprints, Flame, Trophy, Wallet, Save,
  Code, Droplets, Heart, Zap, Coffee, Swords, Utensils, Star,
  LayoutGrid, Database, Download, Activity, Radio, Sun, ArrowUpRight,
  ScrollText, ExternalLink, Link as LinkIcon, Stamp, ArrowLeft, Search
} from 'lucide-react';
import { NexusHub } from './NexusHub';

// ==========================================
// TİP TANIMLARI (TYPES)
// ==========================================
export type CategoryType = 'Spor' | 'İş' | 'Okuma' | 'Yüksek Lisans' | 'Doktora' | 'Keşif' | 'Oyunlar';

export interface CategoryConfig {
  id: CategoryType;
  label: string;
  themeColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

export interface QuestGoal {
  id: string;
  title: string;
  category: string;
  metricName: string;
  current: number;
  target: number;
  unit: string;
  deadlineDays?: number;
  iconType: string;
  colorGradient: string;
  accentColor: string;
  borderColor: string;
  isCustom?: boolean;
}

export interface SavedActivityTemplate {
  id: string;
  title: string;
  category: CategoryType;
  gameName?: string;
  themeColor: string;
  defaultDurationHours: number;
  priority: 'Normal' | 'Yüksek' | 'Kritik (Raid/Sınav)';
  note?: string;
  defaultCost?: number;
  expenseCategory?: string;
}

export interface CalendarEventItem {
  id: string;
  year: number;
  month: number;
  day: number;
  startHour: number;
  endHour: number;
  timeSlot: string;
  category: CategoryType;
  gameName?: string;
  title: string;
  priority: 'Normal' | 'Yüksek' | 'Kritik (Raid/Sınav)';
  note?: string;
  isCompleted: boolean;
  cost: number;
  expenseCategory?: string;
}

export interface FinanceTransaction {
  id: string;
  sourceEventId: string;
  title: string;
  amount: number;
  type: 'Gider';
  date: string;
  category: string;
}

export interface VaultChecklistItem {
  id: string;
  text: string;
  done: boolean;
}

export interface VaultLinkItem {
  id: string;
  title: string;
  url: string;
}

export interface VaultNote {
  id: string;
  title: string;
  category: string;
  content: string;
  checklist: VaultChecklistItem[];
  links: VaultLinkItem[];
  linkedGoalId?: string;
  isSealed?: boolean;
  updatedAt: string;
}

// ==========================================
// SABİTLER & TÜRKİYE RESMİ TATİLLERİ
// ==========================================
const CATEGORIES: CategoryConfig[] = [
  { id: 'Spor', label: 'Spor & Kuvvet', themeColor: '#10b981', icon: Dumbbell },
  { id: 'İş', label: 'İş & Proje', themeColor: '#3b82f6', icon: Briefcase },
  { id: 'Okuma', label: 'Kitap & Tomar', themeColor: '#f59e0b', icon: BookOpen },
  { id: 'Yüksek Lisans', label: 'Yüksek Lisans', themeColor: '#6366f1', icon: GraduationCap },
  { id: 'Doktora', label: 'Doktora & Tez', themeColor: '#a855f7', icon: Award },
  { id: 'Keşif', label: 'Keşif & Sosyal', themeColor: '#06b6d4', icon: Compass },
  { id: 'Oyunlar', label: 'Oyun Seansı', themeColor: '#ef4444', icon: Gamepad2 },
];

const PRESET_GAMES = [
  'World of Warcraft',
  'Metin2',
  'The Elder Scrolls V: Skyrim',
  'Elden Ring',
  'Diablo IV',
  'Path of Exile',
  'Özel Oyun (Manuel Yaz)'
];

const EXPENSE_CATEGORIES = [
  'Yeme-İçme & Sosyal',
  'Oyun & Dijital Abonelik',
  'Spor & Sağlık',
  'Akademi & Kitap',
  'Ulaşım',
  'Genel Yaşam Harcaması'
];

const ALL_QUEST_ICONS = [
  { id: 'Target', label: 'Hedef', icon: Target },
  { id: 'Dumbbell', label: 'Ağırlık', icon: Dumbbell },
  { id: 'Footprints', label: 'Adım', icon: Footprints },
  { id: 'Flame', label: 'Ateş', icon: Flame },
  { id: 'Coins', label: 'Gold', icon: Coins },
  { id: 'BookOpen', label: 'Kitap', icon: BookOpen },
  { id: 'Code', label: 'Kodlama', icon: Code },
  { id: 'Droplets', label: 'Su/Sıvı', icon: Droplets },
  { id: 'Heart', label: 'Sağlık', icon: Heart },
  { id: 'Zap', label: 'Enerji', icon: Zap },
  { id: 'Coffee', label: 'Mola', icon: Coffee },
  { id: 'Swords', label: 'Savaş/Raid', icon: Swords },
  { id: 'Shield', label: 'Savunma', icon: Shield },
  { id: 'Trophy', label: 'Başarı', icon: Trophy },
  { id: 'Utensils', label: 'Beslenme', icon: Utensils },
  { id: 'Star', label: 'Yıldız', icon: Star },
];

const getTurkishOfficialHoliday = (month: number, day: number, year: number): string | null => {
  if (month === 0 && day === 1) return 'Yılbaşı';
  if (month === 3 && day === 23) return '23 Nisan Çocuk B.';
  if (month === 4 && day === 1) return '1 Mayıs Emek Günü';
  if (month === 4 && day === 19) return '19 Mayıs Gençlik B.';
  if (month === 6 && day === 15) return '15 Temmuz Demokrasi';
  if (month === 7 && day === 30) return '30 Ağustos Zafer B.';
  if (month === 9 && day === 29) return '29 Ekim Cumhuriyet B.';
  
  if (year === 2026) {
    if (month === 2 && day >= 20 && day <= 22) return 'Ramazan Bayramı';
    if (month === 4 && day >= 27 && day <= 30) return 'Kurban Bayramı';
  }
  return null;
};

const DEFAULT_GOAL_POOL: Omit<QuestGoal, 'current'>[] = [
  {
    id: 'goal-steps',
    title: 'Günde 10.000 Adım',
    category: 'Spor',
    metricName: 'Günlük Adım',
    target: 10000,
    unit: 'adım',
    iconType: 'Footprints',
    colorGradient: 'from-emerald-500 to-teal-300',
    accentColor: 'text-emerald-400',
    borderColor: 'border-emerald-500/50'
  },
  {
    id: 'goal-workout-sets',
    title: 'Her Gün 2 Set Ağırlık',
    category: 'Spor',
    metricName: 'Ağırlık Seti',
    target: 2,
    unit: 'set',
    iconType: 'Dumbbell',
    colorGradient: 'from-cyan-500 to-blue-400',
    accentColor: 'text-cyan-400',
    borderColor: 'border-cyan-500/50'
  },
  {
    id: 'goal-diablo-reliquary',
    title: 'Diablo IV Sezon Reliquary',
    category: 'Diablo',
    metricName: 'Sezon Kademesi',
    target: 15,
    unit: 'aşama',
    deadlineDays: 24,
    iconType: 'Flame',
    colorGradient: 'from-orange-500 to-red-500',
    accentColor: 'text-orange-400',
    borderColor: 'border-orange-500/50'
  },
  {
    id: 'goal-wow-gold',
    title: 'WoW 5M Gold Mount',
    category: 'WoW',
    metricName: 'Gold Birikimi',
    target: 5000000,
    unit: 'gold',
    deadlineDays: 32,
    iconType: 'Coins',
    colorGradient: 'from-amber-500 via-amber-400 to-yellow-300',
    accentColor: 'text-amber-400',
    borderColor: 'border-amber-500/50'
  },
  {
    id: 'goal-reading',
    title: 'Haftalık 100 Sayfa Okuma',
    category: 'Akademi',
    metricName: 'Okunan Sayfa',
    target: 100,
    unit: 'sayfa',
    deadlineDays: 7,
    iconType: 'BookOpen',
    colorGradient: 'from-purple-500 to-indigo-300',
    accentColor: 'text-purple-400',
    borderColor: 'border-purple-500/50'
  }
];

const DEFAULT_TEMPLATES: SavedActivityTemplate[] = [
  { id: 'tpl-1', title: 'Guild Mythic Raid', category: 'Oyunlar', gameName: 'World of Warcraft', themeColor: '#ef4444', defaultDurationHours: 3, priority: 'Kritik (Raid/Sınav)', note: 'Flask, pot ve food bufflarını hazırla. Discord ses kanalına zamanında gir.', defaultCost: 0 },
  { id: 'tpl-2', title: 'Razador & Ejderha Saati', category: 'Oyunlar', gameName: 'Metin2', themeColor: '#a855f7', defaultDurationHours: 2, priority: 'Yüksek', note: 'Geçit biletlerini kontrol et, pet süresini yenile.', defaultCost: 0 },
  { id: 'tpl-3', title: 'Skyrim Zindan Keşfi', category: 'Oyunlar', gameName: 'The Elder Scrolls V: Skyrim', themeColor: '#f97316', defaultDurationHours: 4, priority: 'Normal', note: 'Yeni yüklenen grafik modlarını test et.', defaultCost: 0 },
  { id: 'tpl-4', title: 'Aspava Akşamı', category: 'Keşif', themeColor: '#06b6d4', defaultDurationHours: 2, priority: 'Normal', note: 'SSK dürüm + künefe.', defaultCost: 850, expenseCategory: 'Yeme-İçme & Sosyal' },
  { id: 'tpl-5', title: 'C# / API Sprint Demosu', category: 'İş', themeColor: '#3b82f6', defaultDurationHours: 3, priority: 'Yüksek', note: 'Endpoint testlerini ekibe göster.', defaultCost: 0 },
  { id: 'tpl-6', title: 'Ağır Kuvvet Antrenmanı', category: 'Spor', themeColor: '#10b981', defaultDurationHours: 2, priority: 'Normal', note: 'Bileşik hareketler: Squat, Bench Press ve Deadlift.', defaultCost: 0 },
  { id: 'tpl-7', title: 'Algoritma & Mimari Okuması', category: 'Okuma', themeColor: '#f59e0b', defaultDurationHours: 1, priority: 'Normal', note: 'Clean Architecture kitabından 2 bölüm bitir.', defaultCost: 0 },
];

const DEFAULT_VAULT_NOTES: VaultNote[] = [
  {
    id: 'note-wow-gold',
    title: 'WoW - 5M Gold Mount Farm Rotası & Stratejisi',
    category: 'WoW & Oyun',
    linkedGoalId: 'goal-wow-gold',
    isSealed: false,
    updatedAt: '2026-09-20',
    content: `Bu parşömen, Çarşamba günleri takvime koyduğumuz Mythic Raid ve Gold Farm seansları için canlı hazırlık defteridir.

Hammadde fiyatları reset günü (Çarşamba) tavan yaptığı için toplanan cevher ve bitkileri sabah saat 10:00'dan önce Müzayede Evi'ne (AH) dizmek kritik önem taşır. Raid öncesi 2 saat transmog turu tamamlanacak.`,
    checklist: [
      { id: 'c1', text: 'Müzayede Evi (AH) fiyat taramasını Auctionator ile güncelle', done: true },
      { id: 'c2', text: 'Blacksmithing ve Alchemy haftalık uzmanlık (Knowledge) görevlerini yap', done: true },
      { id: 'c3', text: 'Old-school raid zindanlarından 15 parça transmog topla', done: false },
      { id: 'c4', text: 'Raid flask ve pot bufflarını çantada hazırla (x20 Flacon)', done: false },
    ],
    links: [
      { id: 'l1', title: 'WoWHead 11.2 Gold Farming Kılavuzu', url: 'https://www.wowhead.com' },
      { id: 'l2', title: 'Undermine Exchange Canlı Piyasa Fiyatları', url: 'https://undermine.exchange' }
    ]
  },
  {
    id: 'note-leetcode-patterns',
    title: 'Algoritma & Veri Yapıları - Sprint Notları',
    category: 'Akademi & Kod',
    linkedGoalId: 'goal-reading',
    isSealed: false,
    updatedAt: '2026-09-19',
    content: `İki işaretçi (Two Pointers) ve Sliding Window tekniklerinde edge case'leri kaçırmamak için önce dizinin sıralı olup olmadığını teyit et.

DFS/BFS ağaç gezintilerinde visited set'ini recursion fonksiyonuna argüman geçmeyi unutma. Mainframe mimarisi araştırması için IBM Redbook dokümanları incelenecek.`,
    checklist: [
      { id: 'c5', text: 'LeetCode Medium: 3 Sum & Container With Most Water çöz', done: true },
      { id: 'c6', text: 'Graph DFS cycle-detection şablonunu çıkar', done: false },
      { id: 'c7', text: 'Clean Architecture Bölüm 4 özetini deftere çıkar', done: false }
    ],
    links: [
      { id: 'l3', title: 'NeetCode 150 Yol Haritası', url: 'https://neetcode.io/roadmap' }
    ]
  }
];

const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const TIMELINE_HOURS = Array.from({ length: 24 }, (_, i) => i);

// ==========================================
// PARŞÖMEN / TO-DO MODÜLÜ (NEXUS VAULT)
// ==========================================
function NexusVaultView({
  notes,
  setNotes,
  selectedNoteId,
  setSelectedNoteId,
  searchQuery,
  setSearchQuery,
  newChecklistText,
  setNewChecklistText,
  newLinkTitle,
  setNewLinkTitle,
  newLinkUrl,
  setNewLinkUrl,
  isAddingLink,
  setIsAddingLink,
  onBackToHub,
  onLaunchOS,
  activeGoals
}: {
  notes: VaultNote[];
  setNotes: React.Dispatch<React.SetStateAction<VaultNote[]>>;
  selectedNoteId: string;
  setSelectedNoteId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  newChecklistText: string;
  setNewChecklistText: (t: string) => void;
  newLinkTitle: string;
  setNewLinkTitle: (t: string) => void;
  newLinkUrl: string;
  setNewLinkUrl: (u: string) => void;
  isAddingLink: boolean;
  setIsAddingLink: (b: boolean) => void;
  onBackToHub: () => void;
  onLaunchOS: () => void;
  activeGoals: QuestGoal[];
}) {
  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleCreateNew = () => {
    const newNote: VaultNote = {
      id: 'note-' + Date.now(),
      title: 'İsimsiz Parşömen',
      category: 'Genel',
      content: 'Buraya yapılacak adımları, farm stratejilerini ve rehber linklerini ekleyin...',
      checklist: [],
      links: [],
      isSealed: false,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDelete = (id: string) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id && remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  const handleUpdate = (fields: Partial<VaultNote>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...fields, updatedAt: new Date().toISOString().slice(0, 10) };
    setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
  };

  const handleToggleChecklist = (itemId: string) => {
    if (!activeNote) return;
    const updatedChecklist = activeNote.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    handleUpdate({ checklist: updatedChecklist });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !activeNote) return;
    const newItem: VaultChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      done: false
    };
    handleUpdate({ checklist: [...activeNote.checklist, newItem] });
    setNewChecklistText('');
  };

  const handleDeleteChecklist = (itemId: string) => {
    if (!activeNote) return;
    handleUpdate({ checklist: activeNote.checklist.filter(i => i.id !== itemId) });
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkTitle.trim() || !newLinkUrl.trim() || !activeNote) return;
    let urlFormatted = newLinkUrl.trim();
    if (!urlFormatted.startsWith('http://') && !urlFormatted.startsWith('https://')) {
      urlFormatted = 'https://' + urlFormatted;
    }
    const newLink: VaultLinkItem = {
      id: 'lnk-' + Date.now(),
      title: newLinkTitle.trim(),
      url: urlFormatted
    };
    handleUpdate({ links: [...activeNote.links, newLink] });
    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!activeNote) return;
    handleUpdate({ links: activeNote.links.filter(l => l.id !== linkId) });
  };

  const filtered = notes.filter(n => 
    n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    n.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const linkedGoal = activeGoals.find(g => g.id === activeNote?.linkedGoalId);

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent p-6 relative">
      {/* Üst Bar */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-500/25 shrink-0 mb-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onBackToHub}
            className="p-2.5 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Hub'a Dön
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 p-[1.5px] shadow-[0_0_15px_rgba(245,158,11,0.25)] flex items-center justify-center">
              <ScrollText className="text-amber-300" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase text-amber-200">NEXUS VAULT</h1>
                <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded">
                  Kadim Tomarlar & Görev Defteri
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Hedeflere bağlı to-do listeleri, farm rotaları ve rehber linkleri</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNew}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all active:scale-95"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>Yeni Parşömen Aç</span>
          </button>
          <button
            onClick={onLaunchOS}
            className="px-3.5 py-2 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <Shield size={14} className="text-amber-400" /> Takvime Git
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* Sol Kolon: Tomar Listesi */}
        <aside className="w-80 flex flex-col gap-3 bg-[#0a0f18]/90 border border-slate-800/90 rounded-3xl p-4 shadow-xl shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500" size={15} />
            <input
              type="text"
              placeholder="Tomarlarda ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0f1422] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/60 font-medium"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 px-1 pt-1">
            <span>Kütüphanedeki Tomarlar</span>
            <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]">
              {notes.length} Parşömen
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
            {filtered.map(n => {
              const isSelected = n.id === activeNote?.id;
              const completedCount = n.checklist.filter(i => i.done).length;
              const totalCount = n.checklist.length;

              return (
                <div
                  key={n.id}
                  onClick={() => setSelectedNoteId(n.id)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden group select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#1f1710] to-[#16110a] border-amber-500/70 shadow-[0_0_20px_rgba(245,158,11,0.12)]'
                      : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#131929]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-black/40 px-1.5 py-0.2 rounded border border-amber-900/30">
                          {n.category || 'Genel'}
                        </span>
                        {n.isSealed && (
                          <span className="text-[8px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/50 px-1 rounded">
                            Mühürlü
                          </span>
                        )}
                      </div>
                      <h4 className={`text-xs font-extrabold truncate ${isSelected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {n.title || 'Başlıksız Not'}
                      </h4>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                      title="Parşömeni Yok Et"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-white/5">
                    <span>{totalCount > 0 ? `${completedCount}/${totalCount} Görev` : 'Not'}</span>
                    <span>{n.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* Sağ Kolon: Parşömen Editörü */}
        {activeNote ? (
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#18120b] via-[#140e08] to-[#19130c] border-2 border-amber-700/40 rounded-3xl p-7 shadow-2xl overflow-y-auto relative font-serif">
            {activeNote.isSealed && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-br from-red-800 to-red-950 text-amber-200 border-2 border-amber-500/80 px-4 py-2 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.5)] rotate-3 select-none pointer-events-none animate-in zoom-in-90 duration-200">
                <Stamp size={20} className="text-amber-300" />
                <span className="font-sans font-black text-xs uppercase tracking-widest">MÜHÜRLENDİ</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pb-5 border-b border-amber-900/40 shrink-0 font-sans">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdate({ title: e.target.value })}
                  placeholder="Parşömenin Başlığı..."
                  className="bg-transparent text-2xl font-black text-amber-100 placeholder:text-amber-900/50 outline-none w-full tracking-wide font-serif"
                />

                <button
                  onClick={() => handleUpdate({ isSealed: !activeNote.isSealed })}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 border shrink-0 ${
                    activeNote.isSealed 
                      ? 'bg-red-950 text-red-200 border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                      : 'bg-[#1a130c] text-amber-300/80 border-amber-800/50 hover:border-amber-500'
                  }`}
                >
                  <Stamp size={14} />
                  <span>{activeNote.isSealed ? 'Mührü Kaldır' : 'Mühürle'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Kategori:</span>
                  <input
                    type="text"
                    value={activeNote.category}
                    onChange={(e) => handleUpdate({ category: e.target.value })}
                    className="bg-transparent text-xs text-amber-100 font-bold outline-none w-28"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <Award size={13} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Hedef Bağı:</span>
                  <select
                    value={activeNote.linkedGoalId || ''}
                    onChange={(e) => handleUpdate({ linkedGoalId: e.target.value || undefined })}
                    className="bg-transparent text-xs text-amber-200 font-bold outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#120d07] text-slate-300">Bağlantı Yok (Serbest Tomar)</option>
                    {activeGoals.map(g => (
                      <option key={g.id} value={g.id} className="bg-[#120d07] text-amber-300">
                        {g.title} ({g.current}/{g.target} {g.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {linkedGoal && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Bağlı Görev: %{Math.min(100, Math.round((linkedGoal.current / linkedGoal.target) * 100))} Tamamlandı</span>
                  </div>
                )}
              </div>
            </div>

            <div className="my-5 flex-1 flex flex-col">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdate({ content: e.target.value })}
                placeholder="Kadim parşömeninizi doldurun..."
                rows={6}
                className="w-full bg-transparent text-amber-100 placeholder:text-amber-900/40 text-sm leading-relaxed outline-none resize-none font-sans font-medium"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-amber-900/40 font-sans">
              {/* Checklist */}
              <div className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 size={15} className="text-amber-400" />
                    <span>Görev Adımları (To-Do)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-900/30 font-bold">
                    {activeNote.checklist.filter(i => i.done).length}/{activeNote.checklist.length} Tamam
                  </span>
                </div>

                <form onSubmit={handleAddChecklist} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adım ekle..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 bg-[#19110a] border border-amber-900/40 rounded-xl px-3 py-1.5 text-xs text-amber-100 outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0">
                    Ekle
                  </button>
                </form>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeNote.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklist(item.id)}
                      className={`p-2 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all group/chk select-none ${
                        item.done 
                          ? 'bg-emerald-950/20 border-emerald-900/40 opacity-50' 
                          : 'bg-[#160f08] border-amber-900/30 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {item.done ? (
                          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                        ) : (
                          <Circle size={16} className="text-amber-500/60 shrink-0" />
                        )}
                        <span className={`text-xs truncate ${item.done ? 'line-through text-slate-400' : 'text-amber-100 font-medium'}`}>
                          {item.text}
                        </span>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChecklist(item.id);
                        }}
                        className="opacity-0 group-hover/chk:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {activeNote.checklist.length === 0 && (
                    <div className="text-center py-4 text-[11px] text-amber-900/80 font-mono">Henüz görev adımı eklenmedi.</div>
                  )}
                </div>
              </div>

              {/* Kılavuz & Rota Linkleri */}
              <div className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <LinkIcon size={14} className="text-amber-400" />
                    <span>Kılavuz & Rota Linkleri</span>
                  </h3>
                  <button
                    onClick={() => setIsAddingLink(!isAddingLink)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Link Ekle
                  </button>
                </div>

                {isAddingLink && (
                  <form onSubmit={handleAddLink} className="p-2.5 rounded-xl bg-[#18110a] border border-amber-700/40 flex flex-col gap-2 animate-in fade-in">
                    <input
                      type="text"
                      placeholder="Link başlığı (Örn: Wowhead Rotası)..."
                      value={newLinkTitle}
                      onChange={(e) => setNewLinkTitle(e.target.value)}
                      className="bg-[#100b06] border border-amber-900/50 rounded-lg px-2.5 py-1 text-xs text-amber-100 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="https://..."
                        value={newLinkUrl}
                        onChange={(e) => setNewLinkUrl(e.target.value)}
                        className="flex-1 bg-[#100b06] border border-amber-900/50 rounded-lg px-2.5 py-1 text-xs text-amber-100 outline-none"
                      />
                      <button type="submit" className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold">
                        Kaydet
                      </button>
                    </div>
                  </form>
                )}

                <div className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1">
                  {activeNote.links.map(link => (
                    <div
                      key={link.id}
                      className="p-2.5 rounded-xl bg-[#160f08] border border-amber-900/30 hover:border-amber-500/40 flex items-center justify-between gap-2 group/link"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2 min-w-0 flex-1 hover:text-amber-300 transition-colors"
                      >
                        <ExternalLink size={14} className="text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-100 font-semibold truncate underline underline-offset-2">{link.title}</span>
                      </a>
                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="opacity-0 group-hover/link:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                  {activeNote.links.length === 0 && (
                    <div className="text-center py-4 text-[11px] text-amber-900/80 font-mono">Kayıtlı bağlantı yok.</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-500 font-mono text-sm">
            Görüntülenecek parşömen bulunamadı. Sol üstten yeni bir tane açın.
          </div>
        )}
      </div>
    </main>
  );
}

export default function App() {
  const [activeApp, setActiveApp] = useState<'os' | 'hub' | 'vault'>('hub');
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 8, 1));
  const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);

  // Tatil Ayarları
  const [showHolidays, setShowHolidays] = useState<boolean>(() => {
    const saved = localStorage.getItem('nexus_show_holidays_v24');
    return saved !== null ? JSON.parse(saved) : true;
  });

  const [customHolidays, setCustomHolidays] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('nexus_custom_holidays_v24');
    return saved ? JSON.parse(saved) : {};
  });

  // Dinamik Kategori & Hedef State'leri
  const [goalCategories, setGoalCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('nexus_goal_categories_v24');
    return saved ? JSON.parse(saved) : ['Spor', 'WoW', 'Diablo', 'Akademi', 'Yaşam', 'Kodlama & Proje'];
  });
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryInput, setNewCategoryInput] = useState('');

  const [goalPool, setGoalPool] = useState<Omit<QuestGoal, 'current'>[]>(() => {
    const saved = localStorage.getItem('nexus_goal_pool_v24');
    return saved ? JSON.parse(saved) : DEFAULT_GOAL_POOL;
  });

  const [activeGoals, setActiveGoals] = useState<QuestGoal[]>(() => {
    const saved = localStorage.getItem('nexus_active_goals_v24');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      { ...DEFAULT_GOAL_POOL[3], current: 1950000 },
      { ...DEFAULT_GOAL_POOL[0], current: 6420 },
      { ...DEFAULT_GOAL_POOL[1], current: 1 },
      { ...DEFAULT_GOAL_POOL[2], current: 8 },
    ];
  });

  const [isGoalPoolModalOpen, setIsGoalPoolModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<QuestGoal | null>(null);

  const [isCreatingGoal, setIsCreatingGoal] = useState(false);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState<string>('Yaşam');
  const [newGoalTarget, setNewGoalTarget] = useState<number>(10);
  const [newGoalUnit, setNewGoalUnit] = useState<string>('adet');
  const [newGoalIcon, setNewGoalIcon] = useState<string>('Target');
  const [newGoalDays, setNewGoalDays] = useState<number | ''>('');
  const [showFullIconGrid, setShowFullIconGrid] = useState(false);

  const [activityPool, setActivityPool] = useState<SavedActivityTemplate[]>(() => {
    const saved = localStorage.getItem('nexus_activity_pool_v24');
    return saved ? JSON.parse(saved) : DEFAULT_TEMPLATES;
  });

  const [events, setEvents] = useState<CalendarEventItem[]>(() => {
    const saved = localStorage.getItem('nexus_events_v24');
    if (saved) {
      try { return JSON.parse(saved); } catch { /* ignore */ }
    }
    return [
      { id: '1', year: 2026, month: 8, day: 18, startHour: 20, endHour: 23, timeSlot: '20:00 - 23:00', category: 'Oyunlar', gameName: 'World of Warcraft', title: 'Guild Mythic Raid', priority: 'Kritik (Raid/Sınav)', note: 'Mythic boss ilerlemesi. Pot ve flaskları stokla.', cost: 0, isCompleted: false },
      { id: '2', year: 2026, month: 8, day: 18, startHour: 20, endHour: 22, timeSlot: '20:00 - 22:00', category: 'Oyunlar', gameName: 'Metin2', title: 'Razador & Ejderha Saati', priority: 'Yüksek', note: 'Lonca üyeleriyle kule önü buluşması.', cost: 0, isCompleted: false },
      { id: '3', year: 2026, month: 8, day: 19, startHour: 19, endHour: 21, timeSlot: '19:00 - 21:00', category: 'Keşif', title: 'Aspava Akşamı', priority: 'Normal', note: 'SSK dürüm.', cost: 850, expenseCategory: 'Yeme-İçme & Sosyal', isCompleted: false },
      { id: '4', year: 2026, month: 8, day: 22, startHour: 11, endHour: 14, timeSlot: '11:00 - 14:00', category: 'İş', title: 'C# / API Sprint Demosu', priority: 'Yüksek', note: 'Demo öncesi migrationları kontrol et.', cost: 0, isCompleted: false },
    ];
  });

  // Parşömen & To-Do (Vault) State'leri
  const [vaultNotes, setVaultNotes] = useState<VaultNote[]>(() => {
    const saved = localStorage.getItem('nexus_vault_notes_v24');
    return saved ? JSON.parse(saved) : DEFAULT_VAULT_NOTES;
  });
  const [selectedVaultNoteId, setSelectedVaultNoteId] = useState<string>(vaultNotes[0]?.id || '');
  const [vaultSearchQuery, setVaultSearchQuery] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_vault_notes_v24', JSON.stringify(vaultNotes));
  }, [vaultNotes]);

  // Modallar
  const [selectedDayDetail, setSelectedDayDetail] = useState<number | null>(null);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SavedActivityTemplate | null>(null);
  const [viewingEvent, setViewingEvent] = useState<CalendarEventItem | null>(null);
  const [viewingCost, setViewingCost] = useState<number>(0);
  const [viewingCategory, setViewingCategory] = useState<string>('Yeme-İçme & Sosyal');
  const [viewingNote, setViewingNote] = useState<string>('');

  const [draggedTemplate, setDraggedTemplate] = useState<SavedActivityTemplate | null>(null);
  const [dropModalData, setDropModalData] = useState<{ day: number; template: SavedActivityTemplate } | null>(null);
  const [dropStartHour, setDropStartHour] = useState<number>(20);
  const [dropEndHour, setDropEndHour] = useState<string>('auto');
  const [dropCost, setDropCost] = useState<number>(0);
  const [dropExpenseCategory, setDropExpenseCategory] = useState<string>('Yeme-İçme & Sosyal');

  // Gün İçi Hızlı Form
  const [formCategory, setFormCategory] = useState<CategoryType>('Oyunlar');
  const [formSelectedGame, setFormSelectedGame] = useState<string>('Metin2');
  const [formCustomGameName, setFormCustomGameName] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [startHour, setStartHour] = useState<number>(20);
  const [endHour, setEndHour] = useState<number>(23);
  const [formPriority, setFormPriority] = useState<'Normal' | 'Yüksek' | 'Kritik (Raid/Sınav)'>('Yüksek');
  const [formNote, setFormNote] = useState<string>('');
  const [formCost, setFormCost] = useState<number>(0);
  const [formExpenseCategory, setFormExpenseCategory] = useState<string>('Yeme-İçme & Sosyal');

  useEffect(() => {
    if (viewingEvent) {
      setViewingCost(Math.max(0, viewingEvent.cost || 0));
      setViewingCategory(viewingEvent.expenseCategory || 'Yeme-İçme & Sosyal');
      setViewingNote(viewingEvent.note || '');
    }
  }, [viewingEvent]);

  useEffect(() => {
    localStorage.setItem('nexus_show_holidays_v24', JSON.stringify(showHolidays));
    localStorage.setItem('nexus_custom_holidays_v24', JSON.stringify(customHolidays));
    localStorage.setItem('nexus_goal_categories_v24', JSON.stringify(goalCategories));
    localStorage.setItem('nexus_goal_pool_v24', JSON.stringify(goalPool));
    localStorage.setItem('nexus_active_goals_v24', JSON.stringify(activeGoals));
    localStorage.setItem('nexus_activity_pool_v24', JSON.stringify(activityPool));
    localStorage.setItem('nexus_events_v24', JSON.stringify(events));

    const transactions: FinanceTransaction[] = events
      .filter(e => e.cost > 0)
      .map(e => ({
        id: 'txn-' + e.id,
        sourceEventId: e.id,
        title: `${e.title} (Nexus OS)`,
        amount: e.cost,
        type: 'Gider',
        date: `${e.year}-${String(e.month + 1).padStart(2, '0')}-${String(e.day).padStart(2, '0')}`,
        category: e.expenseCategory || 'Genel Yaşam Harcaması'
      }));
    localStorage.setItem('nexus_finance_transactions', JSON.stringify(transactions));
  }, [showHolidays, customHolidays, goalCategories, goalPool, activeGoals, activityPool, events]);

  const activeYear = currentDate.getFullYear();
  const activeMonth = currentDate.getMonth();
  const daysInMonth = new Date(activeYear, activeMonth + 1, 0).getDate();
  const firstDayIndex = (new Date(activeYear, activeMonth, 1).getDay() + 6) % 7;

  const monthlyTotalCost = events
    .filter(e => e.year === activeYear && e.month === activeMonth)
    .reduce((sum, e) => sum + (e.cost || 0), 0);

  const getDayHolidayInfo = (day: number) => {
    const dateKey = `${activeYear}-${activeMonth}-${day}`;
    const dayOfWeek = (new Date(activeYear, activeMonth, day).getDay() + 6) % 7;
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const officialHoliday = getTurkishOfficialHoliday(activeMonth, day, activeYear);
    const defaultIsHoliday = isWeekend || Boolean(officialHoliday);
    const isHoliday = customHolidays[dateKey] !== undefined ? customHolidays[dateKey] : defaultIsHoliday;

    let label = '';
    if (isHoliday) {
      if (officialHoliday) label = officialHoliday;
      else if (isWeekend) label = dayOfWeek === 5 ? 'Cumartesi' : 'Pazar';
      else label = 'Özel Tatil';
    }

    return { isHoliday, label, isWeekend, officialHoliday, dateKey };
  };

  const handleToggleDayHoliday = (day: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const { isHoliday, dateKey } = getDayHolidayInfo(day);
    setCustomHolidays(prev => ({
      ...prev,
      [dateKey]: !isHoliday
    }));
  };

  const renderGoalIcon = (type: string, size = 18) => {
    switch (type) {
      case 'Footprints': return <Footprints size={size} />;
      case 'Dumbbell': return <Dumbbell size={size} />;
      case 'Flame': return <Flame size={size} />;
      case 'Coins': return <Coins size={size} />;
      case 'BookOpen': return <BookOpen size={size} />;
      case 'Code': return <Code size={size} />;
      case 'Droplets': return <Droplets size={size} />;
      case 'Heart': return <Heart size={size} />;
      case 'Zap': return <Zap size={size} />;
      case 'Coffee': return <Coffee size={size} />;
      case 'Swords': return <Swords size={size} />;
      case 'Shield': return <Shield size={size} />;
      case 'Trophy': return <Trophy size={size} />;
      case 'Utensils': return <Utensils size={size} />;
      case 'Star': return <Star size={size} />;
      default: return <Target size={size} />;
    }
  };

  const handleAddNewCategory = () => {
    if (!newCategoryInput.trim()) return;
    const trimmed = newCategoryInput.trim();
    if (!goalCategories.includes(trimmed)) {
      setGoalCategories([...goalCategories, trimmed]);
      setNewGoalCategory(trimmed);
    }
    setNewCategoryInput('');
    setIsAddingCategory(false);
  };

  const handleCreateCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;

    let gradient = 'from-cyan-500 to-blue-400';
    let accent = 'text-cyan-400';
    let border = 'border-cyan-500/50';

    if (newGoalCategory === 'Spor') {
      gradient = 'from-emerald-500 to-teal-300';
      accent = 'text-emerald-400';
      border = 'border-emerald-500/50';
    } else if (newGoalCategory === 'WoW') {
      gradient = 'from-amber-500 via-amber-400 to-yellow-300';
      accent = 'text-amber-400';
      border = 'border-amber-500/50';
    } else if (newGoalCategory === 'Diablo') {
      gradient = 'from-orange-500 to-red-500';
      accent = 'text-orange-400';
      border = 'border-orange-500/50';
    } else if (newGoalCategory === 'Akademi') {
      gradient = 'from-purple-500 to-indigo-300';
      accent = 'text-purple-400';
      border = 'border-purple-500/50';
    }

    const newGoal: Omit<QuestGoal, 'current'> = {
      id: 'custom-goal-' + Date.now(),
      title: newGoalTitle.trim(),
      category: newGoalCategory,
      metricName: newGoalTitle.trim(),
      target: Math.max(1, Number(newGoalTarget) || 1),
      unit: newGoalUnit.trim() || 'adet',
      deadlineDays: newGoalDays ? Number(newGoalDays) : undefined,
      iconType: newGoalIcon,
      colorGradient: gradient,
      accentColor: accent,
      borderColor: border,
      isCustom: true
    };

    setGoalPool([newGoal, ...goalPool]);
    setNewGoalTitle('');
    setNewGoalTarget(10);
    setNewGoalUnit('adet');
    setNewGoalDays('');
    setIsCreatingGoal(false);
    setShowFullIconGrid(false);
  };

  const handleDeleteGoalFromPool = (goalId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setGoalPool(prev => prev.filter(g => g.id !== goalId));
    setActiveGoals(prev => prev.filter(g => g.id !== goalId));
  };

  const handleToggleGoalInBar = (poolGoal: Omit<QuestGoal, 'current'>) => {
    const isAlreadyActive = activeGoals.some(g => g.id === poolGoal.id);
    if (isAlreadyActive) {
      setActiveGoals(prev => prev.filter(g => g.id !== poolGoal.id));
    } else {
      const newGoal: QuestGoal = {
        ...poolGoal,
        current: 0
      };
      setActiveGoals(prev => [...prev, newGoal]);
    }
  };

  const handleUpdateGoalProgress = (goalId: string, newCurrent: number) => {
    setActiveGoals(prev => prev.map(g => {
      if (g.id === goalId) {
        return { ...g, current: Math.max(0, newCurrent) };
      }
      return g;
    }));
    if (editingGoal && editingGoal.id === goalId) {
      setEditingGoal(prev => prev ? { ...prev, current: Math.max(0, newCurrent) } : null);
    }
  };

  const handleTimelineHourClick = (clickedHour: number) => {
    if (clickedHour <= startHour) {
      setStartHour(clickedHour);
      setEndHour(clickedHour + 1);
    } else {
      setEndHour(clickedHour);
    }
  };

  const handleLoadTemplateIntoForm = (tpl: SavedActivityTemplate) => {
    setFormCategory(tpl.category);
    if (tpl.gameName) setFormSelectedGame(tpl.gameName);
    setFormTitle(tpl.title);
    setFormNote(tpl.note || '');
    setFormCost(tpl.defaultCost || 0);
    if (tpl.expenseCategory) setFormExpenseCategory(tpl.expenseCategory);
    setEndHour(Math.min(24, startHour + (tpl.defaultDurationHours || 1)));
  };

  const handleSaveEventAndRegisterToPool = (e: React.FormEvent, targetDay: number) => {
    e.preventDefault();
    const safeStart = startHour;
    const safeEnd = endHour;
    const gameFinal = formCategory === 'Oyunlar'
      ? (formSelectedGame === 'Özel Oyun (Manuel Yaz)' ? (formCustomGameName.trim() || 'Özel Oyun') : formSelectedGame)
      : undefined;
    const catConfig = CATEGORIES.find(c => c.id === formCategory)!;
    const finalTitle = formTitle.trim() || (gameFinal ? `${gameFinal} Oturumu` : catConfig.label);
    const validCost = Math.max(0, Number(formCost) || 0);

    const nextDateObj = new Date(activeYear, activeMonth, targetDay + 1);
    const nextY = nextDateObj.getFullYear();
    const nextM = nextDateObj.getMonth();
    const nextD = nextDateObj.getDate();

    if (safeEnd <= 24) {
      for (let h = safeStart; h < safeEnd; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === targetDay && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          return;
        }
      }

      const slotText = `${safeStart < 10 ? `0${safeStart}` : safeStart}:00 - ${safeEnd < 10 ? `0${safeEnd}` : safeEnd}:00`;
      const newEvent: CalendarEventItem = {
        id: 'evt-' + Date.now(),
        year: activeYear,
        month: activeMonth,
        day: targetDay,
        startHour: safeStart,
        endHour: safeEnd,
        timeSlot: slotText,
        category: formCategory,
        gameName: gameFinal,
        title: finalTitle,
        priority: formPriority,
        note: formNote.trim(),
        cost: validCost,
        expenseCategory: validCost > 0 ? formExpenseCategory : undefined,
        isCompleted: false
      };
      setEvents(prev => [...prev, newEvent]);
    } else {
      for (let h = safeStart; h < 24; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === targetDay && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          return;
        }
      }

      const spillHours = safeEnd - 24;
      for (let h = 0; h < spillHours; h++) {
        const count = events.filter(ev => ev.year === nextY && ev.month === nextM && ev.day === nextD && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Ertesi gün saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          return;
        }
      }

      const part1: CalendarEventItem = {
        id: 'evt-p1-' + Date.now(),
        year: activeYear,
        month: activeMonth,
        day: targetDay,
        startHour: safeStart,
        endHour: 24,
        timeSlot: `${safeStart < 10 ? `0${safeStart}` : safeStart}:00 - 24:00`,
        category: formCategory,
        gameName: gameFinal,
        title: finalTitle,
        priority: formPriority,
        note: formNote.trim(),
        cost: validCost,
        expenseCategory: validCost > 0 ? formExpenseCategory : undefined,
        isCompleted: false
      };

      const part2: CalendarEventItem = {
        id: 'evt-p2-' + Date.now(),
        year: nextY,
        month: nextM,
        day: nextD,
        startHour: 0,
        endHour: spillHours,
        timeSlot: `00:00 - ${spillHours < 10 ? `0${spillHours}` : spillHours}:00`,
        category: formCategory,
        gameName: gameFinal,
        title: `${finalTitle} (Devam)`,
        priority: formPriority,
        note: formNote.trim(),
        cost: 0,
        isCompleted: false
      };

      setEvents(prev => [...prev, part1, part2]);
    }

    const existsInPool = activityPool.some(item => item.title.toLowerCase() === finalTitle.toLowerCase() && item.category === formCategory && item.gameName === gameFinal);
    if (!existsInPool) {
      const newPoolItem: SavedActivityTemplate = {
        id: 'pool-' + Date.now(),
        title: finalTitle,
        category: formCategory,
        gameName: gameFinal,
        themeColor: catConfig.themeColor,
        defaultDurationHours: Math.min(16, safeEnd - safeStart),
        priority: formPriority,
        note: formNote.trim(),
        defaultCost: validCost,
        expenseCategory: validCost > 0 ? formExpenseCategory : undefined
      };
      setActivityPool(prev => [newPoolItem, ...prev]);
    }

    setFormTitle('');
    setFormNote('');
    setFormCost(0);
  };

  const handleDropTemplateOnHour = (targetDay: number, targetHour: number) => {
    if (!draggedTemplate) return;

    const duration = Math.min(16, draggedTemplate.defaultDurationHours || 1);
    const start = targetHour;
    const totalEnd = start + duration;
    const validCost = Math.max(0, draggedTemplate.defaultCost || 0);

    const nextDateObj = new Date(activeYear, activeMonth, targetDay + 1);
    const nextY = nextDateObj.getFullYear();
    const nextM = nextDateObj.getMonth();
    const nextD = nextDateObj.getDate();

    if (totalEnd <= 24) {
      for (let h = start; h < totalEnd; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === targetDay && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          setDraggedTemplate(null);
          return;
        }
      }

      const slotText = `${start < 10 ? '0' + start : start}:00 - ${totalEnd < 10 ? '0' + totalEnd : totalEnd}:00`;
      const newEvent: CalendarEventItem = {
        id: 'dropped-hour-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        year: activeYear,
        month: activeMonth,
        day: targetDay,
        startHour: start,
        endHour: totalEnd,
        timeSlot: slotText,
        category: draggedTemplate.category,
        gameName: draggedTemplate.gameName,
        title: draggedTemplate.title,
        priority: draggedTemplate.priority,
        note: draggedTemplate.note,
        cost: validCost,
        expenseCategory: draggedTemplate.expenseCategory,
        isCompleted: false
      };
      setEvents(prev => [...prev, newEvent]);
    } else {
      for (let h = start; h < 24; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === targetDay && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          setDraggedTemplate(null);
          return;
        }
      }

      const spillHours = totalEnd - 24;
      for (let h = 0; h < spillHours; h++) {
        const count = events.filter(ev => ev.year === nextY && ev.month === nextM && ev.day === nextD && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Ertesi gün saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          setDraggedTemplate(null);
          return;
        }
      }

      const part1: CalendarEventItem = {
        id: 'dropped-hour-p1-' + Date.now(),
        year: activeYear,
        month: activeMonth,
        day: targetDay,
        startHour: start,
        endHour: 24,
        timeSlot: `${start < 10 ? '0' + start : start}:00 - 24:00`,
        category: draggedTemplate.category,
        gameName: draggedTemplate.gameName,
        title: draggedTemplate.title,
        priority: draggedTemplate.priority,
        note: draggedTemplate.note,
        cost: validCost,
        expenseCategory: draggedTemplate.expenseCategory,
        isCompleted: false
      };

      const part2: CalendarEventItem = {
        id: 'dropped-hour-p2-' + Date.now(),
        year: nextY,
        month: nextM,
        day: nextD,
        startHour: 0,
        endHour: spillHours,
        timeSlot: `00:00 - ${spillHours < 10 ? `0${spillHours}` : spillHours}:00`,
        category: draggedTemplate.category,
        gameName: draggedTemplate.gameName,
        title: `${draggedTemplate.title} (Devam)`,
        priority: draggedTemplate.priority,
        note: draggedTemplate.note,
        cost: 0,
        isCompleted: false
      };

      setEvents(prev => [...prev, part1, part2]);
    }

    setDraggedTemplate(null);
  };

  const handleDropActivityOnDay = (targetDay: number) => {
    if (!draggedTemplate) return;
    setDropModalData({ day: targetDay, template: draggedTemplate });
    setDropStartHour(20);
    setDropEndHour('auto');
    setDropCost(Math.max(0, draggedTemplate.defaultCost || 0));
    setDropExpenseCategory(draggedTemplate.expenseCategory || 'Yeme-İçme & Sosyal');
  };

  const handleConfirmDropEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dropModalData) return;

    const { day, template } = dropModalData;
    const start = dropStartHour;
    const parsedEnd = dropEndHour !== 'auto' ? Number(dropEndHour) : start + 1;
    const validCost = Math.max(0, Number(dropCost) || 0);

    const nextDateObj = new Date(activeYear, activeMonth, day + 1);
    const nextY = nextDateObj.getFullYear();
    const nextM = nextDateObj.getMonth();
    const nextD = nextDateObj.getDate();

    if (parsedEnd <= 24) {
      for (let h = start; h < parsedEnd; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === day && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var. Lütfen farklı bir saat seçin.`);
          return;
        }
      }

      const slotText = `${start < 10 ? '0' + start : start}:00 - ${parsedEnd < 10 ? '0' + parsedEnd : parsedEnd}:00`;
      const newCalendarEvent: CalendarEventItem = {
        id: 'dropped-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        year: activeYear,
        month: activeMonth,
        day: day,
        startHour: start,
        endHour: parsedEnd,
        timeSlot: slotText,
        category: template.category,
        gameName: template.gameName,
        title: template.title,
        priority: template.priority,
        note: template.note,
        cost: validCost,
        expenseCategory: validCost > 0 ? dropExpenseCategory : undefined,
        isCompleted: false
      };
      setEvents(prev => [...prev, newCalendarEvent]);
    } else {
      for (let h = start; h < 24; h++) {
        const count = events.filter(ev => ev.year === activeYear && ev.month === activeMonth && ev.day === day && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          return;
        }
      }

      const spillHours = parsedEnd - 24;
      for (let h = 0; h < spillHours; h++) {
        const count = events.filter(ev => ev.year === nextY && ev.month === nextM && ev.day === nextD && (h >= ev.startHour && h < ev.endHour)).length;
        if (count >= 3) {
          alert(`Ertesi gün (${nextD} ${MONTH_NAMES[nextM]}) saat ${h < 10 ? '0' + h : h}:00 diliminde zaten maksimum 3 etkinlik var.`);
          return;
        }
      }

      const part1: CalendarEventItem = {
        id: 'dropped-p1-' + Date.now(),
        year: activeYear,
        month: activeMonth,
        day: day,
        startHour: start,
        endHour: 24,
        timeSlot: `${start < 10 ? '0' + start : start}:00 - 24:00`,
        category: template.category,
        gameName: template.gameName,
        title: template.title,
        priority: template.priority,
        note: template.note,
        cost: validCost,
        expenseCategory: validCost > 0 ? dropExpenseCategory : undefined,
        isCompleted: false
      };

      const part2: CalendarEventItem = {
        id: 'dropped-p2-' + Date.now(),
        year: nextY,
        month: nextM,
        day: nextD,
        startHour: 0,
        endHour: spillHours,
        timeSlot: `00:00 - ${spillHours < 10 ? `0${spillHours}` : spillHours}:00`,
        category: template.category,
        gameName: template.gameName,
        title: `${template.title} (Devam)`,
        priority: template.priority,
        note: template.note,
        cost: 0,
        isCompleted: false
      };

      setEvents(prev => [...prev, part1, part2]);
    }

    setDropModalData(null);
    setDraggedTemplate(null);
  };

  const handleSaveViewingEvent = () => {
    if (!viewingEvent) return;
    const validCost = Math.max(0, Number(viewingCost) || 0);

    setEvents(prev => prev.map(ev => {
      if (ev.id === viewingEvent.id) {
        return {
          ...ev,
          cost: validCost,
          expenseCategory: validCost > 0 ? viewingCategory : undefined,
          note: viewingNote.trim()
        };
      }
      return ev;
    }));

    setViewingEvent(prev => prev ? {
      ...prev,
      cost: validCost,
      expenseCategory: validCost > 0 ? viewingCategory : undefined,
      note: viewingNote.trim()
    } : null);
  };

  const handleUpdateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTemplate) return;

    const catConfig = CATEGORIES.find(c => c.id === editingTemplate.category)!;
    const updated = {
      ...editingTemplate,
      defaultCost: Math.max(0, Number(editingTemplate.defaultCost) || 0),
      themeColor: catConfig.themeColor
    };

    setActivityPool(prev => prev.map(item => item.id === updated.id ? updated : item));
    setEditingTemplate(null);
  };

  const handleDeleteFromPool = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setActivityPool(prev => prev.filter(item => item.id !== id));
    if (editingTemplate?.id === id) setEditingTemplate(null);
  };

  const handleToggleComplete = (id: string) => {
    setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev));
    if (viewingEvent && viewingEvent.id === id) {
      setViewingEvent(prev => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
    }
  };

  const handleDeleteEvent = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEvents(prev => prev.filter(ev => ev.id !== id));
    if (viewingEvent?.id === id) setViewingEvent(null);
  };

  const handleExportData = () => {
    const backupData = {
      version: 'nexus-suite-v1',
      date: new Date().toISOString(),
      events,
      activeGoals,
      goalPool,
      activityPool,
      goalCategories,
      customHolidays,
      showHolidays,
      vaultNotes
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // GÖRÜNÜM 1: NEXUS HUB (ANA DASHBOARD)
  // =========================================================================
  if (activeApp === 'hub') {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-950/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#1a2035_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>

        <aside className="w-20 hover:w-72 transition-all duration-300 ease-in-out bg-[#080c14]/95 border-r border-amber-500/25 z-40 flex flex-col justify-between p-3.5 group/nav backdrop-blur-2xl shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.85)] select-none">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3.5 px-1 py-1 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-red-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
                  <Radio className="text-amber-400 animate-pulse" size={20} />
                </div>
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                <span className="text-xs font-black tracking-widest text-amber-300 uppercase block">NEXUS GATEWAY</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Online
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
                Uygulamalar & Modüller
              </span>

              <button onClick={() => setActiveApp('hub')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-l-2 border-amber-400 text-amber-300 overflow-hidden shadow-sm">
                <LayoutGrid size={19} className="shrink-0 text-amber-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Hub</span>
              </button>
              <button onClick={() => setActiveApp('os')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 overflow-hidden">
                <Shield size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus OS</span>
              </button>
              <button onClick={() => setIsFinanceModalOpen(true)} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 overflow-hidden">
                <Wallet size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Finance</span>
              </button>
              <button onClick={() => setActiveApp('vault')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-950/20 transition-all overflow-hidden" title="Nexus Vault (Tomar & To-Do)">
                <ScrollText size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Vault</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-3 p-1.5 rounded-xl bg-black/40 border border-slate-800/60 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
                <Activity size={17} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                <span className="text-xs font-bold text-slate-200 block truncate">Nexus Suite Core</span>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <NexusHub 
            events={events}
            activeGoals={activeGoals}
            monthlyTotalCost={monthlyTotalCost}
            activeYear={activeYear}
            activeMonth={activeMonth}
            onLaunchOS={() => setActiveApp('os')}
            onOpenFinance={() => setIsFinanceModalOpen(true)}
            onOpenGoalPool={() => setIsGoalPoolModalOpen(true)}
            onOpenDayDetail={(day) => { setSelectedDayDetail(day); setActiveApp('os'); }}
            onToggleComplete={(id) => setEvents(events.map(ev => ev.id === id ? { ...ev, isCompleted: !ev.isCompleted } : ev))}
            onEditGoal={(goal) => setEditingGoal(goal)}
            renderGoalIcon={renderGoalIcon}
            {...({ onOpenVault: () => setActiveApp('vault') } as any)}
          />
        </div>
      </div>
    );
  }

  // =========================================================================
  // GÖRÜNÜM 2: NEXUS VAULT (KADİM PARŞÖMEN, TO-DO VE REHBER LİNKLERİ)
  // =========================================================================
  if (activeApp === 'vault') {
    return (
      <div className="min-h-screen bg-[#06080e] text-slate-100 flex font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden">
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-950/20 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(#1a2035_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
        </div>

        <aside className="w-20 hover:w-72 transition-all duration-300 ease-in-out bg-[#080c14]/95 border-r border-amber-500/25 z-40 flex flex-col justify-between p-3.5 group/nav backdrop-blur-2xl shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.85)] select-none">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3.5 px-1 py-1 overflow-hidden">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-red-600 p-[1.5px] shadow-[0_0_20px_rgba(245,158,11,0.35)] shrink-0 flex items-center justify-center">
                <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
                  <Radio className="text-amber-400 animate-pulse" size={20} />
                </div>
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity duration-200 whitespace-nowrap overflow-hidden">
                <span className="text-xs font-black tracking-widest text-amber-300 uppercase block">NEXUS GATEWAY</span>
                <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" /> Online
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
                Uygulamalar & Modüller
              </span>

              <button onClick={() => setActiveApp('hub')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 overflow-hidden">
                <LayoutGrid size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Hub</span>
              </button>
              <button onClick={() => setActiveApp('os')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 overflow-hidden">
                <Shield size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus OS</span>
              </button>
              <button onClick={() => setIsFinanceModalOpen(true)} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 overflow-hidden">
                <Wallet size={19} className="shrink-0 text-slate-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Finance</span>
              </button>
              <button onClick={() => setActiveApp('vault')} className="w-full flex items-center gap-3.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-600/20 to-amber-900/10 border-l-2 border-amber-500 text-amber-300 overflow-hidden shadow-sm">
                <ScrollText size={19} className="shrink-0 text-amber-400" />
                <span className="text-xs font-bold opacity-0 group-hover/nav:opacity-100 whitespace-nowrap">Nexus Vault (Tomar)</span>
              </button>
            </div>
          </div>
          
          <div className="border-t border-slate-800/80 pt-3">
            <div className="flex items-center gap-3 p-1.5 rounded-xl bg-black/40 border border-slate-800/60 overflow-hidden">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
                <Activity size={17} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                <span className="text-xs font-bold text-slate-200 block truncate">Nexus Suite Core</span>
              </div>
            </div>
          </div>
        </aside>

        <NexusVaultView
          notes={vaultNotes}
          setNotes={setVaultNotes}
          selectedNoteId={selectedVaultNoteId}
          setSelectedNoteId={setSelectedVaultNoteId}
          searchQuery={vaultSearchQuery}
          setSearchQuery={setVaultSearchQuery}
          newChecklistText={newChecklistText}
          setNewChecklistText={setNewChecklistText}
          newLinkTitle={newLinkTitle}
          setNewLinkTitle={setNewLinkTitle}
          newLinkUrl={newLinkUrl}
          setNewLinkUrl={setNewLinkUrl}
          isAddingLink={isAddingLink}
          setIsAddingLink={setIsAddingLink}
          onBackToHub={() => setActiveApp('hub')}
          onLaunchOS={() => setActiveApp('os')}
          activeGoals={activeGoals}
        />
      </div>
    );
  }

  // =========================================================================
  // GÖRÜNÜM 3: NEXUS OS (ORİJİNAL ÇALIŞAN TAM TAKVİM EKRANI)
  // =========================================================================
  return (
    <div className="min-h-screen bg-[#06080e] text-slate-100 flex font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden">
      {/* KARANLIK ATMOSFER KATMANI */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-purple-900/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-amber-950/20 rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(#1a2035_1px,transparent_1px)] [background-size:24px_24px] opacity-25" />
      </div>

      {/* AÇILIR SOL MENÜ BARI */}
      <aside className="w-20 hover:w-72 transition-all duration-300 ease-in-out bg-[#080c14]/95 border-r border-amber-500/25 z-40 flex flex-col justify-between p-3.5 group/nav backdrop-blur-2xl shrink-0 shadow-[4px_0_30px_rgba(0,0,0,0.85)] select-none">
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
                Suite v2.4 • Online
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
              Uygulamalar & Modüller
            </span>

            <button
              onClick={() => setActiveApp('hub')}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all group/item overflow-hidden"
              title="Nexus Hub (Ana Komuta)"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-amber-400 shrink-0">
                <LayoutGrid size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-bold">Nexus Hub</span>
                <span className="text-[9px] font-mono bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">Merkez</span>
              </div>
            </button>

            <button
              onClick={() => setActiveApp('os')}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-500/5 border-l-2 border-amber-400 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.15)] transition-all overflow-hidden"
              title="Nexus OS (Zaman & Görev)"
            >
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
                <Shield size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-black">Nexus OS</span>
                <span className="text-[9px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/40">Aktif</span>
              </div>
            </button>

            <button
              onClick={() => setIsFinanceModalOpen(true)}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-emerald-300 hover:bg-emerald-500/10 transition-all group/item overflow-hidden"
              title="Nexus Finance (Niş Tablo)"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-emerald-400 shrink-0">
                <Wallet size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-bold">Nexus Finance</span>
                <span className="text-[9px] font-mono bg-emerald-950 text-emerald-300 px-1.5 py-0.5 rounded border border-emerald-500/40">Hazır</span>
              </div>
            </button>

            <button
              onClick={() => setActiveApp('vault')}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-950/20 transition-all group/item overflow-hidden"
              title="Nexus Vault (Notlar & Kasalar)"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-amber-400 shrink-0">
                <ScrollText size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-bold">Nexus Vault</span>
                <span className="text-[9px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.5 rounded border border-amber-600/40">Tomar</span>
              </div>
            </button>
          </div>

          <div className="flex flex-col gap-2 border-t border-slate-800/80 pt-4">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 opacity-0 group-hover/nav:opacity-100 transition-opacity px-2 mb-1">
              Sistem Araçları
            </span>

            <button
              onClick={handleExportData}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-cyan-300 hover:bg-cyan-500/10 transition-all group/item overflow-hidden"
              title="Verileri Dışa Aktar (JSON)"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-cyan-400 shrink-0">
                <Download size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-semibold">Veri Yedekle</span>
                <span className="text-[9px] font-mono text-cyan-400">JSON</span>
              </div>
            </button>

            <button
              onClick={() => setIsGoalPoolModalOpen(true)}
              className="w-full flex items-center gap-3.5 p-2.5 rounded-xl text-slate-300 hover:text-amber-300 hover:bg-amber-500/10 transition-all group/item overflow-hidden"
              title="Quest Havuzunu Aç"
            >
              <div className="p-1.5 rounded-lg bg-black/40 text-slate-400 group-hover/item:text-amber-400 shrink-0">
                <Trophy size={19} />
              </div>
              <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap flex items-center justify-between flex-1">
                <span className="text-xs font-semibold">Quest Havuzu</span>
                <span className="text-[9px] font-mono text-amber-400">{goalPool.length} Görev</span>
              </div>
            </button>
          </div>
        </div>

        <div className="border-t border-slate-800/80 pt-3">
          <div className="flex items-center gap-3 p-1.5 rounded-xl bg-black/40 border border-slate-800/60 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center text-white shrink-0 shadow-md">
              <Activity size={17} />
            </div>
            <div className="opacity-0 group-hover/nav:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
              <span className="text-xs font-bold text-slate-200 block truncate">
                Nexus Suite Core
              </span>
              <span className="text-[10px] font-mono text-slate-400 truncate block">
                Tüm Kanallar Aktif
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* ANA ÇALIŞMA ALANI */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* ÜST KOMUTA BARI */}
        <header className="min-h-[84px] border-b border-amber-500/25 bg-[#0a0e17]/95 px-7 py-3 flex items-center justify-between gap-5 sticky top-0 z-30 backdrop-blur-xl shadow-[0_6px_35px_rgba(0,0,0,0.85)] relative">
          <div className="flex items-center gap-6 shrink-0">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-amber-400 via-purple-600 to-red-600 p-[2px] shadow-[0_0_20px_rgba(245,158,11,0.35)]">
                  <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
                    <Shield className="text-amber-400" size={22} />
                  </div>
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#080c14] shadow-sm" />
              </div>
              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-lg font-black tracking-wider uppercase bg-gradient-to-r from-amber-100 via-amber-300 to-yellow-500 bg-clip-text text-transparent drop-shadow-sm">
                    NEXUS OS
                  </h1>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-950/80 text-amber-300 border border-amber-500/50 tracking-wider shadow-sm">
                    QUEST CORE
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium">Kişisel Komuta & Hardcore RPG Hub</p>
              </div>
            </div>

            <button
              onClick={() => setIsGoalPoolModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all active:scale-95 border border-amber-300/60 shrink-0"
            >
              <Target size={17} className="stroke-[2.5]" />
              <span>Hedef Ekle</span>
            </button>
          </div>

          <div className="flex items-center gap-3.5 flex-1 justify-end overflow-x-auto py-1 pl-2">
            {activeGoals.map((goal) => {
              const pct = Math.min(100, Math.round((goal.current / goal.target) * 100));

              return (
                <div
                  key={goal.id}
                  onClick={() => setEditingGoal(goal)}
                  className={`group cursor-pointer bg-[#0e131f]/95 hover:bg-[#131929] border ${goal.borderColor} hover:border-amber-400 rounded-2xl px-4 py-2.5 flex items-center gap-3 transition-all shadow-md shrink-0 select-none relative hover:scale-[1.02]`}
                  title="İlerlemeyi güncellemek veya düzenlemek için tıkla"
                >
                  <div className={`w-10 h-10 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center ${goal.accentColor} group-hover:scale-110 transition-transform shrink-0 shadow-inner`}>
                    {renderGoalIcon(goal.iconType, 20)}
                  </div>

                  <div className="flex flex-col min-w-[155px] max-w-[195px]">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-extrabold text-slate-100 group-hover:text-amber-300 transition-colors truncate text-xs">
                        {goal.title}
                      </span>
                      <span className="font-mono text-xs font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                        %{pct}
                      </span>
                    </div>

                    <div className="w-full h-2 bg-slate-900/90 rounded-full mt-1.5 overflow-hidden border border-slate-800 shadow-inner">
                      <div 
                        className={`h-full bg-gradient-to-r ${goal.colorGradient} rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300 mt-1 font-mono font-medium">
                      <span className="truncate">
                        {goal.current >= 1000000 ? `${(goal.current / 1000000).toFixed(2)}M` : goal.current.toLocaleString('tr-TR')} / {goal.target >= 1000000 ? `${(goal.target / 1000000).toFixed(1)}M` : goal.target.toLocaleString('tr-TR')} {goal.unit}
                      </span>
                      {goal.deadlineDays && (
                        <span className="text-amber-400 font-bold shrink-0 ml-1.5">{goal.deadlineDays}g kaldı</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </header>

        {/* ANA ÇALIŞMA DÜZENİ */}
        <div className="flex flex-1 overflow-hidden relative z-10">
          {/* 1) GENİŞLETİLMİŞ ETKİNLİK HAVUZU (W-80) & HOVER EXPANSION */}
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
              onClick={() => setIsNewTemplateModalOpen(true)}
              className="w-full py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all active:scale-98 shrink-0 shadow-sm"
            >
              <Plus size={15} /> Yeni Şablon Tanımla
            </button>

            {/* HOVER ESNASINDA AŞAĞI DOĞRU GENİŞLEYEN ETKİNLİK LİSTESİ */}
            <div className="flex flex-col gap-2.5 overflow-y-auto pr-1 flex-1">
              {activityPool.map((act) => {
                const cat = CATEGORIES.find(c => c.id === act.category);
                const IconComp = cat?.icon || Sparkles;

                return (
                  <div
                    key={act.id}
                    draggable
                    onDragStart={(e) => {
                      setDraggedTemplate(act);
                      e.dataTransfer.setData('text/plain', act.id);
                    }}
                    className="p-3 rounded-2xl bg-[#0f1422] border border-slate-800/90 hover:border-amber-500/70 cursor-grab active:cursor-grabbing flex flex-col group shadow-md hover:shadow-[0_8px_30px_rgba(0,0,0,0.85)] transition-all duration-300 select-none relative"
                  >
                    {/* Üst Satır */}
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: act.themeColor }}
                        >
                          <IconComp size={18} />
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
                            {act.defaultCost !== undefined && act.defaultCost > 0 && (
                              <span className="text-amber-400 font-bold bg-amber-950/60 border border-amber-800/40 px-1.5 py-0.2 rounded text-[10px]">
                                {act.defaultCost} ₺
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTemplate({ ...act });
                          }}
                          className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-amber-500 hover:text-black text-slate-400 transition-all border border-slate-700/60"
                          title="Şablonu Düzenle"
                        >
                          <Edit3 size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteFromPool(act.id, e);
                          }}
                          className="p-1.5 rounded-lg bg-[#141b2c] hover:bg-red-500 hover:text-white text-slate-400 transition-all border border-slate-700/60"
                          title="Havuzdan Kaldır"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>

                    {/* 1) HOVER ESNASINDA AŞAĞIYA DOĞRU AKICI GENİŞLEYEN DETAY BÖLÜMÜ */}
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
                          <span className="text-slate-400 font-mono text-[10px] truncate max-w-[140px]">
                            {act.expenseCategory}
                          </span>
                        )}
                      </div>
                      {act.note ? (
                        <p className="text-[11px] text-slate-300 leading-relaxed italic line-clamp-3 bg-black/40 p-2 rounded-xl border border-white/5 font-sans">
                          "{act.note}"
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

          {/* ORTA PANEL: TAKVİM GRID'İ (YEŞİL TATİL GÜNLERİ & TOGGLE DESTEKLİ) */}
          <main className="flex-1 p-6 overflow-y-auto bg-transparent flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-black text-slate-100 flex items-center gap-3">
                  {MONTH_NAMES[activeMonth]} {activeYear}
                </h2>
                
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-950/60 px-3 py-1 rounded-lg border border-amber-600/30">
                  {events.filter(e => e.year === activeYear && e.month === activeMonth).length} Plan Kayıtlı
                </span>

                <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/70 px-3 py-1 rounded-lg border border-emerald-500/40 flex items-center gap-1.5 shadow-sm">
                  <Wallet size={13} className="text-emerald-400" />
                  <span>{monthlyTotalCost.toLocaleString('tr-TR')} ₺ Aylık Harcama</span>
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* 2) GENEL TATİL VURGUSU TOGGLE'I */}
                <button
                  onClick={() => setShowHolidays(!showHolidays)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all flex items-center gap-1.5 shadow-sm ${
                    showHolidays
                      ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
                      : 'bg-[#0f1422] border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Haftasonu ve Türkiye resmi tatillerini yeşil renkle vurgular"
                >
                  <Sun size={14} className={showHolidays ? "text-emerald-400" : "text-slate-500"} />
                  <span>Tatilleri Vurgula: {showHolidays ? 'Açık' : 'Kapalı'}</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    <ChevronLeft size={15} /> Önceki Ay
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date(2026, 8, 1))}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-mono font-semibold"
                  >
                    Eylül 2026
                  </button>
                  <button 
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}
                    className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/40 transition-all flex items-center gap-1 text-xs font-bold"
                  >
                    Sonraki Ay <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-3.5 text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
              <div>Pazartesi</div>
              <div>Salı</div>
              <div>Çarşamba</div>
              <div>Perşembe</div>
              <div>Cuma</div>
              <div className="text-emerald-400">Cumartesi (Tatil)</div>
              <div className="text-emerald-400">Pazar (Tatil)</div>
            </div>

            <div className="grid grid-cols-7 gap-3.5 flex-1 auto-rows-[minmax(135px,1fr)]">
              {Array.from({ length: firstDayIndex }).map((_, i) => (
                <div key={`empty-${i}`} className="rounded-2xl border border-slate-900/40 bg-[#070a10]/20 opacity-30 pointer-events-none" />
              ))}

              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const dayEvents = events
                  .filter(e => e.year === activeYear && e.month === activeMonth && e.day === day)
                  .sort((a, b) => a.startHour - b.startHour || a.endHour - b.endHour);

                // 2) GÜNÜN TATİL BİLGİSİ
                const { isHoliday, label: holidayLabel } = getDayHolidayInfo(day);
                const isGreenHoliday = showHolidays && isHoliday;

                return (
                  <div
                    key={day}
                    onClick={() => setSelectedDayDetail(day)}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-amber-400', 'bg-[#141b2b]');
                    }}
                    onDragLeave={(e) => {
                      e.currentTarget.classList.remove('border-amber-400', 'bg-[#141b2b]');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-amber-400', 'bg-[#141b2b]');
                      handleDropActivityOnDay(day);
                    }}
                    className={`rounded-2xl p-3 flex flex-col justify-between border cursor-pointer transition-all duration-200 relative group/cell backdrop-blur-sm shadow-lg ${
                      isGreenHoliday
                        ? 'border-emerald-500/60 bg-gradient-to-b from-[#061912]/90 to-[#091512]/90 shadow-[0_0_20px_rgba(16,185,129,0.12)] hover:border-emerald-400'
                        : 'border-slate-800/80 bg-[#0a0f18]/80 hover:border-amber-500/50 hover:bg-[#0e1524]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-mono font-black px-2 py-0.5 rounded-lg ${
                          day === 18 && activeMonth === 8 && activeYear === 2026 
                            ? 'bg-amber-500 text-black shadow-[0_0_12px_rgba(245,158,11,0.5)]' 
                            : isGreenHoliday 
                              ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40' 
                              : 'text-slate-300'
                        }`}>
                          {day < 10 ? `0${day}` : day}
                        </span>

                        {/* YEŞİL TATİL ADI ROZETİ */}
                        {isGreenHoliday && holidayLabel && (
                          <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/90 border border-emerald-500/40 px-1.5 py-0.5 rounded truncate max-w-[110px]" title={holidayLabel}>
                            {holidayLabel}
                          </span>
                        )}
                      </div>

                      {/* GÜN HÜCRESİNDE HIZLI TATİL TOGGLE BUTONU (HOVER'DA ÇIKAR) */}
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => handleToggleDayHoliday(day, e)}
                          className={`opacity-0 group-hover/cell:opacity-100 p-1 rounded-md text-[10px] font-mono font-bold transition-opacity border ${
                            isHoliday
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                          }`}
                          title={isHoliday ? "Çalışma gününe çevir" : "Tatil gününe çevir"}
                        >
                          {isHoliday ? '🌴 Tatil' : '💼 İş'}
                        </button>

                        <span className="opacity-0 group-hover/cell:opacity-100 text-xs text-amber-400 font-mono font-bold transition-opacity">
                          Saatler ↗
                        </span>
                      </div>
                    </div>

                    {/* GÜNDEKİ ETKİNLİKLER */}
                    <div className="flex flex-col gap-1.5 my-1.5 overflow-y-auto max-h-[90px] pr-1">
                      {dayEvents.map((ev) => {
                        const cat = CATEGORIES.find(c => c.id === ev.category);
                        const IconComp = cat?.icon || Sparkles;
                        return (
                          <div
                            key={ev.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setViewingEvent(ev);
                            }}
                            className={`px-2.5 py-1.5 rounded-lg text-white flex items-center justify-between text-xs font-semibold shadow-md transition-all border border-white/10 hover:border-amber-400 hover:scale-[1.02] cursor-pointer ${
                              ev.isCompleted ? 'opacity-40 line-through' : ''
                            }`}
                            style={{ backgroundColor: cat?.themeColor || '#475569' }}
                            title="Tıkla: Detayı ve Maliyeti İncele / Düzenle"
                          >
                            <div className="flex items-center gap-1.5 truncate flex-1 min-w-0">
                              <IconComp size={12} className="shrink-0" />
                              <span className="truncate font-semibold">{ev.title}</span>
                              {ev.cost > 0 && (
                                <span className="text-[10px] font-mono text-amber-300 bg-black/40 px-1 rounded shrink-0">
                                  {ev.cost}₺
                                </span>
                              )}
                            </div>
                            <button
                              onClick={(e) => handleDeleteEvent(ev.id, e)}
                              className="opacity-0 group-hover/cell:opacity-100 hover:text-red-200 ml-1.5 transition-opacity shrink-0"
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

      {/* GÜN YÖNETİM MERKEZİ (TATİL TOGGLE'I & BÜYÜTÜLMÜŞ ŞABLONLAR) */}
      {selectedDayDetail !== null && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6">
          <div className="w-full max-w-7xl h-[92vh] bg-[#090d16] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative flex flex-col animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-mono font-bold text-2xl border ${
                  getDayHolidayInfo(selectedDayDetail).isHoliday
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/40'
                }`}>
                  {selectedDayDetail < 10 ? `0${selectedDayDetail}` : selectedDayDetail}
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-slate-100">
                      {selectedDayDetail} {MONTH_NAMES[activeMonth]} {activeYear} — Günlük Zaman Çizelgesi
                    </h3>

                    <button
                      type="button"
                      onClick={() => handleToggleDayHoliday(selectedDayDetail)}
                      className={`px-3 py-1 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border shadow-sm ${
                        getDayHolidayInfo(selectedDayDetail).isHoliday
                          ? 'bg-emerald-500 text-black border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                          : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      }`}
                    >
                      {getDayHolidayInfo(selectedDayDetail).isHoliday ? '🌴 Tatil Günü Olarak İşaretli' : '💼 Çalışma Günü Olarak İşaretli'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-2 mt-1">
                    <MousePointerClick size={14} className="text-amber-400" />
                    <span>Sol alttaki şablonlara <b>tıklayarak formu otomatik doldurabilir</b> veya sağdaki saate sürükleyebilirsiniz.</span>
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setSelectedDayDetail(null)}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-1 overflow-hidden mt-4 gap-6">
              <div className="w-[420px] flex flex-col gap-4 border-r border-slate-800/80 pr-6 overflow-y-auto shrink-0">
                <form onSubmit={(e) => handleSaveEventAndRegisterToPool(e, selectedDayDetail)} className="flex flex-col gap-3">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1.5 block">Etkinlik Türü</label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {CATEGORIES.map(c => {
                        const IconComp = c.icon;
                        return (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setFormCategory(c.id)}
                            className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all ${
                              formCategory === c.id
                                ? 'border-amber-400 bg-[#1e1b15]'
                                : 'border-slate-800 bg-[#0d121c] text-slate-400'
                            }`}
                          >
                            <div className="p-1 rounded text-white" style={{ backgroundColor: c.themeColor }}>
                              <IconComp size={12} />
                            </div>
                            <span className="text-xs font-bold text-slate-200 truncate">{c.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {formCategory === 'Oyunlar' && (
                    <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col gap-2">
                      <label className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                        <Gamepad2 size={14} /> Hangi Oyunu Oynayacaksın?
                      </label>
                      <select
                        value={formSelectedGame}
                        onChange={(e) => setFormSelectedGame(e.target.value)}
                        className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                      >
                        {PRESET_GAMES.map(g => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>

                      {formSelectedGame === 'Özel Oyun (Manuel Yaz)' && (
                        <input 
                          type="text"
                          placeholder="Oyun adını girin (Örn: Baldur's Gate 3)"
                          value={formCustomGameName}
                          onChange={(e) => setFormCustomGameName(e.target.value)}
                          className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none mt-1"
                        />
                      )}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Etkinlik Başlığı</label>
                    <input
                      type="text"
                      placeholder="Örn: Aspava Akşamı veya Tez Yazımı"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1 block">Başlangıç Saati</label>
                      <select
                        value={startHour}
                        onChange={(e) => {
                          const s = Number(e.target.value);
                          setStartHour(s);
                          if (endHour <= s) setEndHour(s + 1);
                        }}
                        className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: 24 }, (_, i) => i).map(h => (
                          <option key={h} value={h}>{h < 10 ? `0${h}:00` : `${h}:00`}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1 block">Bitiş Saati</label>
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(Number(e.target.value))}
                        className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                      >
                        {Array.from({ length: 16 }, (_, i) => i + 1).map(offset => {
                          const ed = startHour + offset;
                          let label = '';
                          if (ed < 24) {
                            label = `${ed < 10 ? '0' + ed : ed}:00`;
                          } else if (ed === 24) {
                            label = `24:00`;
                          } else {
                            const nextH = ed - 24;
                            label = `${nextH < 10 ? '0' + nextH : nextH}:00 (Ertesi Gün)`;
                          }
                          return (
                            <option key={ed} value={ed}>{label}</option>
                          );
                        })}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 p-2.5 bg-[#121724] border border-slate-800 rounded-xl">
                    <div>
                      <label className="text-[11px] font-bold text-amber-300 mb-1 block flex items-center gap-1">
                        <Wallet size={12} /> Maliyet (₺)
                      </label>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={formCost}
                        onChange={(e) => setFormCost(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
                      <select
                        value={formExpenseCategory}
                        onChange={(e) => setFormExpenseCategory(e.target.value)}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                      >
                        {EXPENSE_CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Öncelik</label>
                    <select
                      value={formPriority}
                      onChange={(e) => setFormPriority(e.target.value as any)}
                      className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                    >
                      <option value="Normal">Normal Plan</option>
                      <option value="Yüksek">Yüksek Öncelik</option>
                      <option value="Kritik (Raid/Sınav)">Kritik (Raid Boss / Sınav)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Açıklama / Görev Notu</label>
                    <textarea
                      rows={2}
                      placeholder="Raid taktikleri, toplantı gündemi..."
                      value={formNote}
                      onChange={(e) => setFormNote(e.target.value)}
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
                      const cat = CATEGORIES.find(c => c.id === act.category);
                      const IconComp = cat?.icon || Sparkles;

                      return (
                        <div
                          key={'modal-pool-' + act.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggedTemplate(act);
                            e.dataTransfer.setData('text/plain', act.id);
                          }}
                          onClick={() => handleLoadTemplateIntoForm(act)}
                          className="p-3 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-400 hover:bg-[#131a2b] cursor-pointer flex items-center justify-between group shadow-sm transition-all select-none"
                          title="Forma otomatik doldurmak için tıkla veya sağdaki saate sürükle"
                        >
                          <div className="flex items-center gap-3 min-w-0 flex-1 pointer-events-none">
                            <div 
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner" 
                              style={{ backgroundColor: act.themeColor }}
                            >
                              <IconComp size={18} />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {act.gameName && (
                                  <span className="text-[9px] font-black uppercase bg-black/60 px-1.5 py-0.5 rounded text-red-300 shrink-0 border border-red-900/40">
                                    {act.gameName}
                                  </span>
                                )}
                                <span className="text-sm font-bold text-slate-100 truncate block leading-snug">
                                  {act.title}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-1 font-medium">
                                <span>~{act.defaultDurationHours} saat</span>
                                {act.defaultCost !== undefined && act.defaultCost > 0 && (
                                  <span className="text-amber-400 font-bold bg-amber-950/80 border border-amber-800/50 px-1.5 py-0.5 rounded text-[11px]">
                                    {act.defaultCost} ₺
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <GripVertical size={18} className="text-slate-500 group-hover:text-amber-400 shrink-0 ml-2" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800 shrink-0">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock size={16} className="text-amber-400" /> 00:00 - 24:00 Çizelgesi
                  </span>
                  <span className="text-xs text-amber-400 font-mono bg-amber-950/60 border border-amber-800/40 px-3 py-1 rounded-md font-bold">
                    Seçili Aralık: {startHour}:00 - {endHour <= 24 ? `${endHour}:00` : `${endHour - 24}:00 (Ertesi Gün)`} ({endHour - startHour} Saat)
                  </span>
                </div>

                {TIMELINE_HOURS.map((hour) => {
                  const hourEvents = events.filter(
                    e => e.year === activeYear && e.month === activeMonth && e.day === selectedDayDetail && (hour >= e.startHour && hour < e.endHour)
                  );

                  const isInSelectedRange = hour >= startHour && hour < endHour;

                  return (
                    <div 
                      key={hour}
                      onClick={() => handleTimelineHourClick(hour)}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.add('border-amber-400', 'bg-amber-950/40');
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove('border-amber-400', 'bg-amber-950/40');
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove('border-amber-400', 'bg-amber-950/40');
                        handleDropTemplateOnHour(selectedDayDetail, hour);
                      }}
                      className={`flex items-center gap-3 p-2 rounded-2xl border transition-all min-h-[60px] cursor-pointer ${
                        isInSelectedRange
                          ? 'border-amber-500/70 bg-amber-950/20 shadow-inner'
                          : 'border-slate-800/80 bg-[#0d121c]/60 hover:border-slate-700 hover:bg-[#101624]'
                      }`}
                    >
                      <div className="w-14 shrink-0 font-mono text-sm font-bold text-slate-400 text-center">
                        {hour < 10 ? `0${hour}:00` : `${hour}:00`}
                      </div>

                      <div className="flex-1 grid grid-cols-3 gap-2 min-w-0">
                        {hourEvents.slice(0, 3).map((ev) => {
                          const cat = CATEGORIES.find(c => c.id === ev.category);
                          const IconComp = cat?.icon || Sparkles;

                          return (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingEvent(ev);
                              }}
                              className={`group/item flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-xl text-white shadow-md border border-white/10 min-w-0 h-[48px] overflow-hidden transition-all hover:scale-[1.02] cursor-pointer hover:border-amber-400/80 ${
                                ev.isCompleted ? 'opacity-40 line-through' : ''
                              }`}
                              style={{ backgroundColor: cat?.themeColor || '#334155' }}
                              title="Tıkla ve görevin açıklamasını, maliyetini gör/düzenle"
                            >
                              <div className="flex items-center gap-2 min-w-0 flex-1">
                                <div className="w-6 h-6 rounded-lg bg-black/30 flex items-center justify-center shrink-0">
                                  <IconComp size={13} />
                                </div>
                                
                                <div className="min-w-0 flex-1 flex flex-col justify-center">
                                  <div className="flex items-center gap-1 min-w-0">
                                    {ev.gameName && (
                                      <span className="text-[9px] font-black uppercase bg-black/50 px-1 py-0.5 rounded text-red-200 shrink-0">
                                        {ev.gameName.length > 7 ? ev.gameName.substring(0, 6) + '..' : ev.gameName}
                                      </span>
                                    )}
                                    <span className="text-xs font-bold truncate leading-tight">{ev.title}</span>
                                  </div>
                                  <div className="flex items-center gap-1.5 text-[10px] text-white/80 font-mono truncate">
                                    <span>{ev.timeSlot}</span>
                                    {ev.cost > 0 && (
                                      <span className="text-amber-300 font-bold bg-black/40 px-1 rounded">
                                        {ev.cost}₺
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="opacity-0 group-hover/item:opacity-100 transition-opacity shrink-0 ml-1 text-white/90">
                                <Eye size={14} />
                              </div>
                            </div>
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
      )}

      {/* POPUP: NEXUS FINANCE ÖNİZLEME */}
      {isFinanceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c101a] border border-emerald-500/40 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setIsFinanceModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3.5 mb-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Wallet size={24} />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-100">Nexus Finance Köprüsü</h3>
                <p className="text-xs text-slate-400">Nexus OS etkinliklerinden beslenen canlı harcama özeti</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#111726] border border-emerald-500/30 mb-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-400 block font-mono">Eylül 2026 Toplam Gider</span>
                <span className="text-2xl font-mono font-black text-emerald-300">{monthlyTotalCost.toLocaleString('tr-TR')} TL</span>
              </div>
              <span className="text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-3 py-1 rounded-lg">
                Canlı Bağlantı Aktif
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-56 overflow-y-auto pr-1 mb-4">
              {events.filter(e => e.cost > 0).map(e => (
                <div key={'sync-' + e.id} className="p-2.5 rounded-xl bg-[#0f1422] border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-200 block">{e.title}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{e.day} Eylül 2026 • {e.expenseCategory}</span>
                  </div>
                  <span className="font-mono font-bold text-amber-300 bg-black/40 px-2 py-1 rounded">
                    -{e.cost} ₺
                  </span>
                </div>
              ))}
              {events.filter(e => e.cost > 0).length === 0 && (
                <div className="text-center py-6 text-xs text-slate-500 font-mono">
                  Henüz maliyetli bir etkinlik girilmemiş.
                </div>
              )}
            </div>

            <button
              onClick={() => setIsFinanceModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* POPUP: SÜRÜKLE-BIRAK ONAY MODALI */}
      {dropModalData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setDropModalData(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md"
                style={{ backgroundColor: dropModalData.template.themeColor }}
              >
                {(() => {
                  const cat = CATEGORIES.find(c => c.id === dropModalData.template.category);
                  const IconComp = cat?.icon || Sparkles;
                  return <IconComp size={18} />;
                })()}
              </div>
              <div>
                <h3 className="text-base font-extrabold text-slate-100">{dropModalData.template.title}</h3>
                <p className="text-xs text-slate-400">
                  {dropModalData.day} {MONTH_NAMES[activeMonth]} günü için saat ve maliyet belirleyin
                </p>
              </div>
            </div>

            <form onSubmit={handleConfirmDropEvent} className="flex flex-col gap-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Başlangıç Saati</label>
                  <select
                    value={dropStartHour}
                    onChange={(e) => setDropStartHour(Number(e.target.value))}
                    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  >
                    {Array.from({ length: 24 }, (_, i) => i).map(h => (
                      <option key={h} value={h}>{h < 10 ? `0${h}:00` : `${h}:00`}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Bitiş Saati</label>
                  <select
                    value={dropEndHour}
                    onChange={(e) => setDropEndHour(e.target.value)}
                    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  >
                    <option value="auto">Otomatik (1 Saat)</option>
                    {Array.from({ length: 16 }, (_, i) => i + 1).map(offset => {
                      const endH = dropStartHour + offset;
                      let label = '';
                      if (endH < 24) {
                        label = `${endH < 10 ? '0' + endH : endH}:00`;
                      } else if (endH === 24) {
                        label = `24:00`;
                      } else {
                        const nextDayH = endH - 24;
                        label = `${nextDayH < 10 ? '0' + nextDayH : nextDayH}:00 (Ertesi Gün)`;
                      }
                      return (
                        <option key={endH} value={endH}>{label}</option>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#121724] border border-slate-800 rounded-2xl">
                <div>
                  <label className="text-[11px] font-bold text-amber-300 mb-1 block flex items-center gap-1">
                    <Wallet size={12} /> Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={dropCost}
                    onChange={(e) => setDropCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
                  <select
                    value={dropExpenseCategory}
                    onChange={(e) => setDropExpenseCategory(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setDropModalData(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-extrabold shadow-md flex items-center gap-1.5"
                >
                  <Check size={16} /> Takvime Yerleştir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: HEDEFLER HAVUZU (KATEGORİ EKLEME & İKON SEÇİCİ DESTEKLİ) */}
      {isGoalPoolModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0c101a] border border-amber-500/40 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[88vh]">
            <button 
              onClick={() => {
                setIsGoalPoolModalOpen(false);
                setIsCreatingGoal(false);
                setIsAddingCategory(false);
              }}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <div className="flex items-center justify-between mb-3 shrink-0">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Trophy size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-100">Kişisel Hedef & Quest Havuzu</h3>
                  <p className="text-xs text-slate-400">Üst çubuğa ekle veya sıfırdan kendi hedefini tanımla</p>
                </div>
              </div>

              <button
                onClick={() => {
                  setIsCreatingGoal(!isCreatingGoal);
                  setIsAddingCategory(false);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border mr-8 ${
                  isCreatingGoal
                    ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                }`}
              >
                {isCreatingGoal ? <X size={14} /> : <Plus size={14} />}
                <span>{isCreatingGoal ? 'Listeye Dön' : 'Yeni Hedef Tanımla'}</span>
              </button>
            </div>

            {isCreatingGoal ? (
              <form onSubmit={handleCreateCustomGoal} className="p-4 rounded-2xl bg-[#111726] border border-amber-500/30 flex flex-col gap-3 my-2 overflow-y-auto">
                <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Target size={14} /> Sıfırdan Özel Hedef / Quest Oluştur
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Hedef Başlığı</label>
                    <input
                      type="text"
                      placeholder="Örn: Günde 3 Litre Su, 50 LeetCode..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-bold text-slate-300">Kategori</label>
                      <button
                        type="button"
                        onClick={() => setIsAddingCategory(!isAddingCategory)}
                        className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                      >
                        <Plus size={11} /> Kategori Ekle
                      </button>
                    </div>

                    {isAddingCategory ? (
                      <div className="flex items-center gap-1.5 animate-in fade-in">
                        <input
                          type="text"
                          placeholder="Yeni kategori adı..."
                          value={newCategoryInput}
                          onChange={(e) => setNewCategoryInput(e.target.value)}
                          className="flex-1 bg-[#0b0f17] border border-amber-500/60 rounded-xl px-3 py-1.5 text-xs text-slate-100 outline-none"
                          autoFocus
                        />
                        <button
                          type="button"
                          onClick={handleAddNewCategory}
                          className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shrink-0"
                          title="Kategoriyi Kaydet"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => { setIsAddingCategory(false); setNewCategoryInput(''); }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs shrink-0"
                          title="Vazgeç"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <select
                        value={newGoalCategory}
                        onChange={(e) => setNewGoalCategory(e.target.value)}
                        className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500"
                      >
                        {goalCategories.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Hedeflenen Miktar</label>
                    <input
                      type="number"
                      min="1"
                      value={newGoalTarget}
                      onChange={(e) => setNewGoalTarget(Math.max(1, Number(e.target.value) || 1))}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Birim</label>
                    <input
                      type="text"
                      placeholder="adım, soru, sayfa, litre, set..."
                      value={newGoalUnit}
                      onChange={(e) => setNewGoalUnit(e.target.value)}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Kalan Gün (Opsiyonel)</label>
                    <input
                      type="number"
                      min="1"
                      placeholder="Örn: 30"
                      value={newGoalDays}
                      onChange={(e) => setNewGoalDays(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-bold text-slate-300">İkon Seçimi</label>
                    <button
                      type="button"
                      onClick={() => setShowFullIconGrid(!showFullIconGrid)}
                      className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
                    >
                      <Sparkles size={12} />
                      <span>{showFullIconGrid ? 'Daha Az Göster' : 'Tüm İkonları Gör (16 Adet)'}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-8 gap-2 p-2 bg-[#0b0f17] border border-slate-800 rounded-2xl max-h-40 overflow-y-auto">
                    {(showFullIconGrid ? ALL_QUEST_ICONS : ALL_QUEST_ICONS.slice(0, 8)).map(ic => {
                      const IconComp = ic.icon;
                      const isSelected = newGoalIcon === ic.id;
                      return (
                        <button
                          key={ic.id}
                          type="button"
                          onClick={() => setNewGoalIcon(ic.id)}
                          className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${
                            isSelected
                              ? 'bg-amber-500 text-black border-amber-400 font-bold shadow-md scale-105'
                              : 'bg-[#121724] text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200'
                          }`}
                          title={ic.label}
                        >
                          <IconComp size={18} />
                          <span className="text-[8px] uppercase truncate w-full text-center">{ic.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreatingGoal(false);
                      setIsAddingCategory(false);
                    }}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-black shadow-md flex items-center gap-1.5"
                  >
                    <Check size={15} /> Hedefi Havuza Ekle
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2 overflow-y-auto pr-1 flex-1">
                {goalPool.map((pGoal) => {
                  const isAdded = activeGoals.some(g => g.id === pGoal.id);

                  return (
                    <div
                      key={pGoal.id}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                        isAdded
                          ? 'bg-[#121927] border-amber-500/60 shadow-lg'
                          : 'bg-[#0f1422] border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl bg-black/40 border border-white/10 ${pGoal.accentColor}`}>
                            {renderGoalIcon(pGoal.iconType, 20)}
                          </div>
                          <div>
                            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 block">
                              {pGoal.category}
                            </span>
                            <h4 className="text-sm font-extrabold text-slate-100">
                              {pGoal.title}
                            </h4>
                          </div>
                        </div>

                        {pGoal.isCustom && (
                          <button
                            onClick={(e) => handleDeleteGoalFromPool(pGoal.id, e)}
                            className="p-1 rounded-lg text-slate-600 hover:text-red-400 transition-colors"
                            title="Havuzdan Kalıcı Sil"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono text-slate-400 pt-2 border-t border-slate-800/80">
                        <span>Hedef: <b className="text-slate-200">{pGoal.target.toLocaleString('tr-TR')} {pGoal.unit}</b></span>
                        {pGoal.deadlineDays && (
                          <span className="text-amber-400">~{pGoal.deadlineDays} Gün</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleToggleGoalInBar(pGoal)}
                        className={`w-full py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                          isAdded
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                            : 'bg-amber-500 hover:bg-amber-400 text-black shadow-md'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check size={14} /> Çubuktan Kaldır
                          </>
                        ) : (
                          <>
                            <Plus size={14} /> Çubuğa Ekle
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* POPUP: AKTİF HEDEF İLERLEMESİ GÜNCELLEME */}
      {editingGoal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setEditingGoal(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className={`p-3 rounded-2xl bg-black/40 border border-white/10 ${editingGoal.accentColor}`}>
                {renderGoalIcon(editingGoal.iconType, 22)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">{editingGoal.title}</h3>
                <p className="text-xs text-slate-400">İlerleme durumunu ve değerini güncelle</p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1.5 block">
                  Şu Anki Değer ({editingGoal.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  value={editingGoal.current}
                  onChange={(e) => handleUpdateGoalProgress(editingGoal.id, Math.max(0, Number(e.target.value) || 0))}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <span className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider font-mono">Hızlı Güncelle:</span>
                <div className="grid grid-cols-3 gap-2">
                  <button onClick={() => handleUpdateGoalProgress(editingGoal.id, editingGoal.current + 1)} className="py-1.5 bg-[#141b2c] hover:bg-amber-500 hover:text-black rounded-lg text-xs font-mono font-bold border border-slate-700">+1 {editingGoal.unit}</button>
                  <button onClick={() => handleUpdateGoalProgress(editingGoal.id, editingGoal.current + 5)} className="py-1.5 bg-[#141b2c] hover:bg-amber-500 hover:text-black rounded-lg text-xs font-mono font-bold border border-slate-700">+5 {editingGoal.unit}</button>
                  <button onClick={() => handleUpdateGoalProgress(editingGoal.id, editingGoal.target)} className="py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold">Tamamla!</button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setActiveGoals(prev => prev.filter(g => g.id !== editingGoal.id));
                    setEditingGoal(null);
                  }}
                  className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={14} /> Çubuktan Çıkar
                </button>

                <button
                  type="button"
                  onClick={() => setEditingGoal(null)}
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md"
                >
                  Tamam
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* POPUP: ŞABLON DÜZENLEME MODALI */}
      {editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0d121c] border border-amber-500/30 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setEditingTemplate(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Edit3 size={22} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">Etkinlik Şablonunu Düzenle</h3>
                <p className="text-xs text-slate-400">Sol havuzdaki bu şablonun özelliklerini güncelleyin</p>
              </div>
            </div>

            <form onSubmit={handleUpdateTemplate} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Kategori</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setEditingTemplate({ ...editingTemplate, category: c.id })}
                      className={`p-2 rounded-xl border text-left flex items-center gap-1.5 ${
                        editingTemplate.category === c.id ? 'border-amber-400 bg-[#1e1b15]' : 'border-slate-800 bg-[#0d121c] text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {editingTemplate.category === 'Oyunlar' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col gap-2">
                  <label className="text-xs font-bold text-red-300">Oyun Adı</label>
                  <select
                    value={editingTemplate.gameName || PRESET_GAMES[0]}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, gameName: e.target.value })}
                    className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    {PRESET_GAMES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Etkinlik Başlığı</label>
                <input
                  type="text"
                  value={editingTemplate.title}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, title: e.target.value })}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Varsayılan Süre (Saat)</label>
                  <input
                    type="number"
                    min="1"
                    max="16"
                    value={editingTemplate.defaultDurationHours}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultDurationHours: Math.max(1, Number(e.target.value) || 1) })}
                    className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-300 mb-1 block">Öncelik</label>
                  <select
                    value={editingTemplate.priority}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, priority: e.target.value as any })}
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
                  <label className="text-[11px] font-bold text-amber-300 mb-1 block flex items-center gap-1">
                    <Wallet size={12} /> Varsayılan Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={editingTemplate.defaultCost ?? 0}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, defaultCost: Math.max(0, Number(e.target.value) || 0) })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
                  <select
                    value={editingTemplate.expenseCategory || 'Yeme-İçme & Sosyal'}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, expenseCategory: e.target.value })}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Açıklama / Görev Notu</label>
                <textarea
                  rows={2}
                  placeholder="Etkinlikle ilgili notlar..."
                  value={editingTemplate.note || ''}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, note: e.target.value })}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800 mt-2">
                <button
                  type="button"
                  onClick={() => handleDeleteFromPool(editingTemplate.id)}
                  className="px-4 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <Trash2 size={15} /> Havuzdan Sil
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTemplate(null)}
                    className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md flex items-center gap-1.5"
                  >
                    <Check size={16} /> Değişiklikleri Kaydet
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: HAVUZA YENİ ŞABLON TANIMLAMA */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0d121c] border border-amber-500/20 rounded-3xl p-6 shadow-2xl relative">
            <button 
              onClick={() => setIsNewTemplateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-slate-100 mb-1 flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" /> Havuza Yeni Şablon Tanımla
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Bu şablon soldaki havuza eklenecek ve istediğin günlere sürükleyebileceksin.
            </p>

            <form onSubmit={(e) => {
              e.preventDefault();
              const catConfig = CATEGORIES.find(c => c.id === formCategory)!;
              const gameFinal = formCategory === 'Oyunlar'
                ? (formSelectedGame === 'Özel Oyun (Manuel Yaz)' ? (formCustomGameName.trim() || 'Özel Oyun') : formSelectedGame)
                : undefined;
              const finalTitle = formTitle.trim() || (gameFinal ? `${gameFinal} Oturumu` : catConfig.label);
              const validCost = Math.max(0, Number(formCost) || 0);

              const newTpl: SavedActivityTemplate = {
                id: 'pool-' + Date.now(),
                title: finalTitle,
                category: formCategory,
                gameName: gameFinal,
                themeColor: catConfig.themeColor,
                defaultDurationHours: Math.min(16, Math.max(1, endHour - startHour)),
                priority: formPriority,
                note: formNote.trim(),
                defaultCost: validCost,
                expenseCategory: validCost > 0 ? formExpenseCategory : undefined
              };

              setActivityPool(prev => [newTpl, ...prev]);
              setFormTitle('');
              setFormNote('');
              setFormCost(0);
              setIsNewTemplateModalOpen(false);
            }} className="flex flex-col gap-3.5">
              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Kategori</label>
                <div className="grid grid-cols-3 gap-1.5">
                  {CATEGORIES.map(c => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setFormCategory(c.id)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-1.5 ${
                        formCategory === c.id ? 'border-amber-400 bg-[#1e1b15]' : 'border-slate-800 bg-[#0d121c] text-slate-400'
                      }`}
                    >
                      <span className="text-xs font-bold truncate">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {formCategory === 'Oyunlar' && (
                <div className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl flex flex-col gap-2">
                  <label className="text-xs font-bold text-red-300">Oyun Adı</label>
                  <select
                    value={formSelectedGame}
                    onChange={(e) => setFormSelectedGame(e.target.value)}
                    className="w-full bg-[#121826] border border-red-800/60 rounded-lg px-3 py-2 text-xs text-slate-100 outline-none"
                  >
                    {PRESET_GAMES.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Şablon Başlığı</label>
                <input
                  type="text"
                  placeholder="Örn: Aspava veya Diablo Sezon Boss Farmı"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-[#121724] border border-slate-800 rounded-2xl">
                <div>
                  <label className="text-[11px] font-bold text-amber-300 mb-1 block flex items-center gap-1">
                    <Wallet size={12} /> Varsayılan Maliyet (₺)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={formCost}
                    onChange={(e) => setFormCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-100 font-mono outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">Finans Kategorisi</label>
                  <select
                    value={formExpenseCategory}
                    onChange={(e) => setFormExpenseCategory(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-lg px-2 py-1.5 text-xs text-slate-200 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-300 mb-1 block">Açıklama / Görev Notu</label>
                <textarea
                  rows={2}
                  placeholder="Şablon için varsayılan not..."
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none focus:border-amber-500 resize-none font-sans"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
              >
                <Check size={16} /> Havuza Kaydet
              </button>
            </form>
          </div>
        </div>
      )}

      {/* POPUP: ETKİNLİK DETAY MODALI */}
      {viewingEvent && (
        <div className="fixed inset-0 z-[60] bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0c101a] border border-amber-500/40 rounded-3xl p-6 shadow-[0_0_50px_rgba(0,0,0,0.9)] relative animate-in fade-in zoom-in-95 duration-150">
            <button 
              onClick={() => setViewingEvent(null)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-start gap-3.5 mb-4">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg mt-0.5 border border-white/20"
                style={{ backgroundColor: CATEGORIES.find(c => c.id === viewingEvent.category)?.themeColor || '#f59e0b' }}
              >
                {(() => {
                  const IconComp = CATEGORIES.find(c => c.id === viewingEvent.category)?.icon || Sparkles;
                  return <IconComp size={22} />;
                })()}
              </div>
              <div className="flex-1 pr-6">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  {viewingEvent.gameName && (
                    <span className="text-[10px] font-black uppercase bg-red-950/80 text-red-300 px-2 py-0.5 rounded-md border border-red-800/50">
                      🎮 {viewingEvent.gameName}
                    </span>
                  )}
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-800 px-2 py-0.5 rounded-md text-slate-300">
                    {viewingEvent.category}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    viewingEvent.priority === 'Kritik (Raid/Sınav)' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                    viewingEvent.priority === 'Yüksek' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                    'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }`}>
                    {viewingEvent.priority}
                  </span>
                </div>
                <h3 className="text-lg font-black text-slate-100 leading-snug">
                  {viewingEvent.title}
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="p-3 rounded-2xl bg-[#121724] border border-slate-800 flex items-center gap-3">
                <Clock size={18} className="text-amber-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Zaman Aralığı</span>
                  <span className="text-xs font-mono font-extrabold text-slate-100">
                    {viewingEvent.timeSlot}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-[#121724] border border-slate-800 flex items-center gap-3">
                <CalendarIcon size={18} className="text-cyan-400 shrink-0" />
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Tarih</span>
                  <span className="text-xs font-mono font-extrabold text-slate-100">
                    {viewingEvent.day} {MONTH_NAMES[viewingEvent.month]} {viewingEvent.year}
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
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Maliyet (₺)</label>
                  <input
                    type="number"
                    min="0"
                    value={viewingCost}
                    onChange={(e) => setViewingCost(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-amber-300 font-mono font-bold outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-1">Harcama Kategorisi</label>
                  <select
                    value={viewingCategory}
                    onChange={(e) => setViewingCategory(e.target.value)}
                    className="w-full bg-[#0b0f17] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 outline-none focus:border-amber-500"
                  >
                    {EXPENSE_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5 mb-1 block">
                <FileText size={14} className="text-amber-400" /> Görev Açıklaması & Notlar
              </span>
              <textarea
                rows={2}
                value={viewingNote}
                onChange={(e) => setViewingNote(e.target.value)}
                placeholder="Bu etkinlik için not ekleyin..."
                className="w-full bg-[#111624] border border-slate-800 rounded-2xl p-2.5 text-xs text-slate-300 leading-relaxed outline-none focus:border-amber-500 resize-none font-sans"
              />
            </div>

            <div className="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-800/80">
              <button
                type="button"
                onClick={() => handleDeleteEvent(viewingEvent.id)}
                className="px-3.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <Trash2 size={14} /> Etkinliği Sil
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleComplete(viewingEvent.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                    viewingEvent.isCompleted
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                      : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  <CheckCircle2 size={15} className={viewingEvent.isCompleted ? 'text-emerald-400' : 'text-slate-400'} />
                  <span>{viewingEvent.isCompleted ? 'Tamamlandı' : 'Tamamla'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveViewingEvent}
                  className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold shadow-md flex items-center gap-1.5 transition-all active:scale-95"
                  title="Maliyet ve açıklama değişikliklerini kaydet"
                >
                  <Save size={14} /> Kaydet
                </button>

                <button
                  type="button"
                  onClick={() => setViewingEvent(null)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md"
                >
                  Kapat
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}