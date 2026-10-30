import { Fragment, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { confirmNote } from '../../utils/confirmNote';
import StatusMessage from '../../components/common/StatusMessage';

// Readable temporary password: no look-alike characters (0/O, 1/l/I).
const CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789';
const generatePassword = (len = 10) => {
  const bytes = new Uint32Array(len);
  window.crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('');
};

function Details({ t, setStatus }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);

  const grouped = (t.assignments || []).reduce((acc, a) => {
    (acc[a.className] ||= []).push(a.subject);
    return acc;
  }, {});

  const resetPassword = async (e) => {
    e.preventDefault();
    if (pw.length < 8) {
      setStatus({ type: 'error', text: 'The new password must be at least 8 characters.' });
      return;
    }
    setBusy(true);
    try {
      await api.put(`/teachers/${t._id}/password`, { newPassword: pw });
      setPw('');
      setStatus({ type: '', text: '' });
      notifySuccess(`Password reset for ${t.name}. Share it with them privately.`, 'Password reset');
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const facts = [
    ['Age', t.age],
    ['Gender', t.gender],
    ['Contact number', t.phone],
    ['Teaching experience', t.experienceYears !== undefined && t.experienceYears !== null ? `${t.experienceYears} years` : ''],
  ];

  return (
    <div className="grid gap-6 bg-forest-50/60 p-4 md:grid-cols-2">
      <div>
        <h3 className="font-serif text-base font-semibold">Profile details</h3>
        <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-xs font-semibold text-slate-500">{k}</dt>
              <dd>{v || <span className="italic text-slate-500">Not filled in</span>}</dd>
            </div>
          ))}
        </dl>

        <h3 className="mt-4 font-serif text-base font-semibold">Classes and subjects</h3>
        {Object.keys(grouped).length === 0 ? (
          <p className="mt-1 text-sm italic text-slate-500">None added yet</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {Object.entries(grouped).map(([c, subs]) => (
              <li key={c} className="flex flex-wrap items-center gap-2">
                <span className="font-semibold">{c}:</span>
                {subs.map((s) => (
                  <span key={s} className="rounded-full bg-white px-2.5 py-0.5 text-xs text-forest-900 ring-1 ring-forest-200">{s}</span>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      <form onSubmit={resetPassword} noValidate>
        <h3 className="font-serif text-base font-semibold">Reset password</h3>
        <label htmlFor={`pw-${t._id}`} className="label mt-2">New temporary password (8+ characters)</label>
        <div className="flex flex-wrap gap-2">
          <input id={`pw-${t._id}`} type="text" autoComplete="off" className="input min-w-[160px] flex-1" value={pw} onChange={(e) => setPw(e.target.value)} />
          <button type="button" className="btn-outline shrink-0" onClick={() => setPw(generatePassword())}>Generate</button>
          <button type="submit" disabled={busy} className="btn-primary shrink-0">{busy ? 'Saving…' : 'Reset'}</button>
        </div>
      </form>
    </div>
  );
}

export default function AdminTeachers() {
  const { data, loading, error, reload } = useFetch('/teachers');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);
  const [open, setOpen] = useState(null);
  const [search, setSearch] = useState('');

  const teachers = data?.teachers || [];
  const q = search.trim().toLowerCase();
  const visible = q ? teachers.filter((t) => `${t.name} ${t.email}`.toLowerCase().includes(q)) : teachers;
  const activeCount = teachers.filter((t) => t.active).length;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    const er = {};
    if (form.name.trim().length < 2) er.name = "Enter the teacher's name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) er.email = 'Enter a valid email address.';
    if (form.password.length < 8) er.password = 'Temporary password must be at least 8 characters.';
    setErrors(er);
    setStatus({ type: '', text: '' });
    if (Object.keys(er).length) return;

    setSaving(true);
    try {
      const name = form.name.trim();
      await api.post('/teachers', { name, email: form.email.trim(), password: form.password });
      setForm({ name: '', email: '', password: '' });
      notifySuccess(
        `Account created for ${name}. Share the temporary password privately; they can change it after login.`,
        'Teacher added'
      );
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/teachers/${t._id}`, { active: !t.active });
      setStatus({ type: '', text: '' });
      notifySuccess(
        `${t.name} has been ${t.active ? 'disabled' : 'enabled'}.`,
        t.active ? 'Account disabled' : 'Account enabled'
      );
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const remove = async (t) => {
    const ok = await confirmNote({
      title: `Delete ${t.name}'s account?`,
      message: 'Results they uploaded will stay published.',
      confirmLabel: 'Yes, delete account',
    });
    if (!ok) return;
    try {
      await api.delete(`/teachers/${t._id}`);
      setStatus({ type: '', text: '' });
      notifySuccess(`${t.name}'s account has been deleted.`, 'Teacher deleted');
      reload();
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err) });
    }
  };

  const field = (id, label, props = {}) => (
    <div>
      <label htmlFor={`t-${id}`} className="label">{label}</label>
      <input id={`t-${id}`} className="input" value={form[id]} onChange={set(id)}
        aria-invalid={errors[id] ? 'true' : 'false'} aria-describedby={errors[id] ? `t-${id}-err` : undefined} {...props} />
      {errors[id] && <p id={`t-${id}-err`} className="mt-1 text-sm text-red-700">{errors[id]}</p>}
    </div>
  );

  return (
    <div className="space-y-8">
      <section className="card p-6" aria-labelledby="add-t">
        <h2 id="add-t" className="section-title !text-xl">Create teacher account</h2>
        <p className="mt-1 text-sm text-slate-600">The teacher fills in the rest of their profile after logging in.</p>
        <form onSubmit={create} noValidate className="mt-4 grid gap-4 sm:grid-cols-3">
          {field('name', 'Full name', { autoComplete: 'off' })}
          {field('email', 'Email (login)', { type: 'email', autoComplete: 'off' })}
          <div>
            <label htmlFor="t-password" className="label">Temporary password</label>
            <div className="flex gap-2">
              <input
                id="t-password"
                type="text"
                autoComplete="off"
                className="input"
                value={form.password}
                onChange={set('password')}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 't-password-err' : undefined}
              />
              <button type="button" className="btn-outline shrink-0" onClick={() => setForm((f) => ({ ...f, password: generatePassword() }))}>
                Generate
              </button>
            </div>
            {errors.password && <p id="t-password-err" className="mt-1 text-sm text-red-700">{errors.password}</p>}
          </div>
          <div className="sm:col-span-3">
            <button type="submit" disabled={saving} className="btn-primary">{saving ? 'Creating…' : 'Create Account'}</button>
          </div>
        </form>
      </section>

      <StatusMessage status={status} />

      <section className="card p-6" aria-labelledby="list-t">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 id="list-t" className="section-title !text-xl">Teachers ({teachers.length})</h2>
            {teachers.length > 0 && <p className="mt-1 text-sm text-slate-600">{activeCount} active, {teachers.length - activeCount} disabled</p>}
          </div>
          {teachers.length > 0 && (
            <div className="w-full sm:w-72">
              <label htmlFor="t-search" className="label">Search</label>
              <input id="t-search" type="search" className="input" placeholder="Name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          )}
        </div>

        {loading && <p role="status" className="mt-3 text-slate-600">Loading…</p>}
        {error && <p role="alert" className="mt-3 text-red-700">{error}</p>}
        {!loading && !error && teachers.length === 0 && <p className="mt-3 text-slate-600">No teachers yet.</p>}
        {!loading && !error && teachers.length > 0 && visible.length === 0 && <p className="mt-3 text-slate-600">No teachers match your search.</p>}

        {visible.length > 0 && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <caption className="sr-only">Teacher accounts</caption>
              <thead>
                <tr className="bg-forest-900 text-white">
                  <th scope="col" className="px-4 py-2">Name</th>
                  <th scope="col" className="px-4 py-2">Email</th>
                  <th scope="col" className="px-4 py-2">Status</th>
                  <th scope="col" className="px-4 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visible.map((t) => (
                  <Fragment key={t._id}>
                    <tr className="border-b border-forest-100 odd:bg-white even:bg-forest-50/50">
                      <th scope="row" className="px-4 py-2 font-semibold text-forest-900">
                        <span className="flex items-center gap-3">
                          <span
                            aria-hidden="true"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-forest-800 text-sm font-bold text-white"
                          >
                            {(t.name || '?').trim().charAt(0).toUpperCase()}
                          </span>
                          {t.name}
                        </span>
                      </th>
                      <td className="px-4 py-2">{t.email}</td>
                      <td className="px-4 py-2">
                        <span className={`rounded px-2 py-0.5 text-xs font-semibold ${t.active ? 'bg-forest-100 text-forest-800' : 'bg-slate-200 text-slate-700'}`}>
                          {t.active ? 'Active' : 'Disabled'}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <div className="flex flex-wrap gap-2">
                          <button type="button" className="btn-outline" aria-expanded={open === t._id} onClick={() => setOpen(open === t._id ? null : t._id)}>
                            {open === t._id ? 'Hide details' : 'Details'}
                          </button>
                          <button type="button" className="btn-outline" onClick={() => toggleActive(t)}>{t.active ? 'Disable' : 'Enable'}</button>
                          <button type="button" className="btn-danger" onClick={() => remove(t)} aria-label={`Delete ${t.name}`}>Delete</button>
                        </div>
                      </td>
                    </tr>
                    {open === t._id && (
                      <tr>
                        <td colSpan={4} className="p-0"><Details t={t} setStatus={setStatus} /></td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
