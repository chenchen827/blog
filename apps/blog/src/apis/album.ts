import type { Album, AlbumDetailData, AlbumListData, ApiResponse, Photo, PhotoListData } from '../types'
import { request, toForm } from './request'

/** 创建 / 更新相集表单负载 */
export interface AlbumPayload {
  name: string
  description?: string
  coverUrl?: string
}

/** 创建 / 更新相片表单负载 */
export interface PhotoPayload {
  imageUrl: string
  description?: string
}

/**
 * 查询当前用户相集列表
 * GET /albums
 */
export function listAlbums(): Promise<ApiResponse<AlbumListData>> {
  return request<AlbumListData>('/albums')
}

/**
 * 查询当前用户的相集详情
 * GET /albums/{id}
 */
export function getAlbum(id: string | number): Promise<ApiResponse<AlbumDetailData>> {
  return request<AlbumDetailData>(`/albums/${id}`)
}

/**
 * 创建相集
 * POST /albums
 */
export function createAlbum(payload: AlbumPayload): Promise<ApiResponse<Album>> {
  return request<Album>('/albums', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/**
 * 更新相集
 * PUT /albums/{id}
 */
export function updateAlbum(id: string | number, payload: AlbumPayload): Promise<ApiResponse<Album>> {
  return request<Album>(`/albums/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

/**
 * 删除相集
 * DELETE /albums/{id}
 */
export function deleteAlbum(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/albums/${id}`, { method: 'DELETE' })
}

/**
 * 查询当前用户相集下的图片列表
 * GET /photos?albumId=...
 */
export function listPhotos(albumId?: string | number): Promise<ApiResponse<PhotoListData | Photo[]>> {
  const query = albumId !== undefined ? `?albumId=${encodeURIComponent(String(albumId))}` : ''
  return request<PhotoListData | Photo[]>(`/photos${query}`)
}

/**
 * 查询当前用户的单张图片详情
 * GET /photos/{id}
 */
export function getPhoto(id: string | number): Promise<ApiResponse<{ photo: Photo }>> {
  return request<{ photo: Photo }>(`/photos/${id}`)
}

/**
 * 向当前用户的相集添加图片
 * POST /photos/{id}
 */
export function createPhoto(albumId: string | number, payload: PhotoPayload): Promise<ApiResponse<Photo>> {
  return request<Photo>(`/photos/${albumId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ imageUrl: payload.imageUrl, description: payload.description ?? '' }).toString(),
  })
}

/**
 * 更新当前用户相集下的图片
 * PUT /photos/{id}
 */
export function updatePhoto(id: string | number, payload: PhotoPayload): Promise<ApiResponse<Photo>> {
  return request<Photo>(`/photos/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ imageUrl: payload.imageUrl, description: payload.description ?? '' }).toString(),
  })
}

/**
 * 删除当前用户相集下的图片
 * DELETE /photos/{id}
 */
export function deletePhoto(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/photos/${id}`, { method: 'DELETE' })
}
