import { useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";
import { Link } from "react-router";
import { ArrowDownOutlined, ArrowRightOutlined, CloseOutlined, MailOutlined, PlusOutlined, UserOutlined } from "@ant-design/icons";
import { AccordionGallery, EmptyState, GhostFibers, GradientWaves, Starfield } from "@repo/shared";

import { getArticle } from "../apis/article";
import { ARTICLE_WINDOW_NAME, openArticleInWindow } from "../lib/articleWindow";
import { getPersonalizationAlbumPhotos } from "../apis/personalization";
import Loader from "../components/Loader";
import { usePersonalization } from "../hooks/usePersonalization";
import type { Album, Article, Photo } from "../types";

interface ParallaxProps {
  children: React.ReactNode;
  className?: string;
  speed?: number;
  scale?: number;
  fixed?: boolean;
}

function Parallax({ children, className, speed = 0.06, scale = 1, fixed = false }: ParallaxProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let currentOffset = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        currentOffset = 0;
        element.style.setProperty("--parallax-y", "0px");
        return;
      }

      const rect = element.getBoundingClientRect();
      const untransformedTop = rect.top - currentOffset;
      const untransformedBottom = rect.bottom - currentOffset;

      if (!fixed && (untransformedBottom < -120 || untransformedTop > window.innerHeight + 120)) {
        currentOffset = 0;
        element.style.setProperty("--parallax-y", "0px");
        return;
      }

      const nextOffset = fixed
        ? Math.max(-28, Math.min(0, -window.scrollY * speed))
        : Math.max(-110, Math.min(110, (window.innerHeight / 2 - (untransformedTop + rect.height / 2)) * speed));

      currentOffset = nextOffset;
      element.style.setProperty("--parallax-y", `${nextOffset.toFixed(2)}px`);
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, [fixed, speed]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transform: `translate3d(0, var(--parallax-y, 0px), 0) scale(${scale})`,
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
const SPLIT_LEFT_CLIP = "polygon(0 0, 78% 0, 66% 12%, 73% 24%, 55% 38%, 61% 52%, 43% 66%, 49% 82%, 28% 100%, 0 100%)";
const SPLIT_RIGHT_CLIP = "polygon(78% 0, 100% 0, 100% 100%, 28% 100%, 49% 82%, 43% 66%, 61% 52%, 55% 38%, 73% 24%, 66% 12%)";
interface WelcomeHeroContentProps {
  displayName: string;
  archiveId: string;
}

function WelcomeHeroContent({ displayName, archiveId }: WelcomeHeroContentProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-canvas/45 px-6 py-8 backdrop-blur-[1px] sm:px-10 sm:py-10 lg:px-14 lg:py-14">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.055]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.75) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.75) 1px, transparent 1px)",
          backgroundSize: "42px 42px",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute -right-20 top-[16%] h-64 w-64 rotate-12 border border-accent/25 bg-accent/[0.035] [clip-path:polygon(18%_0,100%_0,100%_82%,82%_100%,0_100%,0_18%)]"
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <span className="text-[10px] font-black uppercase tracking-[0.42em] text-text-secondary">Personal Archive / {archiveId}</span>
          <a
            href="#contact"
            tabIndex={-1}
            className="pointer-events-auto inline-flex min-h-11 items-center gap-3 rounded-full border border-accent px-5 text-sm font-black uppercase tracking-[0.16em] text-accent transition-colors hover:bg-accent hover:text-ink"
          >
            Contact
            <ArrowRightOutlined aria-hidden="true" />
          </a>
        </div>

        <div className="relative py-10 sm:py-16">
          <div
            aria-hidden="true"
            className="absolute -left-5 top-0 hidden h-28 w-28 -rotate-12 items-center justify-center rounded-full border border-accent/60 text-center text-[8px] font-black uppercase leading-tight tracking-[0.18em] text-accent sm:flex"
          >
            Just a nobody
            <br />
            (and a wild mind)
          </div>

          <h1 className="max-w-5xl text-[clamp(2.6rem,10vw,8.4rem)] font-black uppercase leading-[0.82] tracking-[-0.065em] text-text-primary">
            <span className="block text-accent">Be Curious!</span>
            <span className="block">Create!</span>
            <span className="block text-transparent [-webkit-text-stroke:2px_#f5f5f5]">And Cool!</span>
          </h1>

          <p className="mt-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg">欢迎来到「{displayName}」的数字档案。这里收录生活片段、个人近况与近期文章。</p>
        </div>

        <div className="flex flex-col items-center gap-3 text-center">
          <span aria-hidden="true" className="flex h-8 w-5 items-center justify-center border border-text-secondary/70">
            <span className="h-3 w-0.5 animate-pulse bg-accent" />
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.34em] text-accent">Scroll carefully, it&apos;s smooth</span>
          <span className="text-[9px] font-black uppercase tracking-[0.34em] text-text-secondary">小心 · 地 · 滑</span>
          <ArrowDownOutlined aria-hidden="true" className="text-xs text-accent" />
        </div>
      </div>
    </div>
  );
}

type ContactPhase = "idle" | "joined" | "leaving";

function useContactReveal(ref: RefObject<HTMLElement | null>) {
  const [phase, setPhase] = useState<ContactPhase>("idle");

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastScrollY = window.scrollY;

    const update = () => {
      frame = 0;
      const rect = element.getBoundingClientRect();
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY;
      lastScrollY = currentScrollY;

      if (reducedMotion.matches) {
        setPhase("joined");
        return;
      }

      if (rect.top >= window.innerHeight - 8) {
        setPhase("idle");
        return;
      }

      setPhase((current) => {
        if (rect.bottom <= window.innerHeight * 0.35) return "leaving";
        if (rect.top <= window.innerHeight - 160) return "joined";
        if (current === "leaving" && scrollingUp && rect.bottom > window.innerHeight * 0.65) return "joined";
        return current;
      });
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, [ref]);

  return phase;
}
function useWelcomeSplit() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;
      if (reducedMotion.matches) {
        setProgress(1);
        return;
      }

      const end = Math.max(1, window.innerHeight * (2 / 3));
      const next = Math.min(1, Math.max(0, window.scrollY / end));
      setProgress((current) => (Math.abs(current - next) < 0.008 ? current : next));
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, []);

  return progress;
}
function HomeBackground({ template }: { template?: string | null }) {
  const resolvedTemplate = template || "Starry";
  const isGradientWaves = resolvedTemplate === "GradientWaves";

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-0 h-dvh min-h-screen overflow-hidden bg-canvas">
      <Parallax className="absolute inset-0" speed={0.045} scale={1.12} fixed>
        {resolvedTemplate === "GhostFibers" ? (
          <GhostFibers lineColor="#d9ff00" glowColor="#5f6b00" brightness={1.4} />
        ) : resolvedTemplate === "GradientWaves" ? (
          <GradientWaves horizonColor="#5F8F00" waveColor="#E8FF00" crestColor="#FF9D00" brightness={1.45} fogDepth={22} />
        ) : (
          <Starfield
            contained
            count={900}
            speedRange={[0.45, 1.1]}
            alphaRange={[0.3, 0.95]}
            sizeRange={[0.6, 1.8]}
            minScale={0.18}
            minAlpha={0.06}
            glowColor="#cfe0ff"
            dotColor="#fff6e8"
          />
        )}
      </Parallax>
      <div className={isGradientWaves ? "absolute inset-0 bg-canvas/10" : "absolute inset-0 bg-canvas/35"} />
      {!isGradientWaves && <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,transparent_0%,rgba(5,5,5,0.28)_48%,rgba(5,5,5,0.78)_100%)]" />}
    </div>
  );
}

function usePortraitLaser(ref: RefObject<HTMLElement | null>) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;

    const update = () => {
      frame = 0;

      if (reducedMotion.matches) {
        setProgress(1);
        return;
      }

      const rect = element.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;
      const next = Math.min(1, Math.max(0, 1 - (elementCenter - viewportCenter) / viewportCenter));

      setProgress((current) => (Math.abs(current - next) < 0.01 ? current : next));
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    reducedMotion.addEventListener("change", scheduleUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      reducedMotion.removeEventListener("change", scheduleUpdate);
    };
  }, [ref]);

  return progress;
}

export default function Home() {
  const { personalization, loading, error } = usePersonalization();
  const portraitSectionRef = useRef<HTMLElement | null>(null);
  const laserProgress = usePortraitLaser(portraitSectionRef);
  const welcomeSplit = useWelcomeSplit();
  const contactSectionRef = useRef<HTMLElement | null>(null);
  const contactPhase = useContactReveal(contactSectionRef);

  useEffect(() => {
    document.documentElement.classList.add("hide-scrollbar");

    return () => {
      document.documentElement.classList.remove("hide-scrollbar");
    };
  }, []);
  const [album, setAlbum] = useState<Album | null>(null);
  const [albumPhotos, setAlbumPhotos] = useState<Photo[]>([]);
  const [albumLoading, setAlbumLoading] = useState(false);
  const [albumError, setAlbumError] = useState("");
  const [articles, setArticles] = useState<Article[]>([]);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [emailCopied, setEmailCopied] = useState(false);

  const copyEmail = async () => {
    const email = personalization?.contactEmail;
    if (!email) return;

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = email;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        textarea.remove();
      }

      setEmailCopied(true);
      window.setTimeout(() => setEmailCopied(false), 1600);
    } catch {
      setEmailCopied(false);
    }
  };
  const accessCode = personalization?.accessCode;
  const lifeAlbumId = personalization?.lifeAlbumId ?? null;
  const recommendedArticleIds = useMemo(() => {
    const ids = personalization?.recommendedArticleIds ?? [];
    return [...new Set(ids.map(Number).filter((id) => Number.isInteger(id) && id > 0))];
  }, [personalization?.recommendedArticleIds]);
  const recommendedArticleIdsKey = recommendedArticleIds.join(",");

  useEffect(() => {
    if (!accessCode || !lifeAlbumId) {
      setAlbum(null);
      setAlbumPhotos([]);
      setAlbumLoading(false);
      setAlbumError("");
      return;
    }

    let active = true;
    setAlbumLoading(true);
    setAlbumError("");

    getPersonalizationAlbumPhotos(accessCode, lifeAlbumId)
      .then((res) => {
        if (!active) return;
        setAlbum(res.data.album);
        setAlbumPhotos((res.data.photos ?? []).filter((photo) => Boolean(photo.imageUrl)));
      })
      .catch((requestError) => {
        if (!active) return;
        setAlbum(null);
        setAlbumPhotos([]);
        setAlbumError(requestError instanceof Error ? requestError.message : "加载生活相册失败");
      })
      .finally(() => {
        if (active) setAlbumLoading(false);
      });

    return () => {
      active = false;
    };
  }, [accessCode, lifeAlbumId]);

  useEffect(() => {
    const articleIds = recommendedArticleIdsKey
      ? recommendedArticleIdsKey
          .split(",")
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0)
      : [];

    if (articleIds.length === 0) {
      setArticles([]);
      setArticlesLoading(false);
      return;
    }

    let active = true;
    setArticlesLoading(true);

    Promise.allSettled(articleIds.map((id) => getArticle(id)))
      .then((results) => {
        if (!active) return;

        const next = results.flatMap((result) => (result.status === "fulfilled" ? [result.value.data.article] : []));
        setArticles(next);
      })
      .finally(() => {
        if (active) setArticlesLoading(false);
      });

    return () => {
      active = false;
    };
  }, [recommendedArticleIdsKey]);

  if (loading && !personalization) {
    return (
      <div className="relative isolate min-h-[70vh]">
        <HomeBackground template="Starry" />
        <div className="relative z-10">
          <Loader />
        </div>
      </div>
    );
  }

  if (!personalization) {
    return (
      <div className="relative isolate min-h-[70vh]">
        <HomeBackground template="Starry" />
        <div className="relative z-10">
          <EmptyState
            code="HOME"
            title="暂无可展示的个性化内容"
            description={error || "登录后配置个人首页，或通过个性化访问链接进入。"}
            action={
              <Link
                to="/login"
                className="inline-flex min-h-11 items-center justify-center bg-accent px-7 text-sm font-black uppercase tracking-[0.18em] text-ink transition-[filter] hover:brightness-90"
              >
                去登录
              </Link>
            }
          />
        </div>
      </div>
    );
  }

  const albumItems = albumPhotos.map((photo, index) => ({
    image: photo.imageUrl!,
    label: photo.description || `相片 ${String(index + 1).padStart(2, "0")}`,
    alt: photo.description || album?.name || "生活相册相片",
  }));

  const laserPosition = laserProgress * 100;

  const displayName = personalization.user?.nickname || personalization.user?.username || "个人档案";
  const albumReveal = Math.min(1, Math.max(0, (welcomeSplit - 0.28) / 0.72));

  return (
    <div className="relative isolate space-y-24 pb-12">
      <HomeBackground template={personalization.homeBackgroundTemplate} />

      <div className="relative z-10 space-y-24">
        <section id="welcome" className="relative h-[190vh]">
          <div className="sticky top-20 h-[calc(100dvh-7rem)] overflow-hidden border border-hairline [clip-path:polygon(0_0,100%_0,100%_calc(100%-32px),calc(100%-32px)_100%,0_100%)]">
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                clipPath: SPLIT_LEFT_CLIP,
                transform: `translate3d(-${welcomeSplit * 72}%, ${welcomeSplit * 2}%, 0) rotate(${-welcomeSplit * 2}deg) scale(${1 + welcomeSplit * 0.03})`,
                opacity: 1 - welcomeSplit,
                filter: `blur(${welcomeSplit * 2.5}px)`,
                pointerEvents: welcomeSplit > 0.05 ? "none" : "auto",
                willChange: "transform, opacity, filter",
              }}
            >
              <WelcomeHeroContent displayName={displayName} archiveId={String(personalization.id).padStart(3, "0")} />
            </div>
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                clipPath: SPLIT_RIGHT_CLIP,
                transform: `translate3d(${welcomeSplit * 72}%, ${-welcomeSplit * 2}%, 0) rotate(${welcomeSplit * 2}deg) scale(${1 + welcomeSplit * 0.03})`,
                opacity: 1 - welcomeSplit,
                filter: `blur(${welcomeSplit * 2.5}px)`,
                pointerEvents: "none",
                willChange: "transform, opacity, filter",
              }}
            >
              <WelcomeHeroContent displayName={displayName} archiveId={String(personalization.id).padStart(3, "0")} />
            </div>
            <div className="sr-only">
              <h1>Be Curious! Create! And Cool!</h1>
              <p>欢迎来到「{displayName}」的数字档案。这里收录生活片段、个人近况与近期文章。</p>
              <a href="#contact">Contact</a>
            </div>

            {albumReveal > 0.02 && (
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 z-10 bg-[linear-gradient(135deg,rgba(24,24,24,0.42),rgba(5,5,5,0.18))]"
                style={{
                  opacity: albumReveal,
                  backdropFilter: `blur(${albumReveal * 18}px) saturate(${1 + albumReveal * 0.35})`,
                  WebkitBackdropFilter: `blur(${albumReveal * 18}px) saturate(${1 + albumReveal * 0.35})`,
                }}
              />
            )}
            {albumReveal > 0.02 && (
              <div
                className="absolute inset-0 z-20 flex items-center justify-center p-4 sm:p-6"
                style={{
                  opacity: albumReveal,
                  transform: `translate3d(0, ${(1 - albumReveal) * 16}%, 0) scale(${0.94 + albumReveal * 0.06})`,
                  filter: `blur(${(1 - albumReveal) * 6}px)`,
                  pointerEvents: albumReveal > 0.88 ? "auto" : "none",
                  willChange: "transform, opacity, filter",
                }}
              >
                <div className="h-full max-h-full w-full">
                  {albumLoading ? (
                    <Loader />
                  ) : album && albumItems.length > 0 ? (
                    <AccordionGallery
                      items={albumItems}
                      defaultIndex={0}
                      accentColor="#d9ff00"
                      overlayColor="#050505"
                      textColor="#f5f5f5"
                      fill
                      radius={16}
                      grayscale
                      className="h-full max-h-full"
                    />
                  ) : (
                    <EmptyState code="ALBUM" title="生活相册暂无相片" description={albumError || "当前 lifeAlbumId 尚未配置可用图片。"} className="min-h-0!" />
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
        <section id="contact" ref={contactSectionRef} className="relative grid scroll-mt-20 lg:grid-cols-2">
          <div
            className="relative border border-hairline bg-accent p-6 text-ink sm:p-10 lg:border-r-0 lg:p-14"
            style={{
              transform:
                contactPhase === "joined"
                  ? "translate3d(0, 0, 0) rotate(0deg)"
                  : contactPhase === "leaving"
                    ? "translate3d(-82%, 125%, 0) rotate(-8deg)"
                    : "translate3d(-115%, 0, 0) rotate(-3deg)",
              opacity: contactPhase === "joined" ? 1 : contactPhase === "leaving" ? 0 : 0,
              transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease",
              willChange: "transform, opacity",
            }}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.42em] text-ink/70">Contact / 联系方式</span>
            <h2 className="mt-5 text-[clamp(3rem,6vw,5.8rem)] font-black uppercase leading-[0.86] tracking-[-0.055em]">Get in touch :)</h2>
            <p className="mt-7 max-w-xl whitespace-pre-line text-base font-bold leading-relaxed text-ink/80">{personalization.introduction || "暂未填写个人介绍。"}</p>

            {personalization.contactEmail ? (
              <button
                type="button"
                onClick={() => void copyEmail()}
                aria-label={`复制邮箱 ${personalization.contactEmail}`}
                style={{ color: "#ffffff" }}
                className="mt-10 inline-flex min-h-12 max-w-full cursor-pointer items-center gap-3 rounded-full border-2 border-ink bg-ink px-6 text-sm font-black tracking-wide text-white transition-colors hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 focus-visible:ring-offset-accent"
              >
                <MailOutlined aria-hidden="true" />
                <span className="truncate">{emailCopied ? "邮箱已复制" : personalization.contactEmail}</span>
              </button>
            ) : (
              <p className="mt-10 text-sm font-bold uppercase tracking-[0.18em] text-ink/70">暂未提供联系邮箱。</p>
            )}
          </div>

          <div
            className="relative min-h-[420px] border border-hairline bg-primary p-6 sm:p-10 lg:border-l-0 lg:p-14"
            style={{
              transform:
                contactPhase === "joined"
                  ? "translate3d(0, 0, 0) rotate(0deg)"
                  : contactPhase === "leaving"
                    ? "translate3d(82%, 125%, 0) rotate(8deg)"
                    : "translate3d(115%, 0, 0) rotate(3deg)",
              opacity: contactPhase === "joined" ? 1 : contactPhase === "leaving" ? 0 : 0,
              transition: "transform 900ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease",
              willChange: "transform, opacity",
            }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 opacity-[0.05]"
              style={{
                backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
                backgroundSize: "34px 34px",
              }}
            />
            <div className="relative flex h-full flex-col justify-between">
              <div className="inline-flex h-28 w-36 items-center justify-center border-2 border-text-primary/80">
                <MailOutlined aria-hidden="true" className="text-5xl text-accent" />
              </div>
              <div className="mt-16 border-t border-hairline pt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">Open Channel</p>
                <p className="mt-3 max-w-sm text-sm leading-relaxed text-text-secondary">合作、交流或只是想打个招呼，都可以通过邮箱联系。</p>
              </div>
              <span aria-hidden="true" className="absolute bottom-0 right-0 text-[clamp(5rem,13vw,10rem)] font-black leading-none tracking-[-0.09em] text-white/[0.025]">
                MAIL
              </span>
            </div>
          </div>
        </section>

        <section
          ref={portraitSectionRef}
          className="relative overflow-hidden border border-hairline bg-primary/65 [clip-path:polygon(0_0,100%_0,100%_calc(100%-32px),calc(100%-32px)_100%,0_100%)]"
        >
          <div className="grid min-h-[620px] lg:grid-cols-[minmax(220px,0.34fr)_minmax(0,1fr)]">
            <div className="relative flex flex-col justify-between border-b border-hairline p-6 sm:p-9 lg:border-b-0 lg:border-r">
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.42em] text-accent">Portrait</span>
                <h2 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.04em] text-text-primary sm:text-5xl">个人人像</h2>
                <p className="mt-5 max-w-xs text-sm leading-relaxed text-text-secondary">向下滚动，镭射扫描线会掠过人像；线上为镭射滤镜，线下保持原色。</p>
              </div>
              <div>
                <div className="mb-3 h-1.5 w-full bg-hairline">
                  <div className="h-full bg-accent transition-[width] duration-150" style={{ width: `${laserProgress * 100}%` }} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.34em] text-text-secondary">
                  Laser Scan {String(Math.round(laserProgress * 100)).padStart(3, "0")}%
                </span>
              </div>
            </div>

            <div className="relative flex items-center justify-center p-4 sm:p-8 lg:p-12">
              <figure className="relative aspect-[16/9] w-full max-w-5xl overflow-hidden border border-hairline bg-surface-soft">
                {personalization.portraitUrl ? (
                  <>
                    <img src={personalization.portraitUrl} alt={`${displayName}的人像`} className="h-full w-full object-cover" />

                    <div className="pointer-events-none absolute inset-0 overflow-hidden" style={{ clipPath: `inset(0 0 ${100 - laserPosition}% 0)` }}>
                      <img
                        src={personalization.portraitUrl}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover"
                        style={{ filter: "hue-rotate(36deg) saturate(1.65) contrast(1.14) brightness(1.06)" }}
                      />
                      <div className="absolute inset-0 bg-accent/12 mix-blend-screen" />
                      <div
                        className="absolute inset-0 opacity-25 mix-blend-screen"
                        style={{ backgroundImage: "repeating-linear-gradient(0deg, rgba(217,255,0,0.32) 0 1px, transparent 1px 5px)" }}
                      />
                    </div>

                    <div className="pointer-events-none absolute left-0 right-0 h-0.5 bg-accent shadow-[0_0_18px_rgba(217,255,0,0.95)]" style={{ top: `${laserPosition}%` }} />
                    <div
                      className="pointer-events-none absolute left-0 right-0 h-16 -translate-y-1/2 bg-linear-to-b from-transparent via-accent/20 to-transparent mix-blend-screen"
                      style={{ top: `${laserPosition}%` }}
                    />
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-linear-to-br from-[#d8d8d8] via-[#8a8a8a] to-[#3a3a3a]">
                    <UserOutlined aria-hidden="true" className="text-[7rem] text-white/45" />
                  </div>
                )}
                <span aria-hidden="true" className="absolute left-4 top-4 text-xl font-black text-white">
                  <CloseOutlined />
                </span>
                <span aria-hidden="true" className="absolute right-4 top-4 text-xl font-black text-white">
                  <CloseOutlined />
                </span>
                <span aria-hidden="true" className="absolute bottom-4 left-4 text-xl font-black text-white">
                  <PlusOutlined />
                </span>
                <span aria-hidden="true" className="absolute bottom-4 right-4 text-xl font-black text-white">
                  <PlusOutlined />
                </span>
                <span aria-hidden="true" className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-[0.42em] text-white/85">
                  Portrait / Archive
                </span>
              </figure>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.42em] text-accent">Journal</span>
              <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.04em] text-text-primary sm:text-5xl">文章列表</h2>
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-text-secondary">由 recommendedArticleIds 指定的近期文章。</p>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{String(articles.length).padStart(2, "0")} Entries</span>
          </div>

          {articlesLoading ? (
            <Loader />
          ) : articles.length > 0 ? (
            <ol className="space-y-3">
              {articles.map((article, index) => {
                return (
                  <li key={article.id}>
                      <Link
                        to={`/posts/${article.id}`}
                        target={ARTICLE_WINDOW_NAME}
                        rel="noopener noreferrer"
                        onClick={openArticleInWindow}
                        style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "#f5f5f5" }}
                        className="group grid min-h-36 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-5 overflow-hidden border border-white/12 bg-white/[0.06] px-5 py-6 text-text-primary backdrop-blur-xl backdrop-saturate-150 transition-[background-color,border-color] hover:border-accent/70 hover:bg-white/[0.1] sm:px-7"
                      >
                        <span className="text-[clamp(3rem,7vw,6.5rem)] font-black leading-none tracking-[-0.07em] text-accent">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="min-w-0">
                          <strong className="block truncate text-xl font-black uppercase tracking-tight sm:text-3xl">{article.title}</strong>
                          <small className="mt-3 block text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">
                            Article / {String(article.id).padStart(3, "0")}
                          </small>
                        </span>
                        <span className="flex items-center gap-4">
                          <time className="hidden text-xs font-bold text-text-secondary sm:block">{article.createdAt || "—"}</time>
                          <ArrowRightOutlined aria-hidden="true" className="text-lg transition-transform group-hover:translate-x-1" />
                        </span>
                      </Link>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState code="ARTICLE" title="暂无推荐文章" description="当前没有可访问的 recommendedArticleIds。" className="min-h-0!" />
          )}
        </section>
      </div>
    </div>
  );
}
