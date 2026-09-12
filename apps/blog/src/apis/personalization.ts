import type { ApiResponse } from "../types";
import { request } from "./request";

export type CollectionTemplate = "Record" | "DepthCarousel" | "CircularGallery" | "InfiniteMenu";
export type AlbumTemplate = "Default" | "Masonry" | "DriftWall" | "DomeGallery";

export interface Personalization {
  id: number;
  accessCode: string;
  albumTemplate: AlbumTemplate;
  collectionTemplate: CollectionTemplate;
  homeBackgroundTemplate: string;
  introduction?: string | null;
  portraitUrl?: string | null;
  contactEmail?: string | null;
  lifeAlbumId?: number | null;
  recommendedArticleIds?: number[];
  userId: number;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar?: string | null;
  } | null;
}

export function getPersonalization(): Promise<ApiResponse<{ personalization: Personalization | null }>> {
  return request<{ personalization: Personalization | null }>("/personalization");
}

/** 通过访问编码公开查询个性化配置 */
export function getPersonalizationByAccessCode(accessCode: string): Promise<ApiResponse<{ personalization: Personalization | null }>> {
  return request<{ personalization: Personalization | null }>(`/personalization/${encodeURIComponent(accessCode)}`);
}
