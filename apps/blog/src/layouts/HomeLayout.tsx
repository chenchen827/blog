import { useEffect, useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { UserMenu } from "@repo/shared";
import type { UserMenuUser } from "@repo/shared";

import type { SiteSetting } from "../types";
import { getSetting } from "../apis/settings";
import { useAuth } from "../auth/AuthContext";
import Starfield from "../components/Starfield";
import { cn } from "../lib/cn";

const NAV = [
  { to: "/knowledge", label: "知识库" },
  { to: "/albums", label: "相册集" },
  { to: "/portfolio", label: "作品集" },
  { to: "/posts", label: "文章" },
];

function toMenuUser(user: ReturnType<typeof useAuth>["user"]): UserMenuUser | undefined {
  if (!user) return undefined;
  return {
    id: user.id,
    name: user.nickname || user.username,
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    role: user.role,
    sex: user.sex,
    company: user.company,
    introduce: user.introduce,
  };
}

export default function HomeLayout() {
  const { user, logout, updateProfile } = useAuth();
  const [setting, setSetting] = useState<SiteSetting | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    getSetting()
      .then((res) => {
        if (active) setSetting(res.data.setting);
      })
      .catch(() => {
        if (active) setSetting(null);
      });
    return () => {
      active = false;
    };
  }, []);

  const menuUser = toMenuUser(user);
  const siteName = setting?.name || "My Blog";

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      <Starfield count={1200} speedRange={[0.5, 1.2]} alphaRange={[0.3, 1]} sizeRange={[0.6, 1.8]} minScale={0.2} minAlpha={0.08} glowColor="#cfe0ff" dotColor="#fff6e8" />
      <header className="sticky top-0 z-30 isolate border-b border-hairline bg-canvas/60 backdrop-blur-[2px]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />
        <nav className="relative z-10 mx-auto flex max-w-7xl items-center gap-x-6 px-4 py-4">
          <Link
            to="/"
            title={siteName}
            className="flex min-h-11 min-w-0 max-w-[52vw] shrink items-center text-sm font-black uppercase tracking-[0.18em] text-accent transition-colors hover:text-accent-yellow md:max-w-64"
          >
            <span className="truncate">{siteName}</span>
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn("px-3 py-2 text-sm font-bold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary", isActive && "text-accent")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            <UserMenu user={menuUser} onLogout={logout} onLogin={() => navigate("/login")} onUpdateProfile={updateProfile} />
          </div>
        </nav>

        {/* 移动端导航 */}
        <nav className="relative z-10 flex items-center gap-1 overflow-x-auto border-t border-hairline px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn("shrink-0 px-3 py-1.5 text-sm font-bold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary", isActive && "text-accent")
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>

      <footer className="relative z-10 mt-16 border-t border-hairline">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-2 px-4 py-8 text-center md:flex-row md:justify-between md:text-left">
          <div>
            <p className="text-sm font-black uppercase tracking-wider text-text-primary">{siteName}</p>
            <p className="mt-1 text-xs lowercase tracking-wide text-text-secondary">{setting?.copyright || "© 2026 All Rights Reserved."}</p>
          </div>
          {setting?.icp && <span className="text-xs text-text-secondary">{setting.icp}</span>}
        </div>
      </footer>
    </div>
  );
}