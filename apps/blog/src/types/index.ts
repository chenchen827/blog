import type { Personalization } from "../apis/personalization";

/** 接口返回的状态码：真实接口为 boolean,示例文档可能为数字（200） */
export type ApiStatus = boolean | number;

/** 统一的后端响应包裹结构 */
export interface ApiResponse<T> {
  status: ApiStatus;
  message?: string;
  errors?: string[];
  data: T;
}

/** 列表分页信息 */
export interface Pagination {
  total: number;
  currentPage: number;
  pageSize: number;
}

/** 用户实体 */
export interface User {
  id: number;
  email: string;
  username: string;
  nickname?: string;
  sex?: number;
  company?: string | null;
  introduce?: string | null;
  role?: number | string;
  avatar?: string | null;
  createdAt?: string;
  updatedAt?: string;
  membershipExpiredAt?: string | null;
  openid?: string | null;
}

/** 登录 / 注册成功后返回的用户信息 */
export interface AuthUser extends User {
  token?: string;
}

/** 分类实体 */
export interface Category {
  id: number;
  name: string;
  rank: number;
  createdAt?: string;
  updatedAt?: string;
}

/** 课程关联作者信息 */
export interface CourseUserInfo {
  id: number;
  username?: string;
  nickname?: string;
  avatar?: string | null;
  company?: string | null;
}

/** 课程关联分类信息 */
export interface CourseCategoryInfo {
  id: number;
  name?: string;
}

/** 课程实体 */
export interface Course {
  id: number;
  categoryId: number;
  userId?: number;
  name: string;
  image?: string | null;
  recommended?: boolean;
  introductory?: boolean;
  content?: string | null;
  likesCount?: number;
  chaptersCount?: number;
  free?: boolean;
  createdAt?: string;
  updatedAt?: string;
  category?: CourseCategoryInfo;
  user?: CourseUserInfo;
}

/** 课程列表响应中的 data 结构 */
export interface CourseListData {
  courses: Course[];
  pagination?: Pagination;
}

/** 课程详情响应中的 data 结构 */
export interface CourseDetailData {
  course: Course;
  category?: Category;
  user?: User;
  chapters?: Chapter[];
}

/** 章节实体 */
export interface Chapter {
  id: number;
  courseId: number;
  title: string;
  content?: string | null;
  video?: string | null;
  rank: number;
  free?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** 文章实体 */
export interface Article {
  id: number;
  title: string;
  content?: string;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
}

/** 文章列表响应中的 data 结构 */
export interface ArticleListData {
  articles: Article[];
  pagination?: Pagination;
}

/** 文章详情响应中的 data 结构 */
export interface ArticleDetailData {
  article: Article;
}

/** 相集实体 */
export interface Album {
  id: number;
  name: string;
  description?: string | null;
  coverUrl?: string | null;
  photosCount?: number;
  userId?: number;
  createdAt?: string;
  updatedAt?: string;
  user?: CourseUserInfo;
}

/** 相集列表响应中的 data 结构 */
export interface AlbumListData {
  albums: Album[];
  pagination?: Pagination;
}

/** 相集详情响应中的 data 结构 */
export interface AlbumDetailData {
  album: Album;
}

/** 相片实体 */
export interface Photo {
  id: number;
  albumId?: number;
  imageUrl?: string;
  description?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

/** 相片列表响应中的 data 结构 */
export interface PhotoListData {
  photos?: Photo[];
  pagination?: Pagination;
}

/** 网站信息实体 */
export interface SiteSetting {
  id?: number;
  name?: string;
  icp?: string;
  copyright?: string;
  createdAt?: string;
  updatedAt?: string;
}

/** 首页推荐数据 */
export interface HomeData {
  personalization?: Personalization | null;
  albums?: Album[];
  articles?: Article[];
  recommendedCourses?: Course[];
  likesCourses?: Course[];
  introductoryCourses?: Course[];
}

/** 验证码数据 */
export interface CaptchaData {
  captchaKey: string;
  captchaData: string;
}

/** 搜索返回结果 */
export interface SearchResult {
  articles?: Article[];
  courses?: Course[];
  chapters?: Chapter[];
}

/** 用户资料表单值（用于编辑个人信息） */
export interface UserProfileValues {
  nickname?: string;
  sex?: number;
  company?: string;
  introduce?: string;
  avatar?: string;
}
