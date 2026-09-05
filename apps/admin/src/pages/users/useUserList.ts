import { useCallback, useEffect, useRef, useState } from 'react'
import { App } from 'antd'
import type { TableProps } from 'antd'

import { listUsers } from '../../apis/users'
import type { ListAdminUsersParams } from '../../apis/users'
import type { AdminUser } from '../../apis/users'

export type UserSearchField = 'email' | 'username' | 'nickname'

export interface AdminUserPaginationState {
  current: number
  pageSize: number
  total: number
}

interface UseAdminUserListOptions {
  /** 固定查询条件；例如会员列表传 10 */
  role?: number | string
  defaultField?: UserSearchField
}

/**
 * 用户 / 会员列表共用逻辑：
 * - 调用“查询全部用户”接口（/admin/users）
 * - 可选固定 role 查询条件
 * - 支持按邮箱 / 用户名 / 昵称查询、服务端分页
 */
export function useAdminUserList({ role, defaultField = 'nickname' }: UseAdminUserListOptions) {
  const { message } = App.useApp()

  const [users, setUsers] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [field, setField] = useState<UserSearchField>(defaultField)
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState<AdminUserPaginationState>({ current: 1, pageSize: 10, total: 0 })

  const fieldRef = useRef(field)
  const keywordRef = useRef(keyword)
  fieldRef.current = field
  keywordRef.current = keyword

  const load = useCallback(
    async (searchField: UserSearchField, searchKeyword: string, current: number, pageSize: number) => {
      setLoading(true)
      setError('')
      try {
        const params: ListAdminUsersParams = { currentPage: current, pageSize, role }
        if (searchField === 'email') params.email = searchKeyword || undefined
        if (searchField === 'username') params.username = searchKeyword || undefined
        if (searchField === 'nickname') params.nickname = searchKeyword || undefined
        const res = await listUsers(params)
        setUsers(res.data.users)
        setPagination({
          current: res.data.pagination.currentPage,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : '加载失败'
        setError(msg)
        message.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [role, message],
  )

  // 首次进入页面时加载第一页
  useEffect(() => {
    void load(defaultField, '', 1, 10)
  }, [load, defaultField])

  /** 搜索：重置回第一页 */
  const search = (value: string) => {
    setKeyword(value)
    void load(fieldRef.current, value, 1, pagination.pageSize)
  }

  /** 切换查询字段：清空关键词并重新查询 */
  const changeField = (nextField: UserSearchField) => {
    setField(nextField)
    setKeyword('')
    void load(nextField, '', 1, pagination.pageSize)
  }

  /** 表格分页变化 */
  const onTableChange: TableProps<AdminUser>['onChange'] = (nextPagination) => {
    const current = nextPagination.current ?? 1
    const pageSize = nextPagination.pageSize ?? pagination.pageSize
    void load(fieldRef.current, keywordRef.current, current, pageSize)
  }

  /** 清除错误提示 */
  const clearError = () => setError('')

  return {
    users,
    loading,
    error,
    field,
    keyword,
    pagination,
    load,
    search,
    changeField,
    onTableChange,
    clearError,
  }
}