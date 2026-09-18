import type { PropsWithChildren } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, BarChart3, ClipboardList, LogOut, Settings2, UserRound } from 'lucide-react';
import { useHealth } from '../../hooks/useHealth';
import { useAuth } from '../../auth/AuthProvider';

export function Shell({ children }: PropsWithChildren) {
  const { isSuccess } = useHealth();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = async () => { await logout(); navigate('/login'); };

  return <div className="min-h-screen bg-[#0d2029] text-[#edf4f3]">
    <div className="flex">
      <aside className="hidden min-h-screen w-64 shrink-0 border-r border-white/10 bg-[#10232d] p-6 lg:block">
        <div className="mb-14 px-3"><b className="text-base tracking-[.08em]">GRIDWISE</b><p className="mt-1 text-[10px] font-semibold uppercase tracking-[.16em] text-slate-400">Energy operations</p></div>
        {[['/',BarChart3,'Command center'],['/scenario',Settings2,'New scenario'],['/results',ClipboardList,'Optimization plan'],['/profile',UserRound,'Profile']].map(([to,Icon,label])=>{const NavigationIcon=Icon as typeof ClipboardList;return <NavLink key={to as string} to={to as string} className={({isActive})=>`mb-2 flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium ${isActive?'bg-[#2f8f83] text-[#071b24]':'text-slate-400 hover:bg-white/5 hover:text-white'}`}><NavigationIcon size={18}/>{label as string}</NavLink>})}
      </aside>
      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-white/10 bg-[#10232d] px-5"><div><p className="label">Campus operations</p><b>Energy command center</b></div><div className="flex items-center gap-3"><span className={`hidden items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold sm:flex ${isSuccess?'bg-emerald-500/15 text-emerald-300':'bg-amber-500/15 text-amber-300'}`}><Activity size={14}/>{isSuccess?'API online':'Demo mode'}</span><div className="hidden text-right sm:block"><p className="text-xs font-semibold text-slate-200">{user?.name}</p><p className="text-[11px] capitalize text-slate-500">{user?.role}</p></div><button type="button" onClick={signOut} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-slate-300 transition hover:bg-rose-500/20 hover:text-rose-200" title="Sign out"><LogOut size={15}/></button></div></header>
        <div className="mx-auto max-w-[1500px] p-5 md:p-8">{children}</div>
      </main>
    </div>
  </div>;
}
