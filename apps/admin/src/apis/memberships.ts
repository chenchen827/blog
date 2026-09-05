import type { ApiResponse } from './types'
import { request, toForm } from './request'

/** 会员商品实体 */
export interface Membership {
  id: number
  name: string
  durationMonths: number | string
  price: number | string
  rank: number | string
  description?: string
  createdAt?: string
  updatedAt?: string
}

/** 创建 / 更新会员商品的表单负载 */
export interface MembershipPayload {
  name: string
  durationMonths: number | string
  price: number | string
  rank: number | string
  description?: string
}

/** 查询会员商品列表 */
export function listMemberships(): Promise<ApiResponse<{ memberships: Membership[] }>> {
  return request<{ memberships: Membership[] }>('/admin/memberships')
}

/** 查询会员商品详情 */
export function getMembership(id: string | number): Promise<ApiResponse<{ membership: Membership }>> {
  return request<{ membership: Membership }>(`/admin/memberships/${id}`)
}

/** 创建会员商品 */
export function createMembership(payload: MembershipPayload): Promise<ApiResponse<Membership>> {
  return request<Membership>('/admin/memberships', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({
      name: payload.name,
      durationMonths: String(payload.durationMonths),
      price: String(payload.price),
      rank: String(payload.rank),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }).toString(),
  })
}

/** 更新会员商品 */
export function updateMembership(id: string | number, payload: MembershipPayload): Promise<ApiResponse<Membership>> {
  return request<Membership>(`/admin/memberships/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({
      name: payload.name,
      durationMonths: String(payload.durationMonths),
      price: String(payload.price),
      rank: String(payload.rank),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
    }).toString(),
  })
}

/** 删除会员商品 */
export function deleteMembership(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/memberships/${id}`, {
    method: 'DELETE',
  })
}