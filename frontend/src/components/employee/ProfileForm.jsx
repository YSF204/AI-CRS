import React, { useState } from 'react';
import { Save, User, Phone, MapPin, Globe, FileText } from 'lucide-react';
import { useTranslation } from '../../context/LanguageContext';

const FIELD_STYLE = {
  background: 'transparent',
  outline: 'none',
  width: '100%',
  fontFamily: 'monospace',
  fontSize: '0.875rem',
  color: 'var(--fg)',
};

function FormField({ label, id, icon: Icon, type = 'text', value, onChange, placeholder }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="form-label mb-1"
      >
        <Icon size={12} className="inline mr-1.5 mb-0.5" />
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="nm-input text-sm font-mono"
      />
    </div>
  );
}

/**
 * ProfileForm — editable personal info section.
 * Manages its own draft state; calls onSave with the updated values.
 */
export default function ProfileForm({ user, onSave }) {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    email: user?.email ?? '',
    phone: user?.telephone?.[0] ?? '',
    age: user?.age?.toString() ?? '',
    gender: user?.gender || 'MALE',
  });
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave?.({
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender,
      telephone: form.phone ? [form.phone] : [],
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="nm-card profile-form-card">
      <h3 className="jd-section-title flex items-center gap-2">
        <User size={18} className="text-[var(--nm-primary)]" />
        {t('auth.personalInfo')}
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <FormField
            label={t('auth.firstName')}
            id="firstName"
            icon={User}
            value={form.firstName}
            onChange={set('firstName')}
            placeholder="John"
          />
          <FormField
            label={t('auth.lastName')}
            id="lastName"
            icon={User}
            value={form.lastName}
            onChange={set('lastName')}
            placeholder="Doe"
          />
          <FormField
            label={t('auth.email')}
            id="email"
            icon={Globe}
            type="email"
            value={form.email}
            onChange={set('email')}
            placeholder="you@example.com"
          />
          <FormField
            label={t('auth.phoneNumber')}
            id="phone"
            icon={Phone}
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+20 100 000 0000"
          />
          <FormField
            label={t('auth.age')}
            id="age"
            icon={MapPin}
            type="number"
            value={form.age}
            onChange={set('age')}
            placeholder="30"
          />
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="gender"
              className="form-label mb-1"
            >
              <FileText size={12} className="inline mr-1.5 mb-0.5" />
              {t('auth.gender')}
            </label>
            <select 
              id="gender" 
              value={form.gender} 
              onChange={set('gender')} 
              className="nm-select text-sm font-mono"
            >
              <option value="MALE">{t('auth.male')}</option>
              <option value="FEMALE">{t('auth.female')}</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            className={`nm-btn px-8 min-w-[180px] ${saved ? 'bg-[var(--nm-success)] text-white' : 'nm-btn-primary'}`}
          >
            <Save size={16} />
            {saved ? t('common.saved').toUpperCase() : t('common.saveChanges').toUpperCase()}
          </button>
        </div>
      </form>
    </div>
  );
}
