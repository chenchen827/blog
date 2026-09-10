import { useEffect, useState } from 'react'

import type { Article } from '../types'
import { listArticles } from '../apis/article'
import ArticleCard from '../components/ArticleCard'
import SectionHeader from '../components/SectionHeader'
import Loader from '../components/Loader'
import { EmptyState } from '@repo/shared'

export default function ArticleList() {
  const [articles, setArticles] = useState<Article[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    listArticles({ pageSize: 50, currentPage: 1 })
      .then((res) => {
        if (!active) return
        setArticles(res.data.articles ?? [])
        setTotal(res.data.pagination?.total ?? 0)
      })
      .catch(() => {
        if (active) {
          setArticles([])
          setTotal(0)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  return (
    <div className="space-y-8">
      <SectionHeader code="JOURNAL" title="全部文章" desc={`共 ${total} 篇文章，点击进入阅读。`} />

      {loading ? (
        <Loader />
      ) : articles.length === 0 ? (
        <EmptyState code="ARTICLE" title="暂无文章" description="还没有发布任何文章。" />
      ) : (
        <div className="space-y-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  )
}
