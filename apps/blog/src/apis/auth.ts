import type { ApiResponse, User, UserProfileValues } from '../types'
import { request, toForm } from './request'

/** 注册表单负载 */
export interface RegisterPayload {
  email: string
  username: string
  nickname: string
  password: string
  sex: number
  captchaKey: string
  captchaText: string
}

/**
 * 用户注册
 * POST /auth/sign_up
 */
export function signUp(payload: RegisterPayload): Promise<ApiResponse<{ user: User }>> {
  const body: Record<string, string> = {
    email: payload.email,
    username: payload.username,
    nickname: payload.nickname,
    password: payload.password,
    sex: String(payload.sex),
    captchaKey: payload.captchaKey,
    captchaText: payload.captchaText,
  }
  return request<{ user: User }>('/auth/sign_up', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(body).toString(),
  })
}

/**
 * 用户登录
 * POST /auth/sign_in
 */
export function signIn(login: string, password: string): Promise<ApiResponse<{ token: string }>> {
  return request<{ token: string }>('/auth/sign_in', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ login, password }).toString(),
  })
}

/**
 * 获取当前用户信息
 * GET /users/me
 */
export function getMe(): Promise<ApiResponse<{ user: User }>> {
  return request<{ user: User }>('/users/me')
}

/**
 * 修改当前用户信息
 * PUT /users/info
 */
export function updateUserProfile(payload: UserProfileValues): Promise<ApiResponse<unknown>> {
  const body: Record<string, string> = {}
  if (payload.nickname !== undefined) body.nickname = payload.nickname
  if (payload.sex !== undefined) body.sex = String(payload.sex)
  if (payload.company !== undefined) body.company = payload.company
  if (payload.introduce !== undefined) body.introduce = payload.introduce
  if (payload.avatar !== undefined) body.avatar = payload.avatar
  return request<unknown>('/users/info', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(body).toString(),
  })
}

/**
 * 更新账号信息（邮箱 / 用户名 / 密码）
 * PUT /users/account
 */
export function updateAccount(payload: {
  email?: string
  username?: string
  currentPassword?: string
  password?: string
  passwordConfirmation?: string
}): Promise<ApiResponse<unknown>> {
  const body: Record<string, string> = {}
  if (payload.email !== undefined) body.email = payload.email
  if (payload.username !== undefined) body.username = payload.username
  if (payload.currentPassword !== undefined) body.currentPassword = payload.currentPassword
  if (payload.password !== undefined) body.password = payload.password
  if (payload.passwordConfirmation !== undefined) body.passwordConfirmation = payload.passwordConfirmation
  return request<unknown>('/users/account', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(body).toString(),
  })
}
