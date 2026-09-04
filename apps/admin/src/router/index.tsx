import { createBrowserRouter, Navigate } from 'react-router'

import AdminLayout from '../layouts/AdminLayout'
import ModuleLayout from '../layouts/ModuleLayout'
import NotFound from '../pages/NotFound'
import CategoryListPage from '../pages/categories/list'
import ChapterListPage from '../pages/chapters/list'
import CourseListPage from '../pages/courses/list'
import ErrorLogDetailPage from '../pages/error-logs/detail'
import ErrorLogListPage from '../pages/error-logs/list'
import HomePage from '../pages/home'
import LoginPage from '../pages/login'
import MemberDetailPage from '../pages/members/detail'
import MemberListPage from '../pages/members/list'
import SettingsPage from '../pages/settings'
import ArticleListPage from '../pages/articles/list'
import ArticleNewPage from '../pages/articles/new'
import ArticleTrashPage from '../pages/articles/trash'
import UserListPage from '../pages/users/list'

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
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ArticleListPage /> },
          { path: 'new', element: <ArticleNewPage /> },
          { path: 'trash', element: <ArticleTrashPage /> },
        ],
      },
      {
        path: 'users',
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <UserListPage /> },
        ],
      },
      {
        path: 'courses',
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <CourseListPage /> },
        ],
      },
      {
        path: 'chapters',
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ChapterListPage /> },
        ],
      },
      {
        path: 'categories',
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <CategoryListPage /> },
        ],
      },
      { path: 'settings', element: <SettingsPage /> },
      {
        path: 'error-logs',
        element: <ModuleLayout />,
        children: [
          { index: true, element: <Navigate to="list" replace /> },
          { path: 'list', element: <ErrorLogListPage /> },
          { path: 'detail', element: <ErrorLogDetailPage /> },
        ],
      },
      {
        path: 'members',
        element: <ModuleLayout />,
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
