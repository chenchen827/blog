import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router'

import type { Article, Category, Chapter, Course } from '../types'
import { search } from '../apis/search'
import { searchCourses } from '../apis/course'
import { listCategories } from '../apis/category'
import CourseCard from '../components/CourseCard'
import ArticleCard from '../components/ArticleCard'
import SectionHeader from '../components/SectionHeader'
import Loader from '../components/Loader'
import { EmptyState } from '@repo/shared'

function enrichCourses(courses: Course[], categories: Category[]): Course[] {
  const map = new Map(categories.map((c) => [c.id, c]))
  return courses.map((course) => {
    if (course.category) return course
    const cat = course.categoryId != null ? map.get(course.categoryId) : undefined
    return cat ? { ...course, category: { id: cat.id, name: cat.name } } : course
  })
}

export default function Search() {
  const [params] = useSearchParams()
  const q = params.get('q') ?? ''
  const [courses, setCourses] = useState<Course[]>([])
  const [articles, setArticles] = useState<Article[]>([])
  const [chapters, setChapters] = useState<Chapter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!q) {
      setCourses([])
      setArticles([])
      setChapters([])
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    const fetchData = async () => {
      const [courseRes, wildRes] = await Promise.allSettled([
        searchCourses({ name: q, currentPage: 1, pageSize: 50 }),
        search(q),
      ])
      if (!active) return
      const categories = courseRes.status === 'fulfilled' ? await listCategories().then((r) => r.data.categories ?? []).catch(() => []) : []
      if (courseRes.status === 'fulfilled') setCourses(enrichCourses(courseRes.value.data.courses ?? [], categories))
      else setCourses([])
      if (wildRes.status === 'fulfilled') {
        setArticles(wildRes.value.data.articles ?? [])
        setChapters(wildRes.value.data.chapters ?? [])
      } else {
        setArticles([])
        setChapters([])
      }
    }
    fetchData()
      .catch(() => {
        if (active) {
          setCourses([])
          setArticles([])
          setChapters([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [q])

  const empty = !loading && !q
  const noResults = !loading && q && courses.length === 0 && articles.length === 0 && chapters.length === 0

  return (
    <div className="space-y-10">
      <SectionHeader code="SEARCH" title={`搜索“${q || ''}”`} desc="跨文章、课程与章节检索。" />

      {loading ? (
        <Loader />
      ) : empty ? (
        <EmptyState code="SEARCH" title="输入关键词" description="在顶部搜索框输入关键词开始搜索。" />
      ) : noResults ? (
        <EmptyState code="SEARCH" title="无结果" description={`没有找到与“${q}”相关的内容。`} />
      ) : (
        <>
          {courses.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-lg font-black uppercase tracking-wider text-text-primary">课程（{courses.length}）</h2>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))}
              </div>
            </section>
          )}

          {articles.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-lg font-black uppercase tracking-wider text-text-primary">文章（{articles.length}）</h2>
              <div className="space-y-3">
                {articles.map((article) => (
                  <ArticleCard key={article.id} article={article} />
                ))}
              </div>
            </section>
          )}

          {chapters.length > 0 && (
            <section className="space-y-5">
              <h2 className="text-lg font-black uppercase tracking-wider text-text-primary">章节（{chapters.length}）</h2>
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <Link
                    key={chapter.id}
                    to={`/knowledge/${chapter.courseId}`}
                    className="flex items-center justify-between gap-4 rounded-none border border-hairline bg-primary/70 px-5 py-3 transition-colors hover:border-accent/60"
                  >
                    <span className="font-bold uppercase tracking-tight text-text-primary">{chapter.title}</span>
                    <span className="text-xs text-text-secondary">课程 #{chapter.courseId}</span>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
