import type { ApiResponse, Chapter } from '../types'
import { request } from './request'

/**
 * 章节详情（需要登录）
 * GET /chapters/{id}
 */
export function getChapter(id: string | number): Promise<ApiResponse<{ chapter: Chapter }>> {
  return request<{ chapter: Chapter }>(`/chapters/${id}`)
}
