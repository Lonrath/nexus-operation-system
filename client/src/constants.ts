import {
  Dumbbell, Briefcase, BookOpen, GraduationCap, Award, Compass, Gamepad2,
  Target, Footprints, Flame, Coins, Code, Droplets, Heart, Zap, Coffee,
  Swords, Shield, Trophy, Utensils, Star,
} from 'lucide-react';
import type {
  CategoryConfig, GoalDefinition, SavedActivityTemplate, VaultNote,
} from './types';

export const CATEGORIES: CategoryConfig[] = [
  { id: 'Spor', label: 'Spor & Kuvvet', themeColor: '#10b981', icon: Dumbbell },
  { id: 'İş', label: 'İş & Proje', themeColor: '#3b82f6', icon: Briefcase },
  { id: 'Okuma', label: 'Kitap & Tomar', themeColor: '#f59e0b', icon: BookOpen },
  { id: 'Yüksek Lisans', label: 'Yüksek Lisans', themeColor: '#6366f1', icon: GraduationCap },
  { id: 'Doktora', label: 'Doktora & Tez', themeColor: '#a855f7', icon: Award },
  { id: 'Keşif', label: 'Keşif & Sosyal', themeColor: '#06b6d4', icon: Compass },
  { id: 'Oyunlar', label: 'Oyun Seansı', themeColor: '#ef4444', icon: Gamepad2 },
];

export const CUSTOM_GAME_OPTION = 'Özel Oyun (Manuel Yaz)';

export const PRESET_GAMES = [
  'World of Warcraft',
  'Metin2',
  'The Elder Scrolls V: Skyrim',
  'Elden Ring',
  'Diablo IV',
  'Path of Exile',
  CUSTOM_GAME_OPTION,
];

export const EXPENSE_CATEGORIES = [
  'Yeme-İçme & Sosyal',
  'Oyun & Dijital Abonelik',
  'Spor & Sağlık',
  'Akademi & Kitap',
  'Ulaşım',
  'Genel Yaşam Harcaması',
];

export const DEFAULT_EXPENSE_CATEGORY = EXPENSE_CATEGORIES[0];

/** Bir saat diliminde izin verilen en fazla etkinlik sayısı. */
export const MAX_EVENTS_PER_HOUR = 3;

/** Bir etkinliğin en uzun süresi (saat). */
export const MAX_EVENT_DURATION = 16;

export const ALL_QUEST_ICONS = [
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

/** Hedef kategorisine göre renk paleti. Yeni kategori eklemek için buraya satır ekleyin. */
export const GOAL_PALETTES: Record<string, { gradient: string; accent: string; border: string }> = {
  Spor: { gradient: 'from-emerald-500 to-teal-300', accent: 'text-emerald-400', border: 'border-emerald-500/50' },
  WoW: { gradient: 'from-amber-500 via-amber-400 to-yellow-300', accent: 'text-amber-400', border: 'border-amber-500/50' },
  Diablo: { gradient: 'from-orange-500 to-red-500', accent: 'text-orange-400', border: 'border-orange-500/50' },
  Akademi: { gradient: 'from-purple-500 to-indigo-300', accent: 'text-purple-400', border: 'border-purple-500/50' },
};

export const DEFAULT_GOAL_PALETTE = {
  gradient: 'from-cyan-500 to-blue-400',
  accent: 'text-cyan-400',
  border: 'border-cyan-500/50',
};

export const DEFAULT_GOAL_CATEGORIES = [
  'Spor', 'WoW', 'Diablo', 'Akademi', 'Yaşam', 'Kodlama & Proje',
];

export const DEFAULT_GOAL_POOL: GoalDefinition[] = [
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
    borderColor: 'border-emerald-500/50',
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
    borderColor: 'border-cyan-500/50',
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
    borderColor: 'border-orange-500/50',
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
    borderColor: 'border-amber-500/50',
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
    borderColor: 'border-purple-500/50',
  },
];

/** Uygulama ilk açıldığında üst çubukta duran hedefler. */
export const DEFAULT_GOAL_PROGRESS = [
  { goalId: 'goal-wow-gold', current: 1950000 },
  { goalId: 'goal-steps', current: 6420 },
  { goalId: 'goal-workout-sets', current: 1 },
  { goalId: 'goal-diablo-reliquary', current: 8 },
];

export const DEFAULT_TEMPLATES: SavedActivityTemplate[] = [
  { id: 'tpl-1', title: 'Guild Mythic Raid', category: 'Oyunlar', gameName: 'World of Warcraft', themeColor: '#ef4444', defaultDurationHours: 3, priority: 'Kritik (Raid/Sınav)', note: 'Flask, pot ve food bufflarını hazırla. Discord ses kanalına zamanında gir.', defaultCost: 0 },
  { id: 'tpl-2', title: 'Razador & Ejderha Saati', category: 'Oyunlar', gameName: 'Metin2', themeColor: '#a855f7', defaultDurationHours: 2, priority: 'Yüksek', note: 'Geçit biletlerini kontrol et, pet süresini yenile.', defaultCost: 0 },
  { id: 'tpl-3', title: 'Skyrim Zindan Keşfi', category: 'Oyunlar', gameName: 'The Elder Scrolls V: Skyrim', themeColor: '#f97316', defaultDurationHours: 4, priority: 'Normal', note: 'Yeni yüklenen grafik modlarını test et.', defaultCost: 0 },
  { id: 'tpl-4', title: 'Aspava Akşamı', category: 'Keşif', themeColor: '#06b6d4', defaultDurationHours: 2, priority: 'Normal', note: 'SSK dürüm + künefe.', defaultCost: 850, expenseCategory: 'Yeme-İçme & Sosyal' },
  { id: 'tpl-5', title: 'C# / API Sprint Demosu', category: 'İş', themeColor: '#3b82f6', defaultDurationHours: 3, priority: 'Yüksek', note: 'Endpoint testlerini ekibe göster.', defaultCost: 0 },
  { id: 'tpl-6', title: 'Ağır Kuvvet Antrenmanı', category: 'Spor', themeColor: '#10b981', defaultDurationHours: 2, priority: 'Normal', note: 'Bileşik hareketler: Squat, Bench Press ve Deadlift.', defaultCost: 0 },
  { id: 'tpl-7', title: 'Algoritma & Mimari Okuması', category: 'Okuma', themeColor: '#f59e0b', defaultDurationHours: 1, priority: 'Normal', note: 'Clean Architecture kitabından 2 bölüm bitir.', defaultCost: 0 },
];

export const DEFAULT_VAULT_NOTES: VaultNote[] = [
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
      { id: 'l2', title: 'Undermine Exchange Canlı Piyasa Fiyatları', url: 'https://undermine.exchange' },
    ],
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
      { id: 'c7', text: 'Clean Architecture Bölüm 4 özetini deftere çıkar', done: false },
    ],
    links: [
      { id: 'l3', title: 'NeetCode 150 Yol Haritası', url: 'https://neetcode.io/roadmap' },
    ],
  },
];
