import React, { useState, useEffect } from 'react';
import { 
  ScrollText, Plus, Trash2, CheckCircle2, Circle, ExternalLink, 
  Link as LinkIcon, Award, Shield, Check, X, Sparkles, 
  Search, BookOpen, Clock, Flame, Stamp, ArrowLeft
} from 'lucide-react';
import { QuestGoal } from './App';

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

interface NexusVaultProps {
  onBackToHub: () => void;
  onLaunchOS: () => void;
  activeGoals: QuestGoal[];
}

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

export const NexusVault: React.FC<NexusVaultProps> = ({
  onBackToHub,
  onLaunchOS,
  activeGoals
}) => {
  const [notes, setNotes] = useState<VaultNote[]>(() => {
    const saved = localStorage.getItem('nexus_vault_notes_v2');
    return saved ? JSON.parse(saved) : DEFAULT_VAULT_NOTES;
  });

  const [selectedNoteId, setSelectedNoteId] = useState<string>(notes[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState('');
  const [newChecklistText, setNewChecklistText] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);

  useEffect(() => {
    localStorage.setItem('nexus_vault_notes_v2', JSON.stringify(notes));
  }, [notes]);

  const activeNote = notes.find(n => n.id === selectedNoteId) || notes[0];

  const handleCreateNewNote = () => {
    const newNote: VaultNote = {
      id: 'note-' + Date.now(),
      title: 'İsimsiz Parşömen',
      category: 'Genel',
      content: 'Buraya kadim notlarını, yapılacak stratejileri ve linkleri kaydet...',
      checklist: [],
      links: [],
      isSealed: false,
      updatedAt: new Date().toISOString().slice(0, 10)
    };
    setNotes([newNote, ...notes]);
    setSelectedNoteId(newNote.id);
  };

  const handleDeleteNote = (id: string) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (selectedNoteId === id && remaining.length > 0) {
      setSelectedNoteId(remaining[0].id);
    }
  };

  const handleUpdateActiveNote = (fields: Partial<VaultNote>) => {
    if (!activeNote) return;
    const updated = { ...activeNote, ...fields, updatedAt: new Date().toISOString().slice(0, 10) };
    setNotes(notes.map(n => n.id === activeNote.id ? updated : n));
  };

  // Checklist İşlemleri
  const handleToggleChecklistItem = (itemId: string) => {
    if (!activeNote) return;
    const updatedChecklist = activeNote.checklist.map(item => 
      item.id === itemId ? { ...item, done: !item.done } : item
    );
    handleUpdateActiveNote({ checklist: updatedChecklist });
  };

  const handleAddChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistText.trim() || !activeNote) return;
    const newItem: VaultChecklistItem = {
      id: 'chk-' + Date.now(),
      text: newChecklistText.trim(),
      done: false
    };
    handleUpdateActiveNote({ checklist: [...activeNote.checklist, newItem] });
    setNewChecklistText('');
  };

  const handleDeleteChecklistItem = (itemId: string) => {
    if (!activeNote) return;
    handleUpdateActiveNote({
      checklist: activeNote.checklist.filter(i => i.id !== itemId)
    });
  };

  // Link İşlemleri
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
    handleUpdateActiveNote({ links: [...activeNote.links, newLink] });
    setNewLinkTitle('');
    setNewLinkUrl('');
    setIsAddingLink(false);
  };

  const handleDeleteLink = (linkId: string) => {
    if (!activeNote) return;
    handleUpdateActiveNote({
      links: activeNote.links.filter(l => l.id !== linkId)
    });
  };

  const filteredNotes = notes.filter(n => 
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
                <h1 className="text-lg font-black tracking-wider uppercase text-amber-200">
                  NEXUS VAULT
                </h1>
                <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded">
                  Kadim Tomarlar & Görev Defteri
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Word benzeri zengin notlar, hedeflere bağlı to-do'lar ve önemli link kasası</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateNewNote}
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

      {/* İki Sütunlu Ana Gövde */}
      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* SOL SÜTUN: KİTAPLIK / PARŞÖMEN RAF LİSTESİ */}
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
            {filteredNotes.map(n => {
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
                        handleDeleteNote(n.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                      title="Parşömeni Yok Et"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-white/5">
                    <span>
                      {totalCount > 0 ? `${completedCount}/${totalCount} Görev` : 'Not'}
                    </span>
                    <span>{n.updatedAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </aside>

        {/* SAĞ SÜTUN: FANTASTİK PARŞÖMEN EDİTÖRÜ */}
        {activeNote ? (
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#18120b] via-[#140e08] to-[#19130c] border-2 border-amber-700/40 rounded-3xl p-7 shadow-2xl overflow-y-auto relative font-serif">
            {/* Parşömen Arka Plan Halesi */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_0.5px,transparent_0.5px)] [background-size:20px_20px] opacity-10 pointer-events-none" />

            {/* Kadim Mum Mühür Rozeti (Wax Seal) */}
            {activeNote.isSealed && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-br from-red-800 to-red-950 text-amber-200 border-2 border-amber-500/80 px-4 py-2 rounded-2xl shadow-[0_0_25px_rgba(239,68,68,0.5)] rotate-3 select-none pointer-events-none animate-in zoom-in-90 duration-200">
                <Stamp size={20} className="text-amber-300" />
                <span className="font-sans font-black text-xs uppercase tracking-widest">
                  MÜHÜRLENDİ
                </span>
              </div>
            )}

            {/* Üst Kısım: Başlık & Kategori & Hedef Bağlantısı */}
            <div className="flex flex-col gap-3 pb-5 border-b border-amber-900/40 shrink-0 font-sans">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  value={activeNote.title}
                  onChange={(e) => handleUpdateActiveNote({ title: e.target.value })}
                  placeholder="Parşömenin Başlığı..."
                  className="bg-transparent text-2xl font-black text-amber-100 placeholder:text-amber-900/50 outline-none w-full tracking-wide font-serif"
                />

                <div className="flex items-center gap-2 shrink-0">
                  {/* Mum Mühür Toggle Butonu */}
                  <button
                    onClick={() => handleUpdateActiveNote({ isSealed: !activeNote.isSealed })}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold font-sans transition-all flex items-center gap-1.5 border ${
                      activeNote.isSealed 
                        ? 'bg-red-950 text-red-200 border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.3)]' 
                        : 'bg-[#1a130c] text-amber-300/80 border-amber-800/50 hover:border-amber-500'
                    }`}
                  >
                    <Stamp size={14} />
                    <span>{activeNote.isSealed ? 'Mühürü Kaldır' : 'Mühürle'}</span>
                  </button>
                </div>
              </div>

              {/* Meta Ayarlar Çubuğu */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Kategori Seçici */}
                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Kategori:</span>
                  <input
                    type="text"
                    value={activeNote.category}
                    onChange={(e) => handleUpdateActiveNote({ category: e.target.value })}
                    className="bg-transparent text-xs text-amber-100 font-bold outline-none w-28"
                  />
                </div>

                {/* Hedef Bağlantısı Seçici (Active Quest Linker) */}
                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <Award size={13} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400 font-mono font-bold uppercase">Hedef Bağı:</span>
                  <select
                    value={activeNote.linkedGoalId || ''}
                    onChange={(e) => handleUpdateActiveNote({ linkedGoalId: e.target.value || undefined })}
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

                {/* Bağlı Hedef Vurgusu */}
                {linkedGoal && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>Bağlı Görev: %{Math.min(100, Math.round((linkedGoal.current / linkedGoal.target) * 100))} Tamamlandı</span>
                  </div>
                )}
              </div>
            </div>

            {/* Parşömen Gövdesi (Zengin Metin Alanı) */}
            <div className="my-5 flex-1 flex flex-col">
              <textarea
                value={activeNote.content}
                onChange={(e) => handleUpdateActiveNote({ content: e.target.value })}
                placeholder="Kadim parşömeninizi doldurun..."
                rows={7}
                className="w-full bg-transparent text-amber-100 placeholder:text-amber-900/40 text-sm leading-relaxed outline-none resize-none font-sans font-medium"
              />
            </div>

            {/* ALT BÖLÜMLER: TO-DO CHECKLIST & REHBER LİNKLERİ */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-amber-900/40 font-sans">
              {/* Bölüm 1: Yapılacaklar & Checklist */}
              <div className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 size={15} className="text-amber-400" />
                    <span>Görev Adımları (Checklist)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-900/30 font-bold">
                    {activeNote.checklist.filter(i => i.done).length}/{activeNote.checklist.length} Tamam
                  </span>
                </div>

                {/* Yeni Görev Adımı Ekleme */}
                <form onSubmit={handleAddChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Adım ekle (Örn: 20x Dungeon Turu)..."
                    value={newChecklistText}
                    onChange={(e) => setNewChecklistText(e.target.value)}
                    className="flex-1 bg-[#19110a] border border-amber-900/40 rounded-xl px-3 py-1.5 text-xs text-amber-100 outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0"
                  >
                    Ekle
                  </button>
                </form>

                <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
                  {activeNote.checklist.map(item => (
                    <div
                      key={item.id}
                      onClick={() => handleToggleChecklistItem(item.id)}
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
                          handleDeleteChecklistItem(item.id);
                        }}
                        className="opacity-0 group-hover/chk:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {activeNote.checklist.length === 0 && (
                    <div className="text-center py-5 text-[11px] text-amber-900/80 font-mono">
                      Henüz bu parşömene adım eklenmedi.
                    </div>
                  )}
                </div>
              </div>

              {/* Bölüm 2: Önemli Linkler & Rotalar */}
              <div className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <LinkIcon size={14} className="text-amber-400" />
                    <span>Önemli Kılavuz & Rota Linkleri</span>
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
                      placeholder="Link başlığı (Örn: Wowhead Farm Rotası)..."
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
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold"
                      >
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
                        <span className="text-xs text-amber-100 font-semibold truncate underline underline-offset-2">
                          {link.title}
                        </span>
                      </a>

                      <button
                        onClick={() => handleDeleteLink(link.id)}
                        className="opacity-0 group-link:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}

                  {activeNote.links.length === 0 && (
                    <div className="text-center py-5 text-[11px] text-amber-900/80 font-mono">
                      Kayıtlı harici bağlantı yok.
                    </div>
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
};