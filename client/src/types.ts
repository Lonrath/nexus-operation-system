// ==========================================
// NEXUS SUITE — MERKEZİ TİP TANIMLARI
// Tüm modüller tiplerini buradan alır.
// ==========================================

export type CategoryType =
  | 'Spor'
  | 'İş'
  | 'Okuma'
  | 'Yüksek Lisans'
  | 'Doktora'
  | 'Keşif'
  | 'Oyunlar';

export type PriorityType = 'Normal' | 'Yüksek' | 'Kritik (Raid/Sınav)';

export type AppView = 'hub' | 'os' | 'vault' | 'finance';

export interface CategoryConfig {
  id: CategoryType;
  label: string;
  themeColor: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

/** Havuzdaki hedef tanımı. İlerleme bilgisi TAŞIMAZ. */
export interface GoalDefinition {
  id: string;
  title: string;
  category: string;
  metricName: string;
  target: number;
  unit: string;
  deadlineDays?: number;
  iconType: string;
  colorGradient: string;
  accentColor: string;
  borderColor: string;
  isCustom?: boolean;
}

/** Üst çubuğa alınmış bir hedefin SADECE ilerlemesi. Tanım havuzdan çözülür. */
export interface GoalProgress {
  goalId: string;
  current: number;
}

/** Tanım + ilerleme birleştirilmiş, sadece render için kullanılan türetilmiş tip. */
export interface ActiveGoal extends GoalDefinition {
  current: number;
}

export interface SavedActivityTemplate {
  id: string;
  title: string;
  category: CategoryType;
  gameName?: string;
  themeColor: string;
  defaultDurationHours: number;
  priority: PriorityType;
  note?: string;
  defaultCost?: number;
  expenseCategory?: string;
}

export interface CalendarEventItem {
  id: string;
  /** Gece yarısını aşan etkinliklerde iki parçayı birbirine bağlar. */
  groupId: string;
  year: number;
  month: number;
  day: number;
  startHour: number;
  endHour: number;
  timeSlot: string;
  category: CategoryType;
  gameName?: string;
  title: string;
  priority: PriorityType;
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

// ---- Finance ----

export type ExpenseGroupType = 'fatura' | 'yasam' | 'kredi';

export interface ExpenseRow {
  id: string;
  name: string;
  group: ExpenseGroupType;
  /** true ise bu satır bir kredi kartı EKSTRESİDİR, harcama kalemi değildir. */
  isCreditCardTarget?: boolean;
  /** Bu harcamanın hangi kartın ekstresine gittiği. Nakit ödeniyorsa boş bırakın. */
  creditCardTargetName?: string;
  monthlyValues: number[];
  paidStatus: boolean[];
}

export interface InvestmentAsset {
  id: string;
  name: string;
  type: 'Altın' | 'Borsa/Hisse' | 'Döviz' | 'Fon/Mevduat' | 'Kripto';
  amount: number;
  note?: string;
}

export interface CreditCardMeta {
  name: string;
  limit: number;
  cutoffDay: number;
  dueDay: number;
}

export interface YearFinancialData {
  expenseRows: ExpenseRow[];
  incomes: number[];
  previousAmounts: number[];
}

/** Tüm uygulamanın yedek dosyası formatı. */
export interface NexusBackup {
  version: string;
  date: string;
  events: CalendarEventItem[];
  goalProgress: GoalProgress[];
  goalPool: GoalDefinition[];
  activityPool: SavedActivityTemplate[];
  goalCategories: string[];
  customHolidays: Record<string, boolean>;
  showHolidays: boolean;
  vaultNotes: VaultNote[];
  finance?: {
    multiYearData: Record<number, YearFinancialData>;
    investments: InvestmentAsset[];
    cards: CreditCardMeta[];
  };
}
