import type { ApiResponse } from "./types";
import { request, requestWithToken, toForm } from "./request";

/** 注册表单负载 */
export interface RegisterPayload {
  email: string;
  username: string;
  nickname: string;
  password: string;
  sex: number;
  captchaKey: string;
  captchaText: string;
}

/** 注册成功返回的用户信息 */
export interface RegisterUserData {
  id: number;
  email: string;
  username: string;
  nickname?: string;
  avatar?: string | null;
}

/** 用户登录成功后的返回数据 */
export interface UserLoginData {
  token: string;
}

/** 注册成功后需要写入用户资料的字段 */
export interface UserProfilePayload {
  avatar?: string;
  sex?: number;
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

/**
 * 用户注册
 * POST /auth/sign_up
 */
export function signUp(payload: RegisterPayload): Promise<ApiResponse<{ user: RegisterUserData }>> {
  const body: Record<string, string> = {
    email: payload.email,
    username: payload.username,
    nickname: payload.nickname,
    password: payload.password,
    sex: String(payload.sex),
    captchaKey: payload.captchaKey,
    captchaText: payload.captchaText,
  };

  return request<{ user: RegisterUserData }>("/auth/sign_up", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toForm(body).toString(),
  });
}

/**
 * 用户登录（注册成功后自动登录，用于获取上传头像所需的 token）
 * POST /auth/sign_in
 */
export function signInUser(login: string, password: string): Promise<ApiResponse<UserLoginData>> {
  return request<UserLoginData>("/auth/sign_in", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toForm({ login, password }).toString(),
  });
}

/**
 * 更新当前用户资料（头像、性别）
 * PUT /users/info
 */
export function updateUserProfile(token: string, payload: UserProfilePayload): Promise<ApiResponse<unknown>> {
  const body: Record<string, string> = {};

  if (payload.avatar) {
    body.avatar = payload.avatar;
  }
  if (payload.sex !== undefined) {
    body.sex = String(payload.sex);
  }

  return requestWithToken<unknown>(
    "/users/info",
    {
      method: "PUT",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: toForm(body).toString(),
    },
    token,
  );
}
