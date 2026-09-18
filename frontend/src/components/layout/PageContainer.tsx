import type { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, BatteryCharging, ClipboardList, Leaf, LogOut, Settings2, UserRound } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import { useAuth } from '../../auth/AuthProvider';

export function Shell({ children }: PropsWithChildren) {
  const { isSuccess } = useHealth();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/login'); };

  return (
    <div className="min-h-screen bg-[#061b22] text-slate-100">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-white/10 bg-[#0b212a]/95 px-5 py-6 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="mb-8 flex justify-center px-1">
          <div className="flex min-h-[112px] w-full items-center justify-center rounded-[26px] border border-[#6ef2c5]/25 bg-[radial-gradient(circle_at_top,#1d4d4b_0%,#10353e_40%,#0a2129_100%)] px-4 py-4 text-center shadow-[0_18px_35px_rgba(22,89,89,0.35)]">
            <div><div className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#d8f9f4]">GridWise</div><div className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-200/80">Energy operations</div></div>
          </div>
        </div>
        <nav className="space-y-2">
          {[
            ['/', BarChart3, 'Command center'],
            ['/scenario', Settings2, 'New scenario'],
            ['/results', ClipboardList, 'Optimization plan'],
            ['/profile', UserRound, 'Profile'],
          ].map(([to, Icon, label]) => {
            const NavigationIcon = Icon as typeof BarChart3;
            return <NavLink key={to as string} to={to as string} className={({ isActive }) => `group flex items-center gap-3 rounded-2xl px-3 py-3 text-[15px] font-medium transition ${isActive ? 'bg-[#2f8f83] text-[#071b24] shadow-[0_12px_30px_rgba(47,143,131,0.25)]' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
              {({ isActive }) => <><span className={`flex h-9 w-9 items-center justify-center rounded-xl ${isActive ? 'bg-[#dffaf4]/40 text-[#071b24]' : 'bg-white/5 text-slate-300'}`}><NavigationIcon size={18} /></span>{label as string}</>}
            </NavLink>;
          })}
        </nav>
        <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400"><Leaf size={12} className="text-emerald-300" />Live grid health</div>
          <div className="mt-3 flex items-center justify-between"><span className="text-sm text-slate-200">Battery state</span><span className="text-sm font-semibold text-emerald-300">92%</span></div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full w-[92%] rounded-full bg-gradient-to-r from-[#5ba6bd] to-[#2f8f83]" /></div>
        </div>
      </aside>
      <main className="min-h-screen lg:ml-72">
        <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0b212a]/80 px-5 py-4 backdrop-blur-xl md:px-8">
          <div className="flex items-center justify-between gap-4"><div><div className="text-[10px] font-bold uppercase tracking-[0.28em] text-slate-400">Campus operations</div><div className="mt-1 text-2xl font-semibold tracking-tight text-white">Energy command center</div></div>
            <div className="flex items-center gap-3"><span className={`hidden items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold sm:flex ${isSuccess ? 'border-emerald-400/30 bg-emerald-500/10 text-emerald-300' : 'border-amber-400/30 bg-amber-500/10 text-amber-300'}`}><Activity size={14} />{isSuccess ? 'API online' : 'Demo mode'}</span><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-200">{user?.name}</p><p className="text-[11px] capitalize text-slate-500">{user?.role}</p></div><button type="button" onClick={signOut} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/8 text-xs font-bold text-slate-200 ring-1 ring-white/10 transition hover:bg-rose-500/20 hover:text-rose-200" title="Sign out"><LogOut size={15} /></button></div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</div>
        <footer className="border-t border-white/10 bg-[#0b212a]/80"><div className="mx-auto flex max-w-[1500px] flex-col gap-6 px-5 py-8 md:flex-row md:items-center md:justify-between md:px-8"><div><div className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#5ba6bd]">GridWise</div><p className="mt-2 max-w-xl text-sm text-slate-300">Lower cost. Cleaner power. Smarter operations.</p></div><div className="flex items-center gap-3"><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300"><Leaf size={14} className="text-emerald-300" /><span className="text-xs font-medium">Solar</span></div><div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-slate-300"><BatteryCharging size={14} className="text-cyan-300" /><span className="text-xs font-medium">Storage</span></div></div><div className="flex items-center gap-3"><NavLink to="/scenario" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:border-[#5ba6bd] hover:text-white">Run scenario</NavLink><NavLink to="/results" className="rounded-full bg-[#2f8f83] px-4 py-2 text-sm font-semibold text-[#071b24] transition hover:bg-[#3ea79a]">View plan</NavLink></div></div></footer>
      </main>
    </div>
  );
}
