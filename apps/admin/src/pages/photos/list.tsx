import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, App, Button, Empty, Form, Input, Modal, Popconfirm, Select, Spin } from 'antd'
import { useNavigate, useSearchParams } from 'react-router'

import { listAlbums } from '../../apis/albums'
import type { Album } from '../../apis/albums'
import { createPhoto, deletePhoto, listPhotos, updatePhoto } from '../../apis/photos'
import type { Photo } from '../../apis/photos'
import { uploadImageToAliyun } from '../../apis/upload'

interface PhotoFormValues {
  imageUrl: string
  description?: string
}

export default function PhotoListPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [form] = Form.useForm<PhotoFormValues>()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const albumIdParam = searchParams.get('albumId')
  const [albumId, setAlbumId] = useState<string | undefined>(albumIdParam ?? undefined)
  const [albumOptions, setAlbumOptions] = useState<Album[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Photo | null>(null)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)

  const loadAlbums = useCallback(async () => {
    try {
      const res = await listAlbums()
      setAlbumOptions(res.data.albums ?? [])
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载相集失败')
    }
  }, [message])

  const loadPhotos = useCallback(
    async (id: string | undefined) => {
      if (!id) {
        setPhotos([])
        return
      }
      setLoading(true)
      setError('')
      try {
        const res = await listPhotos(id)
        const data = res.data
        setPhotos(Array.isArray(data) ? data : (data.photos ?? []))
      } catch (err) {
        const msg = err instanceof Error ? err.message : '加载相片失败'
        setError(msg)
        message.error(msg)
      } finally {
        setLoading(false)
      }
    },
    [message],
  )

  useEffect(() => {
    void loadAlbums()
  }, [loadAlbums])

  useEffect(() => {
    void loadPhotos(albumId)
  }, [albumId, loadPhotos])

  const handleAlbumChange = (value: string) => {
    setAlbumId(value)
    navigate(`/photos/list?albumId=${value}`, { replace: true })
  }

  const openAdd = () => {
    if (!albumId) {
      message.warning('请先选择相集')
      return
    }
    setEditing(null)
    form.resetFields()
    form.setFieldsValue({ imageUrl: '', description: '' })
    setModalOpen(true)
  }

  const openEdit = (photo: Photo) => {
    setEditing(photo)
    form.resetFields()
    form.setFieldsValue({
      imageUrl: photo.imageUrl ?? '',
      description: photo.description ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    form.resetFields()
  }

  const handleSave = async (values: PhotoFormValues) => {
    if (!albumId) return
    setSaving(true)
    try {
      const payload = {
        imageUrl: values.imageUrl.trim(),
        description: values.description?.trim() || '',
      }
      if (editing) {
        await updatePhoto(editing.id, payload)
        message.success('相片已更新')
      } else {
        await createPhoto({ albumId, ...payload })
        message.success('相片已添加')
      }
      setModalOpen(false)
      form.resetFields()
      void loadPhotos(albumId)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!albumId) return
    try {
      await deletePhoto(id)
      message.success('相片已删除')
      void loadPhotos(albumId)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setUploading(true)
    try {
      const url = await uploadImageToAliyun(file)
      form.setFieldValue('imageUrl', url)
      message.success('图片已上传')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '图片上传失败')
    } finally {
      setUploading(false)
    }
  }

  if (loading && photos.length === 0) {
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
          <div className="flex flex-wrap items-center gap-3">
            <Button type="link" className="!px-0" onClick={() => navigate('/albums/list')}>
              ← 返回相集
            </Button>
            <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">相片管理</h1>
          </div>
          <p className="mt-2 text-sm text-text-secondary">选择相集后以瀑布流查看相片，双击相片可编辑地址与描述。</p>
        </div>
        <Button type="primary" disabled={!albumId} onClick={openAdd}>
          新增相片
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      <div className="flex flex-wrap items-center gap-4">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="请选择相集"
          value={albumId}
          onChange={handleAlbumChange}
          options={albumOptions.map((album) => ({ label: album.name, value: String(album.id) }))}
          style={{ width: 300 }}
        />
        <span className="text-sm text-text-secondary">
          {albumId ? `当前相集 ID：${albumId}` : '请先选择相集以加载相片'}
        </span>
      </div>

      {!albumId ? (
        <Empty description="请选择相集" />
      ) : photos.length === 0 ? (
        <Empty description="该相集暂无相片" />
      ) : (
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3 2xl:columns-4">
          {photos.map((photo) => (
            <div key={photo.id} className="mb-4 break-inside-avoid overflow-hidden rounded-none border border-hairline bg-primary">
              <button
                type="button"
                className="group relative block w-full overflow-hidden"
                onDoubleClick={() => openEdit(photo)}
                title="双击编辑"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.description || '相片'}
                  loading="lazy"
                  className="block w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {photo.description ? (
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 py-3 text-left text-sm text-text-primary opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    {photo.description}
                  </span>
                ) : null}
              </button>
              <div className="flex items-center justify-end px-3 py-1.5">
                <Popconfirm title="确定删除该相片？" onConfirm={() => handleDelete(photo.id)}>
                  <Button type="link" size="small" danger>
                    删除
                  </Button>
                </Popconfirm>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editing ? '编辑相片' : '新增相片'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<PhotoFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="imageUrl" label="相片地址" rules={[{ required: true, whitespace: true, message: '请输入相片地址' }]}>
            <Input
              placeholder="图片 URL，可手动输入或点击右侧上传"
              addonAfter={
                <Button type="primary" loading={uploading} onClick={() => imageInputRef.current?.click()}>
                  上传图片
                </Button>
              }
            />
          </Form.Item>
          <Form.Item name="description" label="相片描述">
            <Input.TextArea placeholder="请输入相片描述" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </section>
  )
}