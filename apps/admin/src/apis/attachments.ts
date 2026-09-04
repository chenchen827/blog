import { request } from './request'
import type { ApiResponse, AttachmentListData } from './types'

interface ListAttachmentsParams {
  pageSize?: number
  currentPage?: number
}

/** 查询附件列表 */
export function listAttachments(params?: ListAttachmentsParams): Promise<ApiResponse<AttachmentListData>> {
  const search = new URLSearchParams()
  if (params?.pageSize) search.set('pageSize', String(params.pageSize))
  if (params?.currentPage) search.set('currentPage', String(params.currentPage))
  const query = search.toString()
  return request<AttachmentListData>(`/admin/attachments${query ? `?${query}` : ''}`)
}

/** 删除附件 */
export function deleteAttachment(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/attachments/${id}`, {
    method: 'DELETE',
  })
}