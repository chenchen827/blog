import type { ApiResponse } from './types'
import { request } from './request'

/** 相集实体 */
export interface Album {
  id: number
  name: string
  description?: string | null
  coverUrl?: string | null
  photosCount?: number
  userId?: number
  createdAt?: string
  updatedAt?: string
  user?: {
    id: number
    username?: string
    nickname?: string
    avatar?: string | null
  }
}

/** 相集列表分页信息 */
export interface AlbumPagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 相集列表响应中的 data 结构 */
export interface AlbumListData {
  albums: Album[]
  pagination?: AlbumPagination
}

/** 创建 / 更新相集表单负载 */
export interface AlbumPayload {
  name: string
  description?: string
  coverUrl?: string
}

/** 查询相集列表 */
export function listAlbums(): Promise<ApiResponse<AlbumListData>> {
  return request<AlbumListData>('/admin/albums')
}

/** 查询相集详情 */
export function getAlbum(id: string | number): Promise<ApiResponse<{ album: Album }>> {
  return request<{ album: Album }>(`/admin/albums/${id}`)
}

/** 创建相集 */
export function createAlbum(payload: AlbumPayload): Promise<ApiResponse<Album>> {
  return request<Album>('/admin/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 更新相集 */
export function updateAlbum(id: string | number, payload: AlbumPayload): Promise<ApiResponse<Album>> {
  return request<Album>(`/admin/albums/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 删除相集 */
export function deleteAlbum(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/albums/${id}`, {
    method: 'DELETE',
  })
}