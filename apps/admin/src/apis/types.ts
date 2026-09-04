/** 接口返回的状态码：真实接口为 boolean，示例文档可能为数字（200） */
export type ApiStatus = boolean | number

/** 统一的后端响应包裹结构 */
export interface ApiResponse<T> {
  status: ApiStatus
  message?: string
  errors?: string[]
  data: T
}

/** 文章实体 */
export interface Article {
  id: number
  title: string
  content: string
  createdAt: string
  updatedAt: string
  userId?: number
  deletedAt?: string | null
}

/** 列表分页信息 */
export interface ArticlePagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 文章详情响应中的 data 结构 */
export interface ArticleDetailData {
  article: Article
}

/** 文章列表响应中的 data 结构 */
export interface ArticleListData {
  articles: Article[]
  pagination: ArticlePagination
}

/** 查询文章列表参数 */
export interface ListArticlesParams {
  /** 按标题模糊搜索，可空 */
  title?: string
  pageSize: number
  currentPage: number
  /** true 查询回收站，false 查询正常列表 */
  deleted: boolean
}

/** 创建 / 更新文章的表单负载 */
export interface ArticlePayload {
  title: string
  content: string
}

/** 附件实体 */
export interface Attachment {
  id: number
  userId?: number
  originalname: string
  filename: string
  mimetype?: string
  size?: string | number
  path?: string
  fullpath?: string
  url: string
  createdAt?: string
  updatedAt?: string
  user?: {
    id: number
    username?: string
    avatar?: string | null
  }
}

/** 附件列表分页信息 */
export interface AttachmentPagination {
  total: number
  currentPage: number
  pageSize: number
}

/** 附件列表响应中的 data 结构 */
export interface AttachmentListData {
  attachments: Attachment[]
  pagination: AttachmentPagination
}