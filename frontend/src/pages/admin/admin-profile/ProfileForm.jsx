import React from 'react';
import { User } from 'lucide-react';
import { useTranslation } from '../../../context/LanguageContext';

export function Field({ id, label, value, onChange, type = 'text' }) {
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
                className="w-full border-[4px] px-4 py-3 font-mono text-sm outline-none transition-shadow"
                style={{
                    background: 'var(--card-bg)',
                    color: 'var(--fg)',
                    borderColor: 'var(--nm-ink, #000)',
                    borderRadius: '0px',
                }}
            />
        </div>
    );
}

export default function AdminProfileForm({ form, setField, handleSubmit, saving, message, error, panelStyles, user }) {
    const { t } = useTranslation();

    return (
        <div
            className="border-[4px] p-6"
            style={{
                background: 'var(--card-bg)',
                borderColor: 'var(--nm-ink, #000)',
                borderRadius: '0px',
            }}
        >
            <div className="mb-6 flex items-center gap-3">
                <div
                    className="flex h-11 w-11 items-center justify-center border-[4px]"
                    style={{
                        background: panelStyles.accent,
                        color: '#ffffff',
                        borderColor: 'var(--nm-ink, #000)',
                        borderRadius: '0px',
                    }}
                >
                    <User size={18} />
                </div>
                <div>
                    <h2 className="text-2xl font-black text-(--fg)">{t('admin.accountDetails', {}, 'Account Details')}</h2>
                    <p className="font-mono text-sm text-(--fg-muted)">
                        {t('admin.updateAdminInfoDesc', {}, 'Update your admin account information')}
                    </p>
                </div>
            </div>

            {message && (
                <div
                    className="mb-4 border-[4px] px-4 py-3 font-mono text-sm"
                    style={{
                        background: 'var(--card-bg)',
                        color: panelStyles.accent,
                        borderColor: 'var(--nm-ink, #000)',
                        borderRadius: '0px',
                    }}
                >
                    {message}
                </div>
            )}

            {error && (
                <div
                    className="mb-4 border-[4px] px-4 py-3 font-mono text-sm"
                    style={{
                        background: '#ffebee',
                        color: '#ba1a1a',
                        borderColor: 'var(--nm-ink, #000)',
                        borderRadius: '0px',
                    }}
                >
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
                <Field id="firstName" label={t('auth.firstName', {}, 'First Name')} value={form.firstName} onChange={setField('firstName')} />
                <Field id="lastName" label={t('auth.lastName', {}, 'Last Name')} value={form.lastName} onChange={setField('lastName')} />
                <Field id="email" label={t('auth.email', {}, 'Email')} type="email" value={form.email} onChange={setField('email')} />

                <div className="flex flex-col gap-2">
                    <label className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)" htmlFor="gender">
                        {t('auth.gender', {}, 'Gender')}
                    </label>
                    <select
                        id="gender"
                        value={form.gender}
                        onChange={setField('gender')}
                        className="w-full border-[4px] px-4 py-3 font-mono text-sm outline-none"
                        style={{
                            background: 'var(--card-bg)',
                            color: 'var(--fg)',
                            borderColor: 'var(--nm-ink, #000)',
                            borderRadius: '0px',
                        }}
                    >
                        <option value="MALE">{t('auth.male', {}, 'Male')}</option>
                        <option value="FEMALE">{t('auth.female', {}, 'Female')}</option>
                    </select>
                </div>

                <Field id="age" label={t('auth.age', {}, 'Age')} type="number" value={form.age} onChange={setField('age')} />
                <Field id="telephone" label={t('auth.telephone', {}, 'Telephone')} value={form.telephone} onChange={setField('telephone')} />

                <div
                    className="md:col-span-2 flex items-center justify-between gap-4 border-t-[4px] border-dashed pt-4"
                    style={{ borderColor: 'var(--nm-ink, #000)' }}
                >
                    <div className="font-mono text-xs text-(--fg-muted)">
                        {t('admin.signedInAs', {}, 'Signed in as')} `{user?.role || 'ADMIN'}`.
                    </div>
                    <button
                        type="submit"
                        disabled={saving}
                        className="border-[4px] px-5 py-3 font-mono text-sm font-bold uppercase"
                        style={{
                            background: panelStyles.accent,
                            color: '#ffffff',
                            borderColor: 'var(--nm-ink, #000)',
                            borderRadius: '0px',
                            opacity: saving ? 0.6 : 1,
                        }}
                    >
                        {saving ? t('employer.saving', {}, 'Saving...') : t('admin.saveProfile', {}, 'Save Details')}
                    </button>
                </div>
            </form>
        </div>
    );
}
