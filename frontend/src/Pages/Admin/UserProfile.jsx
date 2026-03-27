import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Save, UserPlus, Edit3 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";

const roles = ["EMPLOYEE", "EMPLOYER", "ADMIN"];
const genders = ["MALE", "FEMALE"];
const statuses = ["ACTIVE", "INACTIVE", "PENDING"];

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
    setLoading(true);
    setError("");
    try {
      const res = await api.get(`/admin/users/${userId}`);
      const { user, employer } = res.data.data;
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
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user details.");
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (isCreate) {
      setFormData(EMPTY_FORM);
      setAccountStatus("ACTIVE");
      setError("");
      setMessage("");
      return;
    }

    if (userId) {
      fetchUser();
    }
  }, [userId, isCreate, fetchUser]);

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
        payload.company = {
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

  const renderViewRow = (label, value) => (
    <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
      <div className="text-xs text-(--fg-muted) uppercase tracking-[0.18em] mb-2">
        {label}
      </div>
      <div className="font-medium">{value || "—"}</div>
    </div>
  );

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-7xl mx-auto">
        <DashboardNav role="admin" />

        <div className="brutal-card p-6 bg-(--card-bg) mt-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">
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
                    : "Review the current user record and navigate to edit if needed."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="brutal-btn inline-flex items-center gap-2 px-4 py-3 bg-(--yellow) text-black"
            >
              <ArrowLeft size={18} />
              Back to list
            </button>
          </div>

          {message && (
            <div className="p-4 mb-4 text-sm text-green-800 bg-green-100 border border-green-200 rounded-md">
              {message}
            </div>
          )}
          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-(--fg-muted)">
              Loading user...
            </div>
          ) : isView ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="grid gap-4">
                {renderViewRow(
                  "Full Name",
                  `${formData.firstName} ${formData.lastName}`,
                )}
                {renderViewRow("Email", formData.email)}
                {renderViewRow("Role", formData.role)}
                {renderViewRow("Gender", formData.gender)}
                {renderViewRow("Age", formData.age)}
                {renderViewRow("Telephone", formData.telephone)}
                {renderViewRow("Account Status", accountStatus)}
              </div>
              <div className="grid gap-4">
                {formData.role === "EMPLOYER" && (
                  <div className="form-section">
                    <h2>Company Profile</h2>
                    <div className="grid gap-3">
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
                <button
                  type="button"
                  onClick={() => navigate(`/admin/users/${userId}/edit`)}
                  className="brutal-btn inline-flex items-center gap-2 px-3 py-2 bg-(--yellow) text-black w-auto"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
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
                      {statuses.slice(1).map((status) => (
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
                  className="brutal-btn inline-flex items-center gap-2 px-5 py-3 bg-(--teal) text-black"
                >
                  {isCreate ? <UserPlus size={18} /> : <Save size={18} />}
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
                    className="brutal-btn px-5 py-3 bg-(--yellow) text-black"
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
