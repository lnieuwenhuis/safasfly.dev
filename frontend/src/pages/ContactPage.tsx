import { useState, type FormEvent } from 'react';
import { api } from '../lib/api';
import { trackEvent } from '../lib/analytics';
import { useSiteData } from '../state/SiteDataContext';

type ContactState = 'idle' | 'sending' | 'success' | 'error';

const initialForm = {
  name: '',
  email: '',
  subject: '',
  message: '',
  budgetRange: '',
  timeline: '',
  projectType: '',
  source: 'portfolio',
};

export function ContactPage() {
  const { data } = useSiteData();
  const [form, setForm] = useState(initialForm);
  const [state, setState] = useState<ContactState>('idle');
  const [message, setMessage] = useState('');

  if (!data) {
    return null;
  }

  const { profile } = data;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState('sending');
    setMessage('');

    try {
      const result = await api.sendContact(form);
      setState('success');
      setMessage(result.message);
      setForm(initialForm);
      trackEvent('contact_submitted', {
        budgetRange: form.budgetRange,
        timeline: form.timeline,
        projectType: form.projectType,
      }).catch(() => undefined);
    } catch (error) {
      console.error(error);
      setState('error');
      setMessage(error instanceof Error ? error.message : 'Failed to send message');
    }
  }

  return (
    <section className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.82fr_1.18fr]">
      <div className="space-y-5">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary/80">Contact</p>
        <h2 className="text-3xl font-bold leading-tight md:text-4xl" style={{ fontFamily: 'Sora, sans-serif' }}>
          Start your project
        </h2>
        <p className="text-base-content/80">Share your scope. I will respond with next steps.</p>

        <div className="space-y-2 rounded-2xl border border-primary/25 bg-base-200/55 p-5 text-sm text-base-content/80 shadow-lg">
          <p className="font-medium text-success">{profile.responseSla}</p>
          <p>{profile.availability}</p>
          <p className="text-base-content/65">Calls are scheduled after reviewing your request.</p>
          <a href={`mailto:${profile.email}`} className="link link-hover text-base-content">
            {profile.email}
          </a>
        </div>
      </div>

      <form
        className="card border border-primary/25 bg-base-200/60 p-5 shadow-xl md:p-6 [&_input]:input [&_input]:input-bordered [&_input]:w-full [&_textarea]:textarea [&_textarea]:textarea-bordered [&_textarea]:w-full [&_select]:select [&_select]:select-bordered [&_select]:w-full [&_label]:label [&_label]:label-text [&_label]:text-xs [&_label]:font-semibold [&_label]:uppercase [&_label]:tracking-[0.2em]"
        onSubmit={handleSubmit}
      >
        <div className="mb-1">
          <h3 className="text-xl font-semibold text-base-content" style={{ fontFamily: 'Sora, sans-serif' }}>
            Project inquiry
          </h3>
          <p className="text-sm text-base-content/70">One form, quick review, direct reply.</p>
        </div>

        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          required
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          value={form.email}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          required
        />

        <label htmlFor="subject">Project summary</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          required
        />

        <label htmlFor="projectType">Project type</label>
        <select
          id="projectType"
          name="projectType"
          value={form.projectType}
          onChange={(event) => setForm((prev) => ({ ...prev, projectType: event.target.value }))}
          required
        >
          <option value="">Select type</option>
          <option value="marketing-site">Marketing website</option>
          <option value="web-app">Web application</option>
          <option value="hosting-maintenance">Hosting and maintenance</option>
          <option value="ongoing-retainer">Ongoing retainer</option>
        </select>

        <label htmlFor="budgetRange">Budget range</label>
        <select
          id="budgetRange"
          name="budgetRange"
          value={form.budgetRange}
          onChange={(event) => setForm((prev) => ({ ...prev, budgetRange: event.target.value }))}
          required
        >
          <option value="">Select budget</option>
          <option value="under-1500">Under EUR 1,500</option>
          <option value="1500-3000">EUR 1,500 - EUR 3,000</option>
          <option value="3000-6000">EUR 3,000 - EUR 6,000</option>
          <option value="6000-plus">EUR 6,000+</option>
        </select>

        <label htmlFor="timeline">Timeline</label>
        <select
          id="timeline"
          name="timeline"
          value={form.timeline}
          onChange={(event) => setForm((prev) => ({ ...prev, timeline: event.target.value }))}
          required
        >
          <option value="">Select timeline</option>
          <option value="asap">ASAP</option>
          <option value="2-weeks">Within 2 weeks</option>
          <option value="1-month">Within 1 month</option>
          <option value="flexible">Flexible timeline</option>
        </select>

        <label htmlFor="message">Project details</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          required
        />

        <button type="submit" className="btn btn-primary mt-2 normal-case" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending...' : 'Send request'}
        </button>

        {state === 'success' ? <p className="text-sm text-success">{message || 'Request sent.'}</p> : null}
        {state === 'error' ? <p className="text-sm text-error">{message || 'Could not send request.'}</p> : null}
      </form>
    </section>
  );
}
