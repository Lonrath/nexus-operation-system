import { useState, useMemo, useCallback } from 'react';
import {
  ArrowLeft, ScrollText, Plus, Shield, Search, Trash2, Stamp, Award,
  Sparkles, CheckCircle2, Circle, Link as LinkIcon, ExternalLink,
} from 'lucide-react';
import type { VaultNote, VaultChecklistItem, VaultLinkItem, ActiveGoal } from '../types';
import { newId } from '../lib/storage';

// ==========================================================================
// NEXUS VAULT
//
// Eski kodda bu bileşenin 14 propu vardı ve bunların yarısı geçici form
// state'iydi (yeni link başlığı, "link ekleniyor mu" gibi). O yüzden not
// değiştirince açık link formu kapanmıyordu. Artık bunlar burada.
//
// Ayrıca eski dosyadaki kullanılmayan NexusVault.tsx kopyası silindi;
// o kopya 'nexus_vault_notes_v2' anahtarına yazıyordu, yani ikinci bir
// gizli veri kümesi tutuyordu.
// ==========================================================================

/** Kullanıcının girdiği adresi güvenli bir http(s) adresine çevirir. */
function normalizeUrl(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withScheme);
    // javascript: / data: gibi şemaları kesin olarak eler.
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    return url.toString();
  } catch {
    return null;
  }
}

export function NexusVault({
  notes,
  setNotes,
  activeGoals,
  onBackToHub,
  onLaunchOS,
  notify,
}: {
  notes: VaultNote[];
  setNotes: React.Dispatch<React.SetStateAction<VaultNote[]>>;
  activeGoals: ActiveGoal[];
  onBackToHub: () => void;
  onLaunchOS: () => void;
  notify: (text: string, tone?: 'error' | 'success') => void;
}) {
  const [selectedId, setSelectedId] = useState<string>(() => notes[0]?.id ?? '');
  const [query, setQuery] = useState('');
  const [checklistText, setChecklistText] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [isAddingLink, setIsAddingLink] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const activeNote = notes.find((n) => n.id === selectedId) ?? notes[0] ?? null;

  const filtered = useMemo(() => {
    const q = query.trim().toLocaleLowerCase('tr');
    if (!q) return notes;
    return notes.filter(
      (n) =>
        n.title.toLocaleLowerCase('tr').includes(q) ||
        n.category.toLocaleLowerCase('tr').includes(q)
    );
  }, [notes, query]);

  const linkedGoal = activeGoals.find((g) => g.id === activeNote?.linkedGoalId);

  const updateActive = useCallback((fields: Partial<VaultNote>) => {
    if (!activeNote) return;
    setNotes((prev) =>
      prev.map((n) =>
        n.id === activeNote.id
          ? { ...n, ...fields, updatedAt: new Date().toISOString().slice(0, 10) }
          : n
      )
    );
  }, [activeNote, setNotes]);

  const createNote = () => {
    const note: VaultNote = {
      id: newId('note'),
      title: 'İsimsiz Parşömen',
      category: 'Genel',
      content: '',
      checklist: [],
      links: [],
      isSealed: false,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    setNotes((prev) => [note, ...prev]);
    setSelectedId(note.id);
  };

  // Eski kodda silme tek tıkla, geri dönüşsüz oluyordu.
  const confirmDelete = (id: string) => {
    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== id);
      if (selectedId === id) setSelectedId(remaining[0]?.id ?? '');
      return remaining;
    });
    setPendingDelete(null);
    notify('Parşömen silindi.', 'success');
  };

  const addChecklistItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checklistText.trim() || !activeNote) return;
    const item: VaultChecklistItem = {
      id: newId('chk'),
      text: checklistText.trim(),
      done: false,
    };
    updateActive({ checklist: [...activeNote.checklist, item] });
    setChecklistText('');
  };

  const addLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeNote || !linkTitle.trim()) return;
    const url = normalizeUrl(linkUrl);
    if (!url) {
      notify('Geçerli bir adres girin (örn: wowhead.com).');
      return;
    }
    const link: VaultLinkItem = { id: newId('lnk'), title: linkTitle.trim(), url };
    updateActive({ links: [...activeNote.links, link] });
    setLinkTitle('');
    setLinkUrl('');
    setIsAddingLink(false);
  };

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-transparent p-6 relative">
      <div className="flex items-center justify-between pb-4 border-b border-amber-500/25 shrink-0 mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onBackToHub}
            className="p-2.5 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 transition-all flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft size={16} /> Hub'a Dön
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-600 via-amber-800 to-amber-950 p-[1.5px] flex items-center justify-center">
              <ScrollText className="text-amber-300" size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-wider uppercase text-amber-200">NEXUS VAULT</h1>
                <span className="text-[10px] font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/40 px-2 py-0.5 rounded">
                  Kadim Tomarlar & Görev Defteri
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Hedeflere bağlı to-do listeleri, farm rotaları ve rehber linkleri
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={createNote}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={15} className="stroke-[3]" />
            <span>Yeni Parşömen Aç</span>
          </button>
          <button
            type="button"
            onClick={onLaunchOS}
            className="px-3.5 py-2 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5"
          >
            <Shield size={14} className="text-amber-400" /> Takvime Git
          </button>
        </div>
      </div>

      <div className="flex flex-1 gap-6 overflow-hidden">
        {/* LİSTE */}
        <aside className="w-80 flex flex-col gap-3 bg-[#0a0f18]/90 border border-slate-800/90 rounded-3xl p-4 shadow-xl shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-500 pointer-events-none" size={15} />
            <input
              type="search"
              aria-label="Tomarlarda ara"
              placeholder="Tomarlarda ara..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0f1422] border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 outline-none focus:border-amber-500/60 font-medium"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono font-bold text-slate-400 px-1 pt-1">
            <span>Kütüphanedeki Tomarlar</span>
            <span className="text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded border border-amber-800/40 text-[10px]">
              {filtered.length} / {notes.length}
            </span>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto pr-1 flex-1">
            {filtered.map((n) => {
              const selected = n.id === activeNote?.id;
              const done = n.checklist.filter((i) => i.done).length;
              return (
                <div
                  key={n.id}
                  className={`rounded-2xl border transition-all relative overflow-hidden group ${
                    selected
                      ? 'bg-gradient-to-r from-[#1f1710] to-[#16110a] border-amber-500/70'
                      : 'bg-[#0f1422] border-slate-800/80 hover:border-slate-700 hover:bg-[#131929]'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setSelectedId(n.id)}
                    aria-current={selected ? 'true' : undefined}
                    className="w-full text-left p-3 flex flex-col gap-2"
                  >
                    <span className="min-w-0 block pr-6">
                      <span className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400/90 bg-black/40 px-1.5 py-0.5 rounded border border-amber-900/30">
                          {n.category || 'Genel'}
                        </span>
                        {n.isSealed && (
                          <span className="text-[8px] font-bold uppercase bg-red-950 text-red-400 border border-red-800/50 px-1 rounded">
                            Mühürlü
                          </span>
                        )}
                      </span>
                      <span className={`text-xs font-extrabold truncate block ${selected ? 'text-amber-200' : 'text-slate-200'}`}>
                        {n.title || 'Başlıksız Not'}
                      </span>
                    </span>
                    <span className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1.5 border-t border-white/5">
                      <span>{n.checklist.length > 0 ? `${done}/${n.checklist.length} Görev` : 'Not'}</span>
                      <span>{n.updatedAt}</span>
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPendingDelete(n.id)}
                    aria-label={`${n.title} parşömenini sil`}
                    title="Parşömeni Yok Et"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity"
                  >
                    <Trash2 size={13} />
                  </button>

                  {pendingDelete === n.id && (
                    <div className="absolute inset-0 bg-[#160b0b]/97 flex flex-col items-center justify-center gap-2 p-3 z-10">
                      <span className="text-[11px] text-red-200 font-bold text-center">Bu parşömen silinsin mi?</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={() => confirmDelete(n.id)} className="px-3 py-1 rounded-lg bg-red-500 text-white text-[11px] font-bold">
                          Sil
                        </button>
                        <button type="button" onClick={() => setPendingDelete(null)} className="px-3 py-1 rounded-lg bg-slate-700 text-slate-200 text-[11px] font-bold">
                          Vazgeç
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filtered.length === 0 && (
              <p className="text-center py-6 text-[11px] text-slate-500 font-mono">
                Aramanla eşleşen tomar yok.
              </p>
            )}
          </div>
        </aside>

        {/* EDİTÖR */}
        {activeNote ? (
          <div className="flex-1 flex flex-col bg-gradient-to-b from-[#18120b] via-[#140e08] to-[#19130c] border-2 border-amber-700/40 rounded-3xl p-7 shadow-2xl overflow-y-auto relative">
            {activeNote.isSealed && (
              <div className="absolute top-6 right-6 flex items-center gap-1.5 bg-gradient-to-br from-red-800 to-red-950 text-amber-200 border-2 border-amber-500/80 px-4 py-2 rounded-2xl rotate-3 pointer-events-none">
                <Stamp size={20} className="text-amber-300" />
                <span className="font-black text-xs uppercase tracking-widest">MÜHÜRLENDİ</span>
              </div>
            )}

            <div className="flex flex-col gap-3 pb-5 border-b border-amber-900/40 shrink-0">
              <div className="flex items-center justify-between gap-4">
                <input
                  type="text"
                  aria-label="Parşömen başlığı"
                  value={activeNote.title}
                  onChange={(e) => updateActive({ title: e.target.value })}
                  placeholder="Parşömenin Başlığı..."
                  className="bg-transparent text-2xl font-black text-amber-100 placeholder:text-amber-900/50 outline-none w-full tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => updateActive({ isSealed: !activeNote.isSealed })}
                  aria-pressed={!!activeNote.isSealed}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border shrink-0 ${
                    activeNote.isSealed
                      ? 'bg-red-950 text-red-200 border-red-800'
                      : 'bg-[#1a130c] text-amber-300/80 border-amber-800/50 hover:border-amber-500'
                  }`}
                >
                  <Stamp size={14} />
                  <span>{activeNote.isSealed ? 'Mührü Kaldır' : 'Mühürle'}</span>
                </button>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <label htmlFor="vault-cat" className="text-[10px] text-amber-400 font-mono font-bold uppercase">Kategori:</label>
                  <input
                    id="vault-cat"
                    type="text"
                    value={activeNote.category}
                    onChange={(e) => updateActive({ category: e.target.value })}
                    className="bg-transparent text-xs text-amber-100 font-bold outline-none w-28"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#171009] border border-amber-900/50 rounded-xl px-2.5 py-1">
                  <Award size={13} className="text-amber-400" />
                  <label htmlFor="vault-goal" className="text-[10px] text-amber-400 font-mono font-bold uppercase">Hedef Bağı:</label>
                  <select
                    id="vault-goal"
                    value={activeNote.linkedGoalId || ''}
                    onChange={(e) => updateActive({ linkedGoalId: e.target.value || undefined })}
                    className="bg-transparent text-xs text-amber-200 font-bold outline-none cursor-pointer"
                  >
                    <option value="" className="bg-[#120d07] text-slate-300">Bağlantı Yok (Serbest Tomar)</option>
                    {activeGoals.map((g) => (
                      <option key={g.id} value={g.id} className="bg-[#120d07] text-amber-300">
                        {g.title} ({g.current}/{g.target} {g.unit})
                      </option>
                    ))}
                  </select>
                </div>

                {linkedGoal && (
                  <div className="flex items-center gap-2 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-mono font-bold">
                    <Sparkles size={13} className="text-amber-400" />
                    <span>
                      Bağlı Görev: %
                      {linkedGoal.target > 0
                        ? Math.min(100, Math.round((linkedGoal.current / linkedGoal.target) * 100))
                        : 0}{' '}
                      Tamamlandı
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="my-5 flex-1 flex flex-col">
              <textarea
                aria-label="Parşömen içeriği"
                value={activeNote.content}
                onChange={(e) => updateActive({ content: e.target.value })}
                placeholder="Kadim parşömeninizi doldurun..."
                rows={6}
                className="w-full bg-transparent text-amber-100 placeholder:text-amber-900/40 text-sm leading-relaxed outline-none resize-none font-medium select-text"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-amber-900/40">
              {/* CHECKLIST */}
              <section className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 size={15} className="text-amber-400" />
                    <span>Görev Adımları (To-Do)</span>
                  </h3>
                  <span className="text-[10px] font-mono text-amber-400 bg-black/40 px-2 py-0.5 rounded border border-amber-900/30 font-bold">
                    {activeNote.checklist.filter((i) => i.done).length}/{activeNote.checklist.length} Tamam
                  </span>
                </div>

                <form onSubmit={addChecklistItem} className="flex gap-2">
                  <input
                    type="text"
                    aria-label="Yeni görev adımı"
                    placeholder="Adım ekle..."
                    value={checklistText}
                    onChange={(e) => setChecklistText(e.target.value)}
                    className="flex-1 bg-[#19110a] border border-amber-900/40 rounded-xl px-3 py-1.5 text-xs text-amber-100 outline-none focus:border-amber-500"
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs shrink-0">
                    Ekle
                  </button>
                </form>

                <ul className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1 list-none p-0 m-0">
                  {activeNote.checklist.map((item) => (
                    <li key={item.id} className="relative">
                      <button
                        type="button"
                        onClick={() =>
                          updateActive({
                            checklist: activeNote.checklist.map((i) =>
                              i.id === item.id ? { ...i, done: !i.done } : i
                            ),
                          })
                        }
                        aria-pressed={item.done}
                        className={`w-full text-left p-2 pr-8 rounded-xl border flex items-center gap-2 transition-all group/chk ${
                          item.done
                            ? 'bg-emerald-950/20 border-emerald-900/40 opacity-50'
                            : 'bg-[#160f08] border-amber-900/30 hover:border-amber-500/40'
                        }`}
                      >
                        {item.done
                          ? <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
                          : <Circle size={16} className="text-amber-500/60 shrink-0" />}
                        <span className={`text-xs truncate ${item.done ? 'line-through text-slate-400' : 'text-amber-100 font-medium'}`}>
                          {item.text}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          updateActive({ checklist: activeNote.checklist.filter((i) => i.id !== item.id) })
                        }
                        aria-label={`${item.text} adımını sil`}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                  {activeNote.checklist.length === 0 && (
                    <li className="text-center py-4 text-[11px] text-amber-900/80 font-mono">
                      Henüz görev adımı eklenmedi.
                    </li>
                  )}
                </ul>
              </section>

              {/* LİNKLER */}
              <section className="p-4 rounded-2xl bg-[#110c07] border border-amber-900/40 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-300 flex items-center gap-1.5 font-mono">
                    <LinkIcon size={14} className="text-amber-400" />
                    <span>Kılavuz & Rota Linkleri</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setIsAddingLink((v) => !v)}
                    className="text-[10px] text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
                  >
                    <Plus size={12} /> Link Ekle
                  </button>
                </div>

                {isAddingLink && (
                  <form onSubmit={addLink} className="p-2.5 rounded-xl bg-[#18110a] border border-amber-700/40 flex flex-col gap-2">
                    <input
                      type="text"
                      aria-label="Link başlığı"
                      placeholder="Link başlığı (Örn: Wowhead Rotası)..."
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      className="bg-[#100b06] border border-amber-900/50 rounded-lg px-2.5 py-1 text-xs text-amber-100 outline-none"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        aria-label="Link adresi"
                        placeholder="https://..."
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        className="flex-1 bg-[#100b06] border border-amber-900/50 rounded-lg px-2.5 py-1 text-xs text-amber-100 outline-none"
                      />
                      <button type="submit" className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold">
                        Kaydet
                      </button>
                    </div>
                  </form>
                )}

                <ul className="flex flex-col gap-2 max-h-48 overflow-y-auto pr-1 list-none p-0 m-0">
                  {activeNote.links.map((link) => (
                    <li
                      key={link.id}
                      className="p-2.5 rounded-xl bg-[#160f08] border border-amber-900/30 hover:border-amber-500/40 flex items-center justify-between gap-2 group/link"
                    >
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 min-w-0 flex-1 hover:text-amber-300 transition-colors"
                      >
                        <ExternalLink size={14} className="text-amber-400 shrink-0" />
                        <span className="text-xs text-amber-100 font-semibold truncate underline underline-offset-2">
                          {link.title}
                        </span>
                      </a>
                      <button
                        type="button"
                        onClick={() => updateActive({ links: activeNote.links.filter((l) => l.id !== link.id) })}
                        aria-label={`${link.title} bağlantısını sil`}
                        className="opacity-0 group-hover/link:opacity-100 focus:opacity-100 p-1 text-slate-500 hover:text-red-400 transition-opacity shrink-0"
                      >
                        <Trash2 size={12} />
                      </button>
                    </li>
                  ))}
                  {activeNote.links.length === 0 && (
                    <li className="text-center py-4 text-[11px] text-amber-900/80 font-mono">Kayıtlı bağlantı yok.</li>
                  )}
                </ul>
              </section>
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
