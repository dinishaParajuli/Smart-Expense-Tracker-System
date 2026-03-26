import React, { useEffect, useState } from "react";
import BackButton from "../components/BackButton";
import {
  format,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { useEntry } from "../Context/EntryContext";

const PIE_COLORS = [
  "#6366F1", "#F59E0B", "#10B981", "#EF4444",
  "#3B82F6", "#8B5CF6", "#F97316", "#14B8A6",
];

const PERIODS = [
  { label: "Today",         value: "today"   },
  { label: "This Week",     value: "week"    },
  { label: "This Month",    value: "month"   },
  { label: "Last 3 Months", value: "3months" },
  { label: "All Time",      value: "all"     },
];

export default function AllEntriesPage() {
  const { entries, loading, error, refreshEntries, deleteEntry } = useEntry();
  const [period, setPeriod]         = useState("month");
  const [typeFilter, setTypeFilter] = useState("all");
  const [rangeStart, setRangeStart] = useState("");
  const [rangeEnd, setRangeEnd] = useState("");

  useEffect(() => {
    refreshEntries().catch(() => {});
  }, [refreshEntries]);

  const now = new Date();
  const periodStart = {
    today:   startOfDay(now),
    week:    startOfWeek(now, { weekStartsOn: 1 }),
    month:   startOfMonth(now),
    "3months": subMonths(now, 3),
    all:     new Date(0),
  }[period];

  const filtered = entries.filter((e) => {
    const entryDate = new Date(e.date);
    const inPeriod = entryDate >= periodStart;
    const matchesType = typeFilter === "all" || e.type === typeFilter;
    const matchesRangeStart = !rangeStart || e.date >= rangeStart;
    const matchesRangeEnd = !rangeEnd || e.date <= rangeEnd;
    return inPeriod && matchesType && matchesRangeStart && matchesRangeEnd;
  });

  // sorted newest first
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const totalIncome  = filtered.filter(e => e.type === "income") .reduce((s, e) => s + (Number(e.amount) || 0), 0);
  const totalExpense = filtered.filter(e => e.type === "expense").reduce((s, e) => s + (Number(e.amount) || 0), 0);

  // pie chart – expenses by category
  const expenseByCategory = filtered
    .filter(e => e.type === "expense")
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + (Number(e.amount) || 0);
      return acc;
    }, {});
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));

  const fmt = (amt) =>
    new Intl.NumberFormat("en-NP", {
      style: "currency", currency: "NPR", minimumFractionDigits: 0,
    }).format(amt);

  const fmtDate = (d) => format(new Date(d), "MMM d, yyyy");

  const handleDeleteEntry = async (id) => {
    try {
      await deleteEntry(id);
    } catch (err) {
      alert(err.message || "Failed to delete entry.");
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 p-6 text-slate-100">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-28 left-1/4 h-72 w-72 rounded-full bg-blue-600/10 blur-3xl" />
        <div className="absolute -right-24 top-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">

        {/* Back */}
        <div className="mb-6">
          <BackButton />
        </div>

        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/80 px-5 py-4 backdrop-blur-sm">
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-slate-100">All Entries</h1>
          <p className="text-slate-400">Full breakdown of your transactions</p>
        </div>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-700 bg-amber-900/30 px-4 py-3 text-sm text-amber-200">
            {error}
          </div>
        )}

        {(rangeStart || rangeEnd) && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-blue-700/40 bg-blue-900/20 px-4 py-3 text-sm text-blue-200">
            <span>
              Showing entries from {rangeStart || "the beginning"} to {rangeEnd || "the latest date"}
            </span>
            <button
              onClick={() => {
                setRangeStart("");
                setRangeEnd("");
              }}
              className="rounded-full border border-slate-700 bg-slate-900 px-3 py-1 font-medium text-slate-200 hover:bg-slate-800"
            >
              Clear range
            </button>
          </div>
        )}

        {/* Period filter */}
        <div className="mb-3 flex flex-wrap gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                period === p.value
                  ? "border border-blue-500 bg-blue-600 text-white shadow-sm"
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="mb-6 flex gap-2 rounded-xl border border-slate-800 bg-slate-900/70 p-2">
          {[
            { value: "all",     label: "All Types", active: "border border-slate-600 bg-slate-700 text-white" },
            { value: "expense", label: "Expense",   active: "border border-rose-500 bg-rose-600 text-white" },
            { value: "income",  label: "Income",    active: "border border-emerald-500 bg-emerald-600 text-white" },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                typeFilter === t.value
                  ? t.active
                  : "border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">

          {/* LEFT — entry list */}
          <div className="lg:col-span-2 space-y-3">

            {/* Summary bar */}
            <div className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-emerald-600/30 bg-emerald-900/10 px-3 py-2.5">
                <p className="text-xs text-slate-400">Income</p>
                <p className="font-semibold text-emerald-400">{fmt(totalIncome)}</p>
              </div>
              <div className="rounded-lg border border-rose-600/30 bg-rose-900/10 px-3 py-2.5">
                <p className="text-xs text-slate-400">Expenses</p>
                <p className="font-semibold text-rose-400">{fmt(totalExpense)}</p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-2.5">
                <p className="text-xs text-slate-400">Net</p>
                <p className={`font-semibold ${totalIncome - totalExpense >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {fmt(totalIncome - totalExpense)}
                </p>
              </div>
              <div className="rounded-lg border border-slate-700 bg-slate-800/60 px-3 py-2.5">
                <p className="text-xs text-slate-400">Visible Entries</p>
                <p className="font-semibold text-slate-200">{sorted.length} {sorted.length === 1 ? "entry" : "entries"}</p>
              </div>
            </div>

            {/* Entries */}
            {sorted.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-10 text-center text-slate-400 shadow-sm">
                {loading ? "Loading entries..." : "No entries found for this period"}
              </div>
            ) : (
              sorted.map(e => (
                <div key={e.id} className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900 p-4 shadow-sm transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/90">
                  <div className={`w-1.5 self-stretch rounded-full ${e.type === "income" ? "bg-emerald-400" : "bg-rose-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-100">{e.category}</p>
                        <p className="text-xs text-slate-400">{fmtDate(e.date)} · {e.paymentMethod}</p>
                        {e.notes && (
                          <p className="mt-0.5 truncate text-xs italic text-slate-400">{e.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm whitespace-nowrap ${
                          e.type === "income" ? "text-emerald-400" : "text-rose-400"
                        }`}>
                          {e.type === "income" ? "+" : "-"}{fmt(e.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteEntry(e.id)}
                          title="Delete entry"
                          className="rounded-md border border-rose-700 bg-rose-900/30 px-2.5 py-1 text-xs font-medium text-rose-200 transition-colors hover:bg-rose-900/50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* RIGHT — pie chart */}
          <div>
            <div className="sticky top-6 space-y-6">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
                <h3 className="mb-4 font-semibold text-slate-100">Transaction Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      max={rangeEnd || undefined}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition-colors focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-slate-300">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      min={rangeStart || undefined}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 transition-colors focus:border-blue-500 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setRangeStart("");
                      setRangeEnd("");
                    }}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-700"
                  >
                    Reset Range
                  </button>
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 shadow-sm">
              <h3 className="mb-4 border-b border-slate-800 pb-3 font-semibold text-slate-100">Expense Breakdown</h3>

              {pieData.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">No expense data</p>
              ) : (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, name) => [fmt(v), name]}
                        contentStyle={{ fontSize: 12, backgroundColor: "#0f172a", border: "1px solid #334155", color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>

                  {/* Legend */}
                  <div className="mt-4 space-y-2">
                    {pieData.map((d, i) => {
                      const pct = totalExpense > 0
                        ? ((d.value / totalExpense) * 100).toFixed(1)
                        : "0";
                      return (
                        <div key={d.name} className="flex justify-between items-center text-xs">
                          <div className="flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full shrink-0"
                              style={{ background: PIE_COLORS[i % PIE_COLORS.length] }}
                            />
                            <span className="truncate text-slate-300">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="font-medium text-slate-100">{fmt(d.value)}</span>
                            <span className="text-slate-400">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="mt-4 flex justify-between border-t border-slate-800 pt-3 text-sm font-semibold">
                    <span className="text-slate-200">Total Expenses</span>
                    <span className="text-rose-400">{fmt(totalExpense)}</span>
                  </div>
                </>
              )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
