import { Outlet } from "react-router";

import Starfield from "../components/Starfield";
import PageNav from "../components/PageNav";

/** 独立内容页基础画布：只提供深色背景与内容容器，不注入首页头部和页脚。 */
export default function PageLayout() {
  return (
    <div className="relative min-h-screen bg-canvas text-text-primary">
      <PageNav />
      <Starfield count={700} speedRange={[0.45, 1]} alphaRange={[0.25, 0.85]} sizeRange={[0.6, 1.6]} minScale={0.18} minAlpha={0.06} glowColor="#cfe0ff" dotColor="#fff6e8" />
      <main className="relative z-10 mx-auto max-w-7xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}