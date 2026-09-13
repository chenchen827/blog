import { Link } from "react-router";

import { cn } from "../lib/cn";

export type ReturnHomeVariant = "knowledge" | "default";

interface ReturnHomeLinkProps {
  /** 知识库使用报纸主题，其余内容页使用深色玻璃主题。 */
  variant?: ReturnHomeVariant;
  className?: string;
}

const DEFAULT_STYLE =
  "group fixed right-4 top-4 z-50 inline-flex min-h-11 items-center gap-2 bg-primary/80 px-4 text-text-primary backdrop-blur-xl transition-colors hover:bg-primary/60 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas supports-[backdrop-filter]:bg-primary/35 md:right-7 md:top-6";

/** 页面右上角的返回首页入口。 */
export default function ReturnHomeLink({ variant = "default", className }: ReturnHomeLinkProps) {
  if (variant === "knowledge") {
    return (
      <Link to="/" className={cn("news-home-link", className)} aria-label="返回首页">
        <span aria-hidden="true" className="news-home-link-mark">
          ←
        </span>
        <span className="news-home-link-copy">
          <strong>返回首页</strong>
          <small>Return to Home</small>
        </span>
      </Link>
    );
  }

  return (
    <Link to="/" className={cn(DEFAULT_STYLE, className)} aria-label="返回首页">
      <span aria-hidden="true" className="text-xl font-black transition-transform group-hover:-translate-x-0.5 group-focus-visible:-translate-x-0.5">
        ←
      </span>
      <span className="flex flex-col gap-0.5">
        <strong className="text-sm font-black uppercase tracking-[0.08em]">返回首页</strong>
        <small className="font-mono text-[0.56rem] font-bold uppercase tracking-[0.14em] text-text-secondary transition-colors group-hover:text-accent/80 group-focus-visible:text-accent/80">
          Return to Home
        </small>
      </span>
    </Link>
  );
}