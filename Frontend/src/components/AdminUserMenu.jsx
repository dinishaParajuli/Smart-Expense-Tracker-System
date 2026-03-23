import React, { useMemo, useState } from "react";
import { ChevronDown, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AdminUserMenu = () => {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const username = localStorage.getItem("username") || "Admin";

  const initial = useMemo(() => {
    return username.charAt(0).toUpperCase() || "A";
  }, [username]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    localStorage.removeItem("role");
    localStorage.removeItem("is_staff");
    setOpen(false);
    navigate("/");
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 rounded-full border border-slate-700 bg-[#111827] px-3 py-1.5 text-sm text-slate-100 transition hover:border-slate-500"
      >
        <span className="max-w-[130px] truncate font-medium">{username}</span>
        <div className="grid h-7 w-7 place-items-center rounded-full bg-cyan-500/20 text-cyan-200 text-xs font-semibold">
          {initial}
        </div>
        <ChevronDown size={14} className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-44 overflow-hidden rounded-xl border border-slate-700 bg-[#111827] shadow-xl">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 text-sm text-rose-300 transition hover:bg-slate-900"
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default AdminUserMenu;
