import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, UserPlus, Edit3, Power, PowerOff } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

const roles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
const genders = ["MALE", "FEMALE"];
const statuses = ["ACTIVE", "INACTIVE", "PENDING"];
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

const EMPTY_FORM = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  passwordConfirm: "",
  role: "EMPLOYEE",
  gender: "MALE",
  age: "",
  telephone: "",
  companyName: "",
  companyLicense: "",
  contactEmail: "",
  website: "",
  branchName: "",
  branchCity: "",
  branchStreet: "",
};

export default function UserProfile() {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const userId = params.id;
  const mode = useMemo(() => {
    if (location.pathname.endsWith("/new")) return "create";
    if (location.pathname.endsWith("/edit")) return "edit";
    return userId ? "view" : "create";
  }, [location.pathname, userId]);
  const isCreate = mode === "create";
  const isEdit = mode === "edit";
  const isView = mode === "view";

  const [formData, setFormData] = useState(EMPTY_FORM);
  const [accountStatus, setAccountStatus] = useState("ACTIVE");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    const res = await api.get(`/admin/users/${userId}`);
    return res.data?.data || null;
  }, [userId]);

  const {
    data: fetchedUserData,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(fetchUser, {
    enabled: Boolean(userId) && !isCreate,
    deps: [userId, isCreate],
    initialData: null,
  });

  useEffect(() => {
    if (isCreate) {
      setFormData(EMPTY_FORM);
      setAccountStatus("ACTIVE");
      setError("");
      setMessage("");
      return;
    }

    setLoading(fetchLoading);
  }, [userId, isCreate, fetchLoading]);

  useEffect(() => {
    if (!fetchedUserData?.user) return;
    const { user, employer } = fetchedUserData;
    setFormData({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      password: "",
      passwordConfirm: "",
      role: user.role || "EMPLOYEE",
      gender: user.gender || "MALE",
      age: user.age?.toString() || "",
      telephone: user.telephone?.[0] || "",
      companyName: employer?.company?.name || "",
      companyLicense: employer?.company?.license || "",
      contactEmail: employer?.company?.contactEmail || "",
      website: employer?.company?.website || "",
      branchName: employer?.company?.branches?.[0]?.name || "",
      branchCity: employer?.company?.branches?.[0]?.city || "",
      branchStreet: employer?.company?.branches?.[0]?.street || "",
    });
    setAccountStatus(user.accountStatus || "ACTIVE");
    setLoading(false);
  }, [fetchedUserData]);

  useEffect(() => {
    if (!fetchError) return;
    setError(fetchError.response?.data?.message || "Unable to load user details.");
    setLoading(false);
  }, [fetchError]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        gender: formData.gender,
        role: formData.role,
        age: Number(formData.age),
        telephone: formData.telephone ? [formData.telephone] : [],
      };

      if (isEdit) {
        payload.accountStatus = accountStatus;
      }

      if (formData.role === "EMPLOYER") {
        const companyPayload = {
          name: formData.companyName,
          license: formData.companyLicense,
          contactEmail: formData.contactEmail,
          website: formData.website || undefined,
          branches: [
            {
              name: formData.branchName,
              city: formData.branchCity,
              street: formData.branchStreet,
            },
          ],
        };

        const hasCompanyData =
          formData.companyName?.trim() ||
          formData.companyLicense?.trim() ||
          formData.contactEmail?.trim() ||
          formData.website?.trim() ||
          formData.branchName?.trim() ||
          formData.branchCity?.trim() ||
          formData.branchStreet?.trim();

        if (hasCompanyData) {
          payload.company = companyPayload;
        }
      }

      if (formData.password || formData.passwordConfirm) {
        payload.password = formData.password;
        payload.passwordConfirm = formData.passwordConfirm;
      }

      if (isCreate) {
        await api.post("/admin/users", payload);
      } else {
        await api.patch(`/admin/users/${userId}`, payload);
      }

      navigate("/admin/users", {
        state: {
          message: isCreate
            ? "User created successfully."
            : "User updated successfully.",
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save user.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickStatusChange = async (newStatus) => {
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      await api.patch(`/admin/users/${userId}/status`, {
        accountStatus: newStatus,
      });

      setAccountStatus(newStatus);
      setMessage(`Account status updated to ${newStatus}`);
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update account status.");
    } finally {
      setSubmitting(false);
    }
  };

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
    <div className="min-h-screen bg-(--bg) text-(--fg)">
      <div className="dashboard-nav-area">
        <DashboardNav role="admin" />
      </div>

      <div className="dashboard-shell py-6">
        <div className="brutal-card p-6 bg-(--card-bg)">
          <div className="brutal-card p-5 bg-(--bg) mb-6">
            <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
              <div className="min-w-0">
                <div className="text-xs uppercase tracking-[0.18em] text-(--fg-muted)">
                  Admin Workspace
                </div>
                <h1 className="text-3xl font-bold mt-1">
                  {isCreate
                    ? "Create New User"
                    : isEdit
                      ? "Edit User"
                      : "View User Profile"}
                </h1>
                <p className="text-(--fg-muted) mt-2">
                  {isCreate
                    ? "Fill in the details for the new account."
                    : isEdit
                      ? "Update the existing profile and save changes."
                      : "Review the user details and use actions to navigate quickly."}
                </p>
                {isView && (
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="stat-pill">{formData.role || "USER"}</span>
                    <span className={statusClass(accountStatus)}>
                      {accountStatus || "UNKNOWN"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={() => navigate("/admin/users")}
                  className="brutal-btn inline-flex items-center gap-2 px-4 py-2.5 bg-(--card-bg) text-(--fg)"
                >
                  <ArrowLeft size={16} />
                  Back to list
                </button>
                {isView && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/users/${userId}/edit`)}
                    className="brutal-btn inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e51f6] text-white"
                  >
                    <Edit3 size={16} />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          {message && (
            <div className="p-4 mb-4 text-sm text-blue-900 bg-blue-100 border-4 border-blue-500" style={{ borderRadius: '0' }}>
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-900 bg-red-100 border-4 border-red-500" style={{ borderRadius: '0' }}>
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-(--fg-muted)">
              Loading user...
            </div>
          ) : isView ? (
            <div className="grid gap-6">
              <div className="form-section w-full">
                <h2 className="text-xl font-bold mb-4">Personal Details</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  {renderViewRow(
                    "Full Name",
                    `${formData.firstName} ${formData.lastName}`,
                  )}
                  {renderViewRow("Email", formData.email)}
                  {renderViewRow("Telephone", formData.telephone)}
                  {renderViewRow("Gender", formData.gender)}
                  {renderViewRow("Age", formData.age)}
                  {renderViewRow("User ID", userId)}
                </div>
              </div>

              {formData.role === "EMPLOYER" && (
                <div className="form-section w-full">
                  <h2 className="text-xl font-bold mb-4">Company Details</h2>
                  <div className="grid gap-4 md:grid-cols-2">
                    {renderViewRow("Company Name", formData.companyName)}
                    {renderViewRow("License", formData.companyLicense)}
                    {renderViewRow("Contact Email", formData.contactEmail)}
                    {renderViewRow("Website", formData.website)}
                    {renderViewRow("Branch Name", formData.branchName)}
                    {renderViewRow("Branch City", formData.branchCity)}
                    {renderViewRow("Branch Street", formData.branchStreet)}
                  </div>
                </div>
              )}

              {/* Quick Status Actions */}
              <div className="form-section w-full">
                <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
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
                      Activate Account
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
                      Deactivate Account
                    </button>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-6">
              <div className="form-section grid gap-5 lg:grid-cols-2">
                <div>
                  <label className="form-label">First Name</label>
                  <input
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="form-field"
                    placeholder="First name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Last Name</label>
                  <input
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="form-field"
                    placeholder="Last name"
                    required
                  />
                </div>
                <div>
                  <label className="form-label">Email</label>
                  <input
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
                  <label className="form-label">Telephone</label>
                  <input
                    name="telephone"
                    value={formData.telephone}
                    onChange={handleInputChange}
                    className="form-field"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="form-label">Password</label>
                  <input
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
                  <label className="form-label">Confirm Password</label>
                  <input
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
                  <label className="form-label">Role</label>
                  <select
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
                    <label className="form-label">Account Status</label>
                    <select
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
                  <label className="form-label">Gender</label>
                  <select
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
                  <label className="form-label">Age</label>
                  <input
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
                      <label className="form-label">Company Name</label>
                      <input
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleInputChange}
                        className="form-field"
                        placeholder="Acme Corp"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">License Number</label>
                      <input
                        name="companyLicense"
                        value={formData.companyLicense}
                        onChange={handleInputChange}
                        className="form-field"
                        placeholder="BR-12345"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Contact Email</label>
                      <input
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
                      <label className="form-label">Website</label>
                      <input
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
                      <label className="form-label">Branch Name</label>
                      <input
                        name="branchName"
                        value={formData.branchName}
                        onChange={handleInputChange}
                        className="form-field"
                        placeholder="HQ"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Branch City</label>
                      <input
                        name="branchCity"
                        value={formData.branchCity}
                        onChange={handleInputChange}
                        className="form-field"
                        placeholder="Hebron"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Branch Street</label>
                      <input
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
                  className="brutal-btn inline-flex items-center gap-2 px-5 py-3 bg-[#1e51f6] text-white"
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
                    className="brutal-btn px-5 py-3 bg-[#3949ab] text-white"
                  >
                    View Profile
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
