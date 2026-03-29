import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { DollarSign, PiggyBank, ReceiptText, TrendingDown } from "lucide-react";
import TopBar from "../components/TopBar";
import StatCard from "../components/StatCard";
import BackButton from "../components/BackButton";
import { fetchDashboardOverview } from "../api";
import { isAdminFromStorage } from "../utils/auth";

const statIcons = {
  total_balance: <DollarSign size={16} />,
  monthly_spending: <TrendingDown size={16} />,
  savings: <PiggyBank size={16} />,
  transactions: <ReceiptText size={16} />,
};

function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // Function to format currency values and remove negative signs
  const formatCurrencyValue = (value) => {
    if (typeof value !== "string") return value;
    // Remove negative signs from currency values
    return value.replace(/-\s*/, "");
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      navigate("/login");
      return;
    }

    if (isAdminFromStorage()) {
      navigate("/admin/dashboard");
      return;
    }

    fetchDashboardOverview()
      .then((payload) => {
        // Process stats to remove negative signs from values
        const processedPayload = {
          ...payload,
          stats: payload.stats.map((stat) => ({
            ...stat,
            value: formatCurrencyValue(stat.value),
          })),
        };
        setData(processedPayload);
        if (payload?._source === "fallback") {
          setError("");
        } else {
          setError("");
        }
      })
      .catch((err) => setError(err.message || "Could not load dashboard data from backend."));
  }, []);

  const trendData = useMemo(() => {
    if (!data?.trend) return [];
    return data.trend.labels.map((month, idx) => ({
      month,
      spending: data.trend.spending[idx],
      budget: data.trend.budget[idx],
    }));
  }, [data]);

  return (
    <div className="min-h-screen bg-[#0a0f1f] text-white">
      <TopBar profile={data?.profile} />

      <main className="mx-auto w-full max-w-[1600px] px-6 pb-12 pt-8 md:px-10">
        <BackButton />

        {error ? <p className="mt-8 rounded-xl border border-rose-300/30 bg-rose-400/10 p-4 text-rose-200">{error}</p> : null}
        {!data ? (
          <p className="mt-8 text-[#94a3b8]">Loading dashboard...</p>
        ) : (
          <>
            <section className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {data.stats.map((stat) => (
                <StatCard key={stat.key} {...stat} icon={statIcons[stat.key]} />
              ))}
            </section>

            <section className="mt-6 grid gap-5 xl:grid-cols-2">
              <article className="rounded-3xl border border-white/10 bg-[#111828] p-6 shadow-[0_20px_45px_-28px_rgba(2,6,23,0.9)]">
                <h2 className="text-3xl">Spending by Category</h2>
                <div className="mt-6 h-[430px]">
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={data.categorySpending}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="46%"
                        outerRadius={160}
                        stroke="rgba(225,235,255,0.75)"
                        strokeWidth={1}
                        labelLine={false}
                      >
                        {data.categorySpending.map((entry) => (
                          <Cell key={entry.name} fill={entry.color} />
                        ))}
                      </Pie>
                      <Legend verticalAlign="bottom" iconType="rect" wrapperStyle={{ color: "#cbd5e1" }} />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          background: "#111827",
                          color: "#e2e8f0",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </article>

              <article className="rounded-3xl border border-white/10 bg-[#111828] p-6 shadow-[0_20px_45px_-28px_rgba(2,6,23,0.9)]">
                <h2 className="text-3xl">Spending vs Budget Trend</h2>
                <div className="mt-10 h-[430px]">
                  <ResponsiveContainer>
                    <LineChart data={trendData}>
                      <CartesianGrid stroke="rgba(148, 163, 184, 0.12)" vertical={false} />
                      <XAxis dataKey="month" stroke="#94a3b8" tickLine={false} axisLine={false} />
                      <YAxis
                        stroke="#94a3b8"
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(value) => value.toLocaleString()}
                      />
                      <Tooltip
                        formatter={(value) => `NPR ${Number(value).toLocaleString()}`}
                        contentStyle={{
                          borderRadius: "14px",
                          border: "1px solid rgba(148, 163, 184, 0.35)",
                          background: "#111827",
                          color: "#e2e8f0",
                        }}
                      />
                      <Legend wrapperStyle={{ color: "#cbd5e1" }} />
                      <Line
                        type="monotone"
                        dataKey="spending"
                        name="Spending"
                        stroke="#ff4f5e"
                        strokeWidth={3}
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="budget"
                        name="Budget"
                        stroke="#00d2a8"
                        strokeWidth={2.5}
                        strokeDasharray="7 7"
                        dot={{ r: 3, strokeWidth: 1 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </article>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default DashboardPage;
