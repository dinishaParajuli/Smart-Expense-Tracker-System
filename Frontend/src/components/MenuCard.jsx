import { Bell, LogOut, Settings, Sparkles, Sun } from "lucide-react";

function TopBar({ profile }) {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--line)] bg-[var(--bg-nav)]/90 backdrop-blur">
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
          <div className="ml-2 flex items-center gap-3 rounded-full border border-[var(--line)] bg-white/5 px-3 py-1.5">
            <span className="text-sm">{profile?.name || "Regan Karki"} - {profile?.tier || "Premium"}</span>
            <div className="grid h-7 w-7 place-items-center rounded-full bg-cyan-400 text-slate-900">U</div>
          </div>
          <button className="ml-1 rounded-md border border-[var(--line)] bg-white/5 p-2 text-[var(--text-dim)]">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
