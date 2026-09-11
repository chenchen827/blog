import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { App } from "antd";

import type { Chapter, Course, User } from "../types";
import { getCourse, toggleLike } from "../apis/course";
import { getChapter } from "../apis/chapter";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";

export default function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = App.useApp();
  const [course, setCourse] = useState<Course | null>(null);
  const [author, setAuthor] = useState<User | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [chapterBody, setChapterBody] = useState<string>("");
  const [needLogin, setNeedLogin] = useState(false);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getCourse(id)
      .then((res) => {
        if (!active) return;
        setCourse(res.data.course);
        setAuthor(res.data.user ?? null);
        setChapters(res.data.chapters ?? []);
      })
      .catch(() => {
        if (active) setCourse(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  const handleExpand = async (chapter: Chapter) => {
    if (expanded === chapter.id) {
      setExpanded(null);
      return;
    }
    setExpanded(chapter.id);
    setChapterBody("");
    if (!user) {
      setNeedLogin(true);
      return;
    }
    try {
      const res = await getChapter(chapter.id);
      setChapterBody(res.data.chapter.content ?? "暂无内容");
    } catch {
      setChapterBody("该章节内容需要登录后查看,或暂时不可用。");
    }
  };

  const handleLike = async () => {
    if (!user) {
      message.info("请先登录后再收藏课程");
      navigate("/login");
      return;
    }
    if (!course) return;
    setLiking(true);
    try {
      await toggleLike(course.id);
      message.success("已更新收藏状态");
      setCourse((prev) => (prev ? { ...prev, likesCount: (prev.likesCount ?? 0) + 1 } : prev));
    } catch (err) {
      message.error(err instanceof Error ? err.message : "操作失败");
    } finally {
      setLiking(false);
    }
  };

  if (loading) return <Loader />;

  if (!course) {
    return (
      <div className="space-y-6">
        <Link to="/knowledge" className="text-sm text-text-secondary transition-colors hover:text-text-primary">
          ← 返回知识库
        </Link>
        <p className="text-base text-text-secondary">未找到该课程。</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <Link to="/knowledge" className="inline-block text-sm text-text-secondary transition-colors hover:text-text-primary">
        ← 返回知识库
      </Link>

      <section className="relative overflow-hidden rounded-none border border-hairline bg-primary/70 p-6 md:p-10">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "30px 30px",
          }}
        />
        <div className="relative">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">{course.category?.name ?? "未分类"}</span>
          <h1 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[-0.02em] text-text-primary md:text-5xl">{course.name}</h1>
          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-text-secondary">
            {author && <span>作者：{author.nickname || author.username}</span>}
            <span>赞 {course.likesCount ?? 0}</span>
            <span>章节 {course.chaptersCount ?? 0}</span>
            <span className="rounded-none border border-accent/40 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">{course.free ? "免费" : "VIP"}</span>
          </div>
          {course.content && <p className="mt-6 max-w-3xl whitespace-pre-wrap text-base leading-relaxed text-text-secondary">{course.content}</p>}
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleLike}
              disabled={liking}
              className="inline-flex items-center justify-center rounded-none bg-accent px-8 py-3.5 text-sm font-black uppercase tracking-wide text-ink transition-[filter] hover:brightness-90 disabled:opacity-50"
            >
              {user ? "收藏 / 取消收藏" : "登录后收藏"}
            </button>
          </div>
        </div>
      </section>

      <section className="space-y-5">
        <h2 className="text-xl font-black uppercase tracking-wider text-text-primary">章节 {chapters.length > 0 ? `(${chapters.length})` : ""}</h2>
        {chapters.length === 0 ? (
          <p className="text-sm text-text-secondary">该课程暂无章节。</p>
        ) : (
          <div className="space-y-2">
            {chapters.map((chapter) => (
              <div key={chapter.id} className="rounded-none border border-hairline bg-primary/70">
                <button
                  type="button"
                  onClick={() => handleExpand(chapter)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors hover:bg-surface-soft"
                >
                  <span className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{String(chapter.rank).padStart(2, "0")}</span>
                    <span className="font-black uppercase tracking-wide text-text-primary">{chapter.title}</span>
                  </span>
                  <span className="text-xs text-accent">{expanded === chapter.id ? "−" : "+"}</span>
                </button>
                {expanded === chapter.id && (
                  <div className="border-t border-hairline px-5 py-4">
                    {needLogin ? (
                      <p className="text-sm text-text-secondary">
                        章节内容需要登录后查看。
                        <Link to="/login" className="text-accent hover:underline">
                          去登录
                        </Link>
                      </p>
                    ) : chapterBody ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed text-text-secondary">{chapterBody}</div>
                    ) : (
                      <p className="text-sm text-text-secondary">加载中…</p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
