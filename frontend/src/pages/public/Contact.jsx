import { useState } from 'react';
import usePageTitle from '../../hooks/usePageTitle';
import PageHeader from '../../components/common/PageHeader';
import { school } from '../../config/school';
import api, { errorMessage } from '../../utils/api';

const empty = { name: '', email: '', phone: '', message: '', website: '' }; // `website` is a honeypot
const MAX = 1000;

function validate(f) {
  const e = {};
  if (f.name.trim().length < 2) e.name = 'Please enter your name.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = 'Please enter a valid email address.';
  if (f.phone && !/^[+\d][\d\s-]{7,14}$/.test(f.phone)) e.phone = 'Please enter a valid phone number or leave it blank.';
  if (f.message.trim().length < 10) e.message = 'Please write at least 10 characters.';
  if (f.message.length > MAX) e.message = 'Please keep your message under 1000 characters.';
  return e;
}

function InfoCard({ title, children }) {
  return (
    <section className="card border-l-4 border-l-ochre-500 p-5">
      <h2 className="font-serif text-lg font-semibold text-forest-900">{title}</h2>
      <div className="mt-2 space-y-1 text-slate-700">{children}</div>
    </section>
  );
}

export default function Contact() {
  usePageTitle('Contact Us');
  const [form, setForm] = useState(empty);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState({ type: '', text: '' });
  const [sending, setSending] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setStatus({ type: '', text: '' });
    if (Object.keys(found).length) return;

    setSending(true);
    try {
      await api.post('/contact', form);
      setForm(empty);
      setStatus({ type: 'ok', text: 'Your message has been received by the school office. Thank you.' });
    } catch (err) {
      setStatus({ type: 'error', text: errorMessage(err, 'Your message could not be sent. Please try again later.') });
    } finally {
      setSending(false);
    }
  };

  const field = (id, label, props = {}) => (
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

  const hasPhone = school.phone.verified;
  const hasEmail = school.email.verified;
  const hasHours = school.officeHours.verified;

  return (
    <>
      <PageHeader title="Contact Us" subtitle="Get in touch with the school" />
      <div className="container-page grid gap-8 py-10 lg:grid-cols-5">
        <div className="space-y-5 lg:col-span-2">
          <InfoCard title="Address">
            <p className="font-semibold text-forest-900">{school.name}</p>
            <address className="not-italic leading-relaxed">
              {school.address.line}
              <br />
              {school.address.state} – {school.address.pin}
            </address>
          </InfoCard>

          {(hasPhone || hasEmail || hasHours) ? (
            <InfoCard title="Phone, email and hours">
              {hasPhone && (
                <p>
                  Phone:{' '}
                  <a className="font-medium underline" href={`tel:${school.phone.value.replace(/[^+\d]/g, '')}`}>
                    {school.phone.value}
                  </a>
                </p>
              )}
              {hasEmail && (
                <p>
                  Email:{' '}
                  <a className="font-medium underline" href={`mailto:${school.email.value}`}>{school.email.value}</a>
                </p>
              )}
              {hasHours && <p>Office hours: {school.officeHours.value}</p>}
            </InfoCard>
          ) : (
            <p className="rounded border border-dashed border-ochre-400 bg-ochre-50 p-4 text-sm text-ochre-700">
              Telephone and email details will be published after confirmation by the school.
            </p>
          )}

          <InfoCard title="Directions">
            <p>Open the school&apos;s address in Google Maps.</p>
            <div className="flex flex-wrap gap-3 pt-2">
              <a href={school.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">Open in Google Maps</a>
              <a href={school.mapUrl} target="_blank" rel="noopener noreferrer" className="btn-outline">Get Directions</a>
            </div>
          </InfoCard>
        </div>

        <section className="card p-6 lg:col-span-3" aria-labelledby="enquiry">
          <h2 id="enquiry" className="section-title !text-xl">Send an Enquiry</h2>
          <p className="mt-1 text-sm text-slate-600">The school office will reply to the email address you provide.</p>
          <form onSubmit={submit} noValidate className="mt-5 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              {field('name', 'Your name', { autoComplete: 'name', required: true })}
              {field('email', 'Email address', { type: 'email', autoComplete: 'email', required: true })}
            </div>
            {field('phone', 'Phone number (optional)', { type: 'tel', autoComplete: 'tel' })}

            <div>
              <label htmlFor="message" className="label">Message</label>
              <textarea
                id="message"
                rows="6"
                maxLength={MAX}
                className="input"
                value={form.message}
                onChange={set('message')}
                aria-invalid={errors.message ? 'true' : 'false'}
                aria-describedby={errors.message ? 'message-err message-count' : 'message-count'}
                required
              />
              <div className="mt-1 flex justify-between gap-3">
                <span>
                  {errors.message && <span id="message-err" className="text-sm text-red-700">{errors.message}</span>}
                </span>
                <span id="message-count" className="text-xs text-slate-500">{form.message.length} / {MAX}</span>
              </div>
            </div>

            {/* Honeypot: hidden from people, filled by bots. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Leave this empty</label>
              <input id="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
            </div>

            <p className="text-xs text-slate-600">
              Privacy: we use your details only to reply to your enquiry. Please do not enter a student&apos;s
              personal records.
            </p>

            <button type="submit" disabled={sending} className="btn-primary">
              {sending ? 'Sending…' : 'Send Message'}
            </button>

            <div role="status" aria-live="polite">
              {status.type === 'ok' && <p className="rounded bg-forest-50 p-3 text-sm font-medium text-forest-800">{status.text}</p>}
            </div>
            <div role="alert">
              {status.type === 'error' && <p className="rounded bg-red-50 p-3 text-sm font-medium text-red-800">{status.text}</p>}
            </div>
          </form>
        </section>
      </div>
    </>
  );
}
