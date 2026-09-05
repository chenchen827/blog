import type { ApiResponse } from './types'
import { request } from './request'

/** 相片实体 */
export interface Photo {
  id: number
  albumId?: number
  imageUrl?: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

/** 相片列表响应中的 data 结构 */
export interface PhotoListData {
  photos?: Photo[]
}

/** 创建相片表单负载 */
export interface CreatePhotoPayload {
  albumId: string | number
  imageUrl: string
  description?: string
}

/** 更新相片表单负载 */
export interface UpdatePhotoPayload {
  imageUrl: string
  description?: string
}

/** 查询相片列表 */
export function listPhotos(albumId?: string | number): Promise<ApiResponse<PhotoListData | Photo[]>> {
  const query = albumId !== undefined ? `?albumId=${encodeURIComponent(String(albumId))}` : ''
  return request<PhotoListData | Photo[]>(`/admin/photos${query}`)
}

/** 查询相片详情 */
export function getPhoto(id: string | number): Promise<ApiResponse<{ photo: Photo }>> {
  return request<{ photo: Photo }>(`/admin/photos/${id}`)
}

/** 添加相片 */
export function createPhoto(payload: CreatePhotoPayload): Promise<ApiResponse<Photo>> {
  return request<Photo>('/admin/photos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 更新相片（相片地址与描述） */
export function updatePhoto(id: string | number, payload: UpdatePhotoPayload): Promise<ApiResponse<Photo>> {
  return request<Photo>(`/admin/photos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/** 删除相片 */
export function deletePhoto(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/photos/${id}`, {
    method: 'DELETE',
  })
}