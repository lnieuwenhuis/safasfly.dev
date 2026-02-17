import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { trackEvent } from '../lib/analytics';

type LeadState = 'idle' | 'sending' | 'success' | 'error';

const initialForm = {
  email: '',
  name: '',
  company: '',
  website: '',
  useCase: '',
};

export function LeadMagnetPage() {
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<LeadState>('idle');
  const [message, setMessage] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');

    try {
      await api.captureLead(form);
      setState('success');
      setMessage('Thanks. I will send the project checklist by email.');
      setForm(initialForm);
      trackEvent('lead_magnet_signup', { source: 'free-audit-page' }).catch(() => undefined);
    } catch (error) {
      console.error(error);
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Could not submit your request');
    }
  }

  return (
    <section className="space-y-6">
      <div className="max-w-3xl space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Free resource</p>
        <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Project build checklist
        </h2>
        <p className="text-base-content/80">
          A short checklist I use for school and side projects before publishing.
        </p>
      </div>

      <form
        className="card max-w-3xl border border-primary/25 bg-base-200/60 p-5 shadow-xl [&_input]:input [&_input]:input-bordered [&_input]:w-full [&_textarea]:textarea [&_textarea]:textarea-bordered [&_textarea]:w-full [&_label]:label [&_label]:label-text [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.2em]"
        onSubmit={handleSubmit}
      >
        <label htmlFor="lead-email">Email</label>
        <input
          id="lead-email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label htmlFor="lead-name">Name</label>
        <input
          id="lead-name"
          type="text"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
        />

        <label htmlFor="lead-company">School / company (optional)</label>
        <input
          id="lead-company"
          type="text"
          value={form.company}
          onChange={(event) => setForm((prev) => ({ ...prev, company: event.target.value }))}
        />

        <label htmlFor="lead-website">Project URL (optional)</label>
        <input
          id="lead-website"
          type="url"
          value={form.website}
          onChange={(event) => setForm((prev) => ({ ...prev, website: event.target.value }))}
        />

        <label htmlFor="lead-use-case">What are you working on?</label>
        <textarea
          id="lead-use-case"
          rows={4}
          value={form.useCase}
          onChange={(event) => setForm((prev) => ({ ...prev, useCase: event.target.value }))}
        />

        <button type="submit" className="btn btn-primary mt-2 normal-case" disabled={state === 'sending'}>
          {state === 'sending' ? 'Submitting...' : 'Send checklist'}
        </button>

        {state === 'success' ? <p className="text-sm text-success">{message}</p> : null}
        {state === 'error' ? <p className="text-sm text-error">{message}</p> : null}
      </form>
    </section>
  );
}
