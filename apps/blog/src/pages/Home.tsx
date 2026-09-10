import { useEffect, useState } from 'react'
import { Link } from 'react-router'

import type { Article, Course } from '../types'
import { getHome } from '../apis/home'
import { listArticles } from '../apis/article'
import { getSetting } from '../apis/settings'
import CourseCard from '../components/CourseCard'
import ArticleCard from '../components/ArticleCard'
import SectionHeader from '../components/SectionHeader'
import Loader from '../components/Loader'
import { useAuth } from '../auth/AuthContext'

export default function Home() {
  const { user } = useAuth()
  const [recommended, setRecommended] = useState<Course[]>([])
  const [introductory, setIntroductory] = useState<Course[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [siteName, setSiteName] = useState('My Blog')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([getHome(), listArticles({ pageSize: 6 }), getSetting()])
      .then(([home, articleRes, settingRes]) => {
        if (!active) return
        setRecommended(home.data.recommendedCourses ?? [])
        setIntroductory(home.data.introductoryCourses ?? [])
        setArticles(articleRes.data.articles ?? [])
        setSiteName(settingRes.data.setting?.name || 'My Blog')
      })
      .catch(() => {
        if (active) {
          setRecommended([])
          setIntroductory([])
          setArticles([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const featured = [...new Map([...introductory, ...recommended].map((c) => [c.id, c])).values()].slice(0, 6)

  return (
    <div className="space-y-16">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-none border border-hairline bg-primary/60 px-6 py-14 md:px-10 md:py-20">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '34px 34px' }} />
        <div className="relative max-w-3xl">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">System Archive</span>
          <h1 className="mt-4 text-4xl font-black uppercase leading-[0.95] tracking-[-0.02em] text-text-primary md:text-6xl">
            {siteName}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-text-secondary md:text-lg">
            {user ? `欢迎回来，${user.nickname || user.username}。` : '欢迎来到我的数字档案。探索知识库、相册集与作品集。'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {!user && (
              <>
                <Link to="/login" className="inline-flex items-center justify-center rounded-none bg-accent px-9 py-4 text-sm font-black uppercase tracking-wide text-ink transition-[filter] hover:brightness-90">
                  登录
                </Link>
                <Link to="/register" className="inline-flex items-center justify-center rounded-none bg-surface-soft px-9 py-4 text-sm font-black uppercase tracking-wide text-text-primary transition-colors hover:bg-surface">
                  注册
                </Link>
              </>
            )}
            <Link to="/knowledge" className="inline-flex items-center justify-center rounded-none bg-surface-soft px-9 py-4 text-sm font-black uppercase tracking-wide text-text-primary transition-colors hover:bg-surface">
              进入知识库
            </Link>
          </div>
        </div>
      </section>

      {loading ? (
        <Loader />
      ) : (
        <>
          {/* 推荐课程 */}
          {recommended.length > 0 && (
            <section className="space-y-6">
              <SectionHeader code="RECOMMENDED" title="推荐内容" desc="系统精选，带你快速了解站内优质课程。" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {recommended.slice(0, 6).map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          )}

          {/* 主打 / 入门 */}
          {featured.length > 0 && (
            <section className="space-y-6">
              <SectionHeader code="FEATURED" title="主打作品" desc="创作者主推的入门与旗舰内容。" />
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {featured.map((course) => (
                  <CourseCard key={course.id} course={course} basePath="/knowledge" />
                ))}
              </div>
            </section>
          )}

          {/* 最近文章 */}
          {articles.length > 0 && (
            <section className="space-y-6">
              <SectionHeader code="JOURNAL" title="最新文章" desc="来自档案的近期文章。" action={<Link to="/posts" className="text-sm font-black uppercase tracking-wider text-accent hover:underline">查看全部 →</Link>} />
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}

