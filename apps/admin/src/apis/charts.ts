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

/** 课程点赞明细 */
export interface CourseLikesItem {
  id: number
  name: string
  likesCount: number
}

/** 课程每月点赞趋势 */
export interface MonthlyLikes {
  month: string
  count: number
}

/** 当前用户课程点赞统计 */
export interface CourseLikesStats {
  total: number
  courses: CourseLikesItem[]
  monthly: MonthlyLikes[]
}

/** 查询每月发布的文章 */
export function getMonthlyPosts(): Promise<ApiResponse<{ posts: MonthlyPost[] }>> {
  return request<{ posts: MonthlyPost[] }>('/admin/charts/monthly-posts')
}

/** 查询用户性别 */
export function getSexStats(): Promise<ApiResponse<{ data: SexStat[] }>> {
  return request<{ data: SexStat[] }>('/admin/charts/sex')
}

/** 查询当前用户的课程点赞统计 */
export function getCourseLikesStats(): Promise<ApiResponse<CourseLikesStats>> {
  return request<CourseLikesStats>('/admin/charts/course-likes')
}