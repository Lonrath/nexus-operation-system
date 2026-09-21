import { useState, useEffect, useMemo, useCallback } from 'react';
import type {
  CalendarEventItem, GoalDefinition, GoalProgress, ActiveGoal,
  SavedActivityTemplate, VaultNote, NexusBackup,
} from '../types';
import {
  DEFAULT_GOAL_POOL, DEFAULT_GOAL_PROGRESS, DEFAULT_TEMPLATES,
  DEFAULT_VAULT_NOTES, DEFAULT_GOAL_CATEGORIES,
} from '../constants';
import { STORAGE_KEYS, loadJSON, saveJSON } from '../lib/storage';

// ==========================================================================
// MERKEZİ VERİ KATMANI
//
// Eski kodda tüm state App() içindeydi ve tek bir dev useEffect yedi
// localStorage anahtarını aynı anda yazıyordu. Artık her parça kendi
// efektinde saklanıyor, yani bir alanı değiştirmek diğerlerini yeniden
// yazmıyor.
// ==========================================================================

/** Bir state'i localStorage ile senkron tutan küçük yardımcı. */
function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => loadJSON<T>(key, fallback));
  useEffect(() => {
    saveJSON(key, value);
  }, [key, value]);
  return [value, setValue] as const;
}

export function useNexusData() {
  const [showHolidays, setShowHolidays] = usePersistentState<boolean>(
    STORAGE_KEYS.showHolidays, true);

  const [customHolidays, setCustomHolidays] = usePersistentState<Record<string, boolean>>(
    STORAGE_KEYS.customHolidays, {});

  const [goalCategories, setGoalCategories] = usePersistentState<string[]>(
    STORAGE_KEYS.goalCategories, DEFAULT_GOAL_CATEGORIES);

  const [goalPool, setGoalPool] = usePersistentState<GoalDefinition[]>(
    STORAGE_KEYS.goalPool, DEFAULT_GOAL_POOL);

  // Üst çubuktaki hedefler artık tanımın KOPYASINI değil, sadece
  // {goalId, current} tutuyor. Havuzdaki bir hedefi düzenlediğinizde
  // çubuktaki kart da anında güncelleniyor.
  const [goalProgress, setGoalProgress] = usePersistentState<GoalProgress[]>(
    STORAGE_KEYS.goalProgress, DEFAULT_GOAL_PROGRESS);

  const [activityPool, setActivityPool] = usePersistentState<SavedActivityTemplate[]>(
    STORAGE_KEYS.activityPool, DEFAULT_TEMPLATES);

  const [events, setEvents] = usePersistentState<CalendarEventItem[]>(
    STORAGE_KEYS.events, []);

  const [vaultNotes, setVaultNotes] = usePersistentState<VaultNote[]>(
    STORAGE_KEYS.vaultNotes, DEFAULT_VAULT_NOTES);

  /** Tanım + ilerleme birleştirilmiş hali. Havuzdan silinmiş hedefler düşer. */
  const activeGoals = useMemo<ActiveGoal[]>(() => {
    return goalProgress
      .map((p) => {
        const def = goalPool.find((g) => g.id === p.goalId);
        return def ? { ...def, current: p.current } : null;
      })
      .filter((g): g is ActiveGoal => g !== null);
  }, [goalProgress, goalPool]);

  const setGoalCurrent = useCallback((goalId: string, current: number) => {
    setGoalProgress((prev) =>
      prev.map((p) => (p.goalId === goalId ? { ...p, current: Math.max(0, current) } : p))
    );
  }, [setGoalProgress]);

  const toggleGoalInBar = useCallback((goalId: string) => {
    setGoalProgress((prev) =>
      prev.some((p) => p.goalId === goalId)
        ? prev.filter((p) => p.goalId !== goalId)
        : [...prev, { goalId, current: 0 }]
    );
  }, [setGoalProgress]);

  const removeGoalFromPool = useCallback((goalId: string) => {
    setGoalPool((prev) => prev.filter((g) => g.id !== goalId));
    setGoalProgress((prev) => prev.filter((p) => p.goalId !== goalId));
  }, [setGoalPool, setGoalProgress]);

  /** Gece yarısını aşan etkinliklerde her iki parçayı da siler. */
  const deleteEventGroup = useCallback((groupId: string) => {
    setEvents((prev) => prev.filter((ev) => ev.groupId !== groupId));
  }, [setEvents]);

  /** Tamamlandı işareti de grubun tamamına uygulanır. */
  const toggleEventGroupComplete = useCallback((groupId: string) => {
    setEvents((prev) => {
      const target = prev.find((ev) => ev.groupId === groupId);
      if (!target) return prev;
      const next = !target.isCompleted;
      return prev.map((ev) => (ev.groupId === groupId ? { ...ev, isCompleted: next } : ev));
    });
  }, [setEvents]);

  /** Tüm veriyi tek nesnede toplar (yedekleme için). */
  const exportAll = useCallback((): NexusBackup => ({
    version: 'nexus-suite-v2',
    date: new Date().toISOString(),
    events,
    goalProgress,
    goalPool,
    activityPool,
    goalCategories,
    customHolidays,
    showHolidays,
    vaultNotes,
    finance: {
      multiYearData: loadJSON(STORAGE_KEYS.financeMultiYear, {}),
      investments: loadJSON(STORAGE_KEYS.financeInvestments, []),
      cards: loadJSON(STORAGE_KEYS.financeCards, []),
    },
  }), [events, goalProgress, goalPool, activityPool, goalCategories,
       customHolidays, showHolidays, vaultNotes]);

  /**
   * Yedek dosyasını geri yükler. Eski kodda dışa aktarma vardı ama içe
   * aktarma yoktu; yedek alınabiliyor fakat geri dönülemiyordu.
   */
  const importAll = useCallback((backup: Partial<NexusBackup>) => {
    if (Array.isArray(backup.events)) setEvents(backup.events);
    if (Array.isArray(backup.goalPool)) setGoalPool(backup.goalPool);
    if (Array.isArray(backup.goalProgress)) setGoalProgress(backup.goalProgress);
    if (Array.isArray(backup.activityPool)) setActivityPool(backup.activityPool);
    if (Array.isArray(backup.goalCategories)) setGoalCategories(backup.goalCategories);
    if (Array.isArray(backup.vaultNotes)) setVaultNotes(backup.vaultNotes);
    if (backup.customHolidays) setCustomHolidays(backup.customHolidays);
    if (typeof backup.showHolidays === 'boolean') setShowHolidays(backup.showHolidays);
    if (backup.finance) {
      saveJSON(STORAGE_KEYS.financeMultiYear, backup.finance.multiYearData ?? {});
      saveJSON(STORAGE_KEYS.financeInvestments, backup.finance.investments ?? []);
      saveJSON(STORAGE_KEYS.financeCards, backup.finance.cards ?? []);
    }
  }, [setEvents, setGoalPool, setGoalProgress, setActivityPool, setGoalCategories,
      setVaultNotes, setCustomHolidays, setShowHolidays]);

  return {
    showHolidays, setShowHolidays,
    customHolidays, setCustomHolidays,
    goalCategories, setGoalCategories,
    goalPool, setGoalPool,
    goalProgress, setGoalProgress,
    activeGoals, setGoalCurrent, toggleGoalInBar, removeGoalFromPool,
    activityPool, setActivityPool,
    events, setEvents, deleteEventGroup, toggleEventGroupComplete,
    vaultNotes, setVaultNotes,
    exportAll, importAll,
  };
}

export type NexusData = ReturnType<typeof useNexusData>;
