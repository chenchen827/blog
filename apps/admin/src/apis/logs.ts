import type { ApiResponse } from './types'
import { request } from './request'

/** 日志附加信息 */
export interface ErrorLogMeta {
  service?: string
  stack?: string
}

/** 系统错误日志实体 */
export interface ErrorLog {
  id: number
  level?: string
  message?: string
  timestamp?: string
  meta?: ErrorLogMeta
}

/** 日志列表响应中的 data 结构 */
export interface ErrorLogListData {
  logs?: ErrorLog[]
}

/** 查询日志列表 */
export function listLogs(): Promise<ApiResponse<ErrorLogListData | ErrorLog[]>> {
  return request<ErrorLogListData | ErrorLog[]>('/admin/logs')
}

/** 查询日志详情 */
export function getLog(id: string | number): Promise<ApiResponse<{ log: ErrorLog }>> {
  return request<{ log: ErrorLog }>(`/admin/logs/${id}`)
}

/** 删除单条日志 */
export function deleteLog(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/logs/${id}`, {
    method: 'DELETE',
  })
}

/** 清空全部日志 */
export function clearLogs(): Promise<ApiResponse<unknown>> {
  return request<unknown>('/admin/logs/clear', {
    method: 'DELETE',
  })
}
