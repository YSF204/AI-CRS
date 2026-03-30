import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  PlusCircle,
  Search,
  RefreshCcw,
  Edit3,
  Eye,
  Trash2,
} from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import DashboardNav from "../../components/shared/DashboardNav";
import api from "../../services/api";
import useFetch from "../../hooks/useFetch";

const roles = ["", "EMPLOYEE", "EMPLOYER", "ADMIN"];
const statuses = ["", "ACTIVE", "INACTIVE", "PENDING"];

const statusClass = (status) => {
  switch (status) {
    case "ACTIVE":
      return "status-pill status-pill-active";
    case "PENDING":
      return "status-pill status-pill-pending";
    case "INACTIVE":
      return "status-pill status-pill-inactive";
    default:
      return "status-pill";
  }
};

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pendingDeleteUser, setPendingDeleteUser] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebounce(search, 400);
  const debouncedRoleFilter = useDebounce(roleFilter, 250);
  const debouncedStatusFilter = useDebounce(statusFilter, 250);

  const fetchUsersApi = useCallback(async () => {
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (debouncedRoleFilter) params.set("role", debouncedRoleFilter);
    if (debouncedStatusFilter) params.set("accountStatus", debouncedStatusFilter);
    params.set("page", String(page));
    params.set("limit", "20");
    const res = await api.get(`/admin/users?${params.toString()}`);
    return res.data?.data || { users: [], pagination: {} };
  }, [debouncedSearch, debouncedRoleFilter, debouncedStatusFilter, page]);

  const {
    data: usersPayload,
    loading,
    error: fetchError,
    refetch: refetchUsers,
  } = useFetch(fetchUsersApi, {
    initialData: { users: [], pagination: {} },
    deps: [debouncedSearch, debouncedRoleFilter, debouncedStatusFilter, page],
  });

  useEffect(() => {
    setUsers(usersPayload?.users || []);
    setPagination(usersPayload?.pagination || {});
  }, [usersPayload]);

  useEffect(() => {
    if (fetchError) {
      setError(fetchError.response?.data?.message || "Unable to load users.");
    }
  }, [fetchError]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, location.pathname]);

  const openDeleteDialog = (user) => {
    setPendingDeleteUser(user);
  };

  const closeDeleteDialog = () => {
    if (deleting) return;
    setPendingDeleteUser(null);
  };

  const confirmDelete = async () => {
    if (!pendingDeleteUser) return;
    setDeleting(true);
    setError("");
    setMessage("");
    try {
      const userId = pendingDeleteUser._id || pendingDeleteUser.id;
      await api.delete(`/admin/users/${userId}`);
      setUsers((prev) =>
        prev.filter((item) => (item._id || item.id) !== userId),
      );
      setMessage("User deleted successfully.");
      setPendingDeleteUser(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete user.");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="dashboard-shell">
        <DashboardNav role="admin" />

        <div className="grid gap-6">
          <div className="brutal-card p-6 bg-(--card-bg)">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-(--fg-muted) mt-2">
                  List users, update account status, create new users, and
                  remove inactive accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate("/admin/users/new")}
                className="brutal-btn inline-flex items-center gap-2 px-4 py-3 bg-(--yellow) text-black"
              >
                <PlusCircle size={18} />
                Add User
              </button>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr_0.8fr] mb-6">
              <div className="grid gap-3">
                <label className="font-semibold">Search</label>
                <div className="flex items-center gap-2">
                  <input
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    placeholder="Search name or email"
                    className="flex-1 rounded-sm border border-black bg-(--bg) px-4 py-3 text-(--fg)"
                  />
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    className="brutal-btn px-4 py-3 bg-(--yellow) text-black"
                  >
                    <Search size={16} />
                  </button>
                </div>
              </div>

              <div className="grid gap-3">
                <label className="font-semibold">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-sm border border-black bg-(--bg) px-4 py-3 text-(--fg)"
                >
                  {roles.map((role) => (
                    <option key={role} value={role}>
                      {role || "All Roles"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3">
                <label className="font-semibold">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setPage(1);
                  }}
                  className="w-full rounded-sm border border-black bg-(--bg) px-4 py-3 text-(--fg)"
                >
                  {statuses.map((status) => (
                    <option key={status} value={status}>
                      {status || "All Statuses"}
                    </option>
                  ))}
                </select>
              </div>
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
                Loading users...
              </div>
            ) : users.length === 0 ? (
              <div className="p-8 text-center text-(--fg-muted)">
                No users found.
              </div>
            ) : (
              <div className="brutal-card bg-(--card-bg) divide-y-2 divide-black">
                {users.map((user) => (
                  <div
                    key={user._id || user.id}
                    className="p-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="text-base font-bold truncate">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm font-medium text-(--fg-muted) truncate">
                        {user.email}
                      </div>
                      <div className="text-xs font-medium text-(--fg-muted) mt-1 truncate">
                        {user._id || user.id}
                      </div>
                      <div className="mt-2 grid gap-2">
                        <span className="text-sm font-semibold text-(--fg-muted)">
                          {user.gender || "—"} | {user.telephone?.[0] || "—"}
                        </span>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="stat-pill user-list-pill">{user.role}</span>
                          <span className={`${statusClass(user.accountStatus)} user-list-pill`}>
                            {user.accountStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 lg:w-[180px]">
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/admin/users/${user._id || user.id}`);
                        }}
                        className="brutal-btn px-2 py-2 bg-(--mint) text-black text-[10px]"
                        title="View"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          navigate(`/admin/users/${user._id || user.id}/edit`);
                        }}
                        className="brutal-btn px-2 py-2 bg-(--yellow) text-black text-[10px]"
                        title="Edit"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          openDeleteDialog(user);
                        }}
                        className="brutal-btn px-2 py-2 bg-[#FF6B6B] text-black text-[10px]"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm">
              <div className="text-(--fg-muted)">
                Total users: {pagination.total ?? users.length}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  disabled={page <= 1}
                  className="brutal-btn px-4 py-2 bg-(--card-bg)"
                >
                  Prev
                </button>
                <button
                  type="button"
                  onClick={() => setPage((prev) => prev + 1)}
                  disabled={page >= (pagination.pages || 1)}
                  className="brutal-btn px-4 py-2 bg-(--card-bg)"
                >
                  Next
                </button>
                <button
                  type="button"
                  onClick={() => refetchUsers().catch(() => {})}
                  className="brutal-btn px-4 py-2 bg-(--mint)"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingDeleteUser && (
        <div className="fixed inset-0 z-[100] bg-black/55 flex items-center justify-center p-4">
          <div className="brutal-card bg-(--card-bg) p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-2">Confirm Delete</h2>
            <p className="text-(--fg-muted) mb-5">
              Delete user{" "}
              <span className="font-semibold text-(--fg)">
                {pendingDeleteUser.firstName} {pendingDeleteUser.lastName}
              </span>
              ? This action will deactivate the account.
            </p>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeDeleteDialog}
                className="brutal-btn px-4 py-2 bg-(--card-bg)"
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="brutal-btn px-4 py-2 bg-[#FF6B6B] text-black"
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
