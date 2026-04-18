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
        className="text-xs font-bold font-mono uppercase tracking-wider text-(--fg-muted) flex items-center gap-1.5"
      >
        <Key size={11} />
        {label}
      </label>
      <div className="brutal-card flex items-center gap-2 px-3 py-2.5 bg-(--card-bg) focus-within:shadow-[4px_4px_0_var(--coral)] transition-shadow">
        <input
          id={id}
          type={show[field] ? 'text' : 'password'}
          value={form[field]}
          onChange={set(field)}
          placeholder="••••••••"
          className="flex-1 bg-transparent outline-none font-mono text-sm"
          style={{ color: 'var(--fg)' }}
        />
        <button
          type="button"
          onClick={toggle(field)}
          className="text-(--fg-muted) hover:text-(--fg) transition-colors shrink-0"
        >
          {show[field] ? <EyeOff size={14} /> : <Eye size={14} />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="brutal-card bg-(--card-bg) p-6">
      <h3 className="font-bold font-['Space_Grotesk'] text-lg uppercase tracking-tight mb-5 flex items-center gap-2">
        <Shield size={18} className="text-(--coral)" />
        Security &amp; Password
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <PasswordField id="current" label="Current Password" field="current" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <PasswordField id="next"    label="New Password"     field="next"    />
          <PasswordField id="confirm" label="Confirm Password" field="confirm" />
        </div>

        {error && (
          <p className="font-mono text-xs border-2 border-black px-3 py-2" style={{ background: 'var(--coral)', color: '#0a0a0a' }}>
            ⚠ {error}
          </p>
        )}
        {success && (
          <p className="font-mono text-xs border-2 border-black px-3 py-2" style={{ background: 'var(--mint)', color: '#0a0a0a' }}>
            ✓ Password updated successfully.
          </p>
        )}

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="brutal-btn px-6 py-2.5 font-bold flex items-center gap-2 text-sm"
            style={{ background: 'var(--yellow)', color: '#0a0a0a' }}
          >
            <Shield size={14} />
            UPDATE PASSWORD
          </button>
        </div>
      </form>
    </div>
  );
}
