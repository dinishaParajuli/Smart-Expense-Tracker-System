import React from "react";
import { Grid2x2, Settings, Users, WalletCards } from "lucide-react";

const links = [
  { label: "Dashboard", route: "/admin/dashboard", icon: Grid2x2 },
  { label: "User Management", route: "/admin/users", icon: Users },
  { label: "Expense Monitor", route: "/features", icon: WalletCards },
  { label: "Settings", route: "/", icon: Settings },
];

function initialsFromName(name = "Admin User") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

const AdminPanelSidebar = ({ currentRoute = "/admin/users", onNavigate, adminName = "Admin User" }) => {
  const initials = initialsFromName(adminName);

  return (
    <aside className="hidden w-64 shrink-0 border-r border-slate-800 bg-[#0f172a] px-3 py-4 lg:flex lg:flex-col">
      <div className="px-2">
        <h2 className="text-xl font-bold text-slate-100">Smart Expense</h2>
        <p className="text-xs text-slate-400">System Architect</p>
      </div>

      <nav className="mt-8 space-y-1">
        {links.map((item) => {
          const Icon = item.icon;
          const active = item.route === currentRoute;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm font-medium transition ${
                active
                  ? "bg-cyan-500/20 text-cyan-200 shadow-sm"
                  : "text-slate-300 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto flex items-center gap-3 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-semibold text-cyan-300">
          {initials || "AU"}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-100">{adminName}</p>
          <p className="text-[11px] uppercase tracking-wider text-slate-400">Administrator</p>
        </div>
      </div>
    </aside>
  );
};

export default AdminPanelSidebar;