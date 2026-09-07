import { EmptyState } from '@repo/shared'
import { useState } from 'react'
import { Alert, App, Button, Form, Grid, Input, Modal, Popconfirm, Select, Space, Switch, Table } from 'antd'
import type { TableProps } from 'antd'

import { deleteUser, updateUser, updateUserRole } from '../../apis/users'
import type { AdminUser } from '../../apis/users'
import { emptyText, roleText, sexText } from './meta'
import type { UserSearchField } from './useUserList'
import { useAdminUserList } from './useUserList'

const searchOptions = [
  { label: '昵称', value: 'nickname' },
  { label: '用户名', value: 'username' },
  { label: '邮箱', value: 'email' },
]

interface EditFormValues {
  email: string
  username: string
  nickname: string
  sex: number
  company?: string
  introduce?: string
  password?: string
}

export default function UserListPage() {
  const { message } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const [form] = Form.useForm<EditFormValues>()

  const {
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
  } = useAdminUserList({})

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null)
  const [saving, setSaving] = useState(false)
  const [roleUpdatingId, setRoleUpdatingId] = useState<number | null>(null)

  const openEdit = (user: AdminUser) => {
    setEditingUser(user)
    form.setFieldsValue({
      email: user.email,
      username: user.username,
      nickname: user.nickname,
      sex: Number(user.sex),
      company: user.company ?? '',
      introduce: user.introduce ?? '',
      password: '',
    })
  }

  const closeEdit = () => {
    if (saving) return
    setEditingUser(null)
    form.resetFields()
  }

  const handleSave = async (values: EditFormValues) => {
    if (!editingUser) return
    setSaving(true)
    try {
      await updateUser(editingUser.id, {
        email: values.email.trim(),
        username: values.username.trim(),
        nickname: values.nickname.trim(),
        sex: Number(values.sex),
        company: values.company?.trim() || '',
        introduce: values.introduce?.trim() || '',
        password: values.password || undefined,
      })
      message.success('用户信息已更新')
      setEditingUser(null)
      form.resetFields()
      void load(field, keyword, 1, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteUser(id)
      message.success('用户已删除')
      void load(field, keyword, pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  /** 切换是否为会员：会员 role = 10，普通用户 role = 0 */
  const handleToggleMember = async (user: AdminUser, checked: boolean) => {
    const nextRole = checked ? 10 : 0
    setRoleUpdatingId(user.id)
    try {
      await updateUserRole(user.id, nextRole)
      message.success(checked ? '已设为会员' : '已取消会员')
      void load(field, keyword, pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '切换失败')
    } finally {
      setRoleUpdatingId(null)
    }
  }

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
      { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 180, render: (value?: string) => emptyText(value) },
    )
  }

  columns.push({
    key: 'actions',
    title: '操作',
    width: 280,
    render: (_, record) => (
      <Space size="small">
        <Switch
          checked={Number(record.role) === 10}
          checkedChildren="会员"
          unCheckedChildren="普通"
          loading={roleUpdatingId === record.id}
          disabled={roleUpdatingId !== null || Number(record.role) === 100}
          onChange={(checked) => handleToggleMember(record, checked)}
        />
        <Button type="link" size="small" onClick={() => openEdit(record)}>
          编辑
        </Button>
        <Popconfirm title="确定删除该用户？删除后不可恢复。" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">用户列表</h1>
          <p className="mt-2 text-sm text-text-secondary">支持查询、编辑与删除；编辑时不允许修改用户角色。</p>
        </div>
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
        locale={{ emptyText: <EmptyState title="暂无用户" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={onTableChange}
        scroll={isCompact ? undefined : { x: 980 }}
      />

      <Modal
        title="编辑用户"
        open={!!editingUser}
        onCancel={closeEdit}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<EditFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item label="角色">
            <Input value={editingUser ? roleText(editingUser.role) : ''} disabled />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input placeholder="请输入邮箱" autoComplete="off" />
          </Form.Item>

          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" autoComplete="off" />
          </Form.Item>

          <Form.Item name="nickname" label="昵称" rules={[{ required: true, message: '请输入昵称' }]}>
            <Input placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item name="sex" label="性别" initialValue={2}>
            <Select
              options={[
                { label: '保密', value: 2 },
                { label: '男', value: 0 },
                { label: '女', value: 1 },
              ]}
            />
          </Form.Item>

          <Form.Item name="company" label="公司">
            <Input placeholder="请输入公司" />
          </Form.Item>

          <Form.Item name="introduce" label="简介">
            <Input.TextArea placeholder="请输入简介" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>

          <Form.Item name="password" label="新密码">
            <Input.Password placeholder="留空则不修改密码" autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}
