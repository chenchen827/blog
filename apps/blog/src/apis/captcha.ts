import type { ApiResponse, CaptchaData } from "../types";
import { request, toForm } from "./request";

/**
 * 生成验证码,返回 SVG 图片与 captchaKey
 * GET /captcha
 */
export function getCaptcha(): Promise<ApiResponse<CaptchaData>> {
  return request<CaptchaData>("/captcha");
}

/**
 * 生成邮箱验证码
 * POST /captcha/email
 */
export function sendEmailCode(email: string): Promise<ApiResponse<{ captchaKey: string }>> {
  return request<{ captchaKey: string }>("/captcha/email", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toForm({ email }).toString(),
  });
}
