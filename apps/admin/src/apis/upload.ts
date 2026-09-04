import { request } from './request'

/** 阿里云服务端代理上传返回的数据结构 */
export interface AliyunUploadData {
  url: string
  originalname?: string
  mimetype?: string
  size?: number
}

/**
 * 上传图片到阿里云 OSS（由后端代理）。
 * @param file 图片文件
 * @returns 上传后的 OSS 图片 URL
 */
export async function uploadImageToAliyun(file: File): Promise<string> {
  const form = new FormData()
  form.append('file', file)
  const res = await request<AliyunUploadData>('/uploads/aliyun', {
    method: 'POST',
    body: form,
  })
  return res.data.url
}