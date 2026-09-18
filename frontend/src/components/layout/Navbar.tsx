import { Activity } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';

export function Navbar() {
  const { isSuccess } = useHealth();

  return (
    <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#10232d] px-5">
      <div>
        <p className="label">Campus operations</p>
        <b>Energy command center</b>
      </div>
      <span className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold ${isSuccess ? 'bg-emerald-500/15 text-emerald-300' : 'bg-amber-500/15 text-amber-300'}`}>
        <Activity size={14} />
        {isSuccess ? 'API online' : 'Demo mode'}
      </span>
    </header>
  );
}
