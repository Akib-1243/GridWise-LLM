import { ArrowDownRight } from 'lucide-react';
import { money } from '../../utils/formatters';

export function CostCard({ cost }: { cost: number }) {
  return (
    <div className="panel bg-[#112a34] p-6 text-white shadow-[0_18px_40px_rgba(9,28,33,0.35)] ring-1 ring-white/5">
      <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#7dd7c7]">Optimized 24h cost</p>
      <p className="mt-3 text-4xl font-semibold tracking-tight text-white">{money(cost)}</p>
      <div className="mt-4 flex items-center gap-2 rounded-full bg-emerald-500/12 px-3 py-2 text-sm text-emerald-200 ring-1 ring-emerald-400/20">
        <ArrowDownRight size={18} className="text-emerald-300" />
        <span><b className="font-semibold text-white">18.4%</b> lower than baseline</span>
      </div>
    </div>
  );
}
