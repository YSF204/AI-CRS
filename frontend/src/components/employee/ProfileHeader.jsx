import React, { useRef, useState } from 'react';
import { User, Mail, Briefcase, MapPin, Camera } from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { toApiAssetUrl } from '../../utils/apiConfig';

/**
 * ProfileHeader — displays the user's avatar (initials or photo), name, role,
 * and key stats. Handles profile picture upload.
 */
export default function ProfileHeader({ user }) {
  const { updateUserState } = useAuth();
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim();
  const initials = (fullName || user?.email || 'U')
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const profilePicUrl = user?.profilePic
    ? toApiAssetUrl(user.profilePic)
    : null;

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('profilePic', file);

      const res = await api.post('/users/profile-picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      // Update the user state immediately so the avatar refreshes
      if (res.data?.data?.user) {
        updateUserState(res.data.data.user);
      }
    } catch (err) {
      console.error('Profile picture upload failed:', err);
    } finally {
      setUploading(false);
      // Reset file input so the same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="nm-card profile-header-card overflow-hidden">
      {/* Accent bar */}
      <div className="h-3 w-full bg-[var(--nm-primary)]" />

      <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div
            className="w-20 h-20 border-4 border-[var(--nm-ink)] flex items-center justify-center font-bold text-2xl font-display bg-[var(--nm-warning)] text-[var(--nm-ink)] overflow-hidden"
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
            className="absolute -bottom-2 -right-2 w-8 h-8 flex items-center justify-center border-4 border-[var(--nm-ink)] bg-[var(--nm-primary)] text-white hover:translate-x-[2px] hover:translate-y-[2px] transition-transform"
            title="Change avatar"
            onClick={handleCameraClick}
            disabled={uploading}
            style={{ cursor: uploading ? 'wait' : 'pointer' }}
          >
            <Camera size={14} />
          </button>
          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold font-display uppercase tracking-tight truncate text-[var(--fg)]">
            {fullName || 'Your Name'}
          </h2>

          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3">
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <Mail size={14} className="text-[var(--nm-primary)]" />
              {user?.email ?? '—'}
            </span>
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <Briefcase size={14} className="text-[var(--nm-primary)]" />
              {user?.role ?? 'EMPLOYEE'}
            </span>
            <span className="flex items-center gap-2 font-mono text-sm text-[var(--fg-muted)]">
              <MapPin size={14} className="text-[var(--nm-primary)]" />
              {user?.telephone?.[0] || 'No phone set'}
            </span>
          </div>
        </div>

        {/* Status badge */}
        <span
          className="nm-status-pill active shrink-0 self-start sm:self-center"
        >
          ACTIVE
        </span>
      </div>
    </div>
  );
}
