import { Alert, Empty, Grid, Input, Select, Space, Table } from 'antd'
import type { TableProps } from 'antd'

import type { AdminUser } from '../../apis/users'
import type { UserSearchField } from './useUserList'
import { useAdminUserList } from './useUserList'
import { emptyText, roleText, sexText } from './meta'

const searchOptions = [
  { label: '昵称', value: 'nickname' },
  { label: '用户名', value: 'username' },
  { label: '邮箱', value: 'email' },
]

export default function MemberListPage() {
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md

  const {
    users,
    loading,
    error,
    field,
    pagination,
    search,
    changeField,
    onTableChange,
    clearError,
  } = useAdminUserList({ role: 10 })

  const columns: TableProps<AdminUser>['columns'] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'username', title: '用户名', dataIndex: 'username', ellipsis: true },
    { key: 'nickname', title: '昵称', dataIndex: 'nickname', ellipsis: true },
  ]

  if (!isCompact) {
    columns.push(
      { key: 'email', title: '邮箱', dataIndex: 'email', ellipsis: true },
      { key: 'sex', title: '性别', dataIndex: 'sex', width: 90, render: (value: number) => sexText(value) },
      { key: 'role', title: '角色', dataIndex: 'role', width: 100, render: (value: number | string) => roleText(value) },
      { key: 'createdAt', title: '注册时间', dataIndex: 'createdAt', width: 180, render: (value?: string) => emptyText(value) },
    )
  }

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">会员列表</h1>
        <p className="mt-2 text-sm text-text-secondary">仅查询 role = 10 的会员，不含新增、编辑与删除操作。</p>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={clearError} />}

      <Space.Compact style={{ width: isCompact ? '100%' : 360 }}>
        <Select value={field} onChange={(value) => changeField(value as UserSearchField)} options={searchOptions} style={{ width: 100 }} />
        <Input.Search key={field} allowClear placeholder="输入关键词查询" onSearch={search} />
      </Space.Compact>

      <Table<AdminUser>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={users}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会员" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={onTableChange}
        scroll={isCompact ? undefined : { x: 960 }}
      />
    </section>
  )
}