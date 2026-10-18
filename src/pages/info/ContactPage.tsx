import React, { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { SITE } from '../../config/site';
import { InfoPageLayout } from './InfoPageLayout';
import { useApp } from '../../context/AppContext';

export const ContactPage: React.FC = () => {
  const { addToast } = useApp();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState<'General' | 'Bug report' | 'Feature request' | 'Content feedback'>('General');
  const [message, setMessage] = useState('');

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false
  });

  const nameTrimmed = name.trim();
  const nameError = touched.name && !nameTrimmed ? 'Please provide your name.' : '';

  const emailTrimmed = email.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const emailError =
    touched.email && (!emailTrimmed || !emailRegex.test(emailTrimmed))
      ? 'Please provide a valid email address.'
      : '';

  const messageLength = message.trim().length;
  const messageError =
    touched.message && (messageLength < 10 || messageLength > 1000)
      ? 'Message must be between 10 and 1,000 characters.'
      : '';

  const isFormValid = Boolean(
    nameTrimmed &&
    emailTrimmed &&
    emailRegex.test(emailTrimmed) &&
    messageLength >= 10 &&
    messageLength <= 1000
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ name: true, email: true, message: true });

    if (!isFormValid) return;

    const encodedSubject = encodeURIComponent(`[TradeWise - ${subject}] from ${nameTrimmed}`);
    const encodedBody = encodeURIComponent(
      `Name: ${nameTrimmed}\nEmail: ${emailTrimmed}\nSubject: ${subject}\n\nMessage:\n${message.trim()}`
    );

    window.location.href = `mailto:${SITE.contactEmail}?subject=${encodedSubject}&body=${encodedBody}`;

    addToast('Opening your email app…', 'You can review and send your message directly.', 'info');

    setName('');
    setEmail('');
    setSubject('General');
    setMessage('');
    setTouched({ name: false, email: false, message: false });
  };

  return (
    <InfoPageLayout title="Contact Us">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Column: Intro & Direct Email */}
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-brand-light mt-0 mb-2">Get in Touch</h2>
            <p className="text-sm text-brand-muted leading-relaxed">
              Have questions about TradeWise, found a bug in the simulator, or have feedback on our study modules? We would love to hear from you.
            </p>
          </div>

          <div className="p-5 bg-brand-dark rounded-xl border border-white/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs text-brand-muted block font-medium">Direct Email</span>
                <a
                  href={`mailto:${SITE.contactEmail}`}
                  className="text-sm font-semibold text-brand-light hover:text-brand-orange transition-colors"
                >
                  {SITE.contactEmail}
                </a>
              </div>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              Our team reads all feedback and educational suggestions. Responses are typically sent within 2 business days.
            </p>
          </div>

          <div className="p-5 bg-brand-dark rounded-xl border border-white/5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-brand-light">
              <MessageSquare className="w-4 h-4 text-brand-muted" />
              <span>How this form works</span>
            </div>
            <p className="text-xs text-brand-muted leading-relaxed">
              TradeWise operates entirely client-side without storing messages on a backend database. Submitting this form prepares a pre-filled message inside your default email client.
            </p>
          </div>
        </div>

        {/* Right Column: Contact Form */}
        <form onSubmit={handleSubmit} className="bg-brand-dark p-6 rounded-xl border border-white/5 space-y-4">
          <h3 className="text-base font-bold text-brand-light">Send a Message</h3>

          {/* Name Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">
              Your Name <span className="text-brand-orange">*</span>
            </label>
            <input
              type="text"
              value={name}
              onBlur={() => setTouched(prev => ({ ...prev, name: true }))}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Rishi Shah"
              className="w-full bg-[#1e2030] rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {nameError && <p className="text-[#ef4444] text-xs">{nameError}</p>}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">
              Your Email Address <span className="text-brand-orange">*</span>
            </label>
            <input
              type="email"
              value={email}
              onBlur={() => setTouched(prev => ({ ...prev, email: true }))}
              onChange={e => setEmail(e.target.value)}
              placeholder="e.g. rishi@example.com"
              className="w-full bg-[#1e2030] rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none"
            />
            {emailError && <p className="text-[#ef4444] text-xs">{emailError}</p>}
          </div>

          {/* Subject Field */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-brand-light block">Subject</label>
            <select
              value={subject}
              onChange={e => setSubject(e.target.value as 'General' | 'Bug report' | 'Feature request' | 'Content feedback')}
              className="w-full bg-[#1e2030] rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none cursor-pointer"
            >
              <option value="General">General Inquiry</option>
              <option value="Bug report">Bug Report</option>
              <option value="Feature request">Feature Request</option>
              <option value="Content feedback">Content Feedback</option>
            </select>
          </div>

          {/* Message Field */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-brand-light block">
                Message <span className="text-brand-orange">*</span>
              </label>
              <span className={`text-[11px] ${messageLength > 1000 ? 'text-[#ef4444]' : 'text-brand-muted'}`}>
                {messageLength}/1000
              </span>
            </div>
            <textarea
              rows={4}
              value={message}
              onBlur={() => setTouched(prev => ({ ...prev, message: true }))}
              onChange={e => setMessage(e.target.value)}
              placeholder="Write your feedback or inquiry here (10–1000 characters)..."
              className="w-full bg-[#1e2030] rounded-lg px-3 py-2 text-sm text-brand-light border border-transparent focus:border-white/20 outline-none resize-none"
            />
            {messageError && <p className="text-[#ef4444] text-xs">{messageError}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-lg bg-brand-orange text-brand-black hover:opacity-90 text-sm font-semibold flex items-center justify-center gap-2 transition-opacity cursor-pointer shadow-md"
          >
            <Send className="w-4 h-4" />
            <span>Open Email Client</span>
          </button>
        </form>
      </div>
    </InfoPageLayout>
  );
};
