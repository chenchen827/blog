import { Button, List, Popconfirm } from 'antd'

import type { Album } from '../../apis/albums'

interface AlbumListViewProps {
  albums: Album[]
  onOpenPhotos: (album: Album) => void
  onEdit: (album: Album) => void
  onDelete: (id: number) => void
}

/** 列表视图：使用 antd List 展示相集（含相片 / 编辑 / 删除操作） */
export default function AlbumListView({ albums, onOpenPhotos, onEdit, onDelete }: AlbumListViewProps) {
  return (
    <List
      dataSource={albums}
      rowKey="id"
      className="overflow-hidden border border-hairline bg-primary"
      renderItem={(album) => (
        <List.Item
          
          actions={[
            <Button key="photos" type="link" size="small" onClick={() => onOpenPhotos(album)}>
              相片
            </Button>,
            <Button key="edit" type="link" size="small" onClick={() => onEdit(album)}>
              编辑
            </Button>,
            <Popconfirm key="delete" title="确定删除该相集？" onConfirm={() => onDelete(album.id)}>
              <Button type="link" size="small" danger>
                删除
              </Button>
            </Popconfirm>,
          ]}
        >
          <List.Item.Meta
            avatar={
              album.coverUrl ? (
                <img src={album.coverUrl} alt={album.name} className="h-12 w-16 shrink-0 border border-hairline object-cover" />
              ) : (
                <span className="flex h-12 w-16 shrink-0 items-center justify-center border border-hairline bg-surface-soft text-xs text-text-secondary">
                  暂无
                </span>
              )
            }
            title={
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-base font-bold text-text-primary">{album.name}</span>
                <span className="shrink-0 text-xs font-black uppercase tracking-wider text-accent">{album.photosCount ?? 0} Photos</span>
              </div>
            }
            description={<p className="line-clamp-2 text-sm leading-5 text-text-secondary">{album.description || '—'}</p>}
          />
        </List.Item>
      )}
    />
  )
}

