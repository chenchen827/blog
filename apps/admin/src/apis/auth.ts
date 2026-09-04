import type { ApiResponse } from "./types";
import { request, toForm } from "./request";

/** 管理员登录表单负载 */
export interface LoginPayload {
  login: string;
  password: string;
}

/** 管理员登录成功后的返回数据 */
export interface LoginData {
  token: string;
}

/**
 * 管理员登录
 * POST /admin/auth/sign_in
 */
export function loginAdmin(payload: LoginPayload): Promise<ApiResponse<LoginData>> {
  return request<LoginData>("/admin/auth/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toForm({ login: payload.login, password: payload.password }).toString(),
  });
}
