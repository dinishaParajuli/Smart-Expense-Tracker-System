function parseBoolean(value) {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return value === 1;
  if (typeof value === "string") {
    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1";
  }
  return false;
}

function normalizeRole(value) {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase();
}

export function isAdminFromStorage() {
  const role = normalizeRole(localStorage.getItem("role"));
  return role === "admin";
}

export function getDashboardRouteByStorageRole() {
  return isAdminFromStorage() ? "/admin/dashboard" : "/features";
}

export function getDashboardRouteByRole(roleValue) {
  return normalizeRole(roleValue) === "admin" ? "/admin/dashboard" : "/features";
}

export function saveLoginSession(data) {
  const isStaff = parseBoolean(data?.is_staff);
  const role = normalizeRole(data?.role) || "user";

  localStorage.setItem("access_token", data?.access || "");
  localStorage.setItem("refresh_token", data?.refresh || "");
  localStorage.setItem("username", data?.username || "");
  localStorage.setItem("role", role);
  localStorage.setItem("is_staff", String(isStaff));
}
