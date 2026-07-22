import { NavLink, useLocation } from "react-router-dom";
import { BookOpen, LayoutDashboard, PenLine, Settings, Users, BarChart3, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

type NavItem = {
  label: string;
  icon: React.ElementType;
  path: string;
  adminOnly?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Write Entry", icon: PenLine, path: "/editor" },
  { label: "My Diary", icon: BookOpen, path: "/diary" },
  { label: "Admin Panel", icon: BarChart3, path: "/admin", adminOnly: true },
  { label: "Users", icon: Users, path: "/admin/users", adminOnly: true },
  { label: "Settings", icon: Settings, path: "/settings" },
];

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const visibleItems = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-sidebar-border">
        <img
          src="/icon.png"
          alt="DiaryVerse"
          className="h-10 w-10 rounded-xl object-cover shadow-lg shadow-primary/20"
        />
        <div>
          <h1 className="font-display text-xl font-bold leading-none">DiaryVerse</h1>
          <p className="text-[10px] text-muted-foreground mt-0.5">Capture every moment</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">
          Menu
        </p>
        <ul className="space-y-1">
          {visibleItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "text-sidebar-foreground hover:bg-sidebar-accent",
                  )}
                >
                  <item.icon className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User card */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-lg p-2">
          <img
            src={user?.avatar}
            alt={user?.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            aria-label="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
