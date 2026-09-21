import { useState, useEffect, useCallback } from 'react';
import type { AppView, ActiveGoal, NexusBackup } from './types';
import { useNexusData } from './hooks/useNexusData';
import { Sidebar } from './components/Sidebar';
import { Atmosphere, NoticeStack, useNotices } from './components/Shell';
import { GoalPoolModal } from './components/modals/GoalPoolModal';
import { GoalProgressModal } from './components/modals/GoalProgressModal';
import { NexusHub } from './views/NexusHub';
import { NexusOS } from './views/NexusOS';
import { NexusVault } from './views/NexusVault';
import { NexusFinance } from './views/NexusFinance';

// ==========================================================================
// NEXUS SUITE — KÖK BİLEŞEN
//
// Eski App.tsx tek dosyada 3.615 satırdı ve App() fonksiyonunun kendisi
// ~2.850 satırdı. Artık bu dosya sadece yönlendirme yapıyor; asıl işi
// views/ ve components/ altındaki bileşenler üstleniyor.
// ==========================================================================

const VALID_VIEWS: AppView[] = ['hub', 'os', 'vault', 'finance'];

function readHash(): AppView {
  const h = window.location.hash.replace('#/', '').replace('#', '');
  return (VALID_VIEWS as string[]).includes(h) ? (h as AppView) : 'hub';
}

export default function App() {
  const data = useNexusData();
  const { notices, push: notify } = useNotices();

  // Görünüm artık adres çubuğunda. Eski sürümde bu sadece bir state'ti;
  // sayfayı yenileyince her zaman Hub'a dönüyordunuz ve geri tuşu
  // uygulamadan çıkıyordu.
  const [view, setView] = useState<AppView>(readHash);

  useEffect(() => {
    const onHashChange = () => setView(readHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = useCallback((next: AppView) => {
    window.location.hash = `#/${next}`;
    setView(next);
  }, []);

  // Takvimin açık olduğu ay. Eski kodda `new Date(2026, 8, 1)` olarak
  // sabitlenmişti; uygulama her açılışta Eylül 2026'yı gösteriyordu.
  const [currentDate, setCurrentDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [pendingDay, setPendingDay] = useState<number | null>(null);
  const [goalPoolOpen, setGoalPoolOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<ActiveGoal | null>(null);

  const handleExport = useCallback(() => {
    const blob = new Blob([JSON.stringify(data.exportAll(), null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexus-backup-${new Date().toISOString().slice(0, 10)}.json`;
    // Firefox ve Safari, DOM'a eklenmemiş bir <a> için indirmeyi
    // başlatmayabilir; ayrıca URL hemen iptal edilirse indirme kesilir.
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    notify('Yedek indirildi.', 'success');
  }, [data, notify]);

  const handleImport = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as Partial<NexusBackup>;
      if (typeof parsed !== 'object' || parsed === null) throw new Error('bad shape');
      data.importAll(parsed);
      notify('Yedek geri yüklendi.', 'success');
    } catch {
      notify('Dosya okunamadı. Geçerli bir Nexus yedeği mi?');
    }
  }, [data, notify]);

  const openDayInOS = useCallback((day: number) => {
    setPendingDay(day);
    setCurrentDate(new Date());
    navigate('os');
  }, [navigate]);

  const shell = 'min-h-screen bg-[#06080e] text-slate-100 flex font-sans relative selection:bg-amber-500 selection:text-black overflow-x-hidden';

  return (
    <div className={shell}>
      <Atmosphere />

      <Sidebar
        activeView={view}
        onNavigate={navigate}
        onExport={handleExport}
        onImport={handleImport}
        onOpenGoalPool={view === 'os' ? undefined : () => setGoalPoolOpen(true)}
        goalCount={data.goalPool.length}
      />

      {view === 'hub' && (
        <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
          <NexusHub
            events={data.events}
            activeGoals={data.activeGoals}
            activeYear={currentDate.getFullYear()}
            activeMonth={currentDate.getMonth()}
            onLaunchOS={() => navigate('os')}
            onOpenFinance={() => navigate('finance')}
            onOpenVault={() => navigate('vault')}
            onOpenGoalPool={() => setGoalPoolOpen(true)}
            onOpenDayDetail={openDayInOS}
            onToggleComplete={data.toggleEventGroupComplete}
            onEditGoal={setEditingGoal}
          />
        </div>
      )}

      {view === 'os' && (
        <NexusOS
          events={data.events}
          setEvents={data.setEvents}
          deleteEventGroup={data.deleteEventGroup}
          toggleEventGroupComplete={data.toggleEventGroupComplete}
          activityPool={data.activityPool}
          setActivityPool={data.setActivityPool}
          activeGoals={data.activeGoals}
          goalPool={data.goalPool}
          setGoalPool={data.setGoalPool}
          goalProgress={data.goalProgress}
          goalCategories={data.goalCategories}
          setGoalCategories={data.setGoalCategories}
          setGoalCurrent={data.setGoalCurrent}
          toggleGoalInBar={data.toggleGoalInBar}
          removeGoalFromPool={data.removeGoalFromPool}
          showHolidays={data.showHolidays}
          setShowHolidays={data.setShowHolidays}
          customHolidays={data.customHolidays}
          setCustomHolidays={data.setCustomHolidays}
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          initialDay={pendingDay}
          goalPoolOpen={goalPoolOpen}
          setGoalPoolOpen={setGoalPoolOpen}
          notify={notify}
        />
      )}

      {view === 'vault' && (
        <NexusVault
          notes={data.vaultNotes}
          setNotes={data.setVaultNotes}
          activeGoals={data.activeGoals}
          onBackToHub={() => navigate('hub')}
          onLaunchOS={() => navigate('os')}
          notify={notify}
        />
      )}

      {view === 'finance' && (
        <NexusFinance
          onBackToHub={() => navigate('hub')}
          onLaunchOS={() => navigate('os')}
          notify={notify}
        />
      )}

      {/* OS kendi Quest Havuzu modalını yönetiyor; diğer görünümlerde burası. */}
      {goalPoolOpen && view !== 'os' && (
        <GoalPoolModal
          goalPool={data.goalPool}
          goalProgress={data.goalProgress}
          goalCategories={data.goalCategories}
          onClose={() => setGoalPoolOpen(false)}
          onToggleInBar={data.toggleGoalInBar}
          onRemoveFromPool={data.removeGoalFromPool}
          onCreate={(g) => data.setGoalPool((prev) => [g, ...prev])}
          onAddCategory={(name) =>
            data.setGoalCategories((prev) => (prev.includes(name) ? prev : [...prev, name]))
          }
        />
      )}

      {editingGoal && view !== 'os' && (
        <GoalProgressModal
          goal={data.activeGoals.find((g) => g.id === editingGoal.id) ?? editingGoal}
          onClose={() => setEditingGoal(null)}
          onSetCurrent={data.setGoalCurrent}
          onRemoveFromBar={data.toggleGoalInBar}
        />
      )}

      <NoticeStack notices={notices} />
    </div>
  );
}
