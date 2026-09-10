import { useCallback, useEffect, useState } from 'react'
import type { FormEvent } from 'react'

import type { Category, Course } from '../types'
import { listCategories } from '../apis/category'
import { listCourses, searchCourses } from '../apis/course'
import CourseCard from '../components/CourseCard'
import SectionHeader from '../components/SectionHeader'
import Loader from '../components/Loader'
import { EmptyState } from '@repo/shared'
import { cn } from '../lib/cn'

const ALL = 0

function enrich(courses: Course[], categories: Category[]): Course[] {
  const map = new Map(categories.map((c) => [c.id, c]))
  return courses.map((course) => {
    if (course.category) return course
    const cat = course.categoryId != null ? map.get(course.categoryId) : undefined
    return cat ? { ...course, category: { id: cat.id, name: cat.name } } : course
  })
}

export default function Knowledge() {
  const [categories, setCategories] = useState<Category[]>([])
  const [courseList, setCourseList] = useState<Course[]>([])
  const [activeCategory, setActiveCategory] = useState<number>(ALL)
  const [keyword, setKeyword] = useState('')
  const [loading, setLoading] = useState(true)

  const loadCourses = useCallback(
    async (categoryId: number, name?: string) => {
      setLoading(true)
      try {
        if (name) {
          const res = await searchCourses({ name, currentPage: 1, pageSize: 50 })
          setCourseList(enrich(res.data.courses ?? [], categories))
          return
        }
        if (categoryId === ALL) {
          const list = await listCategories()
          const categoryIds = (list.data.categories ?? []).map((c) => c.id)
          if (categoryIds.length === 0) {
            setCourseList([])
            return
          }
          const results = await Promise.all(categoryIds.map((id) => listCourses({ categoryId: id })))
          const merged = results.flatMap((res) => res.data.courses ?? [])
          const deduped = [...new Map(merged.map((c) => [c.id, c])).values()]
          setCourseList(enrich(deduped, categories))
          return
        }
        const res = await listCourses({ categoryId })
        setCourseList(enrich(res.data.courses ?? [], categories))
      } catch {
        setCourseList([])
      } finally {
        setLoading(false)
      }
    },
    [categories],
  )

  useEffect(() => {
    let active = true
    listCategories()
      .then((res) => {
        if (!active) return
        setCategories(res.data.categories ?? [])
        if ((res.data.categories ?? []).length > 0) setActiveCategory(res.data.categories[0].id)
      })
      .catch(() => {
        if (active) setCategories([])
      })
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    void loadCourses(activeCategory)
  }, [activeCategory, loadCourses])

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const name = keyword.trim()
    void loadCourses(activeCategory, name || undefined)
  }

  const clearSearch = () => {
    setKeyword('')
    void loadCourses(activeCategory)
  }

  return (
    <div className="space-y-8">
      <SectionHeader code="KNOWLEDGE BASE" title="知识库" desc="结构化课程与章节，可按分类浏览或搜索。" />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => {
            setActiveCategory(ALL)
            clearSearch()
          }}
          className={cn(
            'rounded-none border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors',
            activeCategory === ALL ? 'border-accent bg-accent text-ink' : 'border-hairline bg-primary text-text-secondary hover:border-accent hover:text-accent',
          )}
        >
          全部
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => {
              setActiveCategory(cat.id)
              clearSearch()
            }}
            className={cn(
              'rounded-none border px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors',
              activeCategory === cat.id ? 'border-accent bg-accent text-ink' : 'border-hairline bg-primary text-text-secondary hover:border-accent hover:text-accent',
            )}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <form onSubmit={handleSearch} className="flex max-w-xl items-center gap-2 rounded-none border border-hairline bg-surface-soft px-4 py-2">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="输入课程名称搜索…"
          className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-secondary focus:outline-none"
        />
        {keyword && (
          <button type="button" onClick={clearSearch} className="text-xs font-bold text-text-secondary hover:text-accent">
            清除
          </button>
        )}
        <button type="submit" className="rounded-none bg-accent px-4 py-1.5 text-xs font-black uppercase tracking-wider text-ink transition-[filter] hover:brightness-90">
          搜索
        </button>
      </form>

      {loading ? (
        <Loader />
      ) : courseList.length === 0 ? (
        <EmptyState code="KNOWLEDGE" title="暂无课程" description="该分类下还没有课程，或者没有匹配的搜索结果。" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {courseList.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  )
}
