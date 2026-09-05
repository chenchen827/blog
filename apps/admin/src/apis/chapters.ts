import type { ApiResponse } from './types'
import { request } from './request'

/** 章节关联课程信息 */
export interface ChapterCourseInfo {
  id: number
  name?: string
}

/** 章节实体 */
export interface Chapter {
  id: number
  courseId: number
  title: string
  content?: string | null
  video?: string | null
  rank: number
  createdAt?: string
  updatedAt?: string
  course?: ChapterCourseInfo
}

/** 章节列表分页信息 */
export interface ChapterPagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 章节列表响应中的 data 结构 */
export interface ChapterListData {
  chapters: Chapter[]
  pagination: ChapterPagination
}

/** 查询章节列表参数 */
export interface ListChaptersParams {
  courseId: string | number
  pageSize: number
  currentPage: number
  title?: string
}

/** 创建 / 更新章节表单负载 */
export interface ChapterPayload {
  courseId: string | number
  title: string
  content?: string
  video?: string
  rank: number
}

/** 按课程查询章节列表 */
export function listChapters(params: ListChaptersParams): Promise<ApiResponse<ChapterListData>> {
  const search = new URLSearchParams()
  if (params.title) search.set('title', params.title)
  search.set('courseId', String(params.courseId))
  search.set('pageSize', String(params.pageSize))
  search.set('currentPage', String(params.currentPage))
  return request<ChapterListData>(`/admin/chapters?${search.toString()}`)
}

/** 查询章节详情 */
export function getChapter(id: string | number): Promise<ApiResponse<{ chapter: Chapter }>> {
  return request<{ chapter: Chapter }>(`/admin/chapters/${id}`)
}

/** 创建章节 */
export function createChapter(payload: ChapterPayload): Promise<ApiResponse<Chapter>> {
  return request<Chapter>('/admin/chapters', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 更新章节 */
export function updateChapter(id: string | number, payload: ChapterPayload): Promise<ApiResponse<Chapter>> {
  return request<Chapter>(`/admin/chapters/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 删除章节 */
export function deleteChapter(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/chapters/${id}`, {
    method: 'DELETE',
  })
}
