import type { ApiResponse } from '../types'
import { request } from './request'

/** 飞书云盘条目类型。 */
export type FeishuItemType = 'folder' | 'docx'

/** 飞书文件夹 / 文档通用条目。 */
export interface FeishuListItem {
  token: string
  name: string
  parentToken: string
  type: FeishuItemType
  url?: string
  createdTime?: string
  modifiedTime?: string
}

/** 飞书云盘游标分页信息。 */
export interface FeishuPagination {
  pageSize: number
  pageToken: string | null
  hasMore: boolean
}

/** 文件夹或文档列表请求参数。 */
export interface FeishuListParams {
  folderToken?: string
  pageSize?: number
  pageToken?: string
}

export interface FeishuFolderListData {
  folders: FeishuListItem[]
  pagination: FeishuPagination
}

export interface FeishuDocumentListData {
  documents: FeishuListItem[]
  pagination: FeishuPagination
}

export interface FeishuMarkdownData {
  docToken: string
  content: string
}

function buildListQuery(params: FeishuListParams): string {
  const searchParams = new URLSearchParams()

  if (params.folderToken) searchParams.set('folderToken', params.folderToken)
  if (params.pageSize) searchParams.set('pageSize', String(params.pageSize))
  if (params.pageToken) searchParams.set('pageToken', params.pageToken)

  const query = searchParams.toString()
  return query ? `?${query}` : ''
}

/**
 * 查询当前层级文件夹。
 * GET /feishu/folders
 */
export function getFolders(params: FeishuListParams = {}): Promise<ApiResponse<FeishuFolderListData>> {
  return request<FeishuFolderListData>(`/feishu/folders${buildListQuery(params)}`)
}

/**
 * 查询当前层级的新版 docx 文档。
 * GET /feishu/documents
 */
export function getDocuments(params: FeishuListParams = {}): Promise<ApiResponse<FeishuDocumentListData>> {
  return request<FeishuDocumentListData>(`/feishu/documents${buildListQuery(params)}`)
}

/**
 * 获取 docx 文档的 Markdown 内容。
 * GET /feishu/documents/:docToken/markdown
 */
export function getDocumentMarkdown(docToken: string): Promise<ApiResponse<FeishuMarkdownData>> {
  return request<FeishuMarkdownData>(`/feishu/documents/${encodeURIComponent(docToken)}/markdown`)
}