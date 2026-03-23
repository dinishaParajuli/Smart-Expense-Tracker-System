import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CheckCircle2,
  Eye,
  Filter,
  HelpCircle,
  Search,
  TrendingUp,
  XCircle,
} from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import AdminUserMenu from "../components/AdminUserMenu";
import { API_BASE_URL } from "../api";
import { isAdminFromStorage } from "../utils/auth";

const ALL_CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Entertainment",
  "Shopping",
  "Healthcare",
  "Utilities",
  "Travel & Lodging",
  "Education",
  "Miscellaneous",
  "Salary",
  "Business",
  "Investments",
  "Other",
];

function deriveStatus(id) {
  if (id % 5 === 0) return "rejected";
  if (id % 2 === 0) return "approved";
  return "pending";
}

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-NP", {
    style: "currency",
    currency: "NPR",
    minimumFractionDigits: 0,
  }).format(Number(amount || 0));
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initialsFromName(name = "User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

const ExpenseMonitor = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [records, setRecords] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (!isAdminFromStorage()) {
      navigate("/dashboard");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/admin-dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          setError("Could not load expense monitor data.");
          return;
        }

        const data = await response.json();
        const txns = (data?.recent_transactions || []).map((txn) => ({
          ...txn,
          status: deriveStatus(txn.id),
        }));

        setRecords(txns);
        setError("");
      } catch (err) {
        setError("Error loading expense monitor data.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  const filtered = useMemo(() => {
    return records.filter((item) => {
      const text = `${item.user} ${item.category}`.toLowerCase();
      const queryMatch = text.includes(query.toLowerCase());
      const statusMatch = statusFilter === "all" ? true : item.status === statusFilter;
      const categoryMatch = categoryFilter === "all" ? true : item.category === categoryFilter;
      return queryMatch && statusMatch && categoryMatch;
    });
  }, [records, query, statusFilter, categoryFilter]);

  const categories = useMemo(() => {
    const unique = new Set([...ALL_CATEGORIES, ...records.map((item) => item.category).filter(Boolean)]);
    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [records]);

  const dateRangeLabel = useMemo(() => {
    if (!records.length) return "No date range";

    const timestamps = records
      .map((item) => new Date(item.date).getTime())
      .filter((value) => !Number.isNaN(value));

    if (!timestamps.length) return "No date range";

    const minDate = new Date(Math.min(...timestamps));
    const maxDate = new Date(Math.max(...timestamps));

    const format = (date) =>
      date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });

    return `${format(minDate)} - ${format(maxDate)}`;
  }, [records]);

  const pendingAmount = filtered
    .filter((item) => item.status === "pending")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const approvedTodayAmount = filtered
    .filter((item) => item.status === "approved")
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const flagsFound = filtered.filter((item) => item.status === "rejected").length;
  const totalAmount = filtered.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const consumption = totalAmount ? Math.min(Math.round((approvedTodayAmount / totalAmount) * 100), 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b1120] text-slate-300">
        <div className="text-center">
          <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-slate-600 border-t-cyan-400" />
          <p>Loading expense monitor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-hidden bg-[#0b1120] text-white">
      <div className="pointer-events-none absolute left-[-120px] top-[-120px] h-[260px] w-[260px] rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-[-140px] right-[-120px] h-[300px] w-[300px] rounded-full bg-blue-500/10 blur-3xl" />
      <div className="flex min-h-screen">
        <AdminSidebar currentRoute="/admin/expense-monitor" onNavigate={navigate} activeUsers={0} totalUsers={0} />

        <div className="relative z-10 flex-1">
          <header className="border-b border-slate-800 bg-[#0f172a] px-6 py-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="relative w-full max-w-xl">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search reports, users, or IDs..."
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

          <main className="mx-auto w-full max-w-[1300px] px-6 py-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Financial Integrity Protocol</p>
                <h1 className="mt-1 text-4xl font-bold">Expense Monitor</h1>
                <p className="mt-1 text-sm text-slate-400">System-wide audit of pending and historical fiscal transactions.</p>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-slate-700 bg-gradient-to-b from-slate-900 to-[#111827] p-3 shadow-[0_12px_28px_-20px_rgba(34,211,238,0.6)]">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Pending Approval</p>
                  <p className="mt-1 text-2xl font-semibold">{formatCurrency(pendingAmount)}</p>
                </div>
                <div className="rounded-2xl border border-cyan-700/50 bg-gradient-to-b from-cyan-900/30 to-[#111827] p-3 shadow-[0_12px_28px_-20px_rgba(34,211,238,0.8)]">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Approved Total</p>
                  <p className="mt-1 text-2xl font-semibold text-cyan-300">{formatCurrency(approvedTodayAmount)}</p>
                </div>
                <div className="rounded-2xl border border-rose-700/40 bg-gradient-to-b from-rose-900/20 to-[#111827] p-3 shadow-[0_12px_28px_-20px_rgba(244,63,94,0.7)]">
                  <p className="text-[11px] uppercase tracking-wider text-slate-400">Flags Found</p>
                  <p className="mt-1 text-2xl font-semibold text-rose-300">{String(flagsFound).padStart(2, "0")}</p>
                </div>
              </div>
            </div>

            <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-slate-700 bg-[#111827] p-3 text-sm text-slate-300">
              <button className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-3 py-1.5 hover:bg-slate-800">
                <Calendar size={14} /> {dateRangeLabel}
              </button>
              <div className="inline-flex items-center gap-2">
                <Filter size={14} />
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="rounded-lg border border-slate-600 bg-[#0f172a] px-2 py-1.5 text-slate-100 outline-none"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category} className="bg-[#0f172a] text-slate-100">
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              <div className="inline-flex items-center gap-2">
                <Filter size={14} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="rounded-lg border border-slate-600 bg-[#0f172a] px-2 py-1.5 text-slate-100 outline-none"
                >
                  <option value="all" className="bg-[#0f172a] text-slate-100">Status: All</option>
                  <option value="pending" className="bg-[#0f172a] text-slate-100">Status: Pending</option>
                  <option value="approved" className="bg-[#0f172a] text-slate-100">Status: Approved</option>
                  <option value="rejected" className="bg-[#0f172a] text-slate-100">Status: Rejected</option>
                </select>
              </div>
              <button
                onClick={() => {
                  setQuery("");
                  setStatusFilter("all");
                  setCategoryFilter("all");
                }}
                className="ml-auto rounded-lg px-3 py-1.5 text-slate-400 hover:text-white"
              >
                Clear All
              </button>
              <button className="rounded-lg bg-black px-4 py-1.5 font-medium text-white hover:bg-slate-900">Export Report</button>
            </div>

            {error ? <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-red-200">{error}</div> : null}

            <div className="overflow-hidden rounded-2xl border border-slate-700 bg-[#111827] shadow-[0_20px_45px_-30px_rgba(8,47,73,0.9)]">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#0f172a]">
                    <tr>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">User Identity</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">Transaction Amount</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">Category</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">Submission Date</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">Status</th>
                      <th className="px-4 py-3 text-left text-[11px] uppercase tracking-wider text-slate-400">Administrative Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-800">
                    {filtered.length ? (
                      filtered.map((item) => (
                        <tr key={item.id} className="hover:bg-slate-900/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-800 text-xs font-semibold text-cyan-200">
                                {initialsFromName(item.user)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-100">{item.user}</p>
                                <p className="text-xs text-slate-400">Receipt #TRN-{item.id}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-slate-100">{formatCurrency(item.amount)}</td>
                          <td className="px-4 py-3 text-slate-300">{item.category}</td>
                          <td className="px-4 py-3 text-slate-300">{formatDate(item.date)}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px] font-semibold uppercase tracking-wider ${
                                item.status === "approved"
                                  ? "bg-cyan-500/20 text-cyan-200"
                                  : item.status === "rejected"
                                    ? "bg-rose-500/20 text-rose-200"
                                    : "bg-slate-700 text-slate-200"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {item.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <button className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-cyan-500/60 hover:text-cyan-200" title="Approve">
                                <CheckCircle2 size={14} />
                              </button>
                              <button className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-rose-500/60 hover:text-rose-200" title="Reject">
                                <XCircle size={14} />
                              </button>
                              <button className="rounded-md border border-slate-700 p-1.5 text-slate-300 hover:border-slate-500 hover:text-white" title="View">
                                <Eye size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-10 text-center text-slate-400">No matching records found.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <section className="mt-8 grid gap-5 xl:grid-cols-[2fr_1fr]">
              <article className="rounded-2xl border border-cyan-800/40 bg-gradient-to-r from-[#0c1a34] via-[#0d2245] to-[#102b56] p-6 shadow-[0_20px_55px_-35px_rgba(34,211,238,0.9)]">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/80">AI-Driven Insights</p>
                <h3 className="mt-3 text-3xl font-semibold">Optimize Next-Month Spending</h3>
                <p className="mt-3 max-w-2xl text-sm text-slate-200/90">
                  Based on current review trends, monitored categories are drifting upward. Consider stricter
                  approval rules for large, non-essential transactions.
                </p>
                <button
                  onClick={() => navigate("/admin/finance-lab")}
                  className="mt-6 inline-flex items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                >
                  <TrendingUp size={14} /> View Full Analysis
                </button>
              </article>

              <article className="rounded-2xl border border-slate-700 bg-[#111827] p-6">
                <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Monthly Limit</p>
                <div className="mt-2 flex items-end justify-between">
                  <p className="text-3xl font-semibold">{formatCurrency(totalAmount || 250000)}</p>
                  <p className="text-xs text-cyan-300">{consumption}% Consumed</p>
                </div>

                <div className="mt-4 h-2 rounded-full bg-slate-800">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500" style={{ width: `${consumption || 64}%` }} />
                </div>

                <p className="mt-4 text-xs text-slate-400">
                  <AlertTriangle size={12} className="mr-1 inline text-amber-300" />
                  All transactions are logged for permanent audit trail.
                </p>
              </article>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ExpenseMonitor;
