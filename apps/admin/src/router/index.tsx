import { createBrowserRouter, Navigate } from 'react-router'

import AdminLayout from '../layouts/AdminLayout'
import NotFound from '../pages/NotFound'
import CategoriesLayout from '../pages/categories/layout'
import CategoryListPage from '../pages/categories/list'
import ChaptersLayout from '../pages/chapters/layout'
import ChapterListPage from '../pages/chapters/list'
import CoursesLayout from '../pages/courses/layout'
import CourseListPage from '../pages/courses/list'
import ErrorLogDetailPage from '../pages/error-logs/detail'
import ErrorLogsLayout from '../pages/error-logs/layout'
import ErrorLogListPage from '../pages/error-logs/list'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import MemberDetailPage from '../pages/members/detail'
import MembersLayout from '../pages/members/layout'
import MemberListPage from '../pages/members/list'
import SettingsPage from '../pages/settings'
import ArticleListPage from '../pages/articles/list'
import ArticleNewPage from '../pages/articles/new'
import ArticlesLayout from '../pages/articles/layout'
import ArticleTrashPage from '../pages/articles/trash'
import UserListPage from '../pages/users/list'
import UsersLayout from '../pages/users/layout'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    element: <AdminLayout />,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'articles',
        element: <ArticlesLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ArticleListPage /> },
          { path: 'new', element: <ArticleNewPage /> },
          { path: 'trash', element: <ArticleTrashPage /> },
        ],
      },
      {
        path: 'users',
        element: <UsersLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <UserListPage /> },
        ],
      },
      {
        path: 'courses',
        element: <CoursesLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <CourseListPage /> },
        ],
      },
      {
        path: 'chapters',
        element: <ChaptersLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ChapterListPage /> },
        ],
      },
      {
        path: 'categories',
        element: <CategoriesLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <CategoryListPage /> },
        ],
      },
      { path: 'settings', element: <SettingsPage /> },
      {
        path: 'error-logs',
        element: <ErrorLogsLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ErrorLogListPage /> },
          { path: 'detail', element: <ErrorLogDetailPage /> },
        ],
      },
      {
        path: 'members',
        element: <MembersLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <MemberListPage /> },
          { path: 'detail', element: <MemberDetailPage /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
])
