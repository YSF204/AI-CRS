import React, { useEffect, useMemo, useState } from 'react';
import { Save, User } from 'lucide-react';
import DashboardNav from '../../components/shared/DashboardNav';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import api from '../../services/api';

function Field({ id, label, value, onChange, type = 'text' }) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        className="w-full rounded-none border-[3px] px-4 py-3 font-mono text-sm outline-none transition-shadow"
        style={{
          background: 'var(--card-bg)',
          color: 'var(--fg)',
          borderColor: 'var(--border-color)',
          boxShadow: '4px 4px 0 var(--shadow-color)',
        }}
      />
    </div>
  );
}

export default function AdminProfile() {
  const { user, updateUserState } = useAuth();
  const { theme } = useTheme();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    gender: 'MALE',
    age: '',
    telephone: '',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      gender: user.gender || 'MALE',
      age: user.age?.toString() || '',
      telephone: user.telephone?.[0] || '',
    });
  }, [user]);

  const fullName = useMemo(() => {
    const value = `${form.firstName} ${form.lastName}`.trim();
    return value || 'Administrator';
  }, [form.firstName, form.lastName]);

  const initials = useMemo(() => {
    return fullName
      .split(' ')
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  }, [fullName]);

  const panelStyles = useMemo(() => {
    if (theme === 'dark') {
      return {
        hero: 'linear-gradient(135deg, #24242b 0%, #2c313a 100%)',
        badge: '#7dd3c7',
        badgeText: '#10201f',
        accent: '#f4df77',
      };
    }

    return {
      hero: 'linear-gradient(135deg, #f7f2e7 0%, #eef3ed 100%)',
      badge: '#4ecdc4',
      badgeText: '#0a0a0a',
      accent: '#ffe630',
    };
  }, [theme]);

  const setField = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!user?.id && !user?._id) return;

    setSaving(true);
    setMessage('');
    setError('');

    try {
      const targetId = user.id || user._id;
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        gender: form.gender,
        age: form.age ? Number(form.age) : undefined,
        telephone: form.telephone ? [form.telephone] : [],
      };

      const res = await api.patch(`/admin/users/${targetId}`, payload);
      updateUserState(res.data.data.user);
      setMessage('Account details updated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update your admin profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-(--bg) p-8 text-(--fg)">
      <div className="mx-auto max-w-4xl">
        <DashboardNav role="admin" />

        <div className="mt-8">
          <div
            className="overflow-hidden border-[3px]"
            style={{
              background: panelStyles.hero,
              borderColor: 'var(--border-color)',
              boxShadow: '8px 8px 0 var(--shadow-color)',
            }}
          >
            <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
              <div
                className="flex h-24 w-24 items-center justify-center border-[4px] text-3xl font-black"
                style={{
                  background: panelStyles.badge,
                  color: panelStyles.badgeText,
                  borderColor: 'var(--border-color)',
                }}
              >
                {initials}
              </div>
              <div>
                <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)">
                  Admin Profile
                </div>
                <h1 className="mt-2 text-4xl font-black uppercase leading-none text-(--fg)">
                  Account Details
                </h1>
                <p className="mt-3 max-w-xl font-mono text-sm text-(--fg-muted)">
                  Update the logged-in administrator account without the extra dashboard clutter.
                </p>
              </div>
            </div>
          </div>

          <div
            className="mt-6 border-[3px] p-6"
            style={{
              background: 'var(--card-bg)',
              borderColor: 'var(--border-color)',
              boxShadow: '8px 8px 0 var(--shadow-color)',
            }}
          >
            <div className="mb-6 flex items-center gap-3">
              <div
                className="flex h-11 w-11 items-center justify-center border-[3px]"
                style={{
                  background: panelStyles.accent,
                  color: '#0a0a0a',
                  borderColor: 'var(--border-color)',
                }}
              >
                <User size={18} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-(--fg)">Account Details</h2>
                <p className="font-mono text-sm text-(--fg-muted)">
                  These values adapt cleanly in light and dark mode.
                </p>
              </div>
            </div>

            {message && (
              <div
                className="mb-4 border-[2px] px-4 py-3 font-mono text-sm"
                style={{
                  background: theme === 'dark' ? '#1f3a34' : '#dff5ec',
                  color: 'var(--fg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {message}
              </div>
            )}
            {error && (
              <div
                className="mb-4 border-[2px] px-4 py-3 font-mono text-sm"
                style={{
                  background: theme === 'dark' ? '#4a2626' : '#ffe2e0',
                  color: 'var(--fg)',
                  borderColor: 'var(--border-color)',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
              <Field id="firstName" label="First Name" value={form.firstName} onChange={setField('firstName')} />
              <Field id="lastName" label="Last Name" value={form.lastName} onChange={setField('lastName')} />
              <Field id="email" label="Email" type="email" value={form.email} onChange={setField('email')} />

              <div className="flex flex-col gap-2">
                <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)" htmlFor="gender">
                  Gender
                </label>
                <select
                  id="gender"
                  value={form.gender}
                  onChange={setField('gender')}
                  className="w-full rounded-none border-[3px] px-4 py-3 font-mono text-sm outline-none"
                  style={{
                    background: 'var(--card-bg)',
                    color: 'var(--fg)',
                    borderColor: 'var(--border-color)',
                    boxShadow: '4px 4px 0 var(--shadow-color)',
                  }}
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                </select>
              </div>

              <Field id="age" label="Age" type="number" value={form.age} onChange={setField('age')} />
              <Field id="telephone" label="Telephone" value={form.telephone} onChange={setField('telephone')} />

              <div className="md:col-span-2 flex items-center justify-between gap-4 border-t-2 border-dashed pt-4" style={{ borderColor: 'var(--border-color)' }}>
                <div className="font-mono text-xs text-(--fg-muted)">
                  Signed in as `{user?.role || 'ADMIN'}`.
                </div>
                <button
                  type="submit"
                  disabled={saving}
                  className="brutal-btn px-5 py-3"
                  style={{
                    background: panelStyles.accent,
                    color: '#0a0a0a',
                    opacity: saving ? 0.6 : 1,
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : 'Save Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
