import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, App, Button, Form, Image, Input, Modal, Popconfirm, Space, Spin } from 'antd'
import { useNavigate } from 'react-router'

import { createAlbum, deleteAlbum, listAlbums, updateAlbum } from '../../apis/albums'
import type { Album } from '../../apis/albums'
import { uploadImageToAliyun } from '../../apis/upload'
import { EmptyState } from '@repo/shared'

interface AlbumFormValues {
  name: string
  description?: string
  coverUrl?: string
}

export default function AlbumListPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [form] = Form.useForm<AlbumFormValues>()
  const coverInputRef = useRef<HTMLInputElement>(null)

  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Album | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const res = await listAlbums()
      setAlbums(res.data.albums ?? [])
    } catch (err) {
      const msg = err instanceof Error ? err.message : '加载相集失败'
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
    form.resetFields()
    form.setFieldsValue({ name: '', description: '', coverUrl: '' })
    setModalOpen(true)
  }

  const openEdit = (album: Album) => {
    setEditing(album)
    form.resetFields()
    form.setFieldsValue({
      name: album.name,
      description: album.description ?? '',
      coverUrl: album.coverUrl ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    form.resetFields()
  }

  const handleSave = async (values: AlbumFormValues) => {
    setSaving(true)
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || '',
        coverUrl: values.coverUrl?.trim() || '',
      }
      if (editing) {
        await updateAlbum(editing.id, payload)
        message.success('相集已更新')
      } else {
        await createAlbum(payload)
        message.success('相集已创建')
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
      await deleteAlbum(id)
      message.success('相集已删除')
      void load()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageToAliyun(file)
      form.setFieldValue('coverUrl', url)
      message.success('封面已上传')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '封面上传失败')
    } finally {
      setUploading(false)
    }
  }

  const coverUrl = Form.useWatch('coverUrl', form)

  if (loading && albums.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin />
      </div>
    )
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">相集管理</h1>
          <p className="mt-2 text-sm text-text-secondary">管理相集及其封面，进入相片管理后可维护相片。</p>
        </div>
        <Button type="primary" onClick={openCreate}>
          新增相集
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      {!loading && albums.length === 0 ? (
        <EmptyState
          code="ALBUM"
          title="暂无相集"
          description="创建一个相集，把零散的图片归档成完整的故事线。"
          action={
            <Button type="primary" onClick={openCreate}>
              新增相集
            </Button>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {albums.map((album) => (
            <div key={album.id} className="overflow-hidden rounded-none border border-hairline bg-primary">
              <button type="button" className="block h-44 w-full bg-surface-soft" onClick={() => navigate(`/photos/list?albumId=${album.id}`)}>
                {album.coverUrl ? (
                  <img src={album.coverUrl} alt={album.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-sm text-text-secondary">暂无封面</span>
                )}
              </button>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-text-primary">{album.name}</h3>
                    <p className="mt-1 line-clamp-2 min-h-10 text-sm leading-5 text-text-secondary">{album.description || '—'}</p>
                  </div>
                  <Space direction="vertical" size={0}>
                    <Button type="link" size="small" onClick={() => navigate(`/photos/list?albumId=${album.id}`)}>
                      相片
                    </Button>
                    <Button type="link" size="small" onClick={() => openEdit(album)}>
                      编辑
                    </Button>
                    <Popconfirm title="确定删除该相集？" onConfirm={() => handleDelete(album.id)}>
                      <Button type="link" size="small" danger>
                        删除
                      </Button>
                    </Popconfirm>
                  </Space>
                </div>
                <p className="mt-2 text-xs text-text-secondary">共 {album.photosCount ?? 0} 张相片</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editing ? '编辑相集' : '新增相集'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<AlbumFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="name" label="相集名称" rules={[{ required: true, whitespace: true, message: '请输入相集名称' }]}>
            <Input placeholder="请输入相集名称" maxLength={45} showCount />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面地址">
            <Input
              placeholder="封面图片 URL，可手动输入或点击右侧上传"
              addonAfter={
                <Button type="primary" loading={uploading} onClick={() => coverInputRef.current?.click()}>
                  上传封面
                </Button>
              }
            />
          </Form.Item>
          {coverUrl ? (
            <div className="mb-4">
              <Image src={coverUrl} alt="封面预览" width={160} style={{ borderRadius: 0 }} />
            </div>
          ) : null}
          <Form.Item name="description" label="相集描述">
            <Input.TextArea placeholder="请输入相集描述" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
    </section>
  )
}
