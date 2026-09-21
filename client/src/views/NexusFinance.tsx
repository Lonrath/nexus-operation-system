import { Fragment, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Wallet, Plus, Trash2, ArrowLeft, Shield, CreditCard, TrendingUp,
  DollarSign, Edit2, Layers, X, Split, ChevronDown, ChevronRight,
  ChevronLeft, Eye, EyeOff, Sliders, Info,
} from 'lucide-react';
import type {
  ExpenseRow, ExpenseGroupType, InvestmentAsset, CreditCardMeta, YearFinancialData,
} from '../types';
import { MONTH_NAMES } from '../lib/dates';
import { STORAGE_KEYS, loadJSON, saveJSON, newId } from '../lib/storage';
import { LiveClock } from '../components/LiveClock';
import { Modal } from '../components/Shell';

const GROUP_LABELS: Record<ExpenseGroupType, { label: string; color: string }> = {
  fatura: { label: 'Sabit Faturalar & Abonelikler', color: 'text-sky-400 border-sky-500/30 bg-sky-950/20' },
  yasam: { label: 'Yaşam, Market & Bakım', color: 'text-amber-400 border-amber-500/30 bg-amber-950/20' },
  kredi: { label: 'Kredi Kartları & Krediler', color: 'text-purple-400 border-purple-500/30 bg-purple-950/20' },
};

const GROUPS: ExpenseGroupType[] = ['fatura', 'yasam', 'kredi'];

// ==========================================================================
// TOHUM VERİ
//
// Eski dosyada üç satırın paidStatus dizisi 12 yerine 11 elemanlıydı
// (Youtube, Yemek ve Market, KYK) — yani Aralık ayı `undefined` idi.
// Artık normalizeRow() her satırı 12'ye tamamlıyor, ama tohum veri de
// düzeltildi.
// ==========================================================================
const INITIAL_EXPENSE_ROWS_2026: ExpenseRow[] = [
  { id: 'exp-1', name: 'Doğal Gaz', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [1561, 2801, 2197, 1470, 1758, 721, 457, 206, 0, 0, 2500, 2500], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-2', name: 'Elektrik', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [980, 0, 1275, 1290, 1220, 1100, 1255, 1005, 0, 0, 1500, 1500], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-3', name: 'Su', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [449.89, 328.11, 478.4, 545.64, 457.2, 875.36, 777.46, 726.08, 0, 0, 600, 600], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-4', name: 'İnternet', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [524, 524, 524, 524, 524, 524, 611.1, 624, 0, 725, 624, 624], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-5', name: 'Telefon', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [255.5, 282.5, 261, 261, 0, 261, 261, 261, 0, 0, 261, 261], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-10', name: 'Amazon Prime', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [70, 70, 70, 70, 69.9, 69.9, 69.9, 70, 0, 0, 70, 70], paidStatus: [true, true, true, true, true, true, true, true, false, false, false, false] },
  { id: 'exp-11', name: 'Youtube', group: 'fatura', creditCardTargetName: 'Garanti', monthlyValues: [160, 160, 160, 160, 160, 160, 160, 0, 0, 0, 250, 250], paidStatus: [true, true, true, true, true, true, true, false, false, false, false, false] },
  { id: 'exp-6', name: 'Berber', group: 'yasam', creditCardTargetName: 'Garanti', monthlyValues: [800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800, 800], paidStatus: [true, true, true, true, true, true, true, true, true, false, false, false] },
  { id: 'exp-7', name: 'Aidat', group: 'yasam', creditCardTargetName: 'Garanti', monthlyValues: [600, 1000, 600, 800, 800, 800, 800, 800, 800, 800, 800, 800], paidStatus: [true, true, true, true, true, true, true, true, true, false, false, false] },
  { id: 'exp-8', name: 'Yemek ve Market', group: 'yasam', creditCardTargetName: 'Garanti', monthlyValues: [10000, 10000, 10000, 10000, 10000, 10000, 10000, 0, 0, 0, 10000, 10000], paidStatus: [true, true, true, true, true, true, true, false, false, false, false, false] },
  { id: 'exp-9', name: 'Kedi Maması', group: 'yasam', creditCardTargetName: 'Garanti', monthlyValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1332, 1998], paidStatus: Array(12).fill(false) },
  { id: 'exp-13', name: 'Ulaşım', group: 'yasam', creditCardTargetName: 'Garanti', monthlyValues: [350, 0, 450, 450, 450, 450, 0, 0, 0, 450, 450, 450], paidStatus: [true, false, true, true, true, true, false, false, false, false, false, false] },
  { id: 'exp-14', name: 'Garanti', group: 'kredi', isCreditCardTarget: true, monthlyValues: [43248.42, 23325.95, 40117.45, 40085.78, 32004.2, 36373.9, 37696.24, 34778.15, 31184.98, 8577.8, 4206.26, 2474.65], paidStatus: [true, true, true, true, true, true, true, true, true, false, false, false] },
  { id: 'exp-15', name: 'İş Bankası', group: 'kredi', isCreditCardTarget: true, monthlyValues: [3715.71, 3715.72, 1452, 1452.01, 837.68, 837.68, 837.68, 0, 0, 0, 0, 0], paidStatus: [true, true, true, true, true, true, true, false, false, false, false, false] },
  { id: 'exp-16', name: 'YapıKredi', group: 'kredi', isCreditCardTarget: true, monthlyValues: [0, 0, 0, 0, 6752.89, 5552.94, 7765.98, 18442.74, 28360.31, 34339.39, 18824.16, 15592.2], paidStatus: [false, false, false, false, true, true, true, true, true, false, false, false] },
  { id: 'exp-12', name: 'Main Kredi Kartı YapıKredi', group: 'kredi', isCreditCardTarget: true, monthlyValues: [0, 0, 0, 0, 0, 0, 0, 0, 0, 15127.87, 0, 0], paidStatus: Array(12).fill(false) },
  { id: 'exp-17', name: 'KYK', group: 'kredi', creditCardTargetName: 'Garanti', monthlyValues: [550, 550, 550, 550, 550, 0, 0, 0, 0, 0, 650, 650], paidStatus: [true, true, true, true, true, false, false, false, false, false, false, false] },
];

const INITIAL_CARDS: CreditCardMeta[] = [
  { name: 'Garanti', limit: 80000, cutoffDay: 18, dueDay: 28 },
  { name: 'YapıKredi', limit: 60000, cutoffDay: 10, dueDay: 20 },
  { name: 'İş Bankası', limit: 40000, cutoffDay: 5, dueDay: 15 },
];

/** Her satırın iki dizisini de 12 aya tamamlar. Bozuk yedeklere karşı sigorta. */
function normalizeRow(row: ExpenseRow): ExpenseRow {
  const monthlyValues = Array.from({ length: 12 }, (_, i) => Number(row.monthlyValues?.[i]) || 0);
  const paidStatus = Array.from({ length: 12 }, (_, i) => Boolean(row.paidStatus?.[i]));
  return { ...row, monthlyValues, paidStatus };
}

function normalizeYear(data: YearFinancialData): YearFinancialData {
  return {
    expenseRows: (data.expenseRows ?? []).map(normalizeRow),
    incomes: Array.from({ length: 12 }, (_, i) => Number(data.incomes?.[i]) || 0),
    previousAmounts: Array.from({ length: 12 }, (_, i) => Number(data.previousAmounts?.[i]) || 0),
  };
}

function emptyYear(template: ExpenseRow[]): YearFinancialData {
  return {
    expenseRows: template.map((r) => ({
      ...r,
      monthlyValues: Array(12).fill(0),
      paidStatus: Array(12).fill(false),
    })),
    incomes: Array(12).fill(0),
    previousAmounts: Array(12).fill(0),
  };
}

type ValueEdit =
  | { kind: 'cell'; rowId: string; monthIndex: number; label: string }
  | { kind: 'income'; monthIndex: number; label: string }
  | { kind: 'previous'; monthIndex: number; label: string }
  | { kind: 'rename'; rowId: string; label: string };

export function NexusFinance({
  onBackToHub,
  onLaunchOS,
  notify,
}: {
  onBackToHub?: () => void;
  onLaunchOS?: () => void;
  notify: (text: string, tone?: 'error' | 'success') => void;
}) {
  const realNow = useMemo(() => new Date(), []);
  const [selectedYear, setSelectedYear] = useState(realNow.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(realNow.getMonth());

  const [multiYearData, setMultiYearData] = useState<Record<number, YearFinancialData>>(() => {
    const saved = loadJSON<Record<number, YearFinancialData>>(STORAGE_KEYS.financeMultiYear, {});
    if (Object.keys(saved).length > 0) {
      const out: Record<number, YearFinancialData> = {};
      for (const [y, d] of Object.entries(saved)) out[Number(y)] = normalizeYear(d);
      return out;
    }
    return {
      2026: normalizeYear({
        expenseRows: INITIAL_EXPENSE_ROWS_2026,
        incomes: [44000, 35000, 35000, 43000, 43000, 42000, 45200, 60000, 56750, 56750, 56750, 56750],
        previousAmounts: [12000, 0, 15000, 0, 0, 2800, 4475, 330, 6460, 6800, 0, 13882.58],
      }),
    };
  });

  const [investments, setInvestments] = useState<InvestmentAsset[]>(() =>
    loadJSON(STORAGE_KEYS.financeInvestments, [
      { id: 'inv-1', name: 'Fiziki Altın & Ziynet', type: 'Altın', amount: 145000, note: 'Gram & Çeyrek birikimi' },
      { id: 'inv-2', name: 'BIST 100 / Teknoloji Portföyü', type: 'Borsa/Hisse', amount: 88500, note: 'Uzun vadeli hisseler' },
      { id: 'inv-3', name: 'Eurobond & Para Piyasası Fonu', type: 'Fon/Mevduat', amount: 62000, note: 'Likidite fonu' },
    ] as InvestmentAsset[])
  );

  const [cards] = useState<CreditCardMeta[]>(() =>
    loadJSON(STORAGE_KEYS.financeCards, INITIAL_CARDS)
  );

  const [collapsedGroups, setCollapsedGroups] = useState<Record<ExpenseGroupType, boolean>>({
    fatura: false, yasam: false, kredi: false,
  });
  const [hidePaidOnly, setHidePaidOnly] = useState(false);
  const [viewScope, setViewScope] = useState<'all' | 'q1' | 'q2' | 'q3' | 'q4' | 'single'>('all');

  const [valueEdit, setValueEdit] = useState<ValueEdit | null>(null);
  const [editValue, setEditValue] = useState('');
  const [installment, setInstallment] = useState<{ rowId: string; monthIndex: number; totalAmount: number } | null>(null);
  const [installmentCount, setInstallmentCount] = useState(3);
  const [isAddingRow, setIsAddingRow] = useState(false);
  const [newRowName, setNewRowName] = useState('');
  const [newRowGroup, setNewRowGroup] = useState<ExpenseGroupType>('fatura');
  const [newRowIsCard, setNewRowIsCard] = useState(false);
  const [newRowTargetCard, setNewRowTargetCard] = useState('');
  const [portfolioOpen, setPortfolioOpen] = useState(false);
  const [cardsOpen, setCardsOpen] = useState(false);
  const [pendingRowDelete, setPendingRowDelete] = useState<ExpenseRow | null>(null);

  const [newInv, setNewInv] = useState({ name: '', type: 'Altın' as InvestmentAsset['type'], amount: 10000 });

  const currentYearData = useMemo(
    () => multiYearData[selectedYear] ?? emptyYear(INITIAL_EXPENSE_ROWS_2026),
    [multiYearData, selectedYear]
  );
  const { expenseRows, incomes, previousAmounts } = currentYearData;

  // Kaydetme efektleri ayrı; birini değiştirmek diğerlerini yeniden yazmıyor.
  useEffect(() => { saveJSON(STORAGE_KEYS.financeMultiYear, multiYearData); }, [multiYearData]);
  useEffect(() => { saveJSON(STORAGE_KEYS.financeInvestments, investments); }, [investments]);
  useEffect(() => { saveJSON(STORAGE_KEYS.financeCards, cards); }, [cards]);

  /**
   * Eski sürümde bu fonksiyon `prev` yerine render sırasında yakalanmış
   * `currentYearData`'yı kullanıyordu; aynı tick'te iki güncelleme
   * yapıldığında ikincisi birincisini eziyordu.
   */
  const updateYear = useCallback((updater: (prev: YearFinancialData) => YearFinancialData) => {
    setMultiYearData((prev) => {
      const base = prev[selectedYear] ?? emptyYear(INITIAL_EXPENSE_ROWS_2026);
      return { ...prev, [selectedYear]: updater(base) };
    });
  }, [selectedYear]);

  // ======================================================================
  // HESAPLAMALAR
  //
  // Eski sürümde bir kalemi "ödendi" yapmak, tutarını kart satırının
  // monthlyValues'ine EKLİYORDU. Ama getMonthTotalExpense hem kalemi hem
  // kart satırını topluyordu; yani her ödenen kalem ay toplamına iki kez
  // giriyordu ve bakiyeyi aynı miktarda düşürüyordu.
  //
  // Çözüm: kart satırına yazma kaldırıldı ve toplamlar ayrıştırıldı.
  //   • Harcama       = kart ekstresi OLMAYAN satırlar (ne tükettiğin)
  //   • Kart Ekstresi = kart satırları (bankaya ödediğin)
  //   • Nakit Çıkışı  = kart ekstreleri + karta yazılmayan (nakit) kalemler
  // Bakiye artık Nakit Çıkışı'ndan hesaplanıyor, çift sayım yok.
  // ======================================================================

  const sumWhere = useCallback(
    (m: number, pred: (r: ExpenseRow) => boolean) =>
      expenseRows.reduce((s, r) => (pred(r) ? s + (Number(r.monthlyValues[m]) || 0) : s), 0),
    [expenseRows]
  );

  const monthSpend = useCallback((m: number) => sumWhere(m, (r) => !r.isCreditCardTarget), [sumWhere]);
  const monthCardDebt = useCallback((m: number) => sumWhere(m, (r) => !!r.isCreditCardTarget), [sumWhere]);
  const monthCashOut = useCallback(
    (m: number) => sumWhere(m, (r) => !!r.isCreditCardTarget || !r.creditCardTargetName),
    [sumWhere]
  );
  const monthBalance = useCallback(
    (m: number) => (Number(incomes[m]) || 0) + (Number(previousAmounts[m]) || 0) - monthCashOut(m),
    [incomes, previousAmounts, monthCashOut]
  );

  /** Bir kartın o aydaki ekstresi: kart satırı + o karta yazılan kalemler. */
  const cardStatement = useCallback((cardName: string, m: number) => {
    const key = cardName.toLocaleLowerCase('tr');
    const own = expenseRows.find(
      (r) => r.isCreditCardTarget && r.name.toLocaleLowerCase('tr') === key
    );
    const charged = expenseRows.reduce(
      (s, r) =>
        !r.isCreditCardTarget && (r.creditCardTargetName || '').toLocaleLowerCase('tr') === key
          ? s + (Number(r.monthlyValues[m]) || 0)
          : s,
      0
    );
    return (own ? Number(own.monthlyValues[m]) || 0 : 0) + charged;
  }, [expenseRows]);

  const visibleMonths = useMemo(() => {
    switch (viewScope) {
      case 'q1': return [0, 1, 2];
      case 'q2': return [3, 4, 5];
      case 'q3': return [6, 7, 8];
      case 'q4': return [9, 10, 11];
      case 'single': return [selectedMonth];
      default: return Array.from({ length: 12 }, (_, i) => i);
    }
  }, [viewScope, selectedMonth]);

  const totalInvestment = useMemo(
    () => investments.reduce((s, i) => s + (i.amount || 0), 0),
    [investments]
  );

  const cardNames = useMemo(
    () => expenseRows.filter((r) => r.isCreditCardTarget).map((r) => r.name),
    [expenseRows]
  );

  // ======================================================================
  // AKSİYONLAR
  // ======================================================================

  /** Tek tıklama artık sadece "ödendi" işaretini değiştirir. */
  const togglePaid = useCallback((rowId: string, m: number) => {
    updateYear((prev) => ({
      ...prev,
      expenseRows: prev.expenseRows.map((r) => {
        if (r.id !== rowId) return r;
        const next = [...r.paidStatus];
        next[m] = !next[m];
        return { ...r, paidStatus: next };
      }),
    }));
  }, [updateYear]);

  const commitValueEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valueEdit) return;

    if (valueEdit.kind === 'rename') {
      const name = editValue.trim();
      if (!name) { notify('Kalem adı boş olamaz.'); return; }
      updateYear((prev) => ({
        ...prev,
        expenseRows: prev.expenseRows.map((r) => (r.id === valueEdit.rowId ? { ...r, name } : r)),
      }));
      setValueEdit(null);
      return;
    }

    const parsed = parseFloat(editValue.replace(/\s/g, '').replace(',', '.'));
    if (Number.isNaN(parsed)) { notify('Geçerli bir sayı girin.'); return; }
    const val = Math.round(parsed * 100) / 100;

    updateYear((prev) => {
      if (valueEdit.kind === 'cell') {
        return {
          ...prev,
          expenseRows: prev.expenseRows.map((r) => {
            if (r.id !== valueEdit.rowId) return r;
            const next = [...r.monthlyValues];
            next[valueEdit.monthIndex] = val;
            return { ...r, monthlyValues: next };
          }),
        };
      }
      if (valueEdit.kind === 'income') {
        const next = [...prev.incomes];
        next[valueEdit.monthIndex] = val;
        return { ...prev, incomes: next };
      }
      const next = [...prev.previousAmounts];
      next[valueEdit.monthIndex] = val;
      return { ...prev, previousAmounts: next };
    });
    setValueEdit(null);
  };

  /** Taksitleri yıl sınırını aşarak dağıtır. Artık SADECE id ile eşleşir. */
  const applyInstallments = (e: React.FormEvent) => {
    e.preventDefault();
    if (!installment) return;
    const count = Math.max(1, installmentCount);
    const slice = Math.round((installment.totalAmount / count) * 100) / 100;
    const template = currentYearData.expenseRows;

    setMultiYearData((prev) => {
      const next = { ...prev };
      let year = selectedYear;
      let month = installment.monthIndex;
      let applied = false;

      for (let i = 0; i < count; i++) {
        if (month >= 12) { year += 1; month = 0; }
        if (!next[year]) next[year] = emptyYear(template);

        // Eski kod `row.id === rowId || row.name === <ad>` ile eşleşiyordu;
        // aynı isimli birden fazla satır varsa taksit her birine yazılıyordu.
        const rows = next[year].expenseRows.map((r) => {
          if (r.id !== installment.rowId) return r;
          applied = true;
          const vals = [...r.monthlyValues];
          vals[month] = (vals[month] || 0) + slice;
          return { ...r, monthlyValues: vals };
        });

        next[year] = { ...next[year], expenseRows: rows };
        month++;
      }

      if (!applied) notify('Taksit uygulanacak kalem bulunamadı.');
      return next;
    });

    setInstallment(null);
    notify(`${count} taksit uygulandı.`, 'success');
  };

  const switchYear = (target: number) => {
    setMultiYearData((prev) => {
      if (prev[target]) return prev;
      const previousYear = prev[target - 1];
      let carry = 0;
      if (previousYear) {
        const decCashOut = previousYear.expenseRows.reduce(
          (s, r) => (r.isCreditCardTarget || !r.creditCardTargetName ? s + (r.monthlyValues[11] || 0) : s),
          0
        );
        carry = (previousYear.incomes[11] || 0) + (previousYear.previousAmounts[11] || 0) - decCashOut;
      }
      const fresh = emptyYear((prev[selectedYear] ?? { expenseRows: INITIAL_EXPENSE_ROWS_2026 } as YearFinancialData).expenseRows);
      fresh.previousAmounts = [Math.max(0, carry), ...Array(11).fill(0)];
      return { ...prev, [target]: fresh };
    });
    setSelectedYear(target);
  };

  const addRow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRowName.trim()) return;
    const row: ExpenseRow = {
      id: newId('row'),
      name: newRowName.trim(),
      group: newRowGroup,
      isCreditCardTarget: newRowIsCard,
      creditCardTargetName: newRowIsCard ? undefined : (newRowTargetCard || undefined),
      monthlyValues: Array(12).fill(0),
      paidStatus: Array(12).fill(false),
    };
    updateYear((prev) => ({ ...prev, expenseRows: [...prev.expenseRows, row] }));
    setNewRowName('');
    setNewRowIsCard(false);
    setIsAddingRow(false);
    notify('Kalem eklendi.', 'success');
  };

  const addInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInv.name.trim()) return;
    setInvestments((prev) => [
      ...prev,
      { id: newId('inv'), name: newInv.name.trim(), type: newInv.type, amount: Math.max(0, newInv.amount) },
    ]);
    setNewInv({ name: '', type: 'Altın', amount: 10000 });
  };

  const isRealMonth = (m: number) => m === realNow.getMonth() && selectedYear === realNow.getFullYear();

  return (
    <main className="flex-1 flex flex-col h-screen overflow-hidden bg-[#070b12] text-slate-100 p-6 font-sans">
      {/* ÜST BAR */}
      <div className="flex items-center justify-between pb-4 border-b border-amber-500/25 shrink-0 mb-4 gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          {onBackToHub && (
            <button type="button" onClick={onBackToHub} className="p-2.5 rounded-2xl bg-[#0f1422] border border-slate-800 hover:border-amber-500/50 text-slate-300 hover:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all">
              <ArrowLeft size={16} /> Hub'a Dön
            </button>
          )}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-600 to-cyan-700 p-[1.5px] flex items-center justify-center">
              <div className="w-full h-full bg-[#080c14] rounded-2xl flex items-center justify-center">
                <Wallet className="text-emerald-400" size={24} />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-black uppercase bg-gradient-to-r from-emerald-300 to-teal-100 bg-clip-text text-transparent">
                  NEXUS FINANCE
                </h1>
                <span className="text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-600/40 px-2 py-0.5 rounded">
                  Çok Yıllı Bütçe Matrisi
                </span>
              </div>
              <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5 font-mono">
                <LiveClock className="text-emerald-400 font-bold" />
                <span>•</span>
                <span>Tek tık: ödendi işaretle · Çift tık: tutarı düzenle</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="flex items-center bg-[#0d1420] border border-emerald-500/40 rounded-xl p-1">
            <button type="button" onClick={() => switchYear(selectedYear - 1)} aria-label="Önceki yıl" className="p-1.5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <span className="px-3 font-mono font-black text-sm text-emerald-300">{selectedYear}</span>
            <button type="button" onClick={() => switchYear(selectedYear + 1)} aria-label="Sonraki yıl" className="p-1.5 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-300 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex bg-[#0f1422] border border-slate-800 rounded-xl p-1 text-xs font-mono">
            {(['all', 'q1', 'q2', 'q3', 'q4', 'single'] as const).map((sc) => (
              <button
                key={sc}
                type="button"
                onClick={() => setViewScope(sc)}
                aria-pressed={viewScope === sc}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  viewScope === sc ? 'bg-emerald-500 text-black' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sc === 'all' ? '12 Ay' : sc === 'single' ? 'Tek Ay' : sc.toUpperCase()}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setHidePaidOnly((v) => !v)}
            aria-pressed={hidePaidOnly}
            title="Ödenmiş harcamaları gizler"
            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${
              hidePaidOnly ? 'bg-amber-950/80 border-amber-500 text-amber-300' : 'bg-[#0f1422] border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {hidePaidOnly ? <EyeOff size={14} /> : <Eye size={14} />}
            <span>{hidePaidOnly ? 'Sadece Bekleyenler' : 'Tümü'}</span>
          </button>

          <button type="button" onClick={() => setCardsOpen(true)} className="px-3 py-1.5 rounded-xl bg-[#0f1422] hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5">
            <Sliders size={14} className="text-amber-400" /> Kartlar
          </button>

          <button type="button" onClick={() => setPortfolioOpen(true)} className="px-3 py-1.5 rounded-xl bg-[#0f1922] text-teal-300 border border-teal-500/40 text-xs font-bold flex items-center gap-1.5">
            <TrendingUp size={15} /> Portföy ({totalInvestment.toLocaleString('tr-TR')} ₺)
          </button>

          <button type="button" onClick={() => setIsAddingRow(true)} className="px-3.5 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase flex items-center gap-1.5">
            <Plus size={15} className="stroke-[3]" /> Kalem Ekle
          </button>

          {onLaunchOS && (
            <button type="button" onClick={onLaunchOS} className="px-3 py-1.5 rounded-xl bg-[#0f1422] text-slate-300 border border-slate-800 text-xs font-bold flex items-center gap-1.5">
              <Shield size={14} className="text-amber-400" /> OS
            </button>
          )}
        </div>
      </div>

      {/* RADAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3 shrink-0 font-mono">
        <div className="p-3 rounded-2xl bg-[#0b131e] border border-emerald-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">Portföy + Aylık Gelir</span>
            <span className="text-base font-black text-emerald-300">
              {(totalInvestment + (incomes[selectedMonth] || 0)).toLocaleString('tr-TR')} ₺
            </span>
          </div>
          <DollarSign className="text-emerald-400/60" size={22} />
        </div>

        <div className="p-3 rounded-2xl bg-[#0b131e] border border-cyan-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">{MONTH_NAMES[selectedMonth]} Harcama</span>
            <span className="text-base font-black text-cyan-300">
              {monthSpend(selectedMonth).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
            </span>
          </div>
          <Layers className="text-cyan-400/60" size={22} />
        </div>

        <div className="p-3 rounded-2xl bg-[#0b131e] border border-amber-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">{MONTH_NAMES[selectedMonth]} Kart Borcu</span>
            <span className="text-base font-black text-amber-300">
              {monthCardDebt(selectedMonth).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
            </span>
          </div>
          <CreditCard className="text-amber-400/60" size={22} />
        </div>

        <div className="p-3 rounded-2xl bg-[#0b131e] border border-teal-500/30 flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase text-slate-400 font-bold block">{MONTH_NAMES[selectedMonth]} Kalan Bakiye</span>
            <span className={`text-base font-black ${monthBalance(selectedMonth) >= 0 ? 'text-teal-300' : 'text-red-400'}`}>
              {monthBalance(selectedMonth).toLocaleString('tr-TR', { maximumFractionDigits: 2 })} ₺
            </span>
          </div>
          <TrendingUp className="text-teal-400/60" size={22} />
        </div>
      </div>

      <p className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mb-2 shrink-0">
        <Info size={12} className="text-slate-500 shrink-0" />
        <span>
          <b className="text-slate-400">Harcama</b> = kart ekstresi olmayan kalemler ·{' '}
          <b className="text-slate-400">Nakit Çıkışı</b> = kart ekstreleri + nakit ödenen kalemler.
          Bakiye çift sayım olmaması için Nakit Çıkışı'ndan hesaplanır.
        </span>
      </p>

      {/* TABLO */}
      <div className="flex-1 overflow-auto border-2 border-[#1e293b] rounded-3xl bg-[#0a0f18] shadow-2xl relative">
        <table className="w-full border-collapse text-xs font-mono">
          <caption className="sr-only">{selectedYear} yılı aylık gider matrisi</caption>
          <thead className="sticky top-0 z-30 bg-[#ffd700] text-black">
            <tr>
              <th scope="col" className="p-2.5 text-left font-black tracking-wider uppercase border-r-2 border-b-2 border-black w-64 bg-[#facc15] sticky left-0 z-40">
                Harcama Kalemi ({selectedYear})
              </th>
              {visibleMonths.map((m) => (
                <th
                  key={m}
                  scope="col"
                  onClick={() => setSelectedMonth(m)}
                  className={`p-2 text-center font-extrabold border-r border-b-2 border-black min-w-[96px] cursor-pointer relative hover:bg-yellow-300 transition-colors ${
                    m === selectedMonth ? 'bg-amber-300 font-black' : ''
                  }`}
                >
                  {isRealMonth(m) && <span className="absolute top-0 left-0 right-0 h-1.5 bg-red-600" title="Şu Anki Ay" />}
                  <span>{MONTH_NAMES[m]}</span>
                </th>
              ))}
              <th scope="col" className="p-2 text-center font-black border-b-2 border-black bg-[#facc15] w-16">İşlem</th>
            </tr>
          </thead>

          <tbody>
            {GROUPS.map((grp) => {
              const rows = expenseRows.filter((r) => r.group === grp);
              const collapsed = collapsedGroups[grp];
              const total = rows.reduce((s, r) => s + (r.monthlyValues[selectedMonth] || 0), 0);
              const unpaid = rows.reduce(
                (s, r) => (!r.paidStatus[selectedMonth] ? s + (r.monthlyValues[selectedMonth] || 0) : s),
                0
              );

              return (
                <Fragment key={grp}>
                  <tr className="border-t-2 border-b border-slate-700/80">
                    <td colSpan={visibleMonths.length + 2} className="p-0">
                      <button
                        type="button"
                        onClick={() => setCollapsedGroups((p) => ({ ...p, [grp]: !p[grp] }))}
                        aria-expanded={!collapsed}
                        className={`w-full p-2 font-black uppercase text-[11px] flex items-center justify-between border-l-4 hover:bg-slate-800/60 transition-colors ${GROUP_LABELS[grp].color}`}
                      >
                        <span className="flex items-center gap-2">
                          {collapsed ? <ChevronRight size={15} /> : <ChevronDown size={15} />}
                          <span>{GROUP_LABELS[grp].label} ({rows.length})</span>
                        </span>
                        <span className="text-[10px] font-mono text-slate-300 font-semibold normal-case">
                          {MONTH_NAMES[selectedMonth]}: <b>{total.toLocaleString('tr-TR')} ₺</b>{' '}
                          ({unpaid > 0 ? `${unpaid.toLocaleString('tr-TR')} ₺ bekliyor` : 'tamamı ödendi'})
                        </span>
                      </button>
                    </td>
                  </tr>

                  {!collapsed && rows.map((row) => {
                    if (hidePaidOnly && row.paidStatus[selectedMonth] && (row.monthlyValues[selectedMonth] || 0) > 0) {
                      return null;
                    }
                    return (
                      <tr key={row.id} className="border-b border-[#1e293b] hover:bg-[#131d2e] transition-colors group">
                        <th scope="row" className="p-2 border-r border-[#1e293b] font-bold bg-[#0284c7] text-white sticky left-0 z-20 text-left">
                          <span className="flex items-center justify-between gap-1">
                            <span className="flex items-center gap-1.5 truncate">
                              {row.isCreditCardTarget && <CreditCard size={13} className="text-amber-300 shrink-0" />}
                              <span className="truncate">{row.name}</span>
                              {!row.isCreditCardTarget && row.creditCardTargetName && (
                                <span className="text-[9px] font-normal text-sky-100/70 shrink-0">→ {row.creditCardTargetName}</span>
                              )}
                            </span>
                            <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                              {!row.isCreditCardTarget && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const val = row.monthlyValues[selectedMonth] || 0;
                                    if (val <= 0) { notify('Önce bu aya bir tutar girin.'); return; }
                                    setInstallment({ rowId: row.id, monthIndex: selectedMonth, totalAmount: val });
                                  }}
                                  title="Taksitlendir"
                                  aria-label={`${row.name} taksitlendir`}
                                  className="p-1 text-amber-200 hover:text-white"
                                >
                                  <Split size={11} />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setValueEdit({ kind: 'rename', rowId: row.id, label: 'Kalem adını düzenle' });
                                  setEditValue(row.name);
                                }}
                                aria-label={`${row.name} adını düzenle`}
                                className="p-1 text-sky-200 hover:text-white"
                              >
                                <Edit2 size={11} />
                              </button>
                            </span>
                          </span>
                        </th>

                        {visibleMonths.map((m) => {
                          const val = row.monthlyValues[m] || 0;
                          const paid = row.paidStatus[m];
                          const future = m > realNow.getMonth() && selectedYear === realNow.getFullYear();
                          return (
                            <td
                              key={m}
                              onClick={() => togglePaid(row.id, m)}
                              onDoubleClick={(e) => {
                                e.stopPropagation();
                                setValueEdit({ kind: 'cell', rowId: row.id, monthIndex: m, label: `${row.name} — ${MONTH_NAMES[m]}` });
                                setEditValue(val ? String(val) : '');
                              }}
                              title={`${paid ? 'Ödendi' : 'Bekliyor'} — çift tıkla tutarı düzenle`}
                              className={`p-2 text-right border-r border-[#1e293b] cursor-pointer font-mono font-bold transition-all ${
                                paid ? 'bg-[#84cc16] text-black font-extrabold'
                                  : future ? 'bg-[#1e293b]/70 text-slate-400 hover:bg-[#334155]'
                                  : 'bg-[#0f172a] text-slate-200 hover:bg-[#1e293b]'
                              } ${m === selectedMonth ? 'ring-1 ring-inset ring-amber-400/60' : ''}`}
                            >
                              {val > 0 ? val.toLocaleString('tr-TR', { maximumFractionDigits: 2 }) : '0'}
                            </td>
                          );
                        })}

                        <td className="p-2 text-center border-r border-[#1e293b]">
                          <button
                            type="button"
                            onClick={() => setPendingRowDelete(row)}
                            aria-label={`${row.name} kalemini sil`}
                            className="p-1 text-slate-600 hover:text-red-400 rounded"
                          >
                            <Trash2 size={13} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </Fragment>
              );
            })}

            {/* ÖZET SATIRLARI */}
            <tr className="bg-[#1e293b] text-cyan-200 font-bold border-t-2 border-black">
              <th scope="row" className="p-2 uppercase bg-[#0f172a] border-r border-black sticky left-0 z-20 text-left">
                Harcama (Kalemler)
              </th>
              {visibleMonths.map((m) => (
                <td key={m} className="p-2 text-right border-r border-slate-700">
                  {monthSpend(m).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </td>
              ))}
              <td className="bg-[#0f172a]" />
            </tr>

            <tr className="bg-[#facc15] text-black font-extrabold border-b-2 border-black sticky bottom-28 z-20">
              <th scope="row" className="p-2 font-black uppercase tracking-wider bg-[#eab308] border-r border-black sticky left-0 z-20 text-left">
                Nakit Çıkışı
              </th>
              {visibleMonths.map((m) => (
                <td key={m} className="p-2 text-right font-black border-r border-black">
                  {monthCashOut(m).toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                </td>
              ))}
              <td className="bg-[#eab308]" />
            </tr>

            <tr className="bg-[#0f172a] text-slate-100 font-bold border-b border-slate-700 sticky bottom-20 z-20">
              <th scope="row" className="p-2 uppercase bg-[#1e293b] border-r border-slate-700 text-emerald-400 sticky left-0 z-20 text-left">
                Gelir
              </th>
              {visibleMonths.map((m) => (
                <td
                  key={m}
                  onDoubleClick={() => {
                    setValueEdit({ kind: 'income', monthIndex: m, label: `${MONTH_NAMES[m]} Geliri` });
                    setEditValue(String(incomes[m] ?? 0));
                  }}
                  title="Çift tıkla düzenle"
                  className="p-2 text-right border-r border-slate-700 text-emerald-300 cursor-pointer hover:bg-slate-800"
                >
                  {(incomes[m] || 0).toLocaleString('tr-TR')}
                </td>
              ))}
              <td />
            </tr>

            <tr className="bg-[#0f172a] text-slate-300 font-semibold border-b border-slate-700 sticky bottom-10 z-20">
              <th scope="row" className="p-2 uppercase bg-[#1e293b] border-r border-slate-700 sticky left-0 z-20 text-left">
                Önceki Dönemden
              </th>
              {visibleMonths.map((m) => (
                <td
                  key={m}
                  onDoubleClick={() => {
                    setValueEdit({ kind: 'previous', monthIndex: m, label: `${MONTH_NAMES[m]} Devir Tutarı` });
                    setEditValue(String(previousAmounts[m] ?? 0));
                  }}
                  title="Çift tıkla düzenle"
                  className="p-2 text-right border-r border-slate-700 cursor-pointer hover:bg-slate-800"
                >
                  {(previousAmounts[m] || 0).toLocaleString('tr-TR')}
                </td>
              ))}
              <td />
            </tr>

            <tr className="bg-[#15803d] text-white font-black border-t-2 border-b-2 border-black sticky bottom-0 z-20">
              <th scope="row" className="p-2 uppercase tracking-wider bg-[#166534] border-r border-black sticky left-0 z-20 text-left">
                Artan
              </th>
              {visibleMonths.map((m) => {
                const b = monthBalance(m);
                return (
                  <td key={m} className={`p-2 text-right font-black border-r border-black ${b >= 0 ? 'text-white' : 'text-red-300'}`}>
                    {b.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                  </td>
                );
              })}
              <td className="bg-[#166534]" />
            </tr>
          </tbody>
        </table>
      </div>

      {/* MODALLAR */}
      {valueEdit && (
        <Modal onClose={() => setValueEdit(null)} maxWidth="max-w-sm">
          <h3 className="text-base font-extrabold text-slate-100 mb-1 pr-8">
            {valueEdit.kind === 'rename' ? 'Kalem Adı' : 'Tutar Güncelle'}
          </h3>
          <p className="text-xs text-slate-400 mb-4">{valueEdit.label}</p>
          <form onSubmit={commitValueEdit} className="flex flex-col gap-3">
            <input
              type="text"
              inputMode={valueEdit.kind === 'rename' ? 'text' : 'decimal'}
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              autoFocus
              aria-label={valueEdit.label}
              className="w-full bg-[#121826] border border-amber-500/50 rounded-xl px-3 py-2 text-sm text-amber-300 font-mono font-bold outline-none"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setValueEdit(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                İptal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-amber-500 text-black text-xs font-black">
                Kaydet
              </button>
            </div>
          </form>
        </Modal>
      )}

      {installment && (
        <Modal onClose={() => setInstallment(null)} maxWidth="max-w-sm" className="border-cyan-500/40">
          <div className="flex items-center gap-2 mb-2 pr-8">
            <Split className="text-cyan-400" size={20} />
            <h3 className="text-base font-extrabold text-slate-100">Harcamayı Taksitlendir</h3>
          </div>
          <p className="text-xs text-slate-400 mb-3">
            {installment.totalAmount.toLocaleString('tr-TR')} ₺ tutarını {MONTH_NAMES[installment.monthIndex]}{' '}
            {selectedYear} ayından itibaren kaç aya bölmek istiyorsunuz?
          </p>
          <form onSubmit={applyInstallments} className="flex flex-col gap-3.5">
            <select
              value={installmentCount}
              onChange={(e) => setInstallmentCount(Number(e.target.value))}
              aria-label="Taksit sayısı"
              className="w-full bg-[#121826] border border-cyan-500/50 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none"
            >
              {[2, 3, 4, 6, 9, 12].map((n) => (
                <option key={n} value={n}>
                  {n} Taksit (Aylık ~{(installment.totalAmount / n).toFixed(2)} ₺)
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setInstallment(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                İptal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-cyan-500 text-black text-xs font-black">
                Uygula
              </button>
            </div>
          </form>
        </Modal>
      )}

      {pendingRowDelete && (
        <Modal onClose={() => setPendingRowDelete(null)} maxWidth="max-w-sm" className="border-red-500/40">
          <h3 className="text-base font-extrabold text-slate-100 mb-2 pr-8">Kalemi Sil</h3>
          <p className="text-xs text-slate-400 mb-4">
            <b className="text-slate-200">{pendingRowDelete.name}</b> kalemi {selectedYear} yılından silinecek.
            Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setPendingRowDelete(null)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
              Vazgeç
            </button>
            <button
              type="button"
              onClick={() => {
                updateYear((prev) => ({
                  ...prev,
                  expenseRows: prev.expenseRows.filter((r) => r.id !== pendingRowDelete.id),
                }));
                setPendingRowDelete(null);
                notify('Kalem silindi.', 'success');
              }}
              className="px-5 py-2 rounded-xl bg-red-500 text-white text-xs font-black"
            >
              Sil
            </button>
          </div>
        </Modal>
      )}

      {isAddingRow && (
        <Modal onClose={() => setIsAddingRow(false)} maxWidth="max-w-md" className="border-emerald-500/40">
          <h3 className="text-base font-extrabold text-slate-100 mb-1 pr-8">Yeni Kalem Ekle</h3>
          <form onSubmit={addRow} className="flex flex-col gap-3.5 mt-3">
            <input
              type="text"
              placeholder="Kalem Adı..."
              value={newRowName}
              onChange={(e) => setNewRowName(e.target.value)}
              autoFocus
              aria-label="Kalem adı"
              className="w-full bg-[#121826] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
            />
            <div className="grid grid-cols-3 gap-2">
              {GROUPS.map((grp) => (
                <button
                  key={grp}
                  type="button"
                  onClick={() => setNewRowGroup(grp)}
                  aria-pressed={newRowGroup === grp}
                  className={`p-2 rounded-xl text-xs font-bold border transition-all ${
                    newRowGroup === grp ? 'bg-emerald-500 text-black border-emerald-400' : 'bg-[#121826] text-slate-400 border-slate-800'
                  }`}
                >
                  {grp === 'fatura' ? 'Fatura' : grp === 'yasam' ? 'Yaşam' : 'Kredi/Kart'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#121826] border border-slate-800">
              <input
                type="checkbox"
                id="isCard"
                checked={newRowIsCard}
                onChange={(e) => setNewRowIsCard(e.target.checked)}
                className="w-4 h-4 accent-emerald-500"
              />
              <label htmlFor="isCard" className="text-xs text-slate-300">
                Bu bir <b>Kredi Kartı ekstresi</b> satırıdır
              </label>
            </div>

            {!newRowIsCard && (
              <div>
                <label htmlFor="targetCard" className="text-[11px] font-bold text-slate-300 mb-1 block">
                  Hangi karta yansıyor? (boş = nakit ödeniyor)
                </label>
                <select
                  id="targetCard"
                  value={newRowTargetCard}
                  onChange={(e) => setNewRowTargetCard(e.target.value)}
                  className="w-full bg-[#121826] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
                >
                  <option value="">Nakit / Havale (karta yansımaz)</option>
                  {cardNames.map((n) => <option key={n} value={n}>{n}</option>)}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button type="button" onClick={() => setIsAddingRow(false)} className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold">
                İptal
              </button>
              <button type="submit" className="px-5 py-2 rounded-xl bg-emerald-500 text-black text-xs font-black">
                Ekle
              </button>
            </div>
          </form>
        </Modal>
      )}

      {cardsOpen && (
        <Modal onClose={() => setCardsOpen(false)} maxWidth="max-w-lg" className="flex flex-col max-h-[85vh]">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 mb-3 pr-8">
            <CreditCard className="text-amber-400" size={20} /> Kredi Kartı Limitleri — {MONTH_NAMES[selectedMonth]}
          </h3>
          <div className="flex flex-col gap-3 overflow-y-auto flex-1 font-mono">
            {cards.map((c) => {
              // Ekstre artık türetiliyor: kart satırı + o karta yazılan kalemler.
              const debt = cardStatement(c.name, selectedMonth);
              const rate = c.limit > 0 ? Math.min(100, Math.round((debt / c.limit) * 100)) : 0;
              return (
                <div key={c.name} className="p-3.5 rounded-2xl bg-[#111624] border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-100">
                      {c.name}
                      <span className="text-slate-500 font-normal ml-2">
                        kesim {c.cutoffDay} · son ödeme {c.dueDay}
                      </span>
                    </span>
                    <span className="text-amber-300">
                      {debt.toLocaleString('tr-TR', { maximumFractionDigits: 2 })} / {c.limit.toLocaleString('tr-TR')} ₺ (%{rate})
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full transition-all ${rate > 80 ? 'bg-red-500' : rate > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" onClick={() => setCardsOpen(false)} className="mt-3 w-full py-2 rounded-xl bg-amber-500 text-black font-bold text-xs uppercase">
            Tamam
          </button>
        </Modal>
      )}

      {portfolioOpen && (
        <Modal onClose={() => setPortfolioOpen(false)} maxWidth="max-w-lg" className="border-teal-500/40 flex flex-col max-h-[85vh]">
          <h3 className="text-base font-extrabold text-slate-100 flex items-center gap-2 mb-3 pr-8">
            <TrendingUp className="text-teal-400" size={20} /> Yatırım Portföyü
          </h3>

          <div className="flex flex-col gap-2 overflow-y-auto flex-1 font-mono">
            {investments.map((inv) => (
              <div key={inv.id} className="p-2.5 rounded-xl bg-[#0f1422] border border-slate-800 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <span className="font-bold text-slate-100 block truncate">{inv.name}</span>
                  <span className="text-[10px] text-teal-400">{inv.type}</span>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-bold text-teal-300 bg-black/40 px-2 py-1 rounded">
                    {inv.amount.toLocaleString('tr-TR')} ₺
                  </span>
                  <button
                    type="button"
                    onClick={() => setInvestments((prev) => prev.filter((i) => i.id !== inv.id))}
                    aria-label={`${inv.name} varlığını sil`}
                    className="p-1 text-slate-600 hover:text-red-400"
                  >
                    <X size={14} />
                  </button>
                </div>
              </div>
            ))}
            {investments.length === 0 && (
              <p className="text-center py-6 text-xs text-slate-500">Portföyde kayıt yok.</p>
            )}
          </div>

          {/* Eski kodda ekleme formu için state vardı ama form hiç render
              edilmiyordu; portföye kalem eklemek mümkün değildi. */}
          <form onSubmit={addInvestment} className="mt-3 pt-3 border-t border-slate-800 flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Varlık adı"
                value={newInv.name}
                onChange={(e) => setNewInv((p) => ({ ...p, name: e.target.value }))}
                aria-label="Varlık adı"
                className="col-span-2 bg-[#121826] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 outline-none"
              />
              <input
                type="number"
                min={0}
                value={newInv.amount}
                onChange={(e) => setNewInv((p) => ({ ...p, amount: Math.max(0, Number(e.target.value) || 0) }))}
                aria-label="Tutar"
                className="bg-[#121826] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={newInv.type}
                onChange={(e) => setNewInv((p) => ({ ...p, type: e.target.value as InvestmentAsset['type'] }))}
                aria-label="Varlık türü"
                className="flex-1 bg-[#121826] border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none"
              >
                {(['Altın', 'Borsa/Hisse', 'Döviz', 'Fon/Mevduat', 'Kripto'] as const).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <button type="submit" className="px-5 py-2 rounded-xl bg-teal-500 text-black text-xs font-black shrink-0">
                Ekle
              </button>
            </div>
          </form>
        </Modal>
      )}
    </main>
  );
}
