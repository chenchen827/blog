import { request } from './request'

/** 上传返回的数据结构 */
export interface UploadData {
  url: string
  originalname?: string
  mimetype?: string
  size?: number
}

/**
 * 普通用户上传图片到阿里云 OSS
 * POST /uploads/user/aliyun
 */
export async function uploadImage(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await request<UploadData>('/uploads/user/aliyun', {
    method: 'POST',
    body: form,
  })
  return res.data.url
}
