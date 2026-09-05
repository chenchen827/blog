import type { ApiResponse } from './types'
import { request } from './request'

/** 分类实体 */
export interface Category {
  id: number
  name: string
  rank: number
  createdAt?: string
  updatedAt?: string
}

/** 创建 / 更新分类表单负载 */
export interface CategoryPayload {
  name: string
  rank: number
}

/** 查询全部分类 */
export function listCategories(): Promise<ApiResponse<{ categories: Category[] }>> {
  return request<{ categories: Category[] }>('/admin/categories')
}

/** 查询分类详情 */
export function getCategory(id: string | number): Promise<ApiResponse<{ category: Category }>> {
  return request<{ category: Category }>(`/admin/categories/${id}`)
}

/** 创建分类 */
export function createCategory(payload: CategoryPayload): Promise<ApiResponse<Category>> {
  return request<Category>('/admin/categories', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 更新分类 */
export function updateCategory(id: string | number, payload: CategoryPayload): Promise<ApiResponse<Category>> {
  return request<Category>(`/admin/categories/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 删除分类 */
export function deleteCategory(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/categories/${id}`, {
    method: 'DELETE',
  })
}
