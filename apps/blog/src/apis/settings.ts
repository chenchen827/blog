import type { ApiResponse, SiteSetting } from '../types'
import { request } from './request'

/**
 * 查询网站信息
 * GET /settings
 */
export function getSetting(): Promise<ApiResponse<{ setting: SiteSetting }>> {
  return request<{ setting: SiteSetting }>('/settings')
}
