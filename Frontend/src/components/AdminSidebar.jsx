import React from "react";
import {
  BarChart3,
  Briefcase,
  ChartSpline,
  ShieldCheck,
  Users,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", route: "/admin/dashboard", icon: BarChart3 },
  { label: "User Management", route: "/admin/users", icon: Users },
  { label: "Expense Monitor", route: "/admin/expense-monitor", icon: Briefcase },
  { label: "Personal Finance Tracker", route: "/admin/finance-lab", icon: ChartSpline },
];

const AdminSidebar = ({ currentRoute, onNavigate, activeUsers = 0, totalUsers = 0 }) => {
  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-800 bg-[#0f172a] p-5 lg:flex lg:flex-col">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">Personal Finance Tracker</p>
        <h2 className="mt-2 text-xl font-bold text-white">Smart Expense Tracker</h2>
        <p className="mt-1 text-xs text-slate-400">Monitor users, spending, and platform health</p>
      </div>

      <div className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentRoute === item.route;

          return (
            <button
              key={item.route}
              onClick={() => onNavigate(item.route)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-medium transition ${
                isActive
                  ? "bg-cyan-500/20 text-cyan-200"
                  : "text-slate-200 hover:bg-white/10"
              }`}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto rounded-xl border border-slate-700 bg-slate-800 p-4">
        <div className="flex items-center gap-2 text-cyan-200">
          <ShieldCheck size={16} />
          <p className="text-xs uppercase tracking-wider">Live Platform Status</p>
        </div>
        <p className="mt-3 text-sm text-slate-200">
          Active users: <span className="font-semibold">{activeUsers}</span> / {totalUsers}
        </p>
      </div>
    </aside>
  );
};

export default AdminSidebar;