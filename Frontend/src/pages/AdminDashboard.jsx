import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../components/BackButton";
import AdminSidebar from "../components/AdminSidebar";
import { API_BASE_URL } from "../api";
import { isAdminFromStorage } from "../utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!isAdminFromStorage()) {
      navigate("/dashboard");
    }
  }, [navigate]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(`${API_BASE_URL}/api/auth/admin-dashboard/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
        setError("");
      } else {
        setError("Failed to fetch dashboard data");
      }
    } catch (err) {
      setError("Error fetching dashboard data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-NP", {
      style: "currency",
      currency: "NPR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-6">
        <BackButton to="/" label="Back to Home" />
        <div className="max-w-4xl mx-auto mt-8">
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
            {error}
          </div>
        </div>
      </div>
    );
  }

  const { stats, charts, top_spenders, recent_transactions } = dashboardData;

  const monthlyRegistrations = charts?.monthly_registrations || [];
  const maxRegistrations = Math.max(...monthlyRegistrations.map((item) => item.count), 1);
  const totalTrackedAccounts = (stats?.total_users || 0) + (stats?.total_admins || 0);
  const activeRate = totalTrackedAccounts
    ? Math.round(((stats?.active_users || 0) / totalTrackedAccounts) * 100)
    : 0;
  const expenseToIncomeRatio = (stats?.total_income || 0)
    ? ((stats?.total_expense || 0) / (stats?.total_income || 1)) * 100
    : 0;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <div className="flex min-h-screen">
        <AdminSidebar
          currentRoute="/admin/dashboard"
          onNavigate={navigate}
          activeUsers={stats?.active_users || 0}
          totalUsers={totalTrackedAccounts}
        />

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-[#0f172a] px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold">Smart Expense Tracker Admin Dashboard</h1>
                <p className="text-slate-400">Project-wide visibility across users, activity, and spending trends</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="rounded-full bg-slate-800 px-3 py-1">Admin Session</span>
                <span className="rounded-full bg-green-600/20 px-3 py-1">System Online</span>
                <BackButton to="/" label="Back to Home" className="!py-1.5 !px-3" />
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-[1400px] px-6 py-8">
            <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-slate-400">Registered Users</p>
                <p className="mt-3 text-4xl font-bold text-blue-300">{stats.total_users}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-slate-400">Admin Accounts</p>
                <p className="mt-3 text-4xl font-bold text-purple-300">{stats.total_admins}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-slate-400">Platform Net Flow</p>
                <p className="mt-3 text-4xl font-bold text-emerald-300">{formatCurrency(stats.net_amount)}</p>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6 shadow-lg">
                <p className="text-xs uppercase tracking-widest text-slate-400">Monthly Expense Total</p>
                <p className="mt-3 text-4xl font-bold text-amber-300">{formatCurrency(stats.total_expense)}</p>
              </div>
            </div>

            <div className="mb-8 grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
                <h2 className="text-xl font-semibold">Project Health Snapshot</h2>
                <p className="text-xs text-slate-400">Core indicators for Smart Expense Tracker reliability and usage</p>

                <div className="mt-6 space-y-4">
                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Active Account Rate</span>
                      <span>{activeRate}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div className="h-2 rounded-full bg-cyan-400" style={{ width: `${activeRate}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                      <span>Expense to Income Ratio</span>
                      <span>{expenseToIncomeRatio.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-800">
                      <div
                        className="h-2 rounded-full bg-amber-400"
                        style={{ width: `${Math.min(expenseToIncomeRatio, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-slate-400">New Users (30 Days)</p>
                    <p className="mt-1 text-xl font-semibold text-white">{stats.recent_users}</p>
                  </div>
                  <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-3">
                    <p className="text-slate-400">Total Transactions</p>
                    <p className="mt-1 text-xl font-semibold text-white">{stats.total_transactions}</p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
                <h2 className="text-xl font-semibold">Monthly User Registrations</h2>
                <p className="text-xs text-slate-400">Last 6 months onboarding trend</p>

                <div className="mt-6 space-y-3">
                  {monthlyRegistrations.map((entry) => {
                    const width = Math.max((entry.count / maxRegistrations) * 100, 8);
                    return (
                      <div key={entry.month}>
                        <div className="mb-1 flex items-center justify-between text-xs text-slate-400">
                          <span>{entry.month}</span>
                          <span>{entry.count}</span>
                        </div>
                        <div className="h-2 rounded-full bg-slate-800">
                          <div className="h-2 rounded-full bg-blue-400" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Top Spending Users</h3>
                  <span className="text-xs text-slate-400">ranked</span>
                </div>

                {top_spenders?.length ? (
                  <div className="space-y-3">
                    {top_spenders.map((user, index) => (
                      <div key={user.id} className="rounded-xl bg-slate-900/70 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-semibold text-slate-100">
                            #{index + 1} {user.username}
                          </p>
                          <p className="text-emerald-300">{formatCurrency(user.total_spent)}</p>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {user.email} · {user.transaction_count} expense transactions
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="rounded-xl bg-slate-900/70 p-4 text-sm text-slate-400">
                    No spending data available yet.
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
                <h3 className="mb-4 text-lg font-semibold">Recent Transactions</h3>
                <div className="space-y-3">
                  {recent_transactions?.length ? (
                    recent_transactions.slice(0, 6).map((txn) => (
                      <div key={txn.id} className="rounded-xl bg-slate-900/60 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="font-medium text-slate-100">{txn.user}</p>
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              txn.type === "expense" ? "bg-rose-500/20 text-rose-300" : "bg-emerald-500/20 text-emerald-300"
                            }`}
                          >
                            {txn.type}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                          {txn.category} · {formatCurrency(txn.amount)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-xl bg-slate-900/70 p-4 text-sm text-slate-400">
                      No recent transactions found.
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl border border-slate-700 bg-[#111827] p-6">
              <h3 className="text-lg font-semibold">About This Project</h3>
              <p className="mt-2 max-w-3xl text-sm text-slate-400">
                Smart Expense Tracker System helps users manage income, expenses, budgets, receipt scans,
                and financial goals. This admin view gives a single place to monitor platform adoption,
                transaction activity, and user behavior so you can make product decisions faster.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/admin/users")}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm transition hover:bg-blue-500"
                >
                  Manage Users
                </button>
                <button
                  onClick={() => navigate("/admin/expense-monitor")}
                  className="rounded-lg bg-cyan-700 px-4 py-2 text-sm transition hover:bg-cyan-600"
                >
                  Open Expense Monitor
                </button>
                <button
                  onClick={() => navigate("/admin/finance-lab")}
                  className="rounded-lg bg-slate-700 px-4 py-2 text-sm transition hover:bg-slate-600"
                >
                  Open Personal Finance Tracker
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;