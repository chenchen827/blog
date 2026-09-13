import type { Album, ApiResponse, Photo } from "../types";
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

export interface PersonalizationAlbumPhotosData {
  album: Album;
  photos: Photo[];
}

/** 通过访问编码公开查询生活相册图片 */
export function getPersonalizationAlbumPhotos(accessCode: string, albumId: number): Promise<ApiResponse<PersonalizationAlbumPhotosData>> {
  return request<PersonalizationAlbumPhotosData>(`/personalization/${encodeURIComponent(accessCode)}/albums/${encodeURIComponent(String(albumId))}/photos`);
}

/** 通过访问编码公开查询个性化配置 */
export function getPersonalizationByAccessCode(accessCode: string): Promise<ApiResponse<{ personalization: Personalization | null }>> {
  return request<{ personalization: Personalization | null }>(`/personalization/${encodeURIComponent(accessCode)}`);
}
