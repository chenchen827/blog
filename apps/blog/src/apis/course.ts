import type { ApiResponse, Course, CourseDetailData, CourseListData } from '../types'
import { request, toForm } from './request'

/** 查询课程列表参数 */
export interface ListCoursesParams {
  categoryId?: string | number
}

/** 模糊搜索课程参数 */
export interface SearchCoursesParams {
  name?: string
  currentPage?: number
  pageSize?: number
}

/**
 * 查询课程列表
 * GET /courses?categoryId=...
 */
export function listCourses(params?: ListCoursesParams): Promise<ApiResponse<CourseListData>> {
  const search = new URLSearchParams()
  if (params?.categoryId !== undefined) search.set('categoryId', String(params.categoryId))
  const query = search.toString()
  return request<CourseListData>(`/courses${query ? `?${query}` : ''}`)
}

/**
 * 获取课程详情（含分类、作者、章节）
 * GET /courses/{id}
 */
export function getCourse(id: string | number): Promise<ApiResponse<CourseDetailData>> {
  return request<CourseDetailData>(`/courses/${id}`)
}

/**
 * 模糊搜索课程
 * POST /courses/search
 */
export function searchCourses(params: SearchCoursesParams): Promise<ApiResponse<CourseListData>> {
  const body: Record<string, string> = {}
  if (params.name) body.name = params.name
  body.currentPage = String(params.currentPage ?? 1)
  body.pageSize = String(params.pageSize ?? 10)
  return request<CourseListData>('/courses/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(body).toString(),
  })
}

/**
 * 课程收藏 / 取消收藏
 * POST /likes
 */
export function toggleLike(courseId: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>('/likes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ courseId: String(courseId) }).toString(),
  })
}

/**
 * 查询用户收藏过的课程
 * GET /likes
 */
export function listLikedCourses(): Promise<ApiResponse<Course[]>> {
  return request<Course[]>('/likes')
}
