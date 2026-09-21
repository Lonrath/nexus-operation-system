import type { CalendarEventItem, CategoryType, PriorityType } from '../types';
import { MAX_EVENTS_PER_HOUR, MAX_EVENT_DURATION } from '../constants';
import { fmtHour, fmtSlot, nextDay } from './dates';
import { newId } from './storage';

// ==========================================================================
// TEK ETKİNLİK FABRİKASI
//
// Eski kodda "kapasite kontrol et -> etkinlik kur -> gece yarısını taşır"
// bloğu üç ayrı yere kopyalanmıştı (form kaydet, saate bırak, güne bırak).
// Üçü zamanla birbirinden ayrıştığı için farklı davranıyorlardı.
// Artık üçü de burayı çağırıyor.
// ==========================================================================

export interface EventDraft {
  year: number;
  month: number;
  day: number;
  startHour: number;
  /** 24'ü aşabilir; aşarsa etkinlik otomatik olarak ertesi güne taşar. */
  endHour: number;
  category: CategoryType;
  gameName?: string;
  title: string;
  priority: PriorityType;
  note?: string;
  cost: number;
  expenseCategory?: string;
}

export type BuildResult =
  | { ok: true; events: CalendarEventItem[] }
  | { ok: false; error: string };

/** Belirli bir saatte kaç etkinlik olduğunu sayar. */
function countAtHour(
  events: CalendarEventItem[],
  year: number,
  month: number,
  day: number,
  hour: number
): number {
  return events.filter(
    (ev) =>
      ev.year === year &&
      ev.month === month &&
      ev.day === day &&
      hour >= ev.startHour &&
      hour < ev.endHour
  ).length;
}

/**
 * Bir taslaktan takvim etkinlik(ler)i üretir.
 *
 * Doğrulamalar:
 *  - bitiş > başlangıç olmalı
 *  - süre MAX_EVENT_DURATION saati aşamaz
 *  - hiçbir saat dilimi MAX_EVENTS_PER_HOUR sınırını aşamaz (ertesi gün dahil)
 *
 * Hata durumunda `alert()` atmaz; çağıran tarafın arayüzde gösterebileceği
 * bir mesaj döner.
 */
export function buildEvents(
  draft: EventDraft,
  existing: CalendarEventItem[]
): BuildResult {
  const { year, month, day, startHour, endHour } = draft;

  if (endHour <= startHour) {
    return { ok: false, error: 'Bitiş saati başlangıç saatinden sonra olmalı.' };
  }
  if (endHour - startHour > MAX_EVENT_DURATION) {
    return {
      ok: false,
      error: `Bir etkinlik en fazla ${MAX_EVENT_DURATION} saat sürebilir.`,
    };
  }

  const spillsOver = endHour > 24;
  const firstPartEnd = spillsOver ? 24 : endHour;
  const spillHours = spillsOver ? endHour - 24 : 0;
  const tomorrow = nextDay(year, month, day);

  // --- Kapasite kontrolü: bugün ---
  for (let h = startHour; h < firstPartEnd; h++) {
    if (countAtHour(existing, year, month, day, h) >= MAX_EVENTS_PER_HOUR) {
      return {
        ok: false,
        error: `Saat ${fmtHour(h)} diliminde zaten ${MAX_EVENTS_PER_HOUR} etkinlik var.`,
      };
    }
  }

  // --- Kapasite kontrolü: ertesi güne taşan kısım ---
  for (let h = 0; h < spillHours; h++) {
    if (countAtHour(existing, tomorrow.year, tomorrow.month, tomorrow.day, h) >= MAX_EVENTS_PER_HOUR) {
      return {
        ok: false,
        error: `Ertesi gün saat ${fmtHour(h)} diliminde zaten ${MAX_EVENTS_PER_HOUR} etkinlik var.`,
      };
    }
  }

  // Gece yarısını aşan etkinliğin iki parçası bu id ile birbirine bağlanır.
  // Silme ve "tamamlandı" işlemleri grubun tamamına uygulanır.
  const groupId = newId('grp');

  const base = {
    groupId,
    category: draft.category,
    gameName: draft.gameName,
    priority: draft.priority,
    note: draft.note?.trim() || undefined,
    isCompleted: false,
  };

  const first: CalendarEventItem = {
    ...base,
    id: newId('evt'),
    year,
    month,
    day,
    startHour,
    endHour: firstPartEnd,
    timeSlot: fmtSlot(startHour, firstPartEnd),
    title: draft.title,
    // Maliyet yalnızca ilk parçaya yazılır; iki parçaya da yazılsa
    // aylık toplamda iki kez sayılırdı.
    cost: draft.cost,
    expenseCategory: draft.cost > 0 ? draft.expenseCategory : undefined,
  };

  if (!spillsOver) return { ok: true, events: [first] };

  const second: CalendarEventItem = {
    ...base,
    id: newId('evt'),
    year: tomorrow.year,
    month: tomorrow.month,
    day: tomorrow.day,
    startHour: 0,
    endHour: spillHours,
    timeSlot: fmtSlot(0, spillHours),
    title: `${draft.title} (Devam)`,
    cost: 0,
    expenseCategory: undefined,
  };

  return { ok: true, events: [first, second] };
}
