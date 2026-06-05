import React from "react";
import { UserPlus } from "lucide-react";

const roles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
const genders = ["MALE", "FEMALE"];
const statuses = ["ACTIVE", "INACTIVE", "PENDING"];

export default function UserEditForm({ formData, handleInputChange, handleSubmit, submitting, isCreate, isEdit, accountStatus, setAccountStatus, userId, navigate }) {
  return (
    <form onSubmit={handleSubmit} className="grid gap-6">
      <div className="form-section grid gap-5 lg:grid-cols-2">
        <div>
          <label htmlFor="uf-firstName" className="form-label">First Name</label>
          <input
            id="uf-firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="form-field"
            placeholder="First name"
            required
          />
        </div>
        <div>
          <label htmlFor="uf-lastName" className="form-label">Last Name</label>
          <input
            id="uf-lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="form-field"
            placeholder="Last name"
            required
          />
        </div>
        <div>
          <label htmlFor="uf-email" className="form-label">Email</label>
          <input
            id="uf-email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            className="form-field"
            placeholder="user@example.com"
            required
          />
        </div>
        <div>
          <label htmlFor="uf-telephone" className="form-label">Telephone</label>
          <input
            id="uf-telephone"
            name="telephone"
            value={formData.telephone}
            onChange={handleInputChange}
            className="form-field"
            placeholder="1234567890"
          />
        </div>
        <div>
          <label htmlFor="uf-password" className="form-label">Password</label>
          <input
            id="uf-password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleInputChange}
            className="form-field"
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Password"
            }
            required={!isEdit}
          />
        </div>
        <div>
          <label htmlFor="uf-passwordConfirm" className="form-label">Confirm Password</label>
          <input
            id="uf-passwordConfirm"
            name="passwordConfirm"
            type="password"
            value={formData.passwordConfirm}
            onChange={handleInputChange}
            className="form-field"
            placeholder={
              isEdit
                ? "Leave blank to keep current password"
                : "Confirm password"
            }
            required={!isEdit}
          />
        </div>
        <div>
          <label htmlFor="uf-role" className="form-label">Role</label>
          <select
            id="uf-role"
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            className="form-field"
            required
          >
            {roles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>
        {isEdit && (
          <div>
            <label htmlFor="uf-accountStatus" className="form-label">Account Status</label>
            <select
              id="uf-accountStatus"
              name="accountStatus"
              value={accountStatus}
              onChange={(e) => setAccountStatus(e.target.value)}
              className="form-field"
              required
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="uf-gender" className="form-label">Gender</label>
          <select
            id="uf-gender"
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="form-field"
            required
          >
            {genders.map((gender) => (
              <option key={gender} value={gender}>
                {gender}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="uf-age" className="form-label">Age</label>
          <input
            id="uf-age"
            name="age"
            type="number"
            value={formData.age}
            onChange={handleInputChange}
            className="form-field"
            placeholder="Age"
            min="18"
            max="150"
            required
          />
        </div>
      </div>

      {formData.role === "EMPLOYER" && (
        <div className="form-section grid gap-5">
          <h2 className="text-xl font-bold">Company Details</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label htmlFor="uf-companyName" className="form-label">Company Name</label>
              <input
                id="uf-companyName"
                name="companyName"
                value={formData.companyName}
                onChange={handleInputChange}
                className="form-field"
                placeholder="Acme Corp"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-companyLicense" className="form-label">License Number</label>
              <input
                id="uf-companyLicense"
                name="companyLicense"
                value={formData.companyLicense}
                onChange={handleInputChange}
                className="form-field"
                placeholder="BR-12345"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-contactEmail" className="form-label">Contact Email</label>
              <input
                id="uf-contactEmail"
                name="contactEmail"
                type="email"
                value={formData.contactEmail}
                onChange={handleInputChange}
                className="form-field"
                placeholder="hr@company.com"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-website" className="form-label">Website</label>
              <input
                id="uf-website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleInputChange}
                className="form-field"
                placeholder="https://company.com"
              />
            </div>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <div>
              <label htmlFor="uf-branchName" className="form-label">Branch Name</label>
              <input
                id="uf-branchName"
                name="branchName"
                value={formData.branchName}
                onChange={handleInputChange}
                className="form-field"
                placeholder="HQ"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-branchCity" className="form-label">Branch City</label>
              <input
                id="uf-branchCity"
                name="branchCity"
                value={formData.branchCity}
                onChange={handleInputChange}
                className="form-field"
                placeholder="Hebron"
                required
              />
            </div>
            <div>
              <label htmlFor="uf-branchStreet" className="form-label">Branch Street</label>
              <input
                id="uf-branchStreet"
                name="branchStreet"
                value={formData.branchStreet}
                onChange={handleInputChange}
                className="form-field"
                placeholder="Main St"
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
              ? "Creating..."
              : "Saving..."
            : isCreate
              ? "Create User"
              : "Save Changes"}
        </button>
        {!isCreate && (
          <button
            type="button"
            onClick={() => navigate(`/admin/users/${userId}`)}
            className="nm-btn"
          >
            View Profile
          </button>
        )}
      </div>
    </form>
  );
}
