import {useMemo, useState} from 'react';
import type {FormEvent} from 'react';
import {CalendarDays, KeyRound, Save, Shield, UserRound} from 'lucide-react';
import {toast} from 'sonner';
import {useAuth} from '../auth/AuthProvider';

export function ProfilePage(){
  const {user, updateProfile, changePassword} = useAuth();
  const [profileForm, setProfileForm] = useState({name: user?.name ?? '', email: user?.email ?? ''});
  const [profileBusy, setProfileBusy] = useState(false);
  const [passwordForm, setPasswordForm] = useState({current_password:'',password:'',password_confirmation:''});
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const createdAt = useMemo(() => {
    if(!user?.created_at) return 'Not available';
    return new Date(user.created_at).toLocaleDateString(undefined, {year:'numeric', month:'short', day:'numeric'});
  }, [user?.created_at]);

  const handleProfileSave = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if(!user) return;

    try {
      setProfileBusy(true);
      const updated = await updateProfile({
        name: profileForm.name.trim(),
        email: profileForm.email.trim(),
      });
      setProfileForm({name: updated.name, email: updated.email});
      toast.success('Profile updated successfully.');
    } catch (reason: unknown) {
      const message = (reason as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Unable to update profile.';
      toast.error(message);
    } finally {
      setProfileBusy(false);
    }
  };

  const handlePasswordChange = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPasswordError('');

    if(passwordForm.password.length < 10){
      setPasswordError('Password must be at least 10 characters long.');
      return;
    }

    if(passwordForm.password !== passwordForm.password_confirmation){
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setPasswordBusy(true);
      await changePassword({
        current_password: passwordForm.current_password,
        password: passwordForm.password,
        password_confirmation: passwordForm.password_confirmation,
      });
      setPasswordForm({current_password:'', password:'', password_confirmation:''});
      toast.success('Password changed successfully.');
    } catch (reason: unknown) {
      const message = (reason as {response?:{data?:{message?:string}}})?.response?.data?.message ?? 'Unable to change password.';
      setPasswordError(message);
      toast.error(message);
    } finally {
      setPasswordBusy(false);
    }
  };

  if(!user) return null;

  return <div className="space-y-6">
    <section className="panel p-6">
      <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint text-xl font-bold text-ink">{user.name.charAt(0).toUpperCase()}</div>
          <div>
            <p className="label">Account</p>
            <h1 className="text-2xl font-semibold">{user.name}</h1>
          </div>
        </div>
        <div className="rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-cyan">{user.role}</div>
      </div>
    </section>

    <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
      <section className="panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <UserRound className="text-cyan" size={18} />
          <h2 className="text-lg font-semibold">Profile details</h2>
        </div>

        <form onSubmit={handleProfileSave} className="space-y-5">
          <div>
            <label htmlFor="profile-name" className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-200">Full name</label>
            <input id="profile-name" value={profileForm.name} onChange={(event)=>setProfileForm((current)=>({...current,name:event.target.value}))} className="input" />
          </div>
          <div>
            <label htmlFor="profile-email" className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-200">Email address</label>
            <input id="profile-email" type="email" value={profileForm.email} onChange={(event)=>setProfileForm((current)=>({...current,email:event.target.value}))} className="input" />
          </div>
          <button type="submit" disabled={profileBusy} className="flex items-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60 dark:bg-mint dark:text-ink">
            <Save size={16} />
            {profileBusy ? 'Saving…' : 'Save changes'}
          </button>
        </form>
      </section>

      <aside className="panel p-6">
        <div className="mb-5 flex items-center gap-3">
          <Shield className="text-cyan" size={18} />
          <h2 className="text-lg font-semibold">Account overview</h2>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="muted">Role</span>
            <span className="font-semibold capitalize">{user.role}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="muted">Member since</span>
            <span className="font-semibold">{createdAt}</span>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3 dark:bg-white/5">
            <span className="muted">Email</span>
            <span className="max-w-[12rem] truncate font-semibold">{user.email}</span>
          </div>
        </div>
      </aside>
    </div>

    <section className="panel p-6">
      <div className="mb-5 flex items-center gap-3">
        <KeyRound className="text-cyan" size={18} />
        <h2 className="text-lg font-semibold">Change password</h2>
      </div>

      <form onSubmit={handlePasswordChange} className="space-y-5">
        <div>
          <label htmlFor="current-password" className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-200">Current password</label>
          <input id="current-password" type="password" value={passwordForm.current_password} onChange={(event)=>setPasswordForm((current)=>({...current,current_password:event.target.value}))} className="input" />
        </div>
        <div>
          <label htmlFor="new-password" className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-200">New password</label>
          <input id="new-password" type="password" value={passwordForm.password} onChange={(event)=>setPasswordForm((current)=>({...current,password:event.target.value}))} className="input" />
        </div>
        <div>
          <label htmlFor="confirm-new-password" className="mb-2 block text-sm font-medium text-slate-600 dark:text-slate-200">Confirm new password</label>
          <input id="confirm-new-password" type="password" value={passwordForm.password_confirmation} onChange={(event)=>setPasswordForm((current)=>({...current,password_confirmation:event.target.value}))} className="input" />
        </div>
        {passwordError && <p role="alert" className="rounded-xl border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-sm font-medium text-rose-500">{passwordError}</p>}
        <button type="submit" disabled={passwordBusy} className="flex items-center gap-2 rounded-xl bg-mint px-4 py-2.5 text-sm font-semibold text-ink disabled:cursor-not-allowed disabled:opacity-60">
          <CalendarDays size={16} />
          {passwordBusy ? 'Updating…' : 'Update password'}
        </button>
      </form>
    </section>
  </div>;
}
