import { Link } from 'react-router'

import type { Album } from '../types'

const DIAGONAL = '[clip-path:polygon(0_0,100%_0,100%_calc(100%-20px),calc(100%-20px)_100%,0_100%)]'

interface AlbumCardProps {
  album: Album
  basePath?: string
}

/** 相集卡片：封面 + 名称 + 相片数量 */
export default function AlbumCard({ album, basePath = '/albums' }: AlbumCardProps) {
  return (
    <Link
      to={`${basePath}/${album.id}`}
      className={`group block rounded-none border border-hairline bg-primary/80 transition-colors hover:border-accent/60 ${DIAGONAL}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-soft">
        {album.coverUrl ? (
          <img
            src={album.coverUrl}
            alt={album.name}
            loading="lazy"
            className="h-full w-full object-cover opacity-90 transition-opacity group-hover:opacity-100"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-secondary">No Cover</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="truncate text-lg font-black uppercase tracking-tight text-text-primary transition-colors group-hover:text-accent">
          {album.name}
        </h3>
        <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-text-secondary">{album.description || '暂无描述'}</p>
        <div className="mt-3 flex items-center gap-4 text-xs font-bold text-text-secondary">
          <span aria-hidden="true" className="text-accent">▣</span>
          <span>{album.photosCount ?? 0} 张相片</span>
        </div>
      </div>
    </Link>
  )
}
