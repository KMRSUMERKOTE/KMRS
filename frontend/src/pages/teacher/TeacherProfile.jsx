import { useEffect, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const GENDERS = ['Male', 'Female', 'Other'];

const blank = { name: '', age: '', gender: '', phone: '', experienceYears: '' };

function validateProfile(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
  const age = Number(f.age);
  if (!Number.isInteger(age) || age < 18 || age > 70) e.age = 'Enter an age between 18 and 70.';
  if (!GENDERS.includes(f.gender)) e.gender = 'Please select a gender.';
  if (!/^[+\d][\d\s-]{7,14}$/.test(f.phone)) e.phone = 'Enter a valid contact number.';
  const exp = Number(f.experienceYears);
  if (f.experienceYears === '' || !Number.isInteger(exp) || exp < 0 || exp > 50) {
    e.experienceYears = 'Enter teaching experience in whole years (0–50).';
  }
  return e;
}

export default function TeacherProfile() {
  const { data, loading, error, reload } = useFetch('/teachers/me');
  const { setUser } = useAuth();

  const [form, setForm] = useState(blank);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (data?.teacher) {
      const t = data.teacher;
      setForm({
        name: t.name || '',
        age: t.age ?? '',
        gender: t.gender || '',
        phone: t.phone || '',
        experienceYears: t.experienceYears ?? '',
      });
    }
  }, [data]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    const found = validateProfile(form);
    setErrors(found);
    setStatus({ type: '', text: '' });
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        age: Number(form.age),
        gender: form.gender,
        phone: form.phone.trim(),
        experienceYears: Number(form.experienceYears),
      };
      await api.put('/teachers/me', payload);
      setUser((u) => (u ? { ...u, name: payload.name } : u));
      setStatus({ type: 'ok', text: 'Your profile has been saved.' });
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    setPwStatus({ type: '', text: '' });
    if (pw.newPassword.length < 8) {
      setPwStatus({ type: 'error', text: 'New password must be at least 8 characters.' });
      return;
    }
    if (pw.newPassword !== pw.confirm) {
      setPwStatus({ type: 'error', text: 'New password and confirmation do not match.' });
      return;
    }
    setPwSaving(true);
    try {
      await api.put('/auth/change-password', {
        currentPassword: pw.currentPassword,
        newPassword: pw.newPassword,
      });
      setPw({ currentPassword: '', newPassword: '', confirm: '' });
      setPwStatus({ type: 'ok', text: 'Your password has been changed.' });
    } catch (err) {
      setPwStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return <p role="status" className="text-slate-600">Loading…</p>;
  if (error) return <p role="alert" className="text-red-700">{error}</p>;

  const fields = ['name', 'age', 'gender', 'phone', 'experienceYears'];
  const filled = fields.filter((k) => String(form[k]).trim() !== '').length;
  const pwType = showPw ? 'text' : 'password';

  const input = (id, label, props = {}) => (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <input
        id={id}
        className="input"
        value={form[id]}
        onChange={set(id)}
        aria-invalid={errors[id] ? 'true' : 'false'}
        aria-describedby={errors[id] ? `${id}-err` : undefined}
        {...props}
      />
      {errors[id] && <p id={`${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="profile-h">
        <div className="flex flex-wrap items-center gap-4">
          <span
            aria-hidden="true"
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-forest-800 font-serif text-2xl font-bold text-white"
          >
            {(form.name || data.teacher.email || '?').trim().charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <h2 id="profile-h" className="section-title !text-xl">My Profile</h2>
            <p className="truncate text-sm text-slate-600">{data.teacher.email}</p>
          </div>
          <div className="w-full sm:w-52">
            <p className="text-sm font-medium text-forest-900">{filled} of {fields.length} details filled</p>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-forest-100"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuenow={filled}
              aria-valuemin={0}
              aria-valuemax={fields.length}
            >
              <div className="h-full rounded-full bg-ochre-500 transition-all" style={{ width: `${(filled / fields.length) * 100}%` }} />
            </div>
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-600">
          Your contact number and age are visible only to school administrators. They are not published on the
          public website.
        </p>

        <form onSubmit={save} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className="label">Email (used for login)</label>
            <input id="email" className="input bg-slate-100" value={data.teacher.email} readOnly />
          </div>

          <div className="sm:col-span-2">{input('name', 'Full name', { autoComplete: 'name', required: true })}</div>
          {input('age', 'Age', { type: 'number', min: 18, max: 70, inputMode: 'numeric', required: true })}

          <div>
            <label htmlFor="gender" className="label">Gender</label>
            <select
              id="gender"
              className="input"
              value={form.gender}
              onChange={set('gender')}
              aria-invalid={errors.gender ? 'true' : 'false'}
              aria-describedby={errors.gender ? 'gender-err' : undefined}
              required
            >
              <option value="">Select…</option>
              {GENDERS.map((g) => <option key={g}>{g}</option>)}
            </select>
            {errors.gender && <p id="gender-err" className="mt-1 text-sm text-red-700">{errors.gender}</p>}
          </div>

          {input('phone', 'Contact number', { type: 'tel', autoComplete: 'tel', required: true })}
          {input('experienceYears', 'Teaching experience (years)', { type: 'number', min: 0, max: 50, inputMode: 'numeric', required: true })}

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>

          <div className="sm:col-span-2" role="status" aria-live="polite">
            {status.type === 'ok' && <p className="rounded bg-forest-50 p-3 text-sm font-medium text-forest-800">{status.text}</p>}
          </div>
          <div className="sm:col-span-2" role="alert">
            {status.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{status.text}</p>}
          </div>
        </form>
      </section>

      <section className="card p-6" aria-labelledby="pw-h">
        <h2 id="pw-h" className="section-title !text-xl">Change Password</h2>
        <form onSubmit={changePassword} noValidate className="mt-5 grid max-w-md gap-4">
          <div>
            <label htmlFor="cur" className="label">Current password</label>
            <input id="cur" type={pwType} autoComplete="current-password" className="input" value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} required />
          </div>
          <div>
            <label htmlFor="new" className="label">New password (at least 8 characters)</label>
            <input id="new" type={pwType} autoComplete="new-password" className="input" value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} required aria-describedby="new-count" />
            <p id="new-count" className={`mt-1 text-xs ${pw.newPassword.length >= 8 ? 'text-forest-700' : 'text-slate-500'}`}>
              {pw.newPassword.length >= 8 ? '✓ Long enough' : `${pw.newPassword.length} of 8 characters`}
            </p>
          </div>
          <div>
            <label htmlFor="conf" className="label">Confirm new password</label>
            <input id="conf" type={pwType} autoComplete="new-password" className="input" value={pw.confirm} onChange={(e) => setPw({ ...pw, confirm: e.target.value })} required />
            {pw.confirm && pw.confirm !== pw.newPassword && (
              <p className="mt-1 text-xs text-red-700">Passwords do not match yet.</p>
            )}
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={showPw} onChange={(e) => setShowPw(e.target.checked)} />
            Show passwords
          </label>
          <div>
            <button type="submit" disabled={pwSaving} className="btn-primary">
              {pwSaving ? 'Changing…' : 'Change Password'}
            </button>
          </div>
          <div role="status" aria-live="polite">
            {pwStatus.type === 'ok' && <p className="rounded bg-forest-50 p-3 text-sm font-medium text-forest-800">{pwStatus.text}</p>}
          </div>
          <div role="alert">
            {pwStatus.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{pwStatus.text}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}
