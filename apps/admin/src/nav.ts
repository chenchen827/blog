import type { NavItem } from './types/nav'

export const navItems: NavItem[] = [
  { label: 'Home', to: '/' },
  {
    label: '文章管理',
    children: [
      { label: '文章列表', to: '/articles/list' },
      { label: '写文章', to: '/articles/new' },
      { label: '回收站', to: '/articles/trash' },
    ],
  },
  { label: '用户管理', children: [{ label: '用户列表', to: '/users/list' }] },
  { label: '课程管理', children: [{ label: '课程列表', to: '/courses/list' }] },
  { label: '章节管理', children: [{ label: '章节列表', to: '/chapters/list' }] },
  { label: '分类管理', children: [{ label: '分类列表', to: '/categories/list' }] },
  { label: '系统设置', to: '/settings' },
  {
    label: '错误日志',
    children: [
      { label: '日志列表', to: '/error-logs/list' },
      { label: '日志详情', to: '/error-logs/detail' },
    ],
  },
  {
    label: '会员管理',
    children: [
      { label: '会员列表', to: '/members/list' },
      { label: '会员详情', to: '/members/detail' },
    ],
  },
]
