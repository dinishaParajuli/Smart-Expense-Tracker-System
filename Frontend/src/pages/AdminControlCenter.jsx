import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, Calculator, ChartSpline, PiggyBank, Wallet } from "lucide-react";
import AdminSidebar from "../components/AdminSidebar";
import { API_BASE_URL } from "../api";
import { isAdminFromStorage } from "../utils/auth";

const AdminControlCenter = () => {
  const navigate = useNavigate();
  const [growthRate, setGrowthRate] = useState(8);
  const [months, setMonths] = useState(6);
  const [stats, setStats] = useState(null);

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

    const fetchAdminStats = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/admin-dashboard/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) return;

        const json = await response.json();
        setStats(json.stats || null);
      } catch (err) {
        console.error("Personal finance tracker stats load failed", err);
      }
    };

    fetchAdminStats();
  }, [navigate]);

  const totalIncome = Number(stats?.total_income || 0);
  const totalExpense = Number(stats?.total_expense || 0);
  const netAmount = Number(stats?.net_amount || 0);
  const monthlyBase = totalExpense / 12 || 50000;
  const forecastedExpense = monthlyBase * (1 + growthRate / 100) ** months;
  const projectedSavings = totalIncome - forecastedExpense;
  const runwayMonths = monthlyBase > 0 && netAmount > 0 ? Math.round(netAmount / monthlyBase) : 0;

  return (
    <div className="min-h-screen bg-[#0b1120] text-white">
      <div className="flex min-h-screen">
        <AdminSidebar currentRoute="/admin/finance-lab" onNavigate={navigate} activeUsers={0} totalUsers={0} />

        <div className="flex-1">
          <header className="border-b border-slate-800 bg-[#0f172a] px-6 py-5">
            <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-300">Finance Intelligence</p>
            <h1 className="mt-1 text-4xl font-bold">Personal Finance Tracker</h1>
            <p className="mt-1 text-sm text-slate-400">Run projections, test growth scenarios, and inspect future cash-flow pressure.</p>
          </header>

          <main className="mx-auto w-full max-w-[1200px] px-6 py-8">
            <section className="grid gap-5 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
                <div className="flex items-center gap-2 text-cyan-300">
                  <Wallet size={16} />
                  <p className="text-xs uppercase tracking-wider">Current Net</p>
                </div>
                <p className="mt-3 text-2xl font-semibold">NPR {netAmount.toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-400">Income minus expenses from current observed period.</p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
                <div className="flex items-center gap-2 text-cyan-300">
                  <ChartSpline size={16} />
                  <p className="text-xs uppercase tracking-wider">Forecasted Expense</p>
                </div>
                <p className="mt-3 text-2xl font-semibold">NPR {Math.round(forecastedExpense).toLocaleString()}</p>
                <p className="mt-1 text-sm text-slate-400">Projected based on growth rate and time horizon.</p>
              </div>

              <div className="rounded-2xl border border-slate-700 bg-[#111827] p-5">
                <div className="flex items-center gap-2 text-cyan-300">
                  <PiggyBank size={16} />
                  <p className="text-xs uppercase tracking-wider">Projected Savings</p>
                </div>
                <p className={`mt-3 text-2xl font-semibold ${projectedSavings >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
                  NPR {Math.round(projectedSavings).toLocaleString()}
                </p>
                <p className="mt-1 text-sm text-slate-400">Expected remaining amount after forecasted spend.</p>
              </div>
            </section>

            <section className="mt-6 rounded-2xl border border-slate-700 bg-[#111827] p-6">
              <h2 className="text-xl font-semibold">Scenario Simulator</h2>
              <p className="mt-1 text-sm text-slate-400">Adjust expected growth and horizon to explore how expenses evolve.</p>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <p className="mb-2 text-sm font-medium">Monthly Expense Growth Rate</p>
                  <input
                    type="range"
                    min="0"
                    max="25"
                    value={growthRate}
                    onChange={(e) => setGrowthRate(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <p className="mt-2 text-xs text-slate-400">{growthRate}% expected growth</p>
                </label>

                <label className="rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                  <p className="mb-2 text-sm font-medium">Forecast Horizon (Months)</p>
                  <input
                    type="range"
                    min="1"
                    max="12"
                    value={months}
                    onChange={(e) => setMonths(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                  <p className="mt-2 text-xs text-slate-400">{months} months ahead</p>
                </label>
              </div>

              <div className="mt-4 rounded-xl border border-slate-700 bg-slate-900/40 p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Estimated Cash Runway</p>
                    <p className="text-xs text-slate-400">Based on current net and average monthly spending</p>
                  </div>
                  <p className="text-2xl font-semibold text-cyan-300">{runwayMonths} mo</p>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("/admin/expense-monitor")}
                  className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold hover:bg-cyan-500"
                >
                  <Calculator size={14} /> Open Expense Monitor
                </button>
                <button
                  onClick={() => navigate("/admin/dashboard")}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-600 px-4 py-2 text-sm font-semibold text-slate-200 hover:bg-slate-800"
                >
                  <ArrowUpRight size={14} /> Back to Dashboard
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminControlCenter;
