import { Link } from 'react-router'

import type { Course } from '../types'

const DIAGONAL = '[clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]'

interface CourseCardProps {
  course: Course
  basePath?: string
}

/** 课程卡片：封面 + 标签 + 标题 + 点赞/章节 */
export default function CourseCard({ course, basePath = '/knowledge' }: CourseCardProps) {
  return (
    <Link
      to={`${basePath}/${course.id}`}
      className={`group block rounded-none border border-hairline bg-primary/80 transition-colors hover:border-accent/60 ${DIAGONAL}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
        {course.image ? (
          <img
            src={course.image}
            alt={course.name}
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">No Cover</span>
          </div>
        )}
        <span className="absolute right-3 top-3 rounded-none border border-accent/50 bg-canvas/70 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">
          {course.free ? 'Free' : 'VIP'}
        </span>
      </div>
      <div className="p-4">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">{course.category?.name ?? '未分类'}</span>
        <h3 className="mt-2 truncate text-lg font-black uppercase tracking-tight text-text-primary transition-colors group-hover:text-accent">
          {course.name}
        </h3>
        <div className="mt-3 flex items-center gap-4 text-xs font-bold text-text-secondary">
          <span aria-hidden="true" className="text-accent">♥</span>
          <span>{course.likesCount ?? 0} 赞</span>
          <span>章节 {course.chaptersCount ?? 0}</span>
        </div>
      </div>
    </Link>
  )
}
