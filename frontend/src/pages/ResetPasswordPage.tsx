import {useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {CheckCircle2, LockKeyhole, Sparkles} from 'lucide-react';
import {Link, useSearchParams } from 'react-router-dom';
import {toast} from 'sonner';
import {authApi} from '../auth/authApi';

export function ResetPasswordPage(){
  const [searchParams] = useSearchParams();
  const token = useMemo(() => searchParams.get('token') ?? '', [searchParams]);
  const email = useMemo(() => searchParams.get('email') ?? '', [searchParams]);
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!token || !email){
      setMessage('The password reset link is invalid or missing required metadata.');
      return;
    }
    if(password.length < 10){
      setMessage('Password must be at least 10 characters long.');
      return;
    }
    if(password !== passwordConfirmation){
      setMessage('Passwords do not match.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const response = await authApi.resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      setMessage(response.message);
      toast.success(response.message);
    } catch (reason: unknown) {
      const message = (reason as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Unable to reset password.';
      setMessage(message);
      toast.error(message);
    } finally {
      setBusy(false);
    }
  };

  return <main className="grid min-h-screen place-items-center bg-ink px-5 py-10">
    <section className="w-full max-w-md rounded-3xl border border-white/10 bg-[#0d2a3b] p-7 text-white shadow-2xl md:p-9">
      <div className="mb-8 flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-ink"><Sparkles size={22}/></div>
        <div>
          <b className="tracking-wide">GRIDWISE</b>
          <p className="text-[10px] font-bold tracking-[.22em] text-cyan">ENERGY AI</p>
        </div>
      </div>
      <div className="mb-6">
        <p className="label text-cyan">New password</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Set a strong password</h1>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">New password</label>
          <div className="relative">
            <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="password" type="password" value={password} onChange={(event)=>setPassword(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" required />
          </div>
        </div>
        <div>
          <label htmlFor="password_confirmation" className="mb-2 block text-sm font-medium text-slate-200">Confirm password</label>
          <div className="relative">
            <LockKeyhole size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="password_confirmation" type="password" value={passwordConfirmation} onChange={(event)=>setPasswordConfirmation(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" required />
          </div>
        </div>
        {message && <p className={`rounded-xl border px-3 py-2 text-sm ${message.includes('successfully') ? 'border-emerald-400/30 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/30 bg-rose-400/10 text-rose-200'}`}>{message.includes('successfully') ? <span className="inline-flex items-center gap-2"><CheckCircle2 size={16} /> {message}</span> : message}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#8af7d3] disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Resetting…' : 'Reset password'}</button>
      </form>
      <Link to="/login" className="mt-6 inline-block text-sm font-medium text-slate-300 hover:text-cyan">Return to sign in</Link>
    </section>
  </main>;
}
