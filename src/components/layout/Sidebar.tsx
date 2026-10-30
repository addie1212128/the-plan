import { NavLink } from "react-router-dom";
import { LayoutDashboard, Globe2, Settings, PanelLeftClose, PanelLeft } from "lucide-react";
import clsx from "clsx";
import { MODULES } from "@/config/modules";
import { useUI } from "@/lib/store";
import { useEntityCounts } from "@/hooks/useEntities";

export function Sidebar() {
  const collapsed = useUI((s) => s.sidebarCollapsed);
  const toggle = useUI((s) => s.toggleSidebar);
  const counts = useEntityCounts();

  return (
    <aside
      className={clsx(
        "flex h-full flex-col border-r border-ink-600 bg-ink-800/90 transition-[width] duration-200",
        collapsed ? "w-16" : "w-60",
      )}
    >
      <div className="flex items-center gap-2 px-4 py-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-arcane to-ember shadow-glow">
          <Globe2 className="h-5 w-5 text-white" />
        </div>
        {!collapsed && (
          <div className="leading-tight">
            <div className="font-display text-lg text-parchment-100">Loremkeeper</div>
            <div className="text-[11px] uppercase tracking-wider text-parchment-300/60">
              worldbuilding studio
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-2">
        <NavItem to="/" icon={<LayoutDashboard className="h-4 w-4" />} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/world" icon={<Globe2 className="h-4 w-4" />} label="World Map" collapsed={collapsed} />

        {!collapsed && (
          <div className="px-3 pb-1 pt-4 text-[11px] font-semibold uppercase tracking-wider text-parchment-300/50">
            Compendium
          </div>
        )}
        {MODULES.map((m) => (
          <NavItem
            key={m.kind}
            to={`/m/${m.slug}`}
            icon={<m.icon className="h-4 w-4" style={{ color: m.color }} />}
            label={m.label}
            collapsed={collapsed}
            count={counts?.[m.kind]}
          />
        ))}
      </nav>

      <div className="space-y-1 border-t border-ink-600 px-2 py-2">
        <NavItem to="/settings" icon={<Settings className="h-4 w-4" />} label="Settings" collapsed={collapsed} />
        <button
          onClick={toggle}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-parchment-300/70 transition hover:bg-ink-600/60"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  collapsed,
  count,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
  count?: number;
}) {
  return (
    <NavLink
      to={to}
      end={to === "/"}
      title={collapsed ? label : undefined}
      className={({ isActive }) =>
        clsx(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition",
          isActive
            ? "bg-ink-500/70 text-parchment-100 shadow-inner"
            : "text-parchment-300/80 hover:bg-ink-600/60 hover:text-parchment-100",
        )
      }
    >
      <span className="shrink-0">{icon}</span>
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && count != null && count > 0 && (
        <span className="rounded-full bg-ink-600 px-2 text-[11px] text-parchment-300/70">{count}</span>
      )}
    </NavLink>
  );
}
