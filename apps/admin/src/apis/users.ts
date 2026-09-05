import type { ApiResponse } from './types'
import { request, toForm } from './request'

/** 后台管理用户实体 */
export interface AdminUser {
  id: number
  email: string
  username: string
  nickname: string
  password?: string
  sex: number
  company?: string | null
  introduce?: string | null
  role: number | string
  avatar?: string | null
  createdAt?: string
  updatedAt?: string
}

/** 用户列表分页信息 */
export interface AdminUserPagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 用户列表响应中的 data 结构 */
export interface AdminUserListData {
  users: AdminUser[]
  pagination: AdminUserPagination
}

/** 查询用户列表参数 */
export interface ListAdminUsersParams {
  pageSize: number
  currentPage: number
  email?: string
  username?: string
  nickname?: string
  role?: number | string
}

/** 更新用户表单负载（role 不允许通过此接口修改） */
export interface AdminUserUpdatePayload {
  email?: string
  username?: string
  nickname?: string
  password?: string
  sex?: number
  company?: string
  introduce?: string
  avatar?: string
}

/** 查询全部用户 */
export function listUsers(params: ListAdminUsersParams): Promise<ApiResponse<AdminUserListData>> {
  const search = new URLSearchParams()
  if (params.email) search.set('email', params.email)
  if (params.username) search.set('username', params.username)
  if (params.nickname) search.set('nickname', params.nickname)
  if (params.role !== undefined) search.set('role', String(params.role))
  search.set('pageSize', String(params.pageSize))
  search.set('currentPage', String(params.currentPage))
  return request<AdminUserListData>(`/admin/users?${search.toString()}`)
}

/** 查询用户详情 */
export function getUser(id: string | number): Promise<ApiResponse<{ user: AdminUser }>> {
  return request<{ user: AdminUser }>(`/admin/users/${id}`)
}

/** 更新用户（不传 role，避免修改角色） */
export function updateUser(id: string | number, payload: AdminUserUpdatePayload): Promise<ApiResponse<{ user: AdminUser }>> {
  const body: Record<string, string> = {}

  if (payload.email !== undefined) body.email = payload.email
  if (payload.username !== undefined) body.username = payload.username
  if (payload.nickname !== undefined) body.nickname = payload.nickname
  if (payload.sex !== undefined) body.sex = String(payload.sex)
  if (payload.company !== undefined) body.company = payload.company
  if (payload.introduce !== undefined) body.introduce = payload.introduce
  if (payload.avatar !== undefined) body.avatar = payload.avatar
  if (payload.password) body.password = payload.password

  return request<{ user: AdminUser }>(`/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm(body).toString(),
  })
}


/** 切换用户是否为会员：将 role 更新为 0（普通）或 10（会员） */
export function updateUserRole(id: string | number, role: number): Promise<ApiResponse<{ user: AdminUser }>> {
  return request<{ user: AdminUser }>(`/admin/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ role: String(role) }).toString(),
  })
}

/** 删除用户 */
export function deleteUser(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/users/${id}`, {
    method: 'DELETE',
  })
}