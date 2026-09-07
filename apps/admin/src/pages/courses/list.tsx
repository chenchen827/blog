import { EmptyState } from '@repo/shared'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, App, Button, Form, Grid, Image, Input, Modal, Popconfirm, Space, Switch, Table, Tag } from 'antd'
import type { TableProps } from 'antd'
import { useNavigate } from 'react-router'

import { createCourse, deleteCourse, listCourses, updateCourse } from '../../apis/courses'
import type { Course } from '../../apis/courses'
import { uploadImageToAliyun } from '../../apis/upload'
import ArticleEditor from '../articles/editor/ArticleEditor'

interface CourseFormValues {
  name: string
  image?: string
  recommended: boolean
  introductory: boolean
  content: string
}

export default function CourseListPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md
  const [form] = Form.useForm<CourseFormValues>()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [list, setList] = useState<Course[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [keyword, setKeyword] = useState('')
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 })
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Course | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)

  const load = useCallback(
    async (name: string, current: number, pageSize: number) => {
      setLoading(true)
      setError('')
      try {
        const res = await listCourses({ name: name || undefined, currentPage: current, pageSize })
        setList(res.data.courses)
        setPagination({
          current: res.data.pagination.currentPage,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : '加载课程失败'
        setError(msg)
        message.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [message],
  )

  useEffect(() => {
    void load('', 1, 10)
  }, [load])

  const openCreate = () => {
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ name: '', image: '', recommended: false, introductory: false, content: '' })
    setModalOpen(true)
  }

  const openEdit = (record: Course) => {
    setEditing(record)
    form.resetFields()
    form.setFieldsValue({
      name: record.name,
      image: record.image ?? '',
      recommended: !!record.recommended,
      introductory: !!record.introductory,
      content: record.content ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    form.resetFields()
  }

  const handleSave = async (values: CourseFormValues) => {
    setSaving(true)
    try {
      const payload = {
        categoryId: 1,
        name: values.name.trim(),
        image: values.image?.trim() || undefined,
        recommended: !!values.recommended,
        introductory: !!values.introductory,
        content: values.content || '',
      }

      if (editing) {
        await updateCourse(editing.id, payload)
        message.success('课程已更新')
      } else {
        await createCourse(payload)
        message.success('课程已创建')
      }

      setModalOpen(false)
      form.resetFields()
      void load(keyword, pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await deleteCourse(id)
      message.success('课程已删除')
      void load(keyword, pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploadingImage(true)
    try {
      const url = await uploadImageToAliyun(file)
      form.setFieldValue('image', url)
      message.success('封面图已上传')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '封面上传失败')
    } finally {
      setUploadingImage(false)
    }
  }

  const columns: TableProps<Course>['columns'] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'name', title: '课程名称', dataIndex: 'name', ellipsis: true },
  ]

  if (!isCompact) {
    columns.push(
      {
        key: 'category',
        title: '分类',
        dataIndex: 'category',
        width: 140,
        render: (_, record) => record.category?.name ?? '知识库',
      },
      {
        key: 'flags',
        title: '标记',
        width: 150,
        render: (_, record) => (
          <Space size={4}>
            {record.recommended ? <Tag color="gold">推荐</Tag> : null}
            {record.introductory ? <Tag color="cyan">入门</Tag> : null}
          </Space>
        ),
      },
      {
        key: 'user',
        title: '作者',
        dataIndex: 'user',
        width: 140,
        render: (_, record) => record.user?.username ?? '—',
      },
      { key: 'chaptersCount', title: '章节数', dataIndex: 'chaptersCount', width: 90 },
      { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 140 },
    )
  }

  columns.push({
    key: 'actions',
    title: '操作',
    width: 220,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => navigate(`/chapters/list?courseId=${record.id}`)}>
          章节
        </Button>
        <Button type="link" size="small" onClick={() => openEdit(record)}>
          编辑
        </Button>
        <Popconfirm title="删除课程前需先清空其章节，确定删除？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  })

  const imageValue = Form.useWatch('image', form)

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">课程列表</h1>
          <p className="mt-2 text-sm text-text-secondary">管理知识库课程；新建课程固定归入分类「知识库」（ID 1）。</p>
        </div>
        <Button type="primary" onClick={openCreate}>
          新增课程
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      <Input.Search allowClear placeholder="按课程名称搜索" onSearch={(value) => { setKeyword(value); void load(value, 1, pagination.pageSize) }} style={{ width: isCompact ? '100%' : 320 }} />

      <Table<Course>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        locale={{ emptyText: <EmptyState title="暂无课程" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(next) => { void load(keyword, next.current ?? 1, next.pageSize ?? pagination.pageSize) }}
        scroll={isCompact ? undefined : { x: 1100 }}
      />

      <Modal
        title={editing ? '编辑课程' : '新增课程'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        width={760}
        destroyOnHidden
      >
        <Form<CourseFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item label="分类">
            <Input value="知识库（ID 1）" disabled />
          </Form.Item>

          <Form.Item name="name" label="课程名称" rules={[{ required: true, whitespace: true, message: '请输入课程名称' }]}>
            <Input placeholder="请输入课程名称" maxLength={45} showCount />
          </Form.Item>

          <Form.Item name="image" label="封面图">
            <Input
              placeholder="封面图 URL，可手动输入或点击右侧上传"
              addonAfter={
                <Button type="primary" loading={uploadingImage} onClick={() => imageInputRef.current?.click()}>
                  上传封面
                </Button>
              }
            />
          </Form.Item>

          {imageValue ? (
            <div className="mb-4">
              <Image src={imageValue} alt="课程封面预览" width={160} style={{ borderRadius: 0 }} />
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name="recommended" label="是否推荐" valuePropName="checked">
              <Switch checkedChildren="推荐" unCheckedChildren="不推荐" />
            </Form.Item>
            <Form.Item name="introductory" label="是否入门" valuePropName="checked">
              <Switch checkedChildren="入门" unCheckedChildren="非入门" />
            </Form.Item>
          </div>

          <Form.Item name="content" label="课程正文" rules={[{ required: true, message: '请输入课程正文' }]}>
            <ArticleEditor />
          </Form.Item>
        </Form>
      </Modal>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </section>
  )
}
