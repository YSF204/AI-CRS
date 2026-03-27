import React, { useState } from 'react';
import { Save, User, Phone, MapPin, Globe, FileText } from 'lucide-react';

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
        className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-(--fg-muted)"
      >
        <Icon size={11} />
        {label}
      </label>
      <div className="brutal-card flex items-center gap-2 px-3 py-2.5 bg-(--card-bg) focus-within:shadow-[4px_4px_0_var(--teal)] transition-shadow">
        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={FIELD_STYLE}
        />
      </div>
    </div>
  );
}

/**
 * ProfileForm — editable personal info section.
 * Manages its own draft state; calls onSave with the updated values.
 */
export default function ProfileForm({ user, onSave }) {
  const [form, setForm] = useState({
    fullName:  user?.fullName         ?? '',
    // telephone is stored as an array on the backend — read first entry
    phone:     user?.telephone?.[0]   ?? '',
    location:  user?.location         ?? '',
    website:   user?.website          ?? '',
    bio:       user?.bio              ?? '',
  });
  const [saved, setSaved] = useState(false);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Wrap phone back into an array to match the backend schema
    onSave?.({ ...form, telephone: form.phone ? [form.phone] : [] });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="brutal-card bg-(--card-bg) p-6">
      <h3 className="font-bold font-['Space_Grotesk'] text-lg uppercase tracking-tight mb-5 flex items-center gap-2">
        <User size={18} className="text-(--teal)" />
        Personal Information
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Full Name"
            id="fullName"
            icon={User}
            value={form.fullName}
            onChange={set('fullName')}
            placeholder="John Doe"
          />
          <FormField
            label="Phone"
            id="phone"
            icon={Phone}
            type="tel"
            value={form.phone}
            onChange={set('phone')}
            placeholder="+20 100 000 0000"
          />
          <FormField
            label="Location"
            id="location"
            icon={MapPin}
            value={form.location}
            onChange={set('location')}
            placeholder="Cairo, Egypt"
          />
          <FormField
            label="Website / LinkedIn"
            id="website"
            icon={Globe}
            type="url"
            value={form.website}
            onChange={set('website')}
            placeholder="https://linkedin.com/in/..."
          />
        </div>

        {/* Bio – full width */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="bio"
            className="flex items-center gap-1.5 text-xs font-bold font-mono uppercase tracking-wider text-(--fg-muted)"
          >
            <FileText size={11} />
            Short Bio
          </label>
          <div className="brutal-card px-3 py-2.5 bg-(--card-bg) focus-within:shadow-[4px_4px_0_var(--teal)] transition-shadow">
            <textarea
              id="bio"
              rows={3}
              value={form.bio}
              onChange={set('bio')}
              placeholder="A short summary about yourself..."
              style={{ ...FIELD_STYLE, resize: 'vertical' }}
            />
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="brutal-btn px-6 py-2.5 font-bold flex items-center gap-2 text-sm transition-transform active:translate-x-[2px] active:translate-y-[2px]"
            style={{ background: saved ? 'var(--mint)' : 'var(--blue)', color: '#ffffff' }}
          >
            <Save size={14} />
            {saved ? 'SAVED ✓' : 'SAVE CHANGES'}
          </button>
        </div>
      </form>
    </div>
  );
}
