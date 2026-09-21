// ==========================================
// TARİH & TÜRKİYE TATİL YARDIMCILARI
// ==========================================

export const MONTH_NAMES = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık',
] as const;

export const WEEKDAY_NAMES = [
  'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar',
] as const;

export const TIMELINE_HOURS = Array.from({ length: 24 }, (_, i) => i);

/** Saati "08:00" biçimine çevirir. 24 ve üstü ertesi güne taşar. */
export function fmtHour(h: number): string {
  const v = h % 24 === 0 && h !== 0 ? 24 : h % 24;
  return `${String(v).padStart(2, '0')}:00`;
}

/** "20:00 - 23:00" biçiminde aralık metni. */
export function fmtSlot(start: number, end: number): string {
  return `${fmtHour(start)} - ${end === 24 ? '24:00' : fmtHour(end)}`;
}

/** Pazartesi = 0 olacak şekilde haftanın günü. */
export function mondayFirstWeekday(date: Date): number {
  return (date.getDay() + 6) % 7;
}

/**
 * Sabit tarihli resmi tatiller. Yıla bağlı değildir.
 * month 0-tabanlıdır (0 = Ocak).
 */
const FIXED_HOLIDAYS: Record<string, string> = {
  '0-1': 'Yılbaşı',
  '3-23': '23 Nisan Çocuk B.',
  '4-1': '1 Mayıs Emek Günü',
  '4-19': '19 Mayıs Gençlik B.',
  '6-15': '15 Temmuz Demokrasi',
  '7-30': '30 Ağustos Zafer B.',
  '9-29': '29 Ekim Cumhuriyet B.',
};

/**
 * Dini bayramlar hicri takvime göre her yıl kayar, bu yüzden tek tek tanımlanır.
 * Format: [ay(0-tabanlı), başlangıçGünü, bitişGünü].
 * YENİ YIL EKLERKEN: Diyanet takviminden bakıp buraya satır ekleyin.
 * Tanımlı olmayan bir yıl için sadece dini bayramlar görünmez, uygulama çalışmaya devam eder.
 */
const RELIGIOUS_HOLIDAYS: Record<number, Array<[number, number, number, string]>> = {
  2025: [
    [2, 30, 31, 'Ramazan Bayramı'],
    [5, 6, 9, 'Kurban Bayramı'],
  ],
  2026: [
    [2, 20, 22, 'Ramazan Bayramı'],
    [4, 27, 30, 'Kurban Bayramı'],
  ],
  2027: [
    [2, 9, 11, 'Ramazan Bayramı'],
    [4, 16, 19, 'Kurban Bayramı'],
  ],
  2028: [
    [1, 26, 28, 'Ramazan Bayramı'],
    [4, 5, 8, 'Kurban Bayramı'],
  ],
};

export function getTurkishOfficialHoliday(
  month: number,
  day: number,
  year: number
): string | null {
  const fixed = FIXED_HOLIDAYS[`${month}-${day}`];
  if (fixed) return fixed;

  const religious = RELIGIOUS_HOLIDAYS[year];
  if (religious) {
    for (const [m, from, to, label] of religious) {
      if (month === m && day >= from && day <= to) return label;
    }
  }
  return null;
}

export interface DayHolidayInfo {
  isHoliday: boolean;
  label: string;
  isWeekend: boolean;
  officialHoliday: string | null;
  dateKey: string;
}

/**
 * Bir günün tatil olup olmadığını hesaplar.
 * Kullanıcı elle işaretlediyse (customHolidays) o her zaman kazanır.
 */
export function getDayHolidayInfo(
  year: number,
  month: number,
  day: number,
  customHolidays: Record<string, boolean>
): DayHolidayInfo {
  const dateKey = `${year}-${month}-${day}`;
  const dayOfWeek = mondayFirstWeekday(new Date(year, month, day));
  const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
  const officialHoliday = getTurkishOfficialHoliday(month, day, year);
  const defaultIsHoliday = isWeekend || Boolean(officialHoliday);
  const isHoliday = customHolidays[dateKey] ?? defaultIsHoliday;

  let label = '';
  if (isHoliday) {
    if (officialHoliday) label = officialHoliday;
    else if (isWeekend) label = dayOfWeek === 5 ? 'Cumartesi' : 'Pazar';
    else label = 'Özel Tatil';
  }

  return { isHoliday, label, isWeekend, officialHoliday, dateKey };
}

/** Verilen günün ertesi gününü, ay/yıl devrini doğru yaparak döner. */
export function nextDay(year: number, month: number, day: number) {
  const d = new Date(year, month, day + 1);
  return { year: d.getFullYear(), month: d.getMonth(), day: d.getDate() };
}
