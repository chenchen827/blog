import type { ApiResponse, Article, ArticleListData } from '../types'
import { request } from './request'

/** 查询文章列表参数 */
export interface ListArticlesParams {
  pageSize?: number
  currentPage?: number
}

/**
 * 新闻文章列表
 * GET /articles
 */
export function listArticles(params?: ListArticlesParams): Promise<ApiResponse<ArticleListData>> {
  const search = new URLSearchParams()
  if (params?.pageSize) search.set('pageSize', String(params.pageSize))
  if (params?.currentPage) search.set('currentPage', String(params.currentPage))
  const query = search.toString()
  return request<ArticleListData>(`/articles${query ? `?${query}` : ''}`)
}

/**
 * 新闻文章详情
 * GET /articles/{id}
 */
export function getArticle(id: string | number): Promise<ApiResponse<{ article: Article }>> {
  return request<{ article: Article }>(`/articles/${id}`)
}
