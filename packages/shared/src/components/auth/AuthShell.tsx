import type { ReactNode } from "react";

import { cn } from "../../utils";

const DEFAULT_AUTH_BACKGROUND = "https://chenchen-827.oss-cn-chengdu.aliyuncs.com/uploads/3084e7e34121342b435ca62ea576a9d9.jpg";

export type AuthShellLayout = "standalone" | "embedded";
export type AuthShellMaxWidth = "login" | "register";

export interface AuthShellProps {
  children: ReactNode;
  layout?: AuthShellLayout;
  maxWidth?: AuthShellMaxWidth;
  footerNote?: ReactNode;
  backgroundImage?: string;
  className?: string;
}

const maxWidthClasses: Record<AuthShellMaxWidth, string> = {
  login: "max-w-[460px]",
  register: "max-w-[620px]",
};

/** 认证页面统一外壳：独立路由使用全屏背景,嵌入式页面仅负责内容宽度。 */
export function AuthShell({ children, layout = "standalone", maxWidth = "login", footerNote, backgroundImage = DEFAULT_AUTH_BACKGROUND, className }: AuthShellProps) {
  const content = (
    <section className={cn("relative mx-auto w-full", maxWidthClasses[maxWidth])}>
      {children}
      {footerNote ? <p className="pt-6 text-center text-xs font-black uppercase tracking-[0.28em] text-text-secondary">{footerNote}</p> : null}
    </section>
  );

  if (layout === "embedded") {
    return <div className={cn("relative mx-auto w-full py-6 sm:py-10", className)}>{content}</div>;
  }

  return (
    <main className={cn("relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10 text-text-primary sm:px-6", className)}>
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${backgroundImage}")` }} />
      <div aria-hidden="true" className="absolute inset-0 bg-canvas/[0.84]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(217,255,0,0.16), transparent 54%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />
      {content}
    </main>
  );
}

export interface AuthPanelProps {
  children: ReactNode;
  className?: string;
}

/** 认证表单卡片：裁切角、深色表面和边界均对齐 design.md。 */
export function AuthPanel({ children, className }: AuthPanelProps) {
  return (
    <div
      className={cn(
        "relative border border-hairline bg-primary/[0.94] p-6 backdrop-blur-sm [clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)] sm:p-9",
        className,
      )}
    >
      {children}
    </div>
  );
}

export interface AuthPanelHeaderProps {
  eyebrow: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  index: ReactNode;
}

/** 认证卡片标题区,统一编号、标签和海报式标题排版。 */
export function AuthPanelHeader({ eyebrow, title, description, index }: AuthPanelHeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-hairline pb-7">
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">{eyebrow}</p>
        <h1 className="mt-3 text-[36px] font-black uppercase leading-none tracking-[-0.03em] text-text-primary sm:text-[42px]">{title}</h1>
        {description ? <p className="mt-4 text-base leading-relaxed text-text-secondary">{description}</p> : null}
      </div>
      <span aria-hidden="true" className="select-none text-[64px] font-black leading-none text-white/10">
        {index}
      </span>
    </div>
  );
}
