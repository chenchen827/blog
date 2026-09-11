import { useState } from "react";
import { useNavigate } from "react-router";
import { UserMenu } from "@repo/shared";

import { useAuth } from "../auth/AuthContext";
import HomeLink from "./HomeLink";
import { cn } from "../lib/cn";
import { toMenuUser } from "../lib/userMenu";

/** 内容页顶部导航：鼠标进入页头区域时滑出，离开后自动收起。 */
export default function PageNav() {
  const [open, setOpen] = useState(false);
  const { user, logout, updateProfile } = useAuth();
  const navigate = useNavigate();
  const menuUser = toMenuUser(user);

  return (
    <div
      className="fixed inset-x-0 top-0 z-50 h-8"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocusCapture={() => setOpen(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <nav
        aria-hidden={!open}
        className={cn(
          "relative isolate w-full border-b border-hairline bg-canvas/60 backdrop-blur-[2px] transition-[transform,opacity] duration-300 ease-out will-change-transform",
          open ? "translate-y-0 opacity-100" : "pointer-events-none -translate-y-[120%] opacity-0",
        )}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
          }}
        />

        <div className="relative z-10 flex w-full items-center gap-x-6 px-4 py-4">
          <HomeLink label="首页" />

          <div className="ml-auto shrink-0">
            <UserMenu user={menuUser} onLogout={logout} onLogin={() => navigate("/login")} onUpdateProfile={updateProfile} />
          </div>
        </div>
      </nav>
    </div>
  );
}