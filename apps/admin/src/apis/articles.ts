import type {
  ApiResponse,
  Article,
  ArticleListData,
  ArticlePayload,
  ListArticlesParams,
} from './types'
import { request, toForm } from './request'

/** 查询文章列表（deleted=true 时查询回收站） */
export function listArticles(params: ListArticlesParams): Promise<ApiResponse<ArticleListData>> {
  const search = new URLSearchParams()
  if (params.title) search.set('title', params.title)
  search.set('pageSize', String(params.pageSize))
  search.set('currentPage', String(params.currentPage))
  search.set('deleted', String(params.deleted))
  return request<ArticleListData>(`/admin/articles?${search.toString()}`)
}

/** 查询文章详情 */
export function getArticle(id: string | number): Promise<ApiResponse<Article>> {
  return request<Article>(`/admin/articles/${id}`)
}

/** 创建文章 */
export function createArticle(payload: ArticlePayload): Promise<ApiResponse<Article>> {
  return request<Article>('/admin/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ title: payload.title, content: payload.content }).toString(),
  })
}

/** 更新文章 */
export function updateArticle(id: string | number, payload: ArticlePayload): Promise<ApiResponse<unknown>> {
  return request<unknown>(`/admin/articles/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ title: payload.title, content: payload.content }).toString(),
  })
}

/** 批量删除到回收站 */
export function deleteArticles(ids: Array<string | number>): Promise<ApiResponse<unknown>> {
  return request<unknown>('/admin/articles/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ id: ids.map(String) }).toString(),
  })
}

/** 从回收站批量恢复 */
export function restoreArticles(ids: Array<string | number>): Promise<ApiResponse<unknown>> {
  return request<unknown>('/admin/articles/restore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ id: ids.map(String) }).toString(),
  })
}

/** 彻底删除单篇文章 */
export function forceDeleteArticle(id: string | number): Promise<ApiResponse<unknown>> {
  return request<unknown>('/admin/articles/force_delete', {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: toForm({ id: String(id) }).toString(),
  })
}