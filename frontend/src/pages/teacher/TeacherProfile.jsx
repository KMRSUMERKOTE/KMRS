import { useEffect, useRef, useState } from 'react';
import useFetch from '../../hooks/useFetch';
import api, { errorMessage } from '../../utils/api';
import { notifySuccess } from '../../utils/notify';
import { useAuth } from '../../context/AuthContext';

const GENDERS = ['Male', 'Female', 'Other'];

const DESIGNATIONS = {
  teaching: [
    'Principal',
    'PGT Maths',
    'PGT Physics',
    'PGT Chemistry',
    'PGT Biology',
    'PGT Comp Science',
    'TGT Arts',
    'Assistant Teacher',
    'Sanskrit Teacher',
    'Odia Teacher',
    'Hindi Teacher',
    'English Teacher',
    'Guest Teacher',
    'Guest Teacher (TGT Science)',
    'Guest Teacher (MCT)',
    'Guest Teacher (PGT)',
    'Others',
  ],
  'non-teaching': ['Matron', 'CCA', 'ANM', 'Jr Assistant/clerk', 'Sr Assistant/Clerk', 'Others'],
};
const STAFF_TYPES = [
  { value: 'teaching', label: 'Teaching staff' },
  { value: 'non-teaching', label: 'Non-teaching staff' },
];
const QUALIFICATIONS = ['Matric', '+2', 'BSc', 'BA', 'BCom', 'MCA', 'MSc', 'BEd', 'PhD', 'D.El.Ed', 'M.Ed.', 'M.A', 'M.Com'];

const blank = {
  name: '',
  staffType: '',
  designation: '',
  designationOther: '',
  qualifications: [],
  age: '',
  gender: '',
  phone: '',
  experienceYears: '',
};

function validateProfile(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your full name.';
  if (!DESIGNATIONS[f.staffType]) e.staffType = 'Please select teaching or non-teaching staff.';
  if (!DESIGNATIONS[f.staffType]?.includes(f.designation)) e.designation = 'Please select a designation.';
  if (f.designation === 'Others' && f.designationOther.trim().length < 2) {
    e.designationOther = 'Please specify your designation.';
  }
  if (!f.qualifications.length) e.qualifications = 'Select at least one qualification.';
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

  const [photo, setPhoto] = useState('');
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoStatus, setPhotoStatus] = useState({ type: '', text: '' });
  const fileRef = useRef(null);

  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [showPw, setShowPw] = useState(false);
  const [pwStatus, setPwStatus] = useState({ type: '', text: '' });
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    if (data?.teacher) {
      const t = data.teacher;
      setForm({
        name: t.name || '',
        staffType: t.staffType || '',
        designation: t.designation || '',
        designationOther: t.designationOther || '',
        qualifications: t.qualifications || [],
        age: t.age ?? '',
        gender: t.gender || '',
        phone: t.phone || '',
        experienceYears: t.experienceYears ?? '',
      });
      setPhoto(t.profilePic || '');
    }
  }, [data]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const setStaffType = (e) => {
    const staffType = e.target.value;
    setForm((f) => ({ ...f, staffType, designation: '', designationOther: '' }));
  };

  const toggleQual = (q) =>
    setForm((f) => ({
      ...f,
      qualifications: f.qualifications.includes(q)
        ? f.qualifications.filter((x) => x !== q)
        : [...f.qualifications, q],
    }));

  const onPhotoChange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setPhotoStatus({ type: '', text: '' });
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setPhotoStatus({ type: 'error', text: 'Only JPG, PNG or WebP images are allowed.' });
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setPhotoStatus({ type: 'error', text: 'Photo must be 2 MB or smaller.' });
      return;
    }
    setPhotoBusy(true);
    try {
      const fd = new FormData();
      fd.append('photo', file);
      const res = await api.put('/teachers/me/photo', fd);
      setPhoto(res.data.teacher.profilePic || '');
      setUser((u) => (u ? { ...u, profilePic: res.data.teacher.profilePic } : u));
      notifySuccess('Your new profile photo is saved.', 'Photo updated');
    } catch (err) {
      setPhotoStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setPhotoBusy(false);
    }
  };

  const removePhoto = async () => {
    setPhotoStatus({ type: '', text: '' });
    setPhotoBusy(true);
    try {
      await api.delete('/teachers/me/photo');
      setPhoto('');
      setUser((u) => (u ? { ...u, profilePic: '' } : u));
      notifySuccess('Your profile photo has been removed.', 'Photo removed');
    } catch (err) {
      setPhotoStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setPhotoBusy(false);
    }
  };

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
        staffType: form.staffType,
        designation: form.designation,
        designationOther: form.designation === 'Others' ? form.designationOther.trim() : '',
        qualifications: form.qualifications,
        age: Number(form.age),
        gender: form.gender,
        phone: form.phone.trim(),
        experienceYears: Number(form.experienceYears),
      };
      await api.put('/teachers/me', payload);
      setUser((u) => (u ? { ...u, name: payload.name } : u));
      notifySuccess('Your profile details have been saved.', 'Profile saved');
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
      notifySuccess('Use your new password the next time you sign in.', 'Password changed');
    } catch (err) {
      setPwStatus({ type: 'error', text: errorMessage(err) });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading && !data) return <p role="status" className="text-slate-600">Loading…</p>;
  if (!data) return <p role="alert" className="text-red-700">{error || 'Could not load your profile.'}</p>;

  const fields = ['name', 'staffType', 'designation', 'qualifications', 'age', 'gender', 'phone', 'experienceYears'];
  const isFilled = (k) => (k === 'qualifications' ? form.qualifications.length > 0 : String(form[k]).trim() !== '');
  const filled = fields.filter(isFilled).length + (photo ? 1 : 0);
  const total = fields.length + 1;
  const pwType = showPw ? 'text' : 'password';
  const designationList = DESIGNATIONS[form.staffType] || [];

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
          {photo ? (
            <img
              src={photo}
              alt="Your profile"
              className="h-16 w-16 shrink-0 rounded-full object-cover ring-2 ring-forest-100"
            />
          ) : (
            <span
              aria-hidden="true"
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-forest-800 font-serif text-2xl font-bold text-white"
            >
              {(form.name || data.teacher.email || '?').trim().charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0 flex-1">
            <h2 id="profile-h" className="section-title !text-xl">My Profile</h2>
            <p className="truncate text-sm text-slate-600">{data.teacher.email}</p>
          </div>
          <div className="w-full sm:w-52">
            <p className="text-sm font-medium text-forest-900">{filled} of {total} details filled</p>
            <div
              className="mt-1 h-1.5 overflow-hidden rounded-full bg-forest-100"
              role="progressbar"
              aria-label="Profile completeness"
              aria-valuenow={filled}
              aria-valuemin={0}
              aria-valuemax={total}
            >
              <div className="h-full rounded-full bg-ochre-500 transition-all" style={{ width: `${(filled / total) * 100}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <input
            ref={fileRef}
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="sr-only"
            onChange={onPhotoChange}
            disabled={photoBusy}
          />
          <button type="button" className="btn-primary" disabled={photoBusy} onClick={() => fileRef.current?.click()}>
            {photoBusy ? 'Please wait…' : photo ? 'Change Photo' : 'Upload Photo'}
          </button>
          {photo && (
            <button type="button" className="text-sm font-medium text-red-700 underline disabled:opacity-50" disabled={photoBusy} onClick={removePhoto}>
              Remove photo
            </button>
          )}
          <span className="text-xs text-slate-500">JPG, PNG or WebP, up to 2 MB.</span>
        </div>
        <div role="alert">
          {photoStatus.type === 'error' && <p className="mt-2 rounded bg-red-50 p-3 text-sm font-medium text-red-800">{photoStatus.text}</p>}
        </div>

        <p className="mt-4 text-sm text-slate-600">
          Your name, photo, designation, qualifications and years of experience are shown on the public Our Staff
          page once your profile is complete. Your email, contact number, age and gender are visible only to school
          administrators and are never published.
        </p>

        <form onSubmit={save} noValidate className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="email" className="label">Email (used for login)</label>
            <input id="email" className="input bg-slate-100" value={data.teacher.email} readOnly />
          </div>

          <div className="sm:col-span-2">{input('name', 'Full name', { autoComplete: 'name', required: true })}</div>

          <div>
            <label htmlFor="staffType" className="label">Staff type</label>
            <select
              id="staffType"
              className="input"
              value={form.staffType}
              onChange={setStaffType}
              aria-invalid={errors.staffType ? 'true' : 'false'}
              aria-describedby={errors.staffType ? 'staffType-err' : undefined}
              required
            >
              <option value="">Select…</option>
              {STAFF_TYPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            {errors.staffType && <p id="staffType-err" className="mt-1 text-sm text-red-700">{errors.staffType}</p>}
          </div>

          <div>
            <label htmlFor="designation" className="label">Designation</label>
            <select
              id="designation"
              className="input"
              value={form.designation}
              onChange={set('designation')}
              disabled={!form.staffType}
              aria-invalid={errors.designation ? 'true' : 'false'}
              aria-describedby={errors.designation ? 'designation-err' : undefined}
              required
            >
              <option value="">{form.staffType ? 'Select…' : 'Choose staff type first'}</option>
              {designationList.map((d) => <option key={d}>{d}</option>)}
            </select>
            {errors.designation && <p id="designation-err" className="mt-1 text-sm text-red-700">{errors.designation}</p>}
          </div>

          {form.designation === 'Others' && (
            <div className="sm:col-span-2">
              {input('designationOther', 'Please specify your designation', { maxLength: 60, required: true })}
            </div>
          )}

          <fieldset className="sm:col-span-2" aria-describedby={errors.qualifications ? 'qual-err' : undefined}>
            <legend className="label">Qualifications (select all that apply)</legend>
            <div className="mt-1 flex flex-wrap gap-x-5 gap-y-2">
              {QUALIFICATIONS.map((q) => (
                <label key={q} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.qualifications.includes(q)} onChange={() => toggleQual(q)} />
                  {q}
                </label>
              ))}
            </div>
            {errors.qualifications && <p id="qual-err" className="mt-1 text-sm text-red-700">{errors.qualifications}</p>}
          </fieldset>

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
          {input('experienceYears', 'Years of experience', { type: 'number', min: 0, max: 50, inputMode: 'numeric', required: true })}

          <div className="sm:col-span-2">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
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
          <div role="alert">
            {pwStatus.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{pwStatus.text}</p>}
          </div>
        </form>
      </section>
    </div>
  );
}