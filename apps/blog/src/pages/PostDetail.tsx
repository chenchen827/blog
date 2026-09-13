import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";

import type { Article } from "../types";
import { getArticle } from "../apis/article";
import Loader from "../components/Loader";

export default function PostDetail() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getArticle(id)
      .then((res) => {
        if (active) setArticle(res.data.article);
      })
      .catch(() => {
        if (active) setArticle(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <Loader />;

  if (!article) {
    return (
      <div className="space-y-6">
        <p className="text-base text-text-secondary">未找到该文章。</p>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl space-y-8">
      <header className="space-y-3">
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Article · {String(article.id).padStart(3, "0")}</span>
        <h1 className="text-3xl font-black uppercase leading-tight tracking-[-0.01em] text-text-primary md:text-4xl">{article.title}</h1>
        <p className="text-sm text-text-secondary">{article.createdAt ?? ""}</p>
      </header>

      <div
        className="article-content space-y-4 text-base leading-relaxed text-text-secondary [&_img]:max-w-full [&_img]:rounded-none [&_img]:border [&_img]:border-hairline"
        dangerouslySetInnerHTML={{ __html: article.content ?? "" }}
      />
    </article>
  );
}
