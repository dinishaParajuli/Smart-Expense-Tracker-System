const API_CANDIDATES = (() => {
  const envBase = (import.meta.env.VITE_API_BASE_URL || "").trim();
  if (envBase) {
    return [envBase.replace(/\/$/, "")];
  }
  return ["http://127.0.0.1:8000/api"];
})();

export const API_BASE_URL = "http://127.0.0.1:8000";

function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("access_token");
}

function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("refresh_token");
}

function clearSession() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem("access_token");
  window.localStorage.removeItem("refresh_token");
  window.localStorage.removeItem("username");
  window.localStorage.removeItem("role");
  window.localStorage.removeItem("is_staff");
}

let refreshInFlight = null;

async function refreshAccessToken() {
  const refresh = getRefreshToken();
  if (!refresh) return null;

  if (refreshInFlight) {
    return refreshInFlight;
  }

  refreshInFlight = (async () => {
    for (const base of API_CANDIDATES) {
      const url = `${base}/auth/token/refresh/`;

      try {
        const response = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refresh }),
        });

        const contentType = response.headers.get("content-type") || "";

        if (!response.ok || !contentType.includes("application/json")) {
          continue;
        }

        const data = await response.json();
        const nextAccess = data?.access;
        if (nextAccess) {
          window.localStorage.setItem("access_token", nextAccess);
          return nextAccess;
        }
      } catch (_error) {
        // Try next candidate.
      }
    }

    return null;
  })().finally(() => {
    refreshInFlight = null;
  });

  return refreshInFlight;
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
  let token = getAccessToken();

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

      if (requireAuth && response.status === 401) {
        const refreshedToken = await refreshAccessToken();
        if (refreshedToken) {
          token = refreshedToken;

          const retryResponse = await fetch(url, {
            ...options,
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
              ...(options.headers || {}),
            },
          });

          const retryType = retryResponse.headers.get("content-type") || "";
          if (retryResponse.ok) {
            if (retryResponse.status === 204) return null;
            if (!retryType.includes("application/json")) {
              const text = await retryResponse.text();
              errors.push(`${url} returned non-JSON content: ${text.slice(0, 120)}`);
              continue;
            }
            return retryResponse.json();
          }
        }

        clearSession();
        throw new Error("Session expired. Please log in again.");
      }

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
    } catch (_error) {
      errors.push(`${url} unreachable`);
    }
  }

  const hasUnreachableError = errors.some((message) => message.includes("unreachable"));
  const hasHtmlFallbackError = errors.some((message) => message.includes("non-JSON content"));

  if (hasUnreachableError) {
    throw new Error("Backend API is unreachable. Start Django server at http://127.0.0.1:8000.");
  }

  if (hasHtmlFallbackError) {
    throw new Error("API route returned HTML instead of JSON. Verify VITE_API_BASE_URL or Vite proxy configuration.");
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
  try {
    const json = await requestApi("/auth/dashboard/overview/", {}, true);
    return { ...json, _source: "api" };
  } catch (error) {
    return {
      ...FALLBACK_OVERVIEW,
      _source: "fallback",
      _message: `Dashboard API failed: ${error.message}`,
    };
  }
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

// Budget APIs
export async function fetchBudgets() {
  return requestApi("/auth/budgets/", {}, true);
}

export async function createBudget(payload) {
  return requestApi(
    "/auth/budgets/",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function updateBudget(id, payload) {
  return requestApi(
    `/auth/budgets/${id}/`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    true,
  );
}

export async function deleteBudget(id) {
  return requestApi(
    `/auth/budgets/${id}/`,
    {
      method: "DELETE",
    },
    true,
  );
}
