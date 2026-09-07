import { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, App, Button, Form, Image, Input, Modal, Popconfirm, Space, Spin } from 'antd'
import { useNavigate } from 'react-router'

import { createAlbum, deleteAlbum, listAlbums, updateAlbum } from '../../apis/albums'
import type { Album } from '../../apis/albums'
import { uploadImageToAliyun } from '../../apis/upload'
import { Book, EmptyState } from '@repo/shared'
import type { BookPage } from '@repo/shared'

interface AlbumFormValues {
  name: string
  description?: string
  coverUrl?: string
}

/** 每一摞“相册书”最多容纳的相集数（外加 1 页书架封面） */
const ALBUMS_PER_STACK = 6

/** 把相集按固定数量分组，每组渲染成一摞可翻页的书 */
function chunkAlbums<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size))
  }
  return chunks
}

function padNo(value: number): string {
  return String(value).padStart(2, '0')
}

/* ------------------------- 书架视图的页面内容 ------------------------- */

/** 单本相集封面：封面图或占位图 */
function AlbumPageFront({ album, no }: { album: Album; no: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt={album.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#1b1b1b] via-[#101010] to-[#0a0a0a]" />
      )}
      {/* 底部压暗，保证文字可读 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      <span className="relative self-end p-3 text-[9px] font-black uppercase tracking-[0.4em] text-accent">Album · {no}</span>
      <span className="relative max-w-full truncate p-3 pt-0 text-sm font-black uppercase tracking-wide text-text-primary">{album.name}</span>
    </div>
  )
}

/** 相集翻开后的背面：相集信息 + 管理操作 */
function AlbumPageBack({
  album,
  no,
  onOpenPhotos,
  onEdit,
  onDelete,
}: {
  album: Album
  no: string
  onOpenPhotos: (album: Album) => void
  onEdit: (album: Album) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-[#151515] to-[#0c0c0c] p-4">
      <div className="flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Issue · {no}</span>
        <span aria-hidden="true" className="text-accent">
          //
        </span>
      </div>

      <div className="relative">
        <h3 className="text-base font-black uppercase leading-tight text-text-primary">{album.name}</h3>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-secondary">{album.description || '—'}</p>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">
          <span className="text-accent">{album.photosCount ?? 0}</span> Photos
        </p>
      </div>

      <div className="relative flex flex-col gap-2">
        <Button type="primary" size="small" block onClick={() => onOpenPhotos(album)}>
          进入相片
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button size="small" block onClick={() => onEdit(album)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该相集？" onConfirm={() => onDelete(album.id)}>
            <Button size="small" danger block>
              删除
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  )
}

/** 书架封面（整摞相册书的正面，不绑定具体相集） */
function StackCover({ stackIndex, count }: { stackIndex: number; count: number }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#222222] via-[#111111] to-[#070707]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '26px 26px',
        }}
      />
      <div className="relative flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Album Archive</span>
        <span aria-hidden="true" className="text-accent">
          ∅
        </span>
      </div>
      <div className="relative">
        <span className="block text-[40px] font-black uppercase leading-none tracking-[-0.02em] text-text-primary">Stack</span>
        <span className="mt-1 block text-[40px] font-black uppercase leading-none tracking-[-0.02em] text-accent">{padNo(stackIndex + 1)}</span>
        <span aria-hidden="true" className="mt-4 block h-1 w-10 bg-accent" />
      </div>
      <div className="relative flex items-end justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{count} Albums</span>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary">Hover to Flip</span>
      </div>
    </div>
  )
}

/** 书架视图：把相集按组渲染成一摞摞可翻页的“相册书” */
function AlbumShelfView({
  albums,
  onOpenPhotos,
  onEdit,
  onDelete,
}: {
  albums: Album[]
  onOpenPhotos: (album: Album) => void
  onEdit: (album: Album) => void
  onDelete: (id: number) => void
}) {
  const stacks = chunkAlbums(albums, ALBUMS_PER_STACK)

  return (
    <div className="space-y-12">
      {stacks.map((stack, stackIndex) => {
        const pages: BookPage[] = [
          ...stack.map((album, index) => {
            const no = padNo(stackIndex * ALBUMS_PER_STACK + index + 1)
            return {
              id: `${stackIndex}-${album.id}`,
              label: `相集 ${no}：${album.name}`,
              front: <AlbumPageFront album={album} no={no} />,
              back: <AlbumPageBack album={album} no={no} onOpenPhotos={onOpenPhotos} onEdit={onEdit} onDelete={onDelete} />,
            }
          }),
          {
            id: `stack-${stackIndex}-cover`,
            label: `书架封面（第 ${stackIndex + 1} 摞）`,
            front: <StackCover stackIndex={stackIndex} count={stack.length} />,
          },
        ]

        return (
          <section key={stackIndex} aria-label={`相册书架 ${padNo(stackIndex + 1)}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.45em] text-text-secondary">Archive Stack {padNo(stackIndex + 1)}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{stack.length} Albums</span>
              <div aria-hidden="true" className="h-px flex-1 bg-hairline" />
            </div>
            <div className="overflow-x-auto px-4 py-2">
              <div className="mx-auto w-max">
                <Book pages={pages} width={210} height={296} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  )
}

/** 列表视图：保留原本的相集卡片网格（管理大量相集时使用） */
function AlbumGridView({
  albums,
  onOpenPhotos,
  onEdit,
  onDelete,
}: {
  albums: Album[]
  onOpenPhotos: (album: Album) => void
  onEdit: (album: Album) => void
  onDelete: (id: number) => void
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {albums.map((album) => (
        <div key={album.id} className="overflow-hidden rounded-none border border-hairline bg-primary">
          <button type="button" className="block h-44 w-full bg-surface-soft" onClick={() => onOpenPhotos(album)}>
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
                <Button type="link" size="small" onClick={() => onOpenPhotos(album)}>
                  相片
                </Button>
                <Button type="link" size="small" onClick={() => onEdit(album)}>
                  编辑
                </Button>
                <Popconfirm title="确定删除该相集？" onConfirm={() => onDelete(album.id)}>
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
  )
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
  const [view, setView] = useState<'shelf' | 'grid'>('shelf')

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

  const openPhotos = (album: Album) => {
    navigate(`/photos/list?albumId=${album.id}`)
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
        <div className="flex items-center gap-2">
          <div className="flex border border-hairline bg-primary p-0.5">
            <button
              type="button"
              onClick={() => setView('shelf')}
              className={
                view === 'shelf'
                  ? 'h-9 border border-transparent bg-accent px-3 text-xs font-black uppercase tracking-wider text-ink'
                  : 'h-9 border border-transparent px-3 text-xs font-black uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary'
              }
            >
              书架
            </button>
            <button
              type="button"
              onClick={() => setView('grid')}
              className={
                view === 'grid'
                  ? 'h-9 border border-transparent bg-accent px-3 text-xs font-black uppercase tracking-wider text-ink'
                  : 'h-9 border border-transparent px-3 text-xs font-black uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary'
              }
            >
              列表
            </button>
          </div>
          <Button type="primary" onClick={openCreate}>
            新增相集
          </Button>
        </div>
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
      ) : view === 'shelf' ? (
        <div className="space-y-4">
          <p className="flex items-center gap-2 text-xs text-text-secondary">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            悬停翻开书架浏览相集，翻开后的背面可进入相片 / 编辑 / 删除。
          </p>
          <AlbumShelfView albums={albums} onOpenPhotos={openPhotos} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      ) : (
        <AlbumGridView albums={albums} onOpenPhotos={openPhotos} onEdit={openEdit} onDelete={handleDelete} />
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
