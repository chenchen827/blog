import type { ApiResponse } from './types'
import { request } from './request'

/** 课程分类关联信息 */
export interface CourseCategoryInfo {
  id: number
  name?: string
}

/** 课程作者关联信息 */
export interface CourseUserInfo {
  id: number
  username?: string
  avatar?: string | null
}

/** 课程实体 */
export interface Course {
  id: number
  categoryId: number
  userId?: number
  name: string
  image?: string | null
  recommended?: boolean
  introductory?: boolean
  content?: string | null
  likesCount?: number
  chaptersCount?: number
  createdAt?: string
  updatedAt?: string
  category?: CourseCategoryInfo
  user?: CourseUserInfo
}

/** 课程列表分页信息 */
export interface CoursePagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 课程列表响应中的 data 结构 */
export interface CourseListData {
  courses: Course[]
  pagination: CoursePagination
}

/** 查询课程列表参数 */
export interface ListCoursesParams {
  pageSize: number
  currentPage: number
  name?: string
}

/** 创建 / 更新课程表单负载 */
export interface CoursePayload {
  categoryId: number
  name: string
  image?: string
  recommended: boolean
  introductory: boolean
  content: string
}

/** 查询课程列表 */
export function listCourses(params: ListCoursesParams): Promise<ApiResponse<CourseListData>> {
  const search = new URLSearchParams()
  if (params.name) search.set('name', params.name)
  search.set('pageSize', String(params.pageSize))
  search.set('currentPage', String(params.currentPage))
  return request<CourseListData>(`/admin/courses?${search.toString()}`)
}

/** 查询课程详情 */
export function getCourse(id: string | number): Promise<ApiResponse<{ course: Course }>> {
  return request<{ course: Course }>(`/admin/courses/${id}`)
}

/** 创建课程（categoryId 由页面固定为 1） */
export function createCourse(payload: CoursePayload): Promise<ApiResponse<Course>> {
  return request<Course>('/admin/courses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 更新课程（categoryId 由页面固定为 1） */
export function updateCourse(id: string | number, payload: CoursePayload): Promise<ApiResponse<Course>> {
  return request<Course>(`/admin/courses/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 删除课程 */
export function deleteCourse(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/courses/${id}`, {
    method: 'DELETE',
  })
}
