import { Link } from "react-router";

import { cn } from "../lib/cn";

interface HomeLinkProps {
  /** 首页入口显示名称 */
  label: string;
  className?: string;
}

/** 首页入口：标识条、辅助编码和路径绘制动画统一复用。 */
export default function HomeLink({ label, className }: HomeLinkProps) {
  return (
    <Link
      to="/"
      title={label}
      className={cn(
        "group/home-link relative flex min-h-11 min-w-0 items-center gap-3 pr-2 text-text-primary transition-colors hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas",
        className,
      )}
    >
      <span className="relative h-5 w-1 shrink-0 overflow-hidden bg-accent/25">
        <span className="absolute inset-0 -translate-y-full bg-accent transition-transform duration-300 ease-out group-hover/home-link:translate-y-0 group-focus-visible/home-link:translate-y-0" />
      </span>

      <span className="relative min-w-0 pb-1">
        <span className="block text-[8px] font-black uppercase tracking-[0.32em] text-accent/75 transition-colors group-hover/home-link:text-accent">
          Home
        </span>
        <span className="block truncate text-sm font-black uppercase tracking-[0.18em]">{label}</span>

        <svg aria-hidden="true" viewBox="0 0 100 6" preserveAspectRatio="none" className="pointer-events-none absolute -bottom-1 left-0 h-2 w-full min-w-14 overflow-visible">
          <path
            d="M1 5 H30 L38 1 H99"
            pathLength={1}
            className="fill-none stroke-accent stroke-[1.5] [stroke-dasharray:1] [stroke-dashoffset:1] transition-all duration-500 ease-out group-hover/home-link:[stroke-dashoffset:0] group-focus-visible/home-link:[stroke-dashoffset:0]"
          />
          <circle
            cx="99"
            cy="1"
            r="1.5"
            className="fill-accent opacity-0 transition-opacity duration-300 group-hover/home-link:opacity-100 group-focus-visible/home-link:opacity-100"
          />
        </svg>
      </span>
    </Link>
  );
}