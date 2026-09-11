import type { ApiResponse, ApiStatus } from "./types";
import { getToken } from "../utils/auth";

/** 接口基址：通过 Vite 环境变量配置,未配置时回退到同源相对路径 */
const API_BASE: string = import.meta.env.VITE_API_BASE_URL ?? "";

/** 判定业务状态是否成功：兼容 boolean 与数字 200 两种返回 */
export function isSuccess(status: ApiStatus): boolean {
  return status === true || status === 200;
}

/** 将对象序列化为 application/x-www-form-urlencoded 表单；数组按重复键展开 */
export function toForm(body: Record<string, string | string[]>): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(body)) {
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
    } else {
      params.set(key, value);
    }
  }
  return params;
}

/** 优先展示后端返回的具体错误信息 */
function getErrorMessage(body: ApiResponse<unknown>): string {
  return body.errors?.[0] || body.message || "请求失败";
}

/**
 * 统一请求封装：
 * - 可显式传入 token；未传时自动从本地缓存读取管理员 token
 * - 解析 JSON、空响应与纯文本响应
 * - 对 HTTP 错误和业务失败统一抛错,调用方只需 catch 展示 message
 */
export async function requestWithToken<T>(path: string, init: RequestInit | undefined, token: string | null): Promise<ApiResponse<T>> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      ...(token ? { token } : {}),
      ...(init?.headers as Record<string, string> | undefined),
    },
  });

  const text = await response.text();
  let body: ApiResponse<T>;
  if (text) {
    try {
      body = JSON.parse(text) as ApiResponse<T>;
    } catch {
      body = { status: response.ok, message: text } as ApiResponse<T>;
    }
  } else {
    body = { status: response.ok, message: "" } as ApiResponse<T>;
  }

  if (!response.ok) {
    throw new Error(getErrorMessage(body as ApiResponse<unknown>));
  }

  if (!isSuccess(body.status)) {
    throw new Error(getErrorMessage(body as ApiResponse<unknown>));
  }

  return body;
}

/** 自动从本地缓存读取 token 的请求封装 */
export function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  return requestWithToken<T>(path, init, getToken());
}
