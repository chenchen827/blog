import type { ApiResponse, HomeData } from "../types";
import { request } from "./request";

/**
 * 首页个性化数据
 * GET /
 */
export function getHome(accessCode?: string): Promise<ApiResponse<HomeData>> {
  const query = accessCode ? `?accessCode=${encodeURIComponent(accessCode)}` : "";
  return request<HomeData>(`/${query}`);
}
