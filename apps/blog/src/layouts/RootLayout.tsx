import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { UserMenu } from "@repo/shared";
import type { UserMenuUser } from "@repo/shared";

import type { SiteSetting } from "../types";
import { getSetting } from "../apis/settings";
import { useAuth } from "../auth/AuthContext";
import Starfield from "../components/Starfield";
import { cn } from "../lib/cn";

const NAV = [
  { to: "/", label: "首页", code: "HOME" },
  { to: "/knowledge", label: "知识库", code: "KNOWLEDGE" },
  { to: "/albums", label: "相册集", code: "ALBUM" },
  { to: "/portfolio", label: "作品集", code: "PORTFOLIO" },
  { to: "/posts", label: "文章", code: "ARTICLE" },
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

export default function RootLayout() {
  const { user, logout, updateProfile } = useAuth();
  const [setting, setSetting] = useState<SiteSetting | null>(null);
  const [q, setQ] = useState("");
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

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    navigate(`/search?q=${encodeURIComponent(keyword)}`);
  };

  const menuUser = toMenuUser(user);

  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      <Starfield count={1200} speedRange={[0.5, 1.2]} alphaRange={[0.3, 1]} sizeRange={[0.6, 1.8]} minScale={0.2} minAlpha={0.08} glowColor="#cfe0ff" dotColor="#fff6e8" />
      <header className="sticky top-0 z-30 border-b border-hairline bg-canvas/90 backdrop-blur">
        <nav className="mx-auto flex max-w-7xl items-center gap-x-6 px-4 py-4">
          <Link to="/" className="shrink-0 text-lg font-black uppercase tracking-wide text-text-primary">
            {setting?.name || "My Blog"}
          </Link>

          <div className="hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/"}
                className={({ isActive }) =>
                  cn("px-3 py-2 text-sm font-bold uppercase tracking-wide text-text-secondary transition-colors hover:text-text-primary", isActive && "text-accent")
                }
              >
                {item.label}
              </NavLink>
            ))}
          </div>

          <form onSubmit={handleSearch} className="ml-auto hidden items-center gap-2 rounded-none border border-hairline bg-surface-soft px-3 py-1.5 lg:flex">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="搜索文章 / 课程"
              className="w-40 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
            />
            <button type="submit" className="text-xs font-black uppercase tracking-wider text-accent">
              Search
            </button>
          </form>

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <UserMenu user={menuUser} onLogout={logout} onLogin={() => navigate("/login")} onUpdateProfile={updateProfile} />
          </div>
        </nav>

        {/* 移动端导航 */}
        <nav className="flex items-center gap-1 overflow-x-auto border-t border-hairline px-4 py-2 md:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
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
            <p className="text-sm font-black uppercase tracking-wider text-text-primary">{setting?.name || "My Blog"}</p>
            <p className="mt-1 text-xs lowercase tracking-wide text-text-secondary">{setting?.copyright || "© 2026 All Rights Reserved."}</p>
          </div>
          {setting?.icp && <span className="text-xs text-text-secondary">{setting.icp}</span>}
        </div>
      </footer>
    </div>
  );
}
