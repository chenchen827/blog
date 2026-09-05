import { Navigate } from "react-router";

import type { AppRouteObject } from "../types/route";
import ModuleLayout from "../layouts/ModuleLayout";
import NotFound from "../pages/NotFound";
import CategoryListPage from "../pages/categories/list";
import ChapterListPage from "../pages/chapters/list";
import CourseListPage from "../pages/courses/list";
import ErrorLogDetailPage from "../pages/error-logs/detail";
import ErrorLogListPage from "../pages/error-logs/list";
import HomePage from "../pages/home";
// import MemberDetailPage from "../pages/members/detail";
// import MemberListPage from "../pages/members/list";
import SettingsPage from "../pages/settings";
import ArticleListPage from "../pages/articles/list";
import ArticleNewPage from "../pages/articles/new";
import ArticleTrashPage from "../pages/articles/trash";
import AttachmentListPage from "../pages/attachments/list";
import UserListPage from "../pages/users/list";
import UserMemberPage from "../pages/users/member";
import MembershipListPage from "../pages/memberships/list";

export const configs: AppRouteObject[] = [
  { index: true, element: <HomePage />, meta: { label: "Home" } },
  {
    path: "articles",
    element: <ModuleLayout />,
    meta: { label: "文章管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <ArticleListPage />, meta: { label: "文章列表" } },
      { path: "new", element: <ArticleNewPage />, meta: { label: "写文章" } },
      { path: "trash", element: <ArticleTrashPage />, meta: { label: "回收站" } },
    ],
  },
  {
    path: "users",
    element: <ModuleLayout />,
    meta: { label: "用户管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <UserListPage />, meta: { label: "用户列表" } },
      { path: "member", element: <UserMemberPage />, meta: { label: "会员列表" } },
    ],
  },

  {
    path: "memberships",
    element: <ModuleLayout />,
    meta: { label: "会员商品" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <MembershipListPage />, meta: { label: "商品列表" } },
    ],
  },
  {
    path: "courses",
    element: <ModuleLayout />,
    meta: { label: "课程管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <CourseListPage />, meta: { label: "课程列表" } },
    ],
  },
  {
    path: "chapters",
    element: <ModuleLayout />,
    meta: { label: "章节管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <ChapterListPage />, meta: { label: "章节列表" } },
    ],
  },
  {
    path: "categories",
    element: <ModuleLayout />,
    meta: { label: "分类管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <CategoryListPage />, meta: { label: "分类列表" } },
    ],
  },
  {
    path: "attachments",
    element: <ModuleLayout />,
    meta: { label: "附件管理" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <AttachmentListPage />, meta: { label: "附件列表" } },
    ],
  },
  { path: "settings", element: <SettingsPage />, meta: { label: "系统设置" } },
  {
    path: "error-logs",
    element: <ModuleLayout />,
    meta: { label: "错误日志" },
    children: [
      { index: true, element: <Navigate to="list" replace /> },
      { path: "list", element: <ErrorLogListPage />, meta: { label: "日志列表" } },
      { path: "detail", element: <ErrorLogDetailPage />, meta: { label: "日志详情", visible: false } },
    ],
  },
  { path: "*", element: <NotFound /> },
];
