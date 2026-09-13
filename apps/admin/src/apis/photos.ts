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
  pagination?: {
    total?: number
    currentPage?: number
    pageSize?: number
  }
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

const PHOTO_PAGE_SIZE = 100

function buildPhotoListQuery(albumId: string | number | undefined, currentPage: number): string {
  const search = new URLSearchParams()
  if (albumId !== undefined) search.set('albumId', String(albumId))
  search.set('currentPage', String(currentPage))
  search.set('pageSize', String(PHOTO_PAGE_SIZE))
  return search.toString()
}

/** 查询相片列表：自动拉取全部页码，避免超过单页限制后照片展示不全 */
export async function listPhotos(albumId?: string | number): Promise<ApiResponse<PhotoListData | Photo[]>> {
  const firstResponse = await request<PhotoListData | Photo[]>(`/admin/photos?${buildPhotoListQuery(albumId, 1)}`)

  if (Array.isArray(firstResponse.data)) {
    return firstResponse
  }

  const photos = [...(firstResponse.data.photos ?? [])]
  const total = firstResponse.data.pagination?.total ?? photos.length
  let currentPage = 2

  while (photos.length < total) {
    const response = await request<PhotoListData | Photo[]>(`/admin/photos?${buildPhotoListQuery(albumId, currentPage)}`)
    const pagePhotos = Array.isArray(response.data) ? response.data : (response.data.photos ?? [])

    if (pagePhotos.length === 0) break
    photos.push(...pagePhotos)
    if (pagePhotos.length < PHOTO_PAGE_SIZE) break
    currentPage += 1
  }

  return {
    ...firstResponse,
    data: {
      ...firstResponse.data,
      photos,
      pagination: {
        ...firstResponse.data.pagination,
        total,
        currentPage: 1,
        pageSize: photos.length,
      },
    },
  }
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