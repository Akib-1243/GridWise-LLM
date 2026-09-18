import {useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowRight, CheckCircle2, LockKeyhole, Mail, ShieldCheck, Sparkles, UserRound} from 'lucide-react';
import {Link, useNavigate} from 'react-router-dom';
import {toast} from 'sonner';
import {useAuth} from '../auth/AuthProvider';

function getPasswordStrength(password: string){
  let score = 0;
  if(password.length >= 10) score += 1;
  if(/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if(/\d/.test(password)) score += 1;
  if(/[^A-Za-z0-9]/.test(password)) score += 1;
  if(score <= 1) return {label:'Weak', tone:'bg-rose-500'};
  if(score === 2 || score === 3) return {label:'Good', tone:'bg-amber-500'};
  return {label:'Strong', tone:'bg-emerald-500'};
}

export function RegisterPage(){
  const {register}=useAuth();
  const navigate = useNavigate();
  const [form,setForm]=useState({name:'',email:'',password:'',password_confirmation:''});
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [success,setSuccess]=useState('');

  const strength = useMemo(() => getPasswordStrength(form.password), [form.password]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if(form.name.trim().length < 2){
      setError('Full name must be at least 2 characters long.');
      return;
    }

    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())){
      setError('Enter a valid email address.');
      return;
    }

    if(form.password.length < 10){
      setError('Password must be at least 10 characters long.');
      return;
    }

    if(form.password !== form.password_confirmation){
      setError('Passwords do not match.');
      return;
    }

    try {
      setBusy(true);
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setSuccess('Account created successfully. Redirecting to sign in…');
      toast.success('Account created successfully.');
      setTimeout(() => navigate('/login', {replace: true}), 800);
    } catch (reason: unknown) {
      const response = (reason as {response?:{data?:{message?:string;errors?:Record<string,string[]|string>}}})?.response;
      const backendMessage = response?.data?.message;
      const errors = response?.data?.errors;
      const firstError = Array.isArray(errors) ? errors[0] : Object.values(errors ?? {}).flat().find(Boolean);
      setError(backendMessage ?? (typeof firstError === 'string' ? firstError : 'Unable to create account right now.'));
      toast.error(backendMessage ?? 'Unable to create account right now.');
    } finally {
      setBusy(false);
    }
  };

  return <main className="grid min-h-screen place-items-center bg-ink px-5 py-10">
    <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-[#0d2a3b] p-7 text-white shadow-2xl md:p-9">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-ink"><Sparkles size={22}/></div>
        <div>
          <b className="tracking-wide">GRIDWISE</b>
          <p className="text-[10px] font-bold tracking-[.22em] text-cyan">ENERGY AI</p>
        </div>
      </div>

      <div className="mb-7">
        <p className="label text-cyan">Create account</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set up your workspace</h1>
      </div>

      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="name" className="mb-2 block text-sm font-medium text-slate-200">Full name</label>
          <div className="relative">
            <UserRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="name" name="name" type="text" value={form.name} onChange={(event)=>setForm((current)=>({...current,name:event.target.value}))} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" placeholder="Jane Operator" required />
          </div>
        </div>

        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="email" name="email" type="email" value={form.email} onChange={(event)=>setForm((current)=>({...current,email:event.target.value}))} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" placeholder="jane@gridwise.energy" required />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">Password</label>
          <div className="relative">
            <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="password" name="password" type="password" value={form.password} onChange={(event)=>setForm((current)=>({...current,password:event.target.value}))} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" placeholder="At least 10 characters" required />
          </div>
          {form.password && <div className="mt-2 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
              <div className={`${strength.tone} h-full rounded-full`} style={{width: `${Math.min((form.password.length / 16) * 100, 100)}%`}} />
            </div>
            <span className="text-xs font-medium uppercase tracking-[0.15em] text-slate-300">{strength.label}</span>
          </div>}
        </div>

        <div>
          <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
          <div className="relative">
            <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="password_confirmation" name="password_confirmation" type="password" value={form.password_confirmation} onChange={(event)=>setForm((current)=>({...current,password_confirmation:event.target.value}))} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" placeholder="Repeat your password" required />
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-200">{error}</p>}
        {success && <p className="flex items-center gap-2 rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-3 py-2 text-sm font-medium text-emerald-200"><CheckCircle2 size={16} /> {success}</p>}

        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#8af7d3] disabled:cursor-not-allowed disabled:opacity-60">
          {busy ? 'Creating account…' : 'Create account'}
          <ArrowRight size={16} />
        </button>
      </form>

      <p className="mt-6 text-sm text-slate-300">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-cyan hover:text-cyan/80">Sign in</Link>
      </p>
    </section>
  </main>;
}
