import { Link } from "react-router";

import type { Article } from "../types";

interface ArticleCardProps {
  article: Article;
  basePath?: string;
}

/** 文章卡片：编号 + 标题 + 日期 */
export default function ArticleCard({ article, basePath = "/posts" }: ArticleCardProps) {
  return (
    <Link
      to={`${basePath}/${article.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center justify-between gap-4 rounded-lg border border-hairline px-5 py-4 backdrop-blur-xl transition-colors hover:border-accent/60 hover:bg-primary/40!`}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Doc · {String(article.id).padStart(3, "0")}</span>
        <h3 className="mt-1 truncate text-base font-black uppercase tracking-tight text-text-primary transition-colors group-hover:text-accent">{article.title}</h3>
      </div>
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-text-secondary">{article.createdAt ?? ""}</span>
    </Link>
  );
}
