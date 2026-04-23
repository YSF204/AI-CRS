import React, { useEffect, useMemo, useState, useRef } from 'react';
import { User, Camera } from 'lucide-react';
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

export default function AdminProfile() {
    const { user, updateUserState } = useAuth();
    const { theme } = useTheme();
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
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

    const profilePicUrl = user?.profilePic
        ? (user.profilePic.startsWith('http')
            ? user.profilePic
            : `http://localhost:3001${user.profilePic}`)
        : null;

    const panelStyles = useMemo(() => {
        if (theme === 'dark') {
            return {
                hero: 'var(--card-bg)',
                badge: '#4d7bff',
                badgeText: '#ffffff',
                accent: '#4d7bff',
            };
        }

        return {
            hero: 'var(--card-bg)',
            badge: '#1e51f6',
            badgeText: '#ffffff',
            accent: '#1e51f6',
        };
    }, [theme]);

    const setField = (field) => (event) => {
        setForm((prev) => ({ ...prev, [field]: event.target.value }));
    };

    const handlePhotoClick = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('profilePic', file);
            const res = await api.post('/users/profile-picture', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            if (res.data?.data?.user) {
                updateUserState(res.data.data.user);
            }
        } catch (err) {
            setError('Failed to upload profile picture.');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
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
        <div className="min-h-screen bg-(--bg) text-(--fg)">
            <div className="dashboard-nav-area">
                <DashboardNav role="admin" />
            </div>

            <div className="dashboard-shell py-6">
                <div
                    className="overflow-hidden border-[4px]"
                    style={{
                        background: panelStyles.hero,
                        borderColor: 'var(--nm-ink, #000)',
                        borderRadius: '0px',
                        marginBottom: 'var(--spacing-6)',
                    }}
                >
                    <div className="grid gap-6 p-6 md:grid-cols-[auto_1fr] md:items-center">
                        <div className="relative">
                            <div
                                className="flex h-24 w-24 items-center justify-center border-[4px] text-3xl font-black overflow-hidden"
                                style={{
                                    background: panelStyles.badge,
                                    color: panelStyles.badgeText,
                                    borderColor: 'var(--nm-ink, #000)',
                                    borderRadius: '0px',
                                }}
                            >
                                {profilePicUrl ? (
                                    <img
                                        src={profilePicUrl}
                                        alt={fullName}
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                ) : (
                                    initials
                                )}
                            </div>
                            <button
                                onClick={handlePhotoClick}
                                disabled={uploading}
                                className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center border-[4px]"
                                style={{
                                    background: panelStyles.accent,
                                    color: '#fff',
                                    borderColor: 'var(--nm-ink, #000)',
                                    borderRadius: '0px',
                                    cursor: uploading ? 'wait' : 'pointer',
                                }}
                                title="Change photo"
                            >
                                <Camera size={14} />
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handlePhotoChange}
                                style={{ display: 'none' }}
                            />
                        </div>
                        <div>
                            <div className="font-mono text-[11px] uppercase tracking-[0.18em] text-(--fg-muted)">
                                Admin Profile
                            </div>
                            <h1 className="mt-2 text-4xl font-black uppercase leading-none text-(--fg)">
                                Account Details
                            </h1>

                        </div>
                    </div>
                </div>

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
                            <h2 className="text-2xl font-black text-(--fg)">Account Details</h2>
                            <p className="font-mono text-sm text-(--fg-muted)">
                                Update your admin account information
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
                                className="w-full border-[4px] px-4 py-3 font-mono text-sm outline-none"
                                style={{
                                    background: 'var(--card-bg)',
                                    color: 'var(--fg)',
                                    borderColor: 'var(--nm-ink, #000)',
                                    borderRadius: '0px',
                                }}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                            </select>
                        </div>

                        <Field id="age" label="Age" type="number" value={form.age} onChange={setField('age')} />
                        <Field id="telephone" label="Telephone" value={form.telephone} onChange={setField('telephone')} />

                        <div
                            className="md:col-span-2 flex items-center justify-between gap-4 border-t-[4px] border-dashed pt-4"
                            style={{ borderColor: 'var(--nm-ink, #000)' }}
                        >
                            <div className="font-mono text-xs text-(--fg-muted)">
                                Signed in as `{user?.role || 'ADMIN'}`.
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
                                {saving ? 'Saving...' : 'Save Details'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
