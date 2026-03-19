import { Bell, LogOut, Settings, Sparkles, Sun, User, ChevronDown } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function TopBar({ profile }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setDropdownOpen(false);
    navigate("/");
  };

  const handleProfileClick = () => {
    setDropdownOpen(false);
    navigate("/profile");
  };

  const getInitial = () => {
    if (profile?.name) {
      return profile.name.charAt(0).toUpperCase();
    }
    return "U";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg-nav)]/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between px-6 py-3 md:px-10">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--brand)] text-white">
            <Sparkles size={18} />
          </div>
          <div>
            <p className="text-sm font-bold">Smart Expense Tracker</p>
            <p className="text-xs text-[var(--text-dim)]">Made for {profile?.locale || "Nepal"}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-[var(--line)] bg-white/5 p-2 text-[var(--text-dim)]">
            <Sun size={16} />
          </button>
          <button className="rounded-full border border-[var(--line)] bg-white/5 p-2 text-[var(--text-dim)]">
            <Bell size={16} />
          </button>
          <button className="rounded-full border border-[var(--line)] bg-white/5 p-2 text-[var(--text-dim)]">
            <Settings size={16} />
          </button>

          {/* Profile Dropdown */}
          <div className="relative ml-2">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-full border border-[var(--line)] bg-white/5 px-3 py-1.5 hover:bg-white/10 transition-colors"
            >
              <span className="text-sm text-white font-medium">{profile?.name || "Regan Karki"}</span>
              <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-slate-900 font-bold text-sm">
                {getInitial()}
              </div>
              <ChevronDown 
                size={16} 
                className={`text-[var(--text-dim)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} 
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#1e293b] border border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-[#0f172a] transition-colors border-b border-gray-700"
                >
                  <User size={18} className="text-blue-400" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:bg-[#0f172a] transition-colors"
                >
                  <LogOut size={18} />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
