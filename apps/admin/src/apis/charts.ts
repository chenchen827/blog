import type { ApiResponse } from './types'
import { request } from './request'

/** 每月发布文章数量 */
export interface MonthlyPost {
  month: string
  count: number
}

/** 用户性别统计数据 */
export interface SexStat {
  name: string
  value: number
}

/** 查询每月发布的文章 */
export function getMonthlyPosts(): Promise<ApiResponse<{ posts: MonthlyPost[] }>> {
  return request<{ posts: MonthlyPost[] }>('/admin/charts/monthly-posts')
}

/** 查询用户性别 */
export function getSexStats(): Promise<ApiResponse<{ data: SexStat[] }>> {
  return request<{ data: SexStat[] }>('/admin/charts/sex')
}
