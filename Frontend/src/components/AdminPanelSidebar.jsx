import React from "react";
import { Grid2x2, Settings, ShieldCheck, Users, WalletCards } from "lucide-react";

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
    <aside className="relative hidden w-72 shrink-0 overflow-hidden border-r border-slate-800 bg-[#0e1628] p-5 lg:flex lg:flex-col">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-px bg-slate-700/60" />

      <div className="relative z-10 rounded-2xl border border-slate-700/80 bg-slate-900/40 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Admin Workspace</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight text-white">Smart Expense</h2>
            <p className="mt-1 text-xs text-slate-400">System Architect</p>
          </div>
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-slate-700 bg-slate-800 text-sm font-semibold text-slate-100">
            {initials || "AU"}
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-6 px-1">
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">Navigation</p>
      </div>

      <nav className="relative z-10 mt-3 space-y-2">
        {links.map((item) => {
          const Icon = item.icon;
          const active = item.route === currentRoute;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`group relative flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left text-sm font-medium transition ${
                active
                  ? "border-slate-600 bg-slate-800 text-white"
                  : "border-slate-800 bg-transparent text-slate-300 hover:border-slate-700 hover:bg-slate-800/60 hover:text-slate-100"
              }`}
            >
              <span
                className={`absolute left-1.5 top-1/2 h-6 -translate-y-1/2 rounded-full transition-all ${
                  active
                    ? "w-1 bg-slate-300"
                    : "w-0.5 bg-slate-600 group-hover:bg-slate-400"
                }`}
              />
              <div
                className={`grid h-7 w-7 place-items-center rounded-lg transition ${
                  active ? "bg-slate-700 text-slate-100" : "bg-slate-800/70 text-slate-300 group-hover:bg-slate-700"
                }`}
              >
                <Icon size={15} />
              </div>
              <span className="tracking-[0.01em]">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="relative z-10 mt-6 rounded-2xl border border-slate-700/80 bg-slate-900/50 p-4">
        <div className="mb-2 flex items-center gap-2 text-slate-300">
          <ShieldCheck size={15} />
          <p className="text-[11px] uppercase tracking-[0.16em]">Live Status</p>
        </div>
        <p className="text-sm text-slate-300">All admin modules are online.</p>
        <p className="mt-1 text-xs text-slate-500">Monitoring users, spending, and access.</p>
      </div>

      <div className="relative z-10 mt-auto rounded-2xl border border-slate-700/80 bg-slate-900/70 px-4 py-4">
        <div className="mb-3 flex items-center gap-2 text-slate-300">
          <ShieldCheck size={15} />
          <p className="text-[11px] uppercase tracking-[0.16em]">Admin Session</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-700 text-xs font-semibold text-slate-100">
            {initials || "AU"}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-100">{adminName}</p>
            <p className="text-[11px] uppercase tracking-wider text-slate-400">Administrator</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default AdminPanelSidebar;