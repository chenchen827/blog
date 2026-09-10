import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Image, Empty } from 'antd'

import type { Album, Photo } from '../types'
import { getAlbum, listPhotos } from '../apis/album'
import Loader from '../components/Loader'
import { useAuth } from '../auth/AuthContext'

function normalizePhotos(data: unknown): Photo[] {
  if (Array.isArray(data)) return data as Photo[]
  const maybe = data as { photos?: Photo[] }
  return maybe.photos ?? []
}

export default function AlbumDetail() {
  const { id } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [album, setAlbum] = useState<Album | null>(null)
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id || !user) return
    let active = true
    setLoading(true)
    Promise.all([getAlbum(id), listPhotos(id)])
      .then(([albumRes, photoRes]) => {
        if (!active) return
        setAlbum(albumRes.data.album)
        setPhotos(normalizePhotos(photoRes.data))
      })
      .catch(() => {
        if (active) {
          setAlbum(null)
          setPhotos([])
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, user])

  if (authLoading) return <Loader />

  if (!user) {
    return (
      <div className="space-y-6">
        <Link to="/albums" className="text-sm text-text-secondary transition-colors hover:text-text-primary">← 返回相册集</Link>
        <p className="text-base text-text-secondary">请先登录后查看相集详情。<Link to="/login" className="text-accent hover:underline">去登录</Link></p>
      </div>
    )
  }

  if (loading) return <Loader />

  if (!album) {
    return (
      <div className="space-y-6">
        <Link to="/albums" className="text-sm text-text-secondary transition-colors hover:text-text-primary">← 返回相册集</Link>
        <p className="text-base text-text-secondary">未找到该相集。</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Link to="/albums" className="inline-block text-sm text-text-secondary transition-colors hover:text-text-primary">← 返回相册集</Link>

      <section className="relative overflow-hidden rounded-none border border-hairline bg-primary/70 p-6 md:p-10">
        <div aria-hidden="true" className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        <div className="relative">
          <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Album · {String(album.id).padStart(2, '0')}</span>
          <h1 className="mt-3 text-4xl font-black uppercase leading-tight tracking-[-0.02em] text-text-primary md:text-5xl">{album.name}</h1>
          {album.description && <p className="mt-4 max-w-2xl text-base leading-relaxed text-text-secondary">{album.description}</p>}
          <p className="mt-4 text-sm text-text-secondary">共 {photos.length} 张相片</p>
        </div>
      </section>

      {photos.length === 0 ? (
        <Empty description="该相集暂无相片" />
      ) : (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo) => (
            <figure key={photo.id} className="group overflow-hidden rounded-none border border-hairline bg-primary/70">
              <Image
                src={photo.imageUrl}
                alt={photo.description || album.name}
                className="aspect-[4/3] w-full object-cover transition-opacity group-hover:opacity-90"
                style={{ objectFit: 'cover' }}
              />
              {photo.description && (
                <figcaption className="px-3 py-2 text-xs text-text-secondary">{photo.description}</figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  )
}
