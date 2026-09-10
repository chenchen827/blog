import type { ApiResponse, SearchResult } from '../types'
import { request } from './request'

/**
 * 查询文章、课程、章节
 * GET /search?q=...&type=...
 */
export function search(q: string, type?: string): Promise<ApiResponse<SearchResult>> {
  const searchParams = new URLSearchParams()
  if (q) searchParams.set('q', q)
  if (type) searchParams.set('type', type)
  const query = searchParams.toString()
  return request<SearchResult>(`/search${query ? `?${query}` : ''}`)
}
