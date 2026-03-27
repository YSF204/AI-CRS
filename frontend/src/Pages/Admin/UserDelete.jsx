import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Trash2 } from "lucide-react";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";

export default function UserDelete() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchUser = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError("");

    try {
      const res = await api.get(`/admin/users/${id}`);
      setUser(res.data.data.user);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load user details.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleDelete = async () => {
    if (!id) return;

    setSubmitting(true);
    setError("");

    try {
      await api.delete(`/admin/users/${id}`);
      navigate("/admin/users", {
        state: { message: "User deleted successfully." },
      });
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-7xl mx-auto">
        <DashboardNav role="admin" />

        <div className="brutal-card p-6 bg-(--card-bg)">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold">Delete User</h1>
              <p className="text-(--fg-muted) mt-2">
                Confirm deletion of this account. This action is soft-delete and
                will deactivate the user.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/admin/users")}
              className="brutal-btn inline-flex items-center gap-2 px-4 py-3 bg-(--yellow) text-black"
            >
              <ArrowLeft size={18} />
              Back to users
            </button>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          {loading ? (
            <div className="p-8 text-center text-(--fg-muted)">
              Loading user details...
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="form-section">
                <div className="text-sm text-(--fg-muted) uppercase tracking-[0.18em] mb-2">
                  User to delete
                </div>
                <div className="grid gap-3">
                  <div className="font-semibold">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div>{user?.email}</div>
                  <div className="text-xs text-(--fg-muted)">
                    ID: {user?._id}
                  </div>
                  <div>Status: {user?.accountStatus || "—"}</div>
                  <div>Role: {user?.role || "—"}</div>
                </div>
              </div>

              <div className="rounded-xl border border-(--border) bg-(--bg) p-4">
                <p className="mb-4 text-(--fg-muted)">
                  This will deactivate the account and remove access. If you
                  need to preserve user data, please review the profile before
                  deleting.
                </p>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={handleDelete}
                    className="brutal-btn inline-flex items-center gap-2 px-5 py-3 bg-[#FF6B6B] text-black"
                  >
                    <Trash2 size={18} />
                    {submitting ? "Deleting..." : "Confirm Delete"}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate(`/admin/users/${id}`)}
                    className="brutal-btn px-5 py-3 bg-(--teal) text-black"
                  >
                    Cancel
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
