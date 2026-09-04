import { request, requestWithToken } from "./request";

/** 阿里云服务端代理上传返回的数据结构 */
export interface AliyunUploadData {
  url: string;
  originalname?: string;
  mimetype?: string;
  size?: number;
}

/**
 * 上传图片到阿里云 OSS（由后端代理）。
 * @param file 图片文件
 * @param token 可选 token；未传时使用本地缓存中的管理员 token
 * @returns 上传后的 OSS 图片 URL
 */
export async function uploadImageToAliyun(file: File, token?: string | null): Promise<string> {
  const form = new FormData();
  form.append("file", file);

  const init: RequestInit = {
    method: "POST",
    body: form,
  };

  const res = token
    ? await requestWithToken<AliyunUploadData>("/uploads/aliyun", init, token)
    : await request<AliyunUploadData>("/uploads/aliyun", init);

  return res.data.url;
}
