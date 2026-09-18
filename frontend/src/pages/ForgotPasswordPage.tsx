import {useState} from 'react';
import type {FormEvent} from 'react';
import {ArrowLeft, Mail, Sparkles} from 'lucide-react';
import {Link} from 'react-router-dom';
import {toast} from 'sonner';
import {authApi} from '../auth/authApi';

export function ForgotPasswordPage(){
  const [email,setEmail]=useState('');
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState('');

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    try {
      const response = await authApi.forgotPassword({email: email.trim()});
      setMessage(response.message);
      toast.success(response.message);
    } catch (reason: unknown) {
      const message = (reason as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Unable to send reset email.';
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
        <p className="label text-cyan">Reset</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Forgot password?</h1>
      </div>
      <form onSubmit={submit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-2 block text-sm font-medium text-slate-200">Email address</label>
          <div className="relative">
            <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
            <input id="email" type="email" value={email} onChange={(event)=>setEmail(event.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-cyan focus:ring-2 focus:ring-cyan/20" placeholder="you@company.com" required />
          </div>
        </div>
        {message && <p className="rounded-xl border border-cyan/20 bg-cyan/10 px-3 py-2 text-sm text-cyan">{message}</p>}
        <button type="submit" disabled={busy} className="flex w-full items-center justify-center gap-2 rounded-xl bg-mint px-4 py-3 text-sm font-bold text-ink transition hover:bg-[#8af7d3] disabled:cursor-not-allowed disabled:opacity-60">{busy ? 'Sending…' : 'Send reset link'}</button>
      </form>
      <Link to="/login" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 hover:text-cyan"><ArrowLeft size={16}/>Back to sign in</Link>
    </section>
  </main>;
}
