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
      await api.sendContact(form);
      setState('success');
      setMessage('Thanks, your message was sent. I will get back to you soon.');
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
          Let&apos;s connect
        </h2>
        <p className="text-base-content/80">
          Reach out for internship opportunities, graduation assignments, collaboration, or project feedback.
        </p>

        <div className="space-y-2 rounded-2xl border border-primary/25 bg-base-200/55 p-5 text-sm text-base-content/80 shadow-lg">
          <p className="font-medium text-success">Usually replies within 1-2 days.</p>
          <p>Best for school, internship, and collaboration conversations.</p>
          <p className="text-base-content/65">For quick contact, email is the best channel.</p>
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
            Message form
          </h3>
          <p className="text-sm text-base-content/70">Simple form, direct reply.</p>
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

        <label htmlFor="subject">Topic summary</label>
        <input
          id="subject"
          name="subject"
          type="text"
          value={form.subject}
          onChange={(event) => setForm((prev) => ({ ...prev, subject: event.target.value }))}
          required
        />

        <label htmlFor="projectType">Reason for contact</label>
        <select
          id="projectType"
          name="projectType"
          value={form.projectType}
          onChange={(event) => setForm((prev) => ({ ...prev, projectType: event.target.value }))}
          required
        >
          <option value="">Select reason</option>
          <option value="internship-opportunity">Internship opportunity</option>
          <option value="graduation-assignment">Graduation assignment</option>
          <option value="collaboration">Collaboration</option>
          <option value="project-feedback">Question about a project</option>
          <option value="other">Other</option>
        </select>

        <label htmlFor="budgetRange">Your context</label>
        <select
          id="budgetRange"
          name="budgetRange"
          value={form.budgetRange}
          onChange={(event) => setForm((prev) => ({ ...prev, budgetRange: event.target.value }))}
          required
        >
          <option value="">Select context</option>
          <option value="school">School / teacher</option>
          <option value="company">Company</option>
          <option value="student">Student / peer</option>
          <option value="personal-project">Personal project</option>
        </select>

        <label htmlFor="timeline">Preferred timing</label>
        <select
          id="timeline"
          name="timeline"
          value={form.timeline}
          onChange={(event) => setForm((prev) => ({ ...prev, timeline: event.target.value }))}
          required
        >
          <option value="">Select timing</option>
          <option value="this-week">This week</option>
          <option value="this-month">This month</option>
          <option value="next-quarter">Next 1-3 months</option>
          <option value="flexible">Flexible</option>
        </select>

        <label htmlFor="message">Message</label>
        <textarea
          id="message"
          name="message"
          rows={5}
          value={form.message}
          onChange={(event) => setForm((prev) => ({ ...prev, message: event.target.value }))}
          required
        />

        <button type="submit" className="btn btn-primary mt-2 normal-case" disabled={state === 'sending'}>
          {state === 'sending' ? 'Sending...' : 'Send message'}
        </button>

        {state === 'success' ? <p className="text-sm text-success">{message || 'Message sent.'}</p> : null}
        {state === 'error' ? <p className="text-sm text-error">{message || 'Could not send message.'}</p> : null}
      </form>
    </section>
  );
}
