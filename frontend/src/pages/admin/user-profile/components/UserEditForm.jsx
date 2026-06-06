import React from "react";
import { UserPlus } from "lucide-react";
import { useTranslation } from "../../../../context/LanguageContext";

export default function UserEditForm({ formData, handleInputChange, handleSubmit, submitting, isCreate, isEdit, accountStatus, setAccountStatus, userId, navigate }) {
  const { t } = useTranslation();

  const roles = [
    { value: "EMPLOYEE", label: t('admin.employeesLabel', {}, "Employee") },
    { value: "EMPLOYER", label: t('admin.employersLabel', {}, "Employer") },
    { value: "ADMIN", label: t('admin.adminsLabel', {}, "Admin") }
  ];

  const genders = [
    { value: "MALE", label: t('auth.male', {}, "Male") },
    { value: "FEMALE", label: t('auth.female', {}, "Female") }
  ];

  const statuses = [
    { value: "ACTIVE", label: t('admin.activeLabel', {}, "Active") },
    { value: "INACTIVE", label: t('admin.inactiveLabel', {}, "Inactive") },
    { value: "PENDING", label: t('admin.pendingLabel', {}, "Pending") }
  ];

  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="form-section grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="uf-firstName" className="form-label">{t('auth.firstName', {}, 'First Name')}</label>
          <input
            id="uf-firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="form-field"
            placeholder={t('auth.firstNamePlaceholder', {}, 'First name')}
            required
          />
        </div>
        <div>
          <label htmlFor="uf-lastName" className="form-label">{t('auth.lastName', {}, 'Last Name')}</label>
          <input
            id="uf-lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="form-field"
            placeholder={t('auth.lastNamePlaceholder', {}, 'Last name')}
            required
          />
        </div>
        <div>
          <label htmlFor="uf-email" className="form-label">{t('auth.email', {}, 'Email')}</label>
          <input
            id="uf-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-field"
            placeholder="mohammed@example.ps"
            required
          />
        </div>
        <div>
          <label htmlFor="uf-telephone" className="form-label">{t('auth.telephone', {}, 'Telephone')}</label>
          <input
            id="uf-telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className="form-field"
            placeholder="+970 59 000 0000"
          />
        </div>
        <div>
          <label htmlFor="uf-password" className="form-label">{t('auth.password', {}, 'Password')}</label>
          <input
            id="uf-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-field"
            placeholder={
              isEdit
                ? t('admin.leaveBlankPassword', {}, "Leave blank to keep current password")
                : t('auth.password', {}, "Password")
            }
            required={!isEdit}
          />
        </div>
        <div>
          <label htmlFor="uf-passwordConfirm" className="form-label">{t('auth.confirmPassword', {}, 'Confirm Password')}</label>
          <input
            id="uf-passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            className="form-field"
            placeholder={
              isEdit
                ? t('admin.leaveBlankPassword', {}, "Leave blank to keep current password")
                : t('auth.confirmPassword', {}, "Confirm password")
            }
            required={!isEdit}
          />
        </div>
        <div>
          <label htmlFor="uf-role" className="form-label">{t('admin.role', {}, 'Role')}</label>
          <select
            id="uf-role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-field"
            required
          >
            {roles.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        {isEdit && (
          <div>
            <label htmlFor="uf-accountStatus" className="form-label">{t('admin.status', {}, 'Account Status')}</label>
            <select
              id="uf-accountStatus"
              name="accountStatus"
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value)}
              className="form-field"
              required
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="uf-gender" className="form-label">{t('auth.gender', {}, 'Gender')}</label>
          <select
            id="uf-gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="form-field"
            required
          >
            {genders.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="uf-age" className="form-label">{t('auth.age', {}, 'Age')}</label>
          <input
            id="uf-age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            className="form-field"
            placeholder={t('auth.age', {}, 'Age')}
            min="18"
            max="150"
            required
          />
        </div>
      </div>

      {formData.role === "EMPLOYER" && (
        <div className="form-section grid gap-5">
          <h2 className="text-xl font-bold">{t('employer.companyDetails', {}, 'Company Details')}</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label htmlFor="uf-companyName" className="form-label">{t('employer.companyName', {}, 'Company Name')}</label>
              <input
                id="uf-companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="form-field"
                placeholder="شركة القدس للبرمجيات"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-companyLicense" className="form-label">{t('employer.licenseNumber', {}, 'License Number')}</label>
              <input
                id="uf-companyLicense"
                name="companyLicense"
                value={formData.companyLicense}
                onChange={handleInputChange}
                className="form-field"
                placeholder="PS-123456"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-contactEmail" className="form-label">{t('employer.contactEmail', {}, 'Contact Email')}</label>
              <input
                id="uf-contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="form-field"
                placeholder="hr@quds-tech.ps"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-website" className="form-label">{t('employer.companyWebsite', {}, 'Website')}</label>
              <input
                id="uf-website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="form-field"
                placeholder="https://quds-tech.ps"
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label htmlFor="uf-branchName" className="form-label">{t('employer.branchName', {}, 'Branch Name')}</label>
              <input
                id="uf-branchName"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                className="form-field"
                placeholder="المقر الرئيسي"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-branchCity" className="form-label">{t('employer.city', {}, 'Branch City')}</label>
              <input
                id="uf-branchCity"
                name="branchCity"
                value={formData.branchCity}
                onChange={handleInputChange}
                className="form-field"
                placeholder="رام الله"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-branchStreet" className="form-label">{t('employer.companyAddress', {}, 'Branch Street')}</label>
              <input
                id="uf-branchStreet"
                name="branchStreet"
                value={formData.branchStreet}
                onChange={handleInputChange}
                className="form-field"
                placeholder="شارع الإرسال"
                required
              />
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-wrap justify-between gap-3">
        <button
          type="submit"
          disabled={submitting}
          className="nm-btn nm-btn-primary"
        >
          {isCreate ? <UserPlus size={18} /> : null}
          {submitting
            ? isCreate
              ? t('admin.creating', {}, "Creating...")
              : t('employer.saving', {}, "Saving...")
            : isCreate
              ? t('admin.createUser', {}, "Create User")
              : t('admin.saveProfile', {}, "Save Changes")}
        </button>
        {!isCreate && (
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="nm-btn"
          >
            {t('employer.viewProfile', {}, 'View Profile')}
          </button>
        )}
      </div>
    </form>
  );
}
