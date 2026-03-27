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
import DashboardNav from "../../components/shared/DashboardNav";
import AnimatedList from "../../components/AnimatedList";
import api from "../../services/api";

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

export default function UserManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (roleFilter) params.set("role", roleFilter);
      if (statusFilter) params.set("accountStatus", statusFilter);
      params.set("page", String(page));
      params.set("limit", "20");

      const res = await api.get(`/admin/users?${params.toString()}`);
      setUsers(res.data.data.users);
      setPagination(res.data.data.pagination || {});
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (location.state?.message) {
      setMessage(location.state.message);
      window.history.replaceState({}, document.title, location.pathname);
    }
  }, [location.state, location.pathname]);

  const handleDeleteNavigation = (userId) => {
    navigate(`/admin/users/${userId}/delete`);
  };

  return (
    <div className="min-h-screen p-8 bg-(--bg) text-(--fg)">
      <div className="max-w-7xl mx-auto">
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
                    onChange={(e) => setSearch(e.target.value)}
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
              <AnimatedList
                items={users}
                showGradients
                enableArrowNavigation={false}
                displayScrollbar
                renderItem={(user) => (
                  <div className="grid gap-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                      <div>
                        <div className="text-xl font-semibold">
                          {user.firstName} {user.lastName}
                        </div>
                        <div className="text-base text-(--fg-muted)">
                          {user.email}
                        </div>
                        <div className="text-sm text-(--fg-muted) mt-1">
                          ID: {user._id || user.id}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <span className="stat-pill">{user.role}</span>
                        <span className={statusClass(user.accountStatus)}>
                          {user.accountStatus}
                        </span>
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
                      <div className="grid gap-2 text-base text-(--fg-muted)">
                        <div>Gender: {user.gender}</div>
                        <div>Telephone: {user.telephone?.[0] || "—"}</div>
                      </div>
                      <div className="flex flex-wrap gap-2 justify-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/users/${user._id || user.id}`);
                          }}
                          className="brutal-btn px-3 py-2 bg-(--mint) text-black"
                        >
                          <Eye size={16} />
                          View
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(
                              `/admin/users/${user._id || user.id}/edit`,
                            );
                          }}
                          className="brutal-btn px-3 py-2 bg-(--yellow) text-black"
                        >
                          <Edit3 size={16} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNavigation(user._id || user.id);
                          }}
                          className="brutal-btn px-3 py-2 bg-[#FF6B6B] text-black"
                        >
                          <Trash2 size={16} />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              />
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
                  onClick={fetchUsers}
                  className="brutal-btn px-4 py-2 bg-(--mint)"
                >
                  <RefreshCcw size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
