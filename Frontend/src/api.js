const API_CANDIDATES = ["/api", "http://127.0.0.1:8001/api"];

const FALLBACK_OVERVIEW = {
  profile: {
    name: "Regan Karki",
    tier: "Premium",
    locale: "Nepal",
  },
  stats: [
    {
      key: "total_balance",
      label: "Total Balance",
      value: "NPR 125,450",
      delta: "+5.2%",
      deltaType: "positive",
    },
    {
      key: "monthly_spending",
      label: "Monthly Spending",
      value: "NPR 50,200",
      delta: "-12.3%",
      deltaType: "negative",
    },
    {
      key: "savings",
      label: "Savings This Month",
      value: "NPR 28,450",
      delta: "+8.5%",
      deltaType: "positive",
    },
    {
      key: "transactions",
      label: "Total Transactions",
      value: "245",
      delta: "245",
      deltaType: "neutral",
    },
  ],
  categorySpending: [
    { name: "Housing", value: 30, color: "#8B5CF6" },
    { name: "Food & Dining", value: 25, color: "#1D4ED8" },
    { name: "Transportation", value: 16, color: "#10B981" },
    { name: "Shopping", value: 14, color: "#F59E0B" },
    { name: "Healthcare", value: 9, color: "#EF4444" },
    { name: "Others", value: 6, color: "#64748B" },
  ],
  trend: {
    labels: ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"],
    spending: [45000, 48000, 52000, 46000, 44000, 50200],
    budget: [50000, 50000, 50000, 50000, 50000, 50000],
  },
};

export async function fetchDashboardOverview() {
  const errors = [];

  for (const base of API_CANDIDATES) {
    const url = `${base}/dashboard/overview/`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        const json = await response.json();
        return { ...json, _source: "api" };
      }
      errors.push(`${url} returned ${response.status}`);
    } catch (error) {
      errors.push(`${url} unreachable`);
    }
  }

  return {
    ...FALLBACK_OVERVIEW,
    _source: "fallback",
    _message: `Dashboard API failed: ${errors.join(" | ")}`,
  };
}
