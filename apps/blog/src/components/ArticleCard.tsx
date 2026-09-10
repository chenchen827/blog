import { Link } from 'react-router'

import type { Article } from '../types'

const DIAGONAL = '[clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]'

interface ArticleCardProps {
  article: Article
  basePath?: string
}

/** 文章卡片：编号 + 标题 + 日期 */
export default function ArticleCard({ article, basePath = '/posts' }: ArticleCardProps) {
  return (
    <Link
      to={`${basePath}/${article.id}`}
      className={`group flex items-center justify-between gap-4 rounded-none border border-hairline bg-primary/80 px-5 py-4 transition-colors hover:border-accent/60 ${DIAGONAL}`}
    >
      <div className="min-w-0">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">Doc · {String(article.id).padStart(3, '0')}</span>
        <h3 className="mt-1 truncate text-base font-black uppercase tracking-tight text-text-primary transition-colors group-hover:text-accent">
          {article.title}
        </h3>
      </div>
      <span className="shrink-0 text-xs font-bold uppercase tracking-wider text-text-secondary">{article.createdAt ?? ''}</span>
    </Link>
  )
}
