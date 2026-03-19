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

  const totalIncome  = filtered.filter(e => e.type === "income") .reduce((s, e) => s + e.amount, 0);
  const totalExpense = filtered.filter(e => e.type === "expense").reduce((s, e) => s + e.amount, 0);

  // pie chart – expenses by category
  const expenseByCategory = filtered
    .filter(e => e.type === "expense")
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + e.amount;
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto">

        {/* Back */}
        <div className="mb-6">
          <BackButton />
        </div>

        <h1 className="text-3xl font-bold text-gray-800 mb-1">All Entries</h1>
        <p className="text-gray-500 mb-6">Full breakdown of your transactions</p>

        {error && (
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        {(rangeStart || rangeEnd) && (
          <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-indigo-50 px-4 py-3 text-sm text-indigo-700">
            <span>
              Showing entries from {rangeStart || "the beginning"} to {rangeEnd || "the latest date"}
            </span>
            <button
              onClick={() => {
                setRangeStart("");
                setRangeEnd("");
              }}
              className="rounded-full bg-white px-3 py-1 font-medium text-indigo-600 hover:bg-indigo-100"
            >
              Clear range
            </button>
          </div>
        )}

        {/* Period filter */}
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIODS.map(p => (
            <button
              key={p.value}
              onClick={() => setPeriod(p.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                period === p.value
                  ? "bg-indigo-600 text-white shadow"
                  : "bg-white border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-6">
          {[
            { value: "all",     label: "All Types", active: "bg-gray-800 text-white"    },
            { value: "expense", label: "Expense",   active: "bg-red-500 text-white"     },
            { value: "income",  label: "Income",    active: "bg-green-500 text-white"   },
          ].map(t => (
            <button
              key={t.value}
              onClick={() => setTypeFilter(t.value)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition ${
                typeFilter === t.value
                  ? t.active
                  : "bg-white border text-gray-600 hover:bg-gray-100"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* LEFT — entry list */}
          <div className="lg:col-span-2 space-y-3">

            {/* Summary bar */}
            <div className="bg-white rounded-xl shadow p-4 flex flex-wrap gap-6 items-center">
              <div>
                <p className="text-xs text-gray-400">Income</p>
                <p className="font-bold text-green-500">{fmt(totalIncome)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Expenses</p>
                <p className="font-bold text-red-500">{fmt(totalExpense)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Net</p>
                <p className={`font-bold ${totalIncome - totalExpense >= 0 ? "text-green-500" : "text-red-500"}`}>
                  {fmt(totalIncome - totalExpense)}
                </p>
              </div>
              <div className="ml-auto text-xs text-gray-400">
                {sorted.length} {sorted.length === 1 ? "entry" : "entries"}
              </div>
            </div>

            {/* Entries */}
            {sorted.length === 0 ? (
              <div className="bg-white rounded-xl shadow p-10 text-center text-gray-400">
                {loading ? "Loading entries..." : "No entries found for this period"}
              </div>
            ) : (
              sorted.map(e => (
                <div key={e.id} className="bg-white rounded-xl shadow p-4 flex items-start gap-3">
                  <div className={`w-1.5 rounded-full self-stretch ${e.type === "income" ? "bg-green-400" : "bg-red-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{e.category}</p>
                        <p className="text-xs text-gray-400">{fmtDate(e.date)} · {e.paymentMethod}</p>
                        {e.notes && (
                          <p className="text-xs text-gray-500 italic mt-0.5 truncate">{e.notes}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-bold text-sm whitespace-nowrap ${
                          e.type === "income" ? "text-green-500" : "text-red-500"
                        }`}>
                          {e.type === "income" ? "+" : "-"}{fmt(e.amount)}
                        </span>
                        <button
                          onClick={() => handleDeleteEntry(e.id)}
                          title="Delete entry"
                          className="text-xs px-2 py-1 rounded bg-red-50 text-red-400 hover:bg-red-100 transition"
                        >
                          🗑️
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
            <div className="space-y-6 sticky top-6">
              <div className="bg-white rounded-xl shadow p-5">
                <h3 className="font-semibold mb-4">Transaction Range</h3>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">
                      Start Date
                    </label>
                    <input
                      type="date"
                      value={rangeStart}
                      onChange={(e) => setRangeStart(e.target.value)}
                      max={rangeEnd || undefined}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-600">
                      End Date
                    </label>
                    <input
                      type="date"
                      value={rangeEnd}
                      onChange={(e) => setRangeEnd(e.target.value)}
                      min={rangeStart || undefined}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-indigo-400 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => {
                      setRangeStart("");
                      setRangeEnd("");
                    }}
                    className="w-full rounded-xl bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200"
                  >
                    Reset Range
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow p-5">
              <h3 className="font-semibold mb-4">Expense Breakdown</h3>

              {pieData.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-10">No expense data</p>
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
                        contentStyle={{ fontSize: 12 }}
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
                            <span className="text-gray-600 truncate">{d.name}</span>
                          </div>
                          <div className="flex items-center gap-1 shrink-0 ml-2">
                            <span className="font-medium">{fmt(d.value)}</span>
                            <span className="text-gray-400">({pct}%)</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total */}
                  <div className="mt-4 pt-3 border-t flex justify-between text-sm font-semibold">
                    <span>Total Expenses</span>
                    <span className="text-red-500">{fmt(totalExpense)}</span>
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
