import React, { useEffect, useMemo, useState, useRef } from 'react';
import { Camera } from 'lucide-react';
import DashboardNav from '../../../components/shared/DashboardNav';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import api from '../../../services/api';
import { toApiAssetUrl } from '../../../utils/apiConfig';
import AdminProfileForm from './ProfileForm';

export default function AdminProfile() {
    const { user, updateUserState, refreshUser } = useAuth();
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
        refreshUser();
    }, [refreshUser]);

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

    const safeSplit = (value, separator = ' ') => String(value || '').split(separator);

    const initials = useMemo(() => {
        return safeSplit(fullName)
            .map((part) => part[0])
            .slice(0, 2)
            .join('')
            .toUpperCase();
    }, [fullName]);

    const profilePicUrl = user?.profilePic
        ? toApiAssetUrl(user.profilePic)
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

        const originalUser = { ...user };

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

            // Optimistic Update
            updateUserState({ ...user, ...payload });

            const res = await api.patch(`/admin/users/${targetId}`, payload);
            updateUserState(res.data.data.user);
            setMessage('Account details updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Unable to update your admin profile.');
            // Revert
            updateUserState(originalUser);
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
                                accept="image/jpeg,image/png,image/webp"
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

                <AdminProfileForm
                    form={form}
                    setField={setField}
                    handleSubmit={handleSubmit}
                    saving={saving}
                    message={message}
                    error={error}
                    panelStyles={panelStyles}
                    user={user}
                />
            </div>
        </div>
    );
}
