import { useEffect, useMemo, useRef, useState } from "react";
import type { EChartsCoreOption } from "echarts/core";
import { Alert, Button, Spin } from "antd";
import { Link } from "react-router";
import { EmptyState } from "@repo/shared";

import EChart from "../../components/EChart";
import { getCourseLikesStats, getMonthlyPosts, getSexStats } from "../../apis/charts";
import type { CourseLikesStats, MonthlyPost, SexStat } from "../../apis/charts";
import "./home.css";

const EMPTY_STATS: CourseLikesStats = { total: 0, courses: [], monthly: [] };

const MARQUEE_ITEMS = ["ZONE 05", "SYSTEM ARCHIVE", "KNOWLEDGE BASE", "CONTROL DECK", "DATA PROCESSING", "SIGNAL ONLINE", "MEMBERSHIP GRID", "MAINTENANCE BAY"];

const MODULES = [
  { to: "/articles/list", label: "文章管理", code: "ATCL" },
  { to: "/users/list", label: "用户管理", code: "USER" },
  { to: "/memberships/list", label: "会员商品", code: "SHOP" },
  { to: "/courses/list", label: "课程管理", code: "COURSE" },
  { to: "/albums/list", label: "相集管理", code: "ALBUM" },
  { to: "/settings", label: "系统设置", code: "SYST" },
];

export default function HomePage() {
  const [posts, setPosts] = useState<MonthlyPost[]>([]);
  const [sexStats, setSexStats] = useState<SexStat[]>([]);
  const [likes, setLikes] = useState<CourseLikesStats>(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    Promise.all([getMonthlyPosts(), getSexStats(), getCourseLikesStats()])
      .then(([postRes, sexRes, likesRes]) => {
        if (!active) return;
        setPosts(postRes.data.posts ?? []);
        setSexStats(sexRes.data.data ?? []);
        setLikes(likesRes.data ?? EMPTY_STATS);
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : "加载数据失败";
        if (active) setError(msg);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    const elements = document.querySelectorAll(".reveal, .reveal-left, .reveal-right");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading, posts, sexStats, likes]);

  const totalPosts = useMemo(() => posts.reduce((sum, item) => sum + item.count, 0), [posts]);
  const totalUsers = useMemo(() => sexStats.reduce((sum, item) => sum + item.value, 0), [sexStats]);

  const metrics = [
    { label: "文章发布", value: totalPosts, suffix: "篇", tone: "#d9ff00" },
    { label: "用户总数", value: totalUsers, suffix: "人", tone: "#81cbf1" },
    { label: "课程总点赞", value: likes.total, suffix: "赞", tone: "#f075a6" },
    { label: "点赞课程", value: likes.courses.length, suffix: "个", tone: "#e8ff00" },
  ];

  const lineOption = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: "transparent",
      color: ["#d9ff00"],
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0a0a0a",
        borderColor: "#292929",
        textStyle: { color: "#f5f5f5" },
      },
      grid: { left: 48, right: 24, top: 32, bottom: 40 },
      xAxis: {
        type: "category",
        data: posts.map((item) => item.month),
        axisLine: { lineStyle: { color: "#292929" } },
        axisLabel: { color: "#8a8a8a" },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: "#292929" } },
        axisLabel: { color: "#8a8a8a" },
      },
      series: [
        {
          name: "发布文章",
          type: "line",
          smooth: true,
          symbol: "circle",
          data: posts.map((item) => item.count),
          lineStyle: { width: 3, color: "#d9ff00" },
          itemStyle: { color: "#d9ff00" },
          areaStyle: { color: "#d9ff00", opacity: 0.15 },
        },
      ],
    }),
    [posts],
  );

  const pieOption = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: "transparent",
      color: ["#d9ff00", "#f075a6", "#81cbf1"],
      tooltip: {
        trigger: "item",
        backgroundColor: "#0a0a0a",
        borderColor: "#292929",
        textStyle: { color: "#f5f5f5" },
      },
      legend: { bottom: 0, textStyle: { color: "#f5f5f5" }, inactiveColor: "#8a8a8a" },
      series: [
        {
          name: "用户性别",
          type: "pie",
          radius: ["46%", "68%"],
          center: ["50%", "45%"],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: "#0a0a0a", borderWidth: 2 },
          label: { color: "#f5f5f5" },
          data: sexStats,
        },
      ],
    }),
    [sexStats],
  );

  const likesOption = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: "transparent",
      color: ["#e8ff00"],
      tooltip: {
        trigger: "axis",
        backgroundColor: "#0a0a0a",
        borderColor: "#292929",
        textStyle: { color: "#f5f5f5" },
      },
      grid: { left: 48, right: 24, top: 32, bottom: 40 },
      xAxis: {
        type: "category",
        data: likes.monthly.map((item) => item.month),
        axisLine: { lineStyle: { color: "#292929" } },
        axisLabel: { color: "#8a8a8a" },
      },
      yAxis: {
        type: "value",
        minInterval: 1,
        splitLine: { lineStyle: { color: "#292929" } },
        axisLabel: { color: "#8a8a8a" },
      },
      series: [
        {
          name: "新增点赞",
          type: "line",
          smooth: true,
          symbol: "circle",
          data: likes.monthly.map((item) => item.count),
          lineStyle: { width: 3, color: "#e8ff00" },
          itemStyle: { color: "#e8ff00" },
          areaStyle: { color: "#e8ff00", opacity: 0.12 },
        },
      ],
    }),
    [likes.monthly],
  );

  const scrollTrack = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 260, behavior: "smooth" });
  };

  return (
    <section className="home-page relative space-y-8">
      <div className="home-grid" aria-hidden="true" />
      <div className="home-scanline" aria-hidden="true" />

      {/* Hero */}
      <div className="relative overflow-hidden border border-hairline bg-primary/50 [clip-path:polygon(0_0,100%_0,100%_calc(100%-22px),calc(100%-22px)_100%,0_100%)] p-6 sm:p-9">
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.4em] text-accent">System Archive · 2026</p>
            <h1 className="mt-4 text-[42px] font-black uppercase leading-none tracking-[-0.03em] text-text-primary sm:text-[64px]">
              Control
              <br />
              Deck
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-text-secondary">数据看板已接入核心业务信号，实时追踪内容、用户与课程热度。</p>
          </div>
          <div className="flex h-20 w-20 items-center justify-center border border-accent/40 bg-accent/10 text-3xl font-black text-accent">∅</div>
        </div>
      </div>

      {/* 自动滑动信号条 */}
      <div className="overflow-hidden border-y border-hairline bg-canvas/60 py-3">
        <div className="marquee-track">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, index) => (
            <span key={`${item}-${index}`} className="flex shrink-0 items-center gap-3 px-5 text-xs font-black uppercase tracking-[0.35em] text-text-secondary">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {/* 核心指标，滑入视口 */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric, index) => (
          <div
            key={metric.label}
            className={`${index % 2 === 0 ? "reveal-left" : "reveal-right"} rounded-none border border-hairline bg-primary/80 p-5`}
            style={{ transitionDelay: `${index * 80}ms` }}
          >
            <p className="text-xs font-black uppercase tracking-[0.3em] text-text-secondary">{metric.label}</p>
            <div className="mt-3 flex items-end gap-1">
              <span className="text-4xl font-black leading-none text-text-primary" style={{ color: metric.tone }}>
                {loading ? "—" : metric.value}
              </span>
              <span className="pb-1 text-sm font-bold text-text-secondary">{metric.suffix}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="reveal rounded-none border border-hairline bg-primary/90 p-5 lg:col-span-2">
          <h2 className="text-base font-black uppercase tracking-wider text-text-primary">文章发布曲线</h2>
          <p className="mt-1 text-xs text-text-secondary">按月份统计发布的文章数量</p>
          <div className="mt-4">
            {loading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Spin />
              </div>
            ) : posts.length === 0 ? (
              <EmptyState code="POST" title="暂无文章发布数据" description="发布文章后即可看到趋势曲线。" />
            ) : (
              <EChart option={lineOption} height={320} />
            )}
          </div>
        </div>

        <div className="reveal-right rounded-none border border-hairline bg-primary/90 p-5">
          <h2 className="text-base font-black uppercase tracking-wider text-text-primary">用户性别分布</h2>
          <p className="mt-1 text-xs text-text-secondary">男 / 女 / 未选择的用户占比</p>
          <div className="mt-4">
            {loading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Spin />
              </div>
            ) : sexStats.length === 0 ? (
              <EmptyState code="SEX" title="暂无用户数据" description="用户注册后即可看到性别分布。" />
            ) : (
              <EChart option={pieOption} height={320} />
            )}
          </div>
        </div>
      </div>

      <div className="reveal rounded-none border border-hairline bg-primary/90 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-text-primary">课程点赞趋势</h2>
            <p className="mt-1 text-xs text-text-secondary">当前用户课程的每月新增点赞趋势</p>
          </div>
          {likes.total > 0 && <span className="rounded-none border border-accent/40 bg-accent/10 px-3 py-1 text-sm font-black text-accent">总点赞 {likes.total}</span>}
        </div>
        <div className="mt-4">
          {loading ? (
            <div className="flex h-70 items-center justify-center">
              <Spin />
            </div>
          ) : likes.monthly.length === 0 ? (
            <EmptyState code="LIKE" title="暂无点赞数据" description="课程收到点赞后即可看到趋势。" />
          ) : (
            <EChart option={likesOption} height={280} />
          )}
        </div>
      </div>

      {/* 快速入口：横向滑动模块 */}
      <div className="reveal">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider text-text-primary">快速入口</h2>
            <p className="mt-1 text-xs text-text-secondary">横向滑动浏览，点击进入管理模块</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => scrollTrack(-1)}>←</Button>
            <Button onClick={() => scrollTrack(1)}>→</Button>
          </div>
        </div>
        <div ref={trackRef} className="snap-track mt-4">
          {MODULES.map((module) => (
            <Link key={module.code} to={module.to} className="module-card block min-h-32 border border-hairline bg-primary p-4">
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">{module.code}</p>
              <p className="mt-6 text-lg font-black uppercase tracking-wide text-text-primary">{module.label}</p>
              <p className="mt-1 text-xs text-text-secondary">跳转管理</p>
            </Link>
          ))}
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}
    </section>
  );
}
