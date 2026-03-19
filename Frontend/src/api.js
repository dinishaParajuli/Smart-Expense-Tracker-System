const API_CANDIDATES = ["/api", "http://127.0.0.1:8000/api"];

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, value);
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

async function requestApi(path, options = {}, requireAuth = false) {
  const errors = [];
  const token = getAccessToken();

  if (requireAuth && !token) {
    throw new Error("Please log in to manage transactions.");
  }

  for (const base of API_CANDIDATES) {
    const url = `${base}${path}`;

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...(requireAuth && token ? { Authorization: `Bearer ${token}` } : {}),
          ...(options.headers || {}),
        },
      });

      const contentType = response.headers.get("content-type") || "";

      if (response.ok) {
        if (response.status === 204) return null;

        if (!contentType.includes("application/json")) {
          const text = await response.text();
          errors.push(`${url} returned non-JSON content: ${text.slice(0, 120)}`);
          continue;
        }

        return response.json();
      }

      let detail = `${response.status}`;
      try {
        if (contentType.includes("application/json")) {
          const data = await response.json();
          detail = JSON.stringify(data);
        } else {
          detail = (await response.text()).slice(0, 120);
        }
      } catch {
        detail = await response.text();
      }

      errors.push(`${url} returned ${detail}`);
    } catch (error) {
      errors.push(`${url} unreachable`);
    }
  }

  throw new Error(errors.join(" | ") || "API request failed");
}

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
      const contentType = response.headers.get("content-type") || "";
      if (response.ok) {
        if (!contentType.includes("application/json")) {
          errors.push(`${url} returned non-JSON content`);
          continue;
        }
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

export async function fetchTransactions(params = {}) {
  return requestApi(`/auth/transactions/${buildQueryString(params)}`, {}, true);
}

export async function createTransaction(payload) {
  return requestApi(
    "/auth/transactions/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function updateTransaction(id, payload) {
  return requestApi(
    `/auth/transactions/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function deleteTransaction(id) {
  return requestApi(
    `/auth/transactions/${id}/`,
    {
      method: "DELETE",
    },
    true,
  );
}

export async function fetchTransactionSummary(params = {}) {
  return requestApi(`/auth/transactions/summary/${buildQueryString(params)}`, {}, true);
}
