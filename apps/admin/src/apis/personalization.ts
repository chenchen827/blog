import type { ApiResponse } from "./types";
import { request } from "./request";

export type AlbumTemplate = "Default" | "Masonry" | "DriftWall" | "DomeGallery";
export type CollectionTemplate = "Record" | "DepthCarousel" | "CircularGallery";
export type HomeBackgroundTemplate = "GhostFibers" | "Starry" | "GradientWaves";

/** 首页、相集与相片墙等页面的个性化配置 */
export interface Personalization {
  id: number;
  accessCode: string;
  albumTemplate: AlbumTemplate;
  collectionTemplate: CollectionTemplate;
  homeBackgroundTemplate: HomeBackgroundTemplate;
  introduction?: string | null;
  portraitUrl?: string | null;
  contactEmail?: string | null;
  lifeAlbumId?: number | null;
  recommendedArticleIds: number[];
  userId: number;
  lifeAlbum?: {
    id: number;
    name: string;
    coverUrl?: string | null;
  } | null;
  user?: {
    id: number;
    username: string;
    nickname: string;
    avatar?: string | null;
  } | null;
  recommendedArticles?: Array<{
    id: number;
    title: string;
  }>;
  createdAt?: string;
  updatedAt?: string;
}

/** 创建或更新个性化配置的请求体 */
export interface PersonalizationUpsertRequest {
  accessCode?: string;
  albumTemplate?: AlbumTemplate;
  collectionTemplate?: CollectionTemplate;
  homeBackgroundTemplate?: HomeBackgroundTemplate;
  introduction?: string | null;
  portraitUrl?: string | null;
  contactEmail?: string | null;
  lifeAlbumId?: number | null;
  recommendedArticleIds?: number[];
}

interface PersonalizationData {
  personalization: Personalization | null;
}

/** 查询当前登录用户的个性化配置 */
export function getPersonalization(): Promise<ApiResponse<PersonalizationData>> {
  return request<PersonalizationData>("/personalization");
}

/** 创建或更新当前登录用户的个性化配置 */
export function createPersonalization(payload: PersonalizationUpsertRequest = {}): Promise<ApiResponse<PersonalizationData>> {
  return request<PersonalizationData>("/personalization", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}
