import { Outlet, useLocation } from "react-router";

import solarSystem from "../assets/solar-system.svg";
import { Starfield } from "@repo/shared";
import ReturnHomeLink from "../components/ReturnHomeLink";
import type { ReturnHomeVariant } from "../components/ReturnHomeLink";
import { cn } from "../lib/cn";

/** 独立内容页基础画布：默认使用深色星空，知识库使用旧报纸纸张背景。 */
export default function PageLayout() {
  const { pathname } = useLocation();
  const isKnowledgePage = pathname === "/knowledge";
  const isAlbumsPage = pathname === "/albums" || /^\/personalizations\/[^/]+\/?$/.test(pathname);
  const returnHomeVariant: ReturnHomeVariant | null = isKnowledgePage
    ? "knowledge"
    : isAlbumsPage || pathname === "/posts"
      ? "default"
      : null;

  return (
    <div className={cn("relative min-h-screen bg-canvas text-text-primary", isKnowledgePage && "knowledge-paper-canvas")}>
      {isKnowledgePage && <img src={solarSystem} alt="" aria-hidden="true" className="knowledge-line-art" />}
      {!isKnowledgePage && (
        <Starfield count={700} speedRange={[0.45, 1]} alphaRange={[0.25, 0.85]} sizeRange={[0.6, 1.6]} minScale={0.18} minAlpha={0.06} glowColor="#cfe0ff" dotColor="#fff6e8" />
      )}
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
      {returnHomeVariant && <ReturnHomeLink variant={returnHomeVariant} />}
    </div>
  );
}
