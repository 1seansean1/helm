import { useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  Compass,
  KeySquare,
  LineChart,
  Menu,
  Sailboat,
  Settings as SettingsIcon,
  X,
  Zap,
} from "lucide-react";
import { useHelm } from "../state";

const NAV = [
  { to: "/", label: "Home", icon: Compass },
  { to: "/pocket", label: "Pocket", icon: Zap },
  { to: "/progress", label: "Progress", icon: LineChart },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { state } = useHelm();
  const hasKey = state.apiKey.length > 0;
  const loc = useLocation();

  return (
    <div className="flex h-full w-full flex-col bg-ink-950 text-ink-100">
      {/* top bar */}
      <header
        className="sticky top-0 z-30 flex items-center justify-between border-b border-ink-700/60 bg-ink-950/85 px-4 backdrop-blur-md"
        style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
      >
        <Link to="/" className="flex items-center gap-2 py-3">
          <Sailboat className="h-5 w-5 text-gold-400" strokeWidth={1.75} />
          <span className="font-display text-lg font-semibold tracking-tight">Helm</span>
          <span className="hidden sm:inline text-xs uppercase tracking-[0.18em] text-ink-300">
            Frontier AI for product leaders
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            to="/settings"
            className={`hidden md:flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
              hasKey
                ? "border-moss-500/40 bg-moss-500/10 text-moss-400 hover:bg-moss-500/15"
                : "border-gold-500/40 bg-gold-500/10 text-gold-300 hover:bg-gold-500/15"
            }`}
          >
            <KeySquare className="h-3.5 w-3.5" />
            {hasKey ? "Key set" : "Add API key"}
          </Link>
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label="Open menu"
            className="rounded-md p-2 text-ink-200 hover:bg-ink-800 md:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* desktop sidebar */}
        <nav className="hidden w-56 shrink-0 flex-col gap-1 border-r border-ink-700/60 bg-ink-900/40 p-4 md:flex">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition ${
                  isActive
                    ? "bg-gold-500/12 text-gold-200 ring-1 ring-gold-500/30"
                    : "text-ink-200 hover:bg-ink-800/80"
                }`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
          <div className="mt-auto pt-4">
            <Link to="/help" className="text-xs text-ink-300 hover:text-ink-100">
              Help &amp; FAQ
            </Link>
            <p className="mt-3 text-[10px] uppercase tracking-[0.18em] text-ink-400">
              Built for product leaders in banking &amp; fintech.
            </p>
          </div>
        </nav>

        {/* main content */}
        <main className="paper-texture relative flex-1 overflow-y-auto pb-24 md:pb-8" key={loc.pathname}>
          {children}
        </main>
      </div>

      {/* mobile drawer */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-ink-950/70 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        >
          <div
            className="absolute right-0 top-0 h-full w-72 max-w-[85vw] border-l border-ink-700/60 bg-ink-900 p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg">Menu</span>
              <button
                onClick={() => setOpen(false)}
                aria-label="Close menu"
                className="rounded-md p-2 hover:bg-ink-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {NAV.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `mb-1 flex items-center gap-3 rounded-xl px-3 py-3 text-sm ${
                    isActive ? "bg-gold-500/12 text-gold-200" : "text-ink-100 hover:bg-ink-800"
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </NavLink>
            ))}
            <Link
              to="/help"
              onClick={() => setOpen(false)}
              className="mt-2 block rounded-xl px-3 py-3 text-sm text-ink-300 hover:bg-ink-800"
            >
              Help &amp; FAQ
            </Link>
          </div>
        </div>
      )}

      {/* mobile bottom nav */}
      <nav
        className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-ink-700/60 bg-ink-950/90 backdrop-blur-md md:hidden"
        style={{ paddingBottom: "max(env(safe-area-inset-bottom), 0px)" }}
      >
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] uppercase tracking-wider transition ${
                isActive ? "text-gold-300" : "text-ink-300"
              }`
            }
          >
            <Icon className="h-5 w-5" strokeWidth={1.75} />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
