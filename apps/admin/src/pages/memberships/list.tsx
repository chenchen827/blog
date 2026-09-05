import { useCallback, useEffect, useState } from 'react'
import { Alert, App, Button, Empty, Form, Grid, Input, InputNumber, Modal, Popconfirm, Space, Table } from 'antd'
import type { TableProps } from 'antd'

import { createMembership, deleteMembership, listMemberships, updateMembership } from '../../apis/memberships'
import type { Membership } from '../../apis/memberships'

interface MembershipFormValues {
  name: string
  durationMonths: number
  price: number
  rank: number
  description?: string
}

const defaultFormValues: MembershipFormValues = {
  name: '',
  durationMonths: 1,
  price: 0,
  rank: 0,
  description: '',
}

export default function MembershipListPage() {
  const { message } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const [form] = Form.useForm<MembershipFormValues>()

  const [list, setList] = useState<Membership[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Membership | null>(null)
  const [saving, setSaving] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listMemberships()
      setList(res.data.memberships ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载失败'
      setError(msg)
      message.error(msg)
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    void load()
  }, [load])

  const openCreate = () => {
    setEditing(null)
    form.setFieldsValue(defaultFormValues)
    setModalOpen(true)
  }

  const openEdit = (record: Membership) => {
    setEditing(record)
    form.setFieldsValue({
      name: record.name,
      durationMonths: Number(record.durationMonths),
      price: Number(record.price),
      rank: Number(record.rank),
      description: record.description ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    form.resetFields()
  }

  const handleSave = async (values: MembershipFormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: values.name.trim(),
        durationMonths: values.durationMonths,
        price: values.price,
        rank: values.rank,
        description: values.description?.trim() ?? '',
      }

      if (editing) {
        await updateMembership(editing.id, payload)
        message.success('会员商品已更新')
      } else {
        await createMembership(payload)
        message.success('会员商品已创建')
      }

      setModalOpen(false)
      form.resetFields()
      void load()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteMembership(id)
      message.success('会员商品已删除')
      void load()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const columns: TableProps<Membership>['columns'] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'name', title: '商品名称', dataIndex: 'name', ellipsis: true },
  ]

  if (!isCompact) {
    columns.push(
      { key: 'durationMonths', title: '时长（月）', dataIndex: 'durationMonths', width: 110 },
      {
        key: 'price',
        title: '价格',
        dataIndex: 'price',
        width: 120,
        render: (value: number | string) => `¥ ${Number(value).toFixed(2)}`,
      },
      { key: 'rank', title: '排序', dataIndex: 'rank', width: 90 },
      { key: 'description', title: '描述', dataIndex: 'description', ellipsis: true, render: (value?: string) => value || '—' },
      { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 180, render: (value?: string) => value || '—' },
    )
  }

  columns.push({
    key: 'actions',
    title: '操作',
    width: 140,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => openEdit(record)}>
          编辑
        </Button>
        <Popconfirm title="确定删除该会员商品？" onConfirm={() => handleDelete(record.id)}>
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
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">会员商品</h1>
          <p className="mt-2 text-sm text-text-secondary">管理会员开通套餐：新增、编辑、删除与查看。</p>
        </div>
        <Button type="primary" onClick={openCreate}>
          新增商品
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      <Table<Membership>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无会员商品" /> }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={isCompact ? undefined : { x: 960 }}
      />

      <Modal
        title={editing ? '编辑会员商品' : '新增会员商品'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<MembershipFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="name" label="商品名称" rules={[{ required: true, whitespace: true, message: '请输入商品名称' }]}>
            <Input placeholder="例如：季度大会员" maxLength={60} showCount />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="durationMonths"
              label="会员时长（月）"
              rules={[{ required: true, message: '请输入会员时长' }]}
            >
              <InputNumber min={1} precision={0} style={{ width: '100%' }} placeholder="例如：3" />
            </Form.Item>

            <Form.Item
              name="price"
              label="价格（元）"
              rules={[{ required: true, message: '请输入价格' }]}
            >
              <InputNumber min={0} precision={2} style={{ width: '100%' }} placeholder="例如：60" />
            </Form.Item>
          </div>

          <Form.Item name="rank" label="排序" rules={[{ required: true, message: '请输入排序值' }]}>
            <InputNumber min={0} precision={0} style={{ width: '100%' }} placeholder="数字越小越靠前" />
          </Form.Item>

          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="请输入商品描述" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  )
}