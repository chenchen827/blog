import type { ApiResponse, HomeData } from "../types";
import { request } from "./request";

/**
 * 首页个性化数据
 * GET /
 */
export function getHome(): Promise<ApiResponse<HomeData>> {
  return request<HomeData>("/");
}
