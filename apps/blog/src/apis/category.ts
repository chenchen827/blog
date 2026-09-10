import type { ApiResponse, Category } from '../types'
import { request } from './request'

/**
 * 查询全部分类
 * GET /categories
 */
export function listCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
  return request<{ categories: Category[] }>('/categories')
}
