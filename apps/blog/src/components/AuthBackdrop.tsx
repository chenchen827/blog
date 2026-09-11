import type { ReactNode } from "react";

import { cn } from "../lib/cn";

export interface AuthBackdropProps {
  children: ReactNode;
  code: string;
  label: string;
  className?: string;
}

/** 博客认证页背景：工业网格、荧光定位线和机械编号,不干扰表单可读性。 */
export default function AuthBackdrop({ children, code, label, className }: AuthBackdropProps) {
  return (
    <section className={cn("relative isolate overflow-hidden border-y border-hairline bg-primary/55", className)}>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              "radial-gradient(circle at 18% 24%, rgba(217, 255, 0, 0.08), transparent 28%), radial-gradient(circle at 82% 72%, rgba(255, 255, 255, 0.055), transparent 32%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "linear-gradient(rgba(255, 255, 255, 0.65) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.65) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
            maskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
            WebkitMaskImage: "linear-gradient(to bottom, black 0%, transparent 92%)",
          }}
        />
        <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.8) 0 1px, transparent 1px 4px)" }} />

        <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent" />
        <div className="absolute left-[12%] top-0 hidden h-full w-px bg-linear-to-b from-transparent via-accent/20 to-transparent sm:block" />
        <div className="absolute -right-16 top-[18%] h-52 w-52 rotate-12 border border-accent/15 bg-accent/[0.035] [clip-path:polygon(18%_0,100%_0,100%_82%,82%_100%,0_100%,0_18%)]" />
        <div className="absolute bottom-14 left-5 h-px w-20 bg-accent/60 sm:left-8 sm:w-28" />

        <span className="absolute -bottom-5 right-3 select-none text-[clamp(4rem,14vw,10rem)] font-black uppercase leading-none tracking-[-0.08em] text-white/[0.025]">
          {label}
        </span>
        <span className="absolute right-5 top-8 hidden text-[10px] font-black uppercase tracking-[0.42em] text-text-secondary [writing-mode:vertical-rl] sm:block">
          ZONE 05 / {code}
        </span>
        <div className="absolute bottom-6 left-5 hidden items-center gap-3 sm:flex sm:left-8">
          <span className="h-1.5 w-1.5 bg-accent" />
          <span className="text-[10px] font-black uppercase tracking-[0.34em] text-text-secondary">Authentication Node</span>
        </div>
      </div>

      <div className="relative z-10 flex min-h-155 items-center justify-center px-4 py-10 sm:px-8 md:min-h-170 lg:px-12">{children}</div>
    </section>
  );
}
