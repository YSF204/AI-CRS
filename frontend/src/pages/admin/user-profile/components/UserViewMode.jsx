import React from "react";
import { Power, PowerOff } from "lucide-react";
import { useTranslation } from "../../../../context/LanguageContext";

const statusClass = (status) => {
  switch (status) {
    case "ACTIVE":
      return "admin-status-chip active-blue";
    case "PENDING":
      return "admin-status-chip pending-blue";
    case "INACTIVE":
      return "admin-status-chip inactive-blue";
    default:
      return "admin-status-chip";
  }
};

export default function UserViewMode({ formData, accountStatus, userId, handleQuickStatusChange, submitting }) {
  const { t } = useTranslation();

  const renderViewRow = (label, value) => (
    <div className="rounded-xl border-2 border-(--border) bg-(--bg) p-5 min-h-[88px] flex items-center">
      <div className="w-full flex flex-col gap-2">
        <div className="text-xs text-(--fg-muted) uppercase tracking-[0.18em]">
          {label}
        </div>
        <div className="font-semibold text-base break-words">{value || "—"}</div>
      </div>
    </div>
  );

  return (
    <div className="grid gap-6">
      <div className="form-section w-full">
        <h2 className="text-xl font-bold mb-4">{t('admin.personalDetails', {}, 'Personal Details')}</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {renderViewRow(
            t('admin.fullName', {}, 'Full Name'),
            `${formData.firstName} ${formData.lastName}`,
          )}
          {renderViewRow(t('auth.email', {}, 'Email'), formData.email)}
          {renderViewRow(t('auth.telephone', {}, 'Telephone'), formData.telephone)}
          {renderViewRow(t('auth.gender', {}, 'Gender'), formData.gender)}
          {renderViewRow(t('auth.age', {}, 'Age'), formData.age)}
          {renderViewRow(t('admin.userId', {}, 'User ID'), userId)}
        </div>
      </div>

      {formData.role === "EMPLOYER" && (
        <div className="form-section w-full">
          <h2 className="text-xl font-bold mb-4">{t('employer.companyDetails', {}, 'Company Details')}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {renderViewRow(t('employer.companyName', {}, 'Company Name'), formData.companyName)}
            {renderViewRow(t('employer.license', {}, 'License'), formData.companyLicense)}
            {renderViewRow(t('employer.contactEmail', {}, 'Contact Email'), formData.contactEmail)}
            {renderViewRow(t('employer.website', {}, 'Website'), formData.website)}
            {renderViewRow(t('employer.branchName', {}, 'Branch Name'), formData.branchName)}
            {renderViewRow(t('employer.city', {}, 'Branch City'), formData.branchCity)}
            {renderViewRow(t('employer.companyAddress', {}, 'Branch Street'), formData.branchStreet)}
          </div>
        </div>
      )}

      {/* Quick Status Actions */}
      <div className="form-section w-full">
        <h2 className="text-xl font-bold mb-4">{t('admin.quickActions', {}, 'Quick Actions')}</h2>
        <div className="flex flex-wrap gap-3">
          {formData.role !== 'ADMIN' && accountStatus !== 'ACTIVE' && (
            <button
              type="button"
              onClick={() => handleQuickStatusChange('ACTIVE')}
              disabled={submitting}
              className="admin-action-btn status-active"
              style={{ padding: 'var(--spacing-3) var(--spacing-5)', fontSize: 'var(--text-sm)' }}
            >
              <Power size={18} strokeWidth={2.5} />
              {t('admin.activateAccount', {}, 'Activate Account')}
            </button>
          )}
          {formData.role !== 'ADMIN' && accountStatus !== 'INACTIVE' && (
            <button
              type="button"
              onClick={() => handleQuickStatusChange('INACTIVE')}
              disabled={submitting}
              className="admin-action-btn status-inactive"
              style={{ padding: 'var(--spacing-3) var(--spacing-5)', fontSize: 'var(--text-sm)' }}
            >
              <PowerOff size={18} strokeWidth={2.5} />
              {t('admin.deactivateAccount', {}, 'Deactivate Account')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
