import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import "../../styles/admin.css";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";
import { useTranslation } from "../../context/LanguageContext";

export default function UserDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    if (!id) return null;
    const res = await api.get(`/admin/users/${id}`);
    return res.data?.data?.user || null;
  }, [id]);

  const {
    data: fetchedUser,
    loading: fetchLoading,
    error: fetchError,
  } = useFetch(fetchUser, { enabled: Boolean(id), key: id, initialData: null });

  useEffect(() => {
    setLoading(fetchLoading);
    if (fetchError) {
      setError(fetchError.response?.data?.message || t("admin.unableToLoadUser", {}, "Unable to load user details."));
      return;
    }
    if (fetchedUser) {
      setUser(fetchedUser);
    }
  }, [fetchLoading, fetchError, fetchedUser, t]);

  const handleDelete = async () => {
    if (!id) return;

    setSubmitting(true);
    setError("");

    try {
      await api.delete(`/admin/users/${id}`);
      navigate("/admin/users", {
        state: { message: t("toast.user_deleted") },
      });
    } catch (err) {
      setError(err.response?.data?.message || t("admin.unableToDeleteUser", {}, "Unable to delete user."));
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
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">{t("admin.userDelete")}</h1>
              <p className="text-(--fg-muted) mt-2">
                {t("admin.deleteDesc", {}, "Confirm deletion of this account. This action is soft-delete and will deactivate the user.")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="brutal-btn inline-flex items-center gap-2 px-4 py-3 bg-(--yellow) text-black"
            >
              <ArrowLeft size={18} />
              {t("admin.backToUsers", {}, "Back to users")}
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-(--fg-muted)">
              {t("admin.loadingUser", {}, "Loading user details...")}
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="form-section">
                <div className="text-sm text-(--fg-muted) uppercase tracking-[0.18em] mb-2">
                  {t("admin.userToDelete", {}, "User to delete")}
                </div>
                <div className="grid gap-3">
                  <div className="font-semibold">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div>{user?.email}</div>
                  <div className="text-xs text-(--fg-muted)">
                    ID: {user?._id}
                  </div>
                  <div>{t("admin.status")}: {user?.accountStatus || "—"}</div>
                  <div>{t("admin.role")}: {user?.role || "—"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
                <p className="mb-4 text-(--fg-muted)">
                  {t("admin.deleteWarningDetails", {}, "This will deactivate the account and remove access. If you need to preserve user data, please review the profile before deleting.")}
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleDelete}
                    className="brutal-btn inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] text-black"
                  >
                    <Trash2 size={18} />
                    {submitting ? t("common.deleting", {}, "Deleting...") : t("admin.confirmDelete")}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/users/${id}`)}
                    className="brutal-btn px-5 py-3 bg-(--teal) text-black"
                  >
                    {t("common.cancel")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
