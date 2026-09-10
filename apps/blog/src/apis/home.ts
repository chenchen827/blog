import type { ApiResponse, HomeData } from '../types'
import { request } from './request'

/**
 * 首页推荐数据（推荐课程 / 收藏课程 / 入门课程）
 * GET /
 */
export function getHome(): Promise<ApiResponse<HomeData>> {
  return request<HomeData>('/')
}
