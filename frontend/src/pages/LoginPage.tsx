import {useState} from 'react';
import type {FormEvent} from 'react';
import {LockKeyhole,LogIn,Sparkles,UserRound} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'sonner';
import {useAuth} from '../auth/AuthProvider';

export function LoginPage(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [remember,setRemember]=useState(true);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const {login}=useAuth();

  const submit=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    setBusy(true);
    setError('');
    login(username,password,remember)
      .catch((reason:unknown)=>{
        const response=(reason as {response?:{data?:{message?:string}}})?.response;
        const message=response?.data?.message??'Unable to sign in right now.';
        setError(message);
        toast.error(message);
      })
      .finally(()=>setBusy(false));
  };

  return <main className="grid min-h-screen place-items-center bg-ink px-5 py-10">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d2a3b] p-7 text-white shadow-2xl md:p-9">
      <div className="mb-8 flex items-center gap-3"><div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-ink"><Sparkles size={22}/></div><div><b className="tracking-wide">GRIDWISE</b><p className="text-[10px] font-bold tracking-[.22em] text-cyan">ENERGY AI</p></div></div>
      <div className="mb-7"><p className="label text-cyan">Secure access</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Welcome back</h1><p className="mt-2 text-sm text-slate-300">Sign in to open the campus energy command center.</p></div>
      <form onSubmit={submit} className="space-y-5">
        <div><label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">Username or email</label><div className="relative"><UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input id="username" name="username" type="text" autoComplete="username" value={username} onChange={(event)=>setUsername(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" required/></div></div>
        <div><label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label><div className="relative"><LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input id="password" name="password" type="password" autoComplete="current-password" value={password} onChange={(event)=>setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" required/></div></div>
        <div className="flex items-center justify-between gap-3 text-sm text-slate-300">
          <label className="inline-flex items-center gap-2"><input type="checkbox" checked={remember} onChange={(event)=>setRemember(event.target.checked)} className="h-4 w-4 rounded border-white/10 bg-white/5"/>Remember me</label>
          <Link to="/forgot-password" className="font-medium text-cyan hover:text-cyan/80">Forgot password?</Link>
        </div>
        {error&&<p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">{error}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#8af7d3] disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-2 focus:ring-mint focus:ring-offset-2 focus:ring-offset-[#0d2a3b]"><LogIn size={17}/>{busy?'Signing in…':'Sign in'}</button>
      </form>
      <p className="mt-6 text-sm text-slate-300">Need an account? <Link to="/register" className="font-semibold text-cyan hover:text-cyan/80">Create one</Link></p>
    </section>
  </main>;
}
