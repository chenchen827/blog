import { useEffect, useState } from "react";
import { Link, Navigate, NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { Alert, Button, Spin } from "antd";

import { navItems } from "../router/nav";
import type { NavItem } from "../types/nav";
import { clearToken, getCachedRole, getToken, saveRole } from "../utils/auth";
import { getCurrentUser } from "../apis/users";
import { ADMIN_ONLY_MENU_LABELS, isAdminOnlyPath, isAdminRole } from "../constants/permissions";

function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

const rowClasses = "flex min-h-11 w-full items-center gap-2 rounded-lg px-3 hover:bg-white/10! hover:text-accent! transition-all duration-300 origin-left";
const rowIdle = "text-white!";
const rowActive = "text-accent! bg-white/10! transition-all duration-300 origin-left";

function getGroupBase(item: NavItem): string | undefined {
  const first = item.children?.[0];
  if (!first) return undefined;
  return `/${first.to.split("/")[1] ?? ""}`;
}

function isGroupActive(item: NavItem, pathname: string): boolean {
  return item.children?.some((child) => child.to === pathname) ?? false;
}

interface LeafLinkProps {
  to: string;
  label: string;
  onNavigate?: () => void;
}

function LeafLink({ to, label, onNavigate }: LeafLinkProps) {
  return (
    <NavLink to={to} end={to === "/"} onClick={onNavigate} className={({ isActive }) => cx(rowClasses, isActive ? rowActive : rowIdle)}>
      {label}
    </NavLink>
  );
}

interface NavListProps {
  onNavigate?: () => void;
  isAdmin: boolean;
}

function NavList({ onNavigate, isAdmin }: NavListProps) {
  const { pathname } = useLocation();
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const [hoverGroup, setHoverGroup] = useState<string | null>(null);

  useEffect(() => {
    setOpenGroup(null);
    setHoverGroup(null);
  }, [pathname]);

  function toggleGroup(base: string) {
    setOpenGroup((prev) => (prev === base ? null : base));
  }

  const visibleItems = navItems.filter((item) => isAdmin || !ADMIN_ONLY_MENU_LABELS.has(item.label));

  return (
    <nav aria-label="主导航" className="space-y-1 px-2 py-4">
      {visibleItems.map((item) => {
        const children = item.children ?? [];
        if (children.length > 0) {
          const base = getGroupBase(item)!;
          const active = isGroupActive(item, pathname);
          const open = active || openGroup === base || hoverGroup === base;
          return (
            <div key={item.label} onMouseEnter={() => setHoverGroup(base)} onMouseLeave={() => setHoverGroup((prev) => (prev === base ? null : prev))}>
              <button
                type="button"
                aria-expanded={open}
                onClick={() => toggleGroup(base)}
                className={cx(rowClasses, active ? "text-accent!" : rowIdle, "justify-between text-base font-bold")}
              >
                <span>{item.label}</span>
                <span aria-hidden="true" className={cx("text-xs transition-transform duration-200", open && "rotate-180")}>
                  ▾
                </span>
              </button>
              <div className={cx("mt-1 grid transition-[grid-template-rows] duration-300 ease-in-out", open ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
                <div className={cx("min-h-0 overflow-hidden transition-[opacity,visibility] duration-300", open ? "visible opacity-100" : "invisible opacity-0")}>
                  <ul className="mt-1 space-y-1 pl-3">
                    {children.map((child) => (
                      <li key={child.to}>
                        <LeafLink to={child.to} label={child.label} onNavigate={onNavigate} />
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        }

        return <LeafLink key={item.label} to={item.to!} label={item.label} onNavigate={onNavigate} />;
      })}
    </nav>
  );
}

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  const token = getToken();
  const [role, setRole] = useState<number | null>(() => getCachedRole());
  const [roleLoading, setRoleLoading] = useState(() => Boolean(token) && getCachedRole() === null);
  const [authError, setAuthError] = useState("");
  const isAdmin = isAdminRole(role);

  useEffect(() => {
    if (!token || role !== null) return;
    let active = true;
    setRoleLoading(true);
    setAuthError("");
    getCurrentUser()
      .then((res) => {
        if (!active) return;
        const userRole = Number(res.data.user.role);
        setRole(userRole);
        saveRole(userRole);
      })
      .catch((err) => {
        if (active) {
          setAuthError(err instanceof Error ? err.message : "获取当前用户信息失败");
        }
      })
      .finally(() => {
        if (active) setRoleLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, role]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    clearToken();
    navigate("/login", { replace: true });
  }

  if (roleLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas">
        <Spin />
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-canvas px-6">
        <Alert type="error" showIcon message="权限信息加载失败" description={authError} />
        <Button onClick={handleLogout}>返回登录</Button>
      </div>
    );
  }

  if (!isAdmin && isAdminOnlyPath(pathname)) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-canvas text-text-primary">
      <header className="sticky top-0 z-30 flex h-17 items-center gap-3 border-b border-hairline bg-canvas px-4 md:gap-4 md:px-6">
        <button
          type="button"
          aria-label="打开菜单"
          onClick={() => setMenuOpen(true)}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-none bg-surface-soft text-text-primary transition-colors hover:bg-white/20 xl:hidden"
        >
          <span aria-hidden="true" className="text-base leading-none">
            ☰
          </span>
        </button>
        <Link to="/" className="hidden shrink-0 text-lg font-black uppercase tracking-wide text-text-primary md:inline">
          Blog Admin
        </Link>
        <Link
          to="/login"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-none bg-accent px-6 text-base font-black uppercase tracking-wide text-ink transition-[filter] hover:brightness-90"
        >
          登录
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-none bg-surface-soft px-5 text-base font-black uppercase tracking-wide text-text-primary transition-colors hover:bg-surface"
        >
          登出
        </button>
      </header>
      <div className="flex flex-1 items-stretch">
        <aside className="sticky top-17 hidden h-[calc(100vh-68px)] w-60 shrink-0 overflow-y-auto border-r border-hairline bg-primary xl:block">
          <NavList isAdmin={isAdmin} />
        </aside>
        <main className="min-w-0 flex-1">
          <div className="mx-auto w-full max-w-[2000px] h-full py-8 md:px-8 bg-[url('//chenchen-827.oss-cn-chengdu.aliyuncs.com/image/admin-bg.jpg')] bg-cover bg-center bg-no-repeat">
            <Outlet />
          </div>
        </main>
      </div>
      {menuOpen && (
        <div className="fixed inset-0 z-40 xl:hidden">
          <button type="button" aria-label="关闭菜单" onClick={closeMenu} className="absolute inset-0 h-full w-full cursor-default bg-overlay-scrim/70" />
          <aside className="absolute inset-y-0 left-0 flex w-60 flex-col overflow-y-auto border-r border-hairline bg-primary">
            <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
              <span className="text-base font-black uppercase tracking-wide">Blog Admin</span>
              <button
                type="button"
                aria-label="关闭菜单"
                onClick={closeMenu}
                className="flex h-11 w-11 items-center justify-center rounded-none bg-surface-soft text-text-primary transition-colors hover:bg-surface"
              >
                ✕
              </button>
            </div>
            <NavList isAdmin={isAdmin} onNavigate={closeMenu} />
          </aside>
        </div>
      )}
    </div>
  );
}