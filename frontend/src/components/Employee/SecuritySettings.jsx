import React, { useState } from 'react';
import { Shield, Eye, EyeOff, Key } from 'lucide-react';
import api from '../../services/api';

/**
 * SecuritySettings — password change form.
 * Solely responsible for the security / account panel.
 */
export default function SecuritySettings() {
  const [form, setForm] = useState({ current: '', next: '', confirm: '' });
  const [show, setShow] = useState({ current: false, next: false, confirm: false });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));
  const toggle = (field) => () => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (form.next.length < 8) {
      setError('New password must be at least 8 characters.');
      return;
    }
    if (form.next !== form.confirm) {
      setError('New passwords do not match.');
      return;
    }

    try {
      await api.patch('/auth/updatePassword', {
        passwordCurrent: form.current,
        password: form.next,
        passwordConfirm: form.confirm,
      });
      setSuccess(true);
      setForm({ current: '', next: '', confirm: '' });
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update password.');
    }
  };

  const PasswordField = ({ id, label, field }) => (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="form-label mb-1"
      >
        <Key size={12} className="inline mr-1.5 mb-0.5" />
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          placeholder="••••••••"
          className="nm-input font-mono text-sm pr-12"
        />
        <button
          type="button"
          onClick={toggle(field)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors shrink-0"
        >
          {show[field] ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="nm-card security-settings-card">
      <h3 className="jd-section-title flex items-center gap-2">
        <Shield size={18} className="text-[var(--nm-warning)]" />
        Account Security
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <PasswordField id="current" label="Current Password" field="current" />
        <div className="grid grid-cols-1 gap-6">
          <PasswordField id="next"    label="New Password"     field="next"    />
          <PasswordField id="confirm" label="Confirm Password" field="confirm" />
        </div>

        {error && (
          <div className="nm-chip bg-[var(--nm-error-surface)] border-[var(--nm-error)] text-[var(--nm-error)] py-3 px-4 w-full justify-start lowercase">
             {error}
          </div>
        )}
        {success && (
          <div className="nm-chip bg-[var(--nm-success-surface)] border-[var(--nm-success)] text-[var(--nm-success)] py-3 px-4 w-full justify-start lowercase">
             Password updated successfully.
          </div>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="nm-btn nm-btn-primary w-full"
          >
            <Shield size={16} />
            UPDATE PASSWORD
          </button>
        </div>
      </form>
    </div>
  );
}
