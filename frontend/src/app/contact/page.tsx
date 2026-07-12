'use client';

import { useState } from 'react';
import { isValidEmail } from '@/lib/validation';
import toast from 'react-hot-toast';
import { Send } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!isValidEmail(form.email)) errs.email = 'Invalid email address';
    if (!form.message.trim()) errs.message = 'Message is required';
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSending(true);
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      toast.success('Message sent successfully!');
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send message');
    }
    setSending(false);
  };

  return (
    <div className="flex-grow flex flex-col items-center px-6 py-12 w-full max-w-[720px] mx-auto">
      <div className="w-full text-center mb-10 fade-in-stagger delay-100">
        <h1 className="text-[clamp(1.8rem,4vw,2.5rem)] font-bold text-on-surface tracking-tight">Contact Us</h1>
        <p className="text-base text-on-surface-variant mt-2">Have questions or feedback? We&apos;d love to hear from you.</p>
      </div>
      <div className="w-full grid gap-6 md:grid-cols-2 fade-in-stagger delay-200">
        <div className="glass-panel rounded-xl p-6 light-bleed">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold tracking-wider text-on-surface-variant mb-1 block">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
                placeholder="Your name"
              />
              {errors.name && <p className="text-xs text-red-400 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider text-on-surface-variant mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition"
                placeholder="your@email.com"
              />
              {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email}</p>}
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider text-on-surface-variant mb-1 block">Message</label>
              <textarea
                rows={4}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full bg-surface-container-low border border-outline-variant/50 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary-container spring-transition resize-none"
                placeholder="Your message..."
              />
              {errors.message && <p className="text-xs text-red-400 mt-1">{errors.message}</p>}
            </div>
            <button
              type="submit"
              disabled={sending}
              className="bg-gradient-to-r from-primary-container to-[#8BB8D4] text-on-primary-container font-semibold text-sm px-6 py-2.5 rounded-full liquid-hover spring-transition shadow-lg flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
        <div className="space-y-4">
          <div className="glass-panel rounded-xl p-6 light-bleed">
            <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '24px' }}>mail</span>
            <h3 className="font-semibold text-on-surface mt-2 text-sm">Email</h3>
            <p className="text-sm text-on-surface-variant mt-1">lollino066@gmail.com</p>
          </div>
          <div className="glass-panel rounded-xl p-6 light-bleed">
            <span className="material-symbols-outlined text-primary hand-drawn-icon" style={{ fontSize: '24px' }}>chat</span>
            <h3 className="font-semibold text-on-surface mt-2 text-sm">Response Time</h3>
            <p className="text-sm text-on-surface-variant mt-1">We typically respond within 24 hours.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
