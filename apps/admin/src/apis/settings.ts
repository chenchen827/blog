import type { ApiResponse } from "./types";
import { request } from "./request";

/** 系统设置实体 */
export interface SiteSetting {
  id?: number;
  name?: string;
  icp?: string;
  copyright?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 系统设置表单负载 */
export interface SiteSettingPayload {
  name: string;
  icp: string;
  copyright: string;
}

/** 查询系统设置 */
export function getSetting(): Promise<ApiResponse<{ setting: SiteSetting }>> {
  return request<{ setting: SiteSetting }>("/admin/settings");
}

/** 更新系统设置 */
export function updateSetting(payload: SiteSettingPayload): Promise<ApiResponse<{ setting: SiteSetting }>> {
  return request<{ setting: SiteSetting }>("/admin/settings", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

/** 清除全部 Redis 缓存 */
export function flushAllCaches(): Promise<ApiResponse<unknown>> {
  return request<unknown>("/admin/settings/flush-all");
}

/** 重建搜索引擎索引 */
export function reindexSearchEngine(): Promise<ApiResponse<unknown>> {
  return request<unknown>("/admin/settings/meilisearch_reindex");
}
