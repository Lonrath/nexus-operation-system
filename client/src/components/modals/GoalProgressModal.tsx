import { Trash2 } from 'lucide-react';
import type { ActiveGoal } from '../../types';
import { Modal } from '../Shell';
import { GoalIcon } from '../GoalIcon';

export function GoalProgressModal({
  goal,
  onClose,
  onSetCurrent,
  onRemoveFromBar,
}: {
  goal: ActiveGoal;
  onClose: () => void;
  onSetCurrent: (goalId: string, current: number) => void;
  onRemoveFromBar: (goalId: string) => void;
}) {
  return (
    <Modal onClose={onClose} maxWidth="max-w-md" labelledBy="goalprog-title" className="border-amber-500/30 bg-[#0d121c]">
      <div className="flex items-center gap-3 mb-4 pr-10">
        <div className={`p-3 rounded-2xl bg-black/40 border border-white/10 ${goal.accentColor}`}>
          <GoalIcon type={goal.iconType} size={22} />
        </div>
        <div>
          <h3 id="goalprog-title" className="text-base font-bold text-slate-100">{goal.title}</h3>
          <p className="text-xs text-slate-400">İlerleme durumunu ve değerini güncelle</p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div>
          <label htmlFor="goal-current" className="text-xs font-bold text-slate-300 mb-1.5 block">
            Şu Anki Değer ({goal.unit})
          </label>
          <input
            id="goal-current"
            type="number"
            min={0}
            value={goal.current}
            onChange={(e) => onSetCurrent(goal.id, Math.max(0, Number(e.target.value) || 0))}
            className="w-full bg-[#121826] border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 font-mono outline-none focus:border-amber-500"
          />
        </div>

        <div>
          <span className="text-[11px] font-bold text-slate-400 mb-1.5 block uppercase tracking-wider font-mono">
            Hızlı Güncelle:
          </span>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" onClick={() => onSetCurrent(goal.id, goal.current + 1)} className="py-1.5 bg-[#141b2c] hover:bg-amber-500 hover:text-black rounded-lg text-xs font-mono font-bold border border-slate-700">
              +1 {goal.unit}
            </button>
            <button type="button" onClick={() => onSetCurrent(goal.id, goal.current + 5)} className="py-1.5 bg-[#141b2c] hover:bg-amber-500 hover:text-black rounded-lg text-xs font-mono font-bold border border-slate-700">
              +5 {goal.unit}
            </button>
            <button type="button" onClick={() => onSetCurrent(goal.id, goal.target)} className="py-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-mono font-bold">
              Tamamla!
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <button
            type="button"
            onClick={() => { onRemoveFromBar(goal.id); onClose(); }}
            className="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/50 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <Trash2 size={14} /> Çubuktan Çıkar
          </button>
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold shadow-md">
            Tamam
          </button>
        </div>
      </div>
    </Modal>
  );
}
