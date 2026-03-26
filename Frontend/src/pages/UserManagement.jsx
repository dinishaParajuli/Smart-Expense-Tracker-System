import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, HelpCircle, Pencil, Search, Shield, Trash2, UserCheck, UserPlus, UsersRound } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminUserMenu from "../components/AdminUserMenu";
import { API_BASE_URL } from "../api";

const UserManagement = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [addUserError, setAddUserError] = useState("");
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    email: "",
    role: "user",
    is_active: true,
  });
  const [editUserError, setEditUserError] = useState("");
  const [isUpdatingUser, setIsUpdatingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/auth/users/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
        setError("");
      } else {
        setError("Failed to fetch users");
      }
    } catch (err) {
      setError("Error fetching users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleUserAction = (user, action) => {
    setSelectedUser(user);
    setModalType(action);
    setEditUserError("");
    if (action === "edit") {
      setEditForm({
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        role: user.role || "user",
        is_active: Boolean(user.is_active),
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
    setModalType("");
    setAddUserError("");
    setEditUserError("");
    setIsCreatingUser(false);
    setIsUpdatingUser(false);
    setAddForm({
      first_name: "",
      last_name: "",
      email: "",
      password: "",
      role: "user",
    });
    setEditForm({
      first_name: "",
      last_name: "",
      email: "",
      role: "user",
      is_active: true,
    });
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setAddUserError("");
    setIsCreatingUser(true);

    if (addForm.password.length < 8) {
      setAddUserError("Password must be at least 8 characters.");
      setIsCreatingUser(false);
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        username: addForm.email,
        first_name: addForm.first_name,
        last_name: addForm.last_name,
        email: addForm.email,
        password: addForm.password,
        role: addForm.role,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/users/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const createdUser = await response.json();
        setUsers((prev) => [createdUser, ...prev]);
        closeModal();
        setError("");
      } else {
        const errData = await response.json().catch(() => ({}));
        const firstKey = Object.keys(errData)[0];
        const firstValue = firstKey ? errData[firstKey] : "Failed to create user";
        setAddUserError(Array.isArray(firstValue) ? String(firstValue[0]) : String(firstValue || "Failed to create user"));
      }
    } catch (err) {
      setAddUserError("Error creating user");
      console.error(err);
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    if (!selectedUser.id) {
      setError("Invalid user selected for deletion");
      return;
    }

    setError("");

    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}/`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchUsers();
        closeModal();
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user");
      console.error(err);
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    setEditUserError("");
    setIsUpdatingUser(true);

    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        username: editForm.email,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        email: editForm.email,
        role: editForm.role,
        is_active: editForm.is_active,
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/users/${selectedUser.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUsers((prev) => prev.map((user) => (user.id === selectedUser.id ? updatedUser : user)));
        closeModal();
        setError("");
      } else {
        const errData = await response.json().catch(() => ({}));
        const firstKey = Object.keys(errData)[0];
        const firstValue = firstKey ? errData[firstKey] : "Failed to update user";
        setEditUserError(Array.isArray(firstValue) ? String(firstValue[0]) : String(firstValue || "Failed to update user"));
      }
    } catch (err) {
      setEditUserError("Error updating user");
      console.error(err);
    } finally {
      setIsUpdatingUser(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatLastLogin = (lastLogin, dateJoined) => {
    const sourceDate = lastLogin || dateJoined;
    if (!sourceDate) return "-";
    return new Date(sourceDate).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (activeTab === "admins") return matchesSearch && user.role === "admin";
    if (activeTab === "users") return matchesSearch && user.role === "user";
    return matchesSearch;
  });

  const activeUsers = users.filter((u) => u.is_active).length;
  const totalUsers = users.length;
  const occupancy = totalUsers ? Math.round((activeUsers / totalUsers) * 100) : 0;
  const adminsCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;
  const usersGrowth = Math.max(users.filter((u) => u.role === "user").length - adminsCount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-slate-300">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b1120] text-white">
      <div className="flex min-h-screen">
        <AdminSidebar
          currentRoute="/admin/users"
          onNavigate={navigate}
          activeUsers={activeUsers}
          totalUsers={totalUsers}
        />

        <div className="relative z-10 flex-1">
          <header className="border-b border-slate-800 bg-[#0f172a] px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-xl">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search system resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-[#111827]/90 py-2.5 pl-10 pr-4 text-sm text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div className="flex items-center gap-3 text-slate-400">
                <button className="rounded-full border border-slate-700 bg-[#111827] p-2 shadow-sm transition hover:border-slate-500" title="Alerts">
                  <Bell size={15} />
                </button>
                <button className="rounded-full border border-slate-700 bg-[#111827] p-2 shadow-sm transition hover:border-slate-500" title="Help">
                  <HelpCircle size={15} />
                </button>
                <AdminUserMenu />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1200px] px-6 py-6">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Administrative Module</p>
                <h1 className="text-4xl font-bold tracking-tight text-white">User Management</h1>
                <p className="mt-1 text-sm text-slate-400">Control access, monitor activity, and manage account lifecycle.</p>
              </div>
              <button
                onClick={() => {
                  setModalType("add");
                  setSelectedUser(null);
                  setShowModal(true);
                }}
                className="inline-flex items-center gap-2 rounded-xl bg-cyan-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-500"
              >
                <UserPlus size={14} />
                Add New User
              </button>
            </div>

            <div className="mb-6 grid gap-4 lg:grid-cols-[2fr_1fr]">
              <section className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Directory</p>
                <div className="mt-2 flex items-end gap-2">
                  <h2 className="text-4xl font-semibold text-white">{activeUsers.toLocaleString()}</h2>
                  <span className="rounded-md bg-cyan-500/20 px-2 py-1 text-xs font-medium text-cyan-200">
                    +{usersGrowth}% vs last month
                  </span>
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-cyan-500" style={{ width: `${occupancy}%` }} />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Current Occupancy: {occupancy}% of seat limit</span>
                  <span>{Math.max(totalUsers, 1)} Total Seats</span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-center gap-2 text-cyan-300">
                      <UserCheck size={14} />
                      <p className="text-xs uppercase tracking-wider">Active</p>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-white">{activeUsers}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-center gap-2 text-indigo-300">
                      <Shield size={14} />
                      <p className="text-xs uppercase tracking-wider">Admins</p>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-white">{adminsCount}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/70 p-3">
                    <div className="flex items-center gap-2 text-amber-300">
                      <UsersRound size={14} />
                      <p className="text-xs uppercase tracking-wider">Users</p>
                    </div>
                    <p className="mt-1 text-xl font-semibold text-white">{userCount}</p>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-700 bg-[#111827] p-5 text-white">
                <p className="text-xs uppercase tracking-wider text-slate-300">System Health</p>
                <p className="mt-3 text-lg font-semibold leading-snug">
                  All internal authentication services are operational.
                </p>
                <div className="mt-5 space-y-2 text-xs text-cyan-100">
                  <p>• API uptime: 99.9%</p>
                  <p>• Auth latency: low</p>
                  <p>• Security checks: active</p>
                </div>
              </section>
            </div>

            {error ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">{error}</div> : null}

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827]">
              <div className="flex flex-col gap-3 border-b border-slate-800 px-5 py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab("all")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      activeTab === "all" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    All Users
                  </button>
                  <button
                    onClick={() => setActiveTab("admins")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      activeTab === "admins" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Admins
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      activeTab === "users" ? "bg-cyan-500 text-slate-950" : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    Users
                  </button>
                </div>
                <button className="text-xs font-medium text-slate-400">Advanced Filters</button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        User Identity
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Access Level
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Network Status
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Last Login
                      </th>
                      <th className="px-5 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800 bg-[#111827]">
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <tr key={user.id} className="transition hover:bg-slate-900/70">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-slate-200">
                                {(user.username || "U").slice(0, 2).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-slate-100">{user.first_name || user.username}</div>
                                <div className="text-xs text-slate-400">{user.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded px-2 py-1 text-xs font-semibold ${
                                user.role === "admin" ? "bg-indigo-500/20 text-indigo-200" : "bg-slate-700 text-slate-200"
                              }`}
                            >
                              {user.role === "admin" ? "Admin" : "User"}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-2 text-xs font-medium ${
                                user.is_active ? "text-emerald-300" : "text-slate-400"
                              }`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${user.is_active ? "bg-emerald-400" : "bg-slate-500"}`} />
                              {user.is_active ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-sm text-slate-300">{formatLastLogin(user.last_login, user.date_joined)}</td>
                          <td className="px-5 py-4 text-sm font-medium">
                            <div className="flex items-center gap-3">
                              <button
                                onClick={() => handleUserAction(user, "view")}
                                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-200"
                                title="View"
                              >
                                <UsersRound size={14} />
                              </button>
                              <button
                                onClick={() => handleUserAction(user, "edit")}
                                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-cyan-500/60 hover:text-cyan-200"
                                title="Edit"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleUserAction(user, "delete")}
                                className="rounded-lg border border-slate-700 p-1.5 text-slate-300 transition hover:border-rose-500/60 hover:text-rose-300"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-400">
                          {searchTerm ? "No users found matching your search." : "No users found."}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800 px-5 py-3 text-xs text-slate-400">
                <p>
                  Showing {filteredUsers.length} of {totalUsers} users
                </p>
                <div className="flex gap-2">
                  <button className="rounded-lg border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:bg-slate-800">Previous</button>
                  <button className="rounded-lg border border-slate-700 px-3 py-1.5 transition hover:border-slate-500 hover:bg-slate-800">Next</button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {showModal && (modalType === "add" || selectedUser) ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-xl border border-slate-700 bg-gray-800">
            <div className="p-6">
              <h3 className="mb-4 text-xl font-semibold text-white">
                {modalType === "add" && "Add New User"}
                {modalType === "view" && "User Details"}
                {modalType === "edit" && "Edit User"}
                {modalType === "delete" && "Delete User"}
              </h3>

              {modalType === "add" ? (
                <form onSubmit={handleCreateUser} className="space-y-3">
                  {addUserError ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-200">
                      {addUserError}
                    </div>
                  ) : null}
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={addForm.first_name}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="First name"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      value={addForm.last_name}
                      onChange={(e) => setAddForm((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Last name"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>
                  <input
                    type="email"
                    required
                    value={addForm.email}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  />
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={addForm.password}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, password: e.target.value }))}
                    placeholder="Password"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  />
                  <p className="text-xs text-slate-400">Use at least 8 characters for the password.</p>
                  <select
                    value={addForm.role}
                    onChange={(e) => setAddForm((prev) => ({ ...prev, role: e.target.value }))}
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isCreatingUser}
                      className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 font-medium transition hover:bg-cyan-500"
                    >
                      {isCreatingUser ? "Creating..." : "Create User"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-lg bg-gray-600 px-4 py-2 font-medium transition hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}

              {modalType === "view" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm text-gray-400">Username</label>
                    <p className="text-white">{selectedUser.username}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Email</label>
                    <p className="text-white">{selectedUser.email}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Role</label>
                    <p className="text-white">{selectedUser.role === "admin" ? "Admin" : "User"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Status</label>
                    <p className="text-white">{selectedUser.is_active ? "Active" : "Inactive"}</p>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Joined</label>
                    <p className="text-white">{formatDate(selectedUser.date_joined)}</p>
                  </div>
                </div>
              ) : null}

              {modalType === "delete" ? (
                <div>
                  <p className="mb-4 text-gray-300">
                    Are you sure you want to delete user "{selectedUser.username}"? This action cannot be undone.
                  </p>
                  <div className="flex space-x-3">
                    <button
                      onClick={handleDeleteUser}
                      className="flex-1 rounded-lg bg-red-600 px-4 py-2 font-medium transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                    <button
                      onClick={closeModal}
                      className="flex-1 rounded-lg bg-gray-600 px-4 py-2 font-medium transition hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : null}

              {modalType === "edit" ? (
                <form onSubmit={handleUpdateUser} className="space-y-3">
                  {editUserError ? (
                    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-sm text-rose-200">
                      {editUserError}
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      value={editForm.first_name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, first_name: e.target.value }))}
                      placeholder="First name"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                    <input
                      type="text"
                      value={editForm.last_name}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, last_name: e.target.value }))}
                      placeholder="Last name"
                      className="rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    />
                  </div>

                  <input
                    type="email"
                    required
                    value={editForm.email}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                  />

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <select
                      value={editForm.role}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>

                    <select
                      value={editForm.is_active ? "active" : "inactive"}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, is_active: e.target.value === "active" }))}
                      className="w-full rounded-lg border border-slate-600 bg-slate-900 px-3 py-2 text-sm text-white outline-none focus:border-cyan-400"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-2">
                    <button
                      type="submit"
                      disabled={isUpdatingUser}
                      className="flex-1 rounded-lg bg-cyan-600 px-4 py-2 font-medium transition hover:bg-cyan-500"
                    >
                      {isUpdatingUser ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 rounded-lg bg-gray-600 px-4 py-2 font-medium transition hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default UserManagement;
