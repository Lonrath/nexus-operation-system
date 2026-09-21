// ==========================================
// GÜVENLİ LOCALSTORAGE KATMANI
// Bozuk veri artık uygulamayı beyaz ekrana düşürmez.
// ==========================================

/** Tüm anahtarlar tek yerden. Sürüm değiştirmek için sadece burayı düzenleyin. */
export const STORAGE_KEYS = {
  showHolidays: 'nexus_show_holidays_v25',
  customHolidays: 'nexus_custom_holidays_v25',
  goalCategories: 'nexus_goal_categories_v25',
  goalPool: 'nexus_goal_pool_v25',
  goalProgress: 'nexus_goal_progress_v25',
  activityPool: 'nexus_activity_pool_v25',
  events: 'nexus_events_v25',
  vaultNotes: 'nexus_vault_notes_v25',
  financeMultiYear: 'nexus_finance_multiyear_v25',
  financeInvestments: 'nexus_finance_investments_v25',
  financeCards: 'nexus_finance_cards_v25',
  activeView: 'nexus_active_view_v25',
} as const;

/**
 * localStorage'dan okur. Anahtar yoksa, JSON bozuksa veya tarayıcı
 * storage'ı engelliyorsa (gizli sekme, kota dolu) sessizce fallback döner.
 */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed = JSON.parse(raw);
    if (parsed === null || parsed === undefined) return fallback;
    return parsed as T;
  } catch (err) {
    console.warn(`[nexus/storage] "${key}" okunamadı, varsayılana dönülüyor.`, err);
    return fallback;
  }
}

/** localStorage'a yazar. Kota dolduysa çökmek yerine uyarı basar. */
export function saveJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn(`[nexus/storage] "${key}" yazılamadı (kota dolu olabilir).`, err);
  }
}

/** Çakışmayan ID üretir. Aynı milisaniyede iki kayıt açılsa bile benzersizdir. */
export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  return `${prefix}-${uuid}`;
}
