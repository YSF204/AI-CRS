import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ArrowLeft, Edit3 } from "lucide-react";
import DashboardNav from "../../../components/shared/DashboardNav";
import "../../../styles/admin.css";
import api from "../../../services/api";
import useFetch from "../../../hooks/useFetch";
import UserViewMode from "./components/UserViewMode";
import UserEditForm from "./components/UserEditForm";
import { useTranslation } from "../../../context/LanguageContext";

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
  const { t } = useTranslation();
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
    key: `${userId}|${String(isCreate)}`,
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
    setError(fetchError.response?.data?.message || t('admin.unableLoadUserDetails', {}, "Unable to load user details."));
    setLoading(false);
  }, [fetchError, t]);

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
            ? t('toast.user_created', {}, "User created successfully.")
            : t('toast.user_updated', {}, "User updated successfully."),
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || t('admin.unableSaveUser', {}, "Unable to save user."));
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
      setMessage(t('admin.accountStatusUpdated', { status: newStatus }, `Account status updated to ${newStatus}`));
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || t('admin.failedUpdateAccountStatus', {}, "Failed to update account status."));
    } finally {
      setSubmitting(false);
    }
  };

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
                  {t('admin.adminWorkspace', {}, 'Admin Workspace')}
                </div>
                <h1 className="text-3xl font-bold mt-1">
                  {isCreate
                    ? t('admin.createUser', {}, "Create New User")
                    : isEdit
                      ? t('admin.editUser', {}, "Edit User")
                      : t('admin.userProfile', {}, "View User Profile")}
                </h1>
                <p className="text-(--fg-muted) mt-2">
                  {isCreate
                    ? t('admin.createUserDesc', {}, "Fill in the details for the new account.")
                    : isEdit
                      ? t('admin.editUserDesc', {}, "Update the existing profile and save changes.")
                      : t('admin.viewUserDesc', {}, "Review the user details and use actions to navigate quickly.")}
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
                  className="nm-btn"
                >
                  <ArrowLeft size={16} />
                  {t('admin.backToList', {}, 'Back to list')}
                </button>
                {isView && (
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/users/${userId}/edit`)}
                    className="brutal-btn inline-flex items-center gap-2 px-4 py-2.5 bg-[#1e51f6] text-white"
                  >
                    <Edit3 size={16} />
                    {t('admin.editProfile', {}, 'Edit Profile')}
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
              {t('admin.loadingUser', {}, 'Loading user...')}
            </div>
          ) : isView ? (
            <UserViewMode
              formData={formData}
              accountStatus={accountStatus}
              userId={userId}
              handleQuickStatusChange={handleQuickStatusChange}
              submitting={submitting}
            />
          ) : (
            <UserEditForm
              formData={formData}
              handleInputChange={handleInputChange}
              handleSubmit={handleSubmit}
              submitting={submitting}
              isCreate={isCreate}
              isEdit={isEdit}
              accountStatus={accountStatus}
              setAccountStatus={setAccountStatus}
              userId={userId}
              navigate={navigate}
            />
          )}
        </div>
      </div>
    </div>
  );
}
