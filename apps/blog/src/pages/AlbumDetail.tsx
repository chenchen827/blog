import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { Empty, Image } from 'antd'

import type { Album, Photo } from '../types'
import { getAlbum, listPhotos } from '../apis/album'
import Loader from '../components/Loader'
import { useAuth } from '../auth/AuthContext'
import { cn } from '../lib/cn'

function normalizePhotos(data: unknown): Photo[] {
  if (Array.isArray(data)) return data as Photo[]
  const maybe = data as { photos?: Photo[] }
  return maybe.photos ?? []
}

function getPhotoLayout(index: number) {
  if (index === 0) return 'col-span-2 row-span-2'
  if (index % 7 === 3) return 'row-span-2'
  if (index % 7 === 5) return 'md:col-span-2'
  return ''
}

function PhotoArchiveCard({ photo, index, albumName, className }: { photo: Photo; index: number; albumName: string; className?: string }) {
  const code = String(index + 1).padStart(3, '0')

  return (
    <figure
      className={cn(
        'group relative h-full min-h-0 overflow-hidden border border-hairline bg-primary/70 transition-[transform,border-color,filter] duration-500 ease-out hover:-translate-y-1 hover:border-accent/70 hover:brightness-125 [clip-path:polygon(0_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%)]',
        className,
      )}
    >
      <Image
        src={photo.imageUrl}
        alt={photo.description || albumName}
        loading="lazy"
        classNames={{
          root: 'block h-full w-full',
          image: 'h-full w-full object-cover transition-[transform,filter] duration-700 ease-out group-hover:scale-[1.06] group-hover:brightness-110',
        }}
        styles={{ root: { height: '100%' }, image: { height: '100%', objectFit: 'cover' } }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.06]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '30px 30px',
        }}
      />
      <div className="pointer-events-none absolute inset-0 z-10 bg-gradient-to-t from-canvas via-canvas/5 to-transparent opacity-80 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 z-10 bg-[radial-gradient(circle_at_50%_42%,rgba(255,255,255,0.14),transparent_68%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-center justify-between p-3 md:p-4">
        <span className="border border-accent/50 bg-canvas/70 px-2 py-1 text-[9px] font-black uppercase tracking-[0.28em] text-accent backdrop-blur-sm">
          Photo / {code}
        </span>
        <span className="text-[9px] font-black uppercase tracking-[0.24em] text-text-primary/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          View ↗
        </span>
      </div>

      <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex items-end justify-between gap-4 p-3 md:p-4">
        <p className="line-clamp-2 max-w-[75%] text-xs font-bold leading-relaxed text-text-primary md:text-sm">
          {photo.description || 'Untitled frame'}
        </p>
        <span className="h-px w-8 shrink-0 bg-accent transition-[width] duration-500 group-hover:w-14" />
      </figcaption>
    </figure>
  )
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

  const albumCode = String(album.id).padStart(2, '0')

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link to="/albums" className="group inline-flex min-h-11 items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary transition-colors hover:text-accent">
          <span aria-hidden="true" className="text-base text-accent transition-transform group-hover:-translate-x-1">←</span>
          返回相册集
        </Link>
        <span className="hidden text-[9px] font-black uppercase tracking-[0.34em] text-text-secondary sm:block">
          Archive / Album {albumCode}
        </span>
      </div>

      <section className="relative overflow-hidden border border-hairline bg-primary/60 p-6 md:p-10 [clip-path:polygon(0_0,100%_0,100%_calc(100%-24px),calc(100%-24px)_100%,0_100%)]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
          }}
        />
        {album.coverUrl && (
          <img
            src={album.coverUrl}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute right-0 top-0 h-full w-1/2 object-cover opacity-20 mix-blend-luminosity [mask-image:linear-gradient(to_left,black,transparent)]"
          />
        )}
        <span aria-hidden="true" className="pointer-events-none absolute -right-2 -top-8 select-none text-[clamp(6rem,18vw,13rem)] font-black uppercase leading-none tracking-[-0.1em] text-white/[0.035]">
          {albumCode}
        </span>

        <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3 text-[9px] font-black uppercase tracking-[0.34em]">
              <span className="h-2 w-2 bg-accent" />
              <span className="text-accent">Album Archive</span>
              <span className="text-text-secondary">/ Frames {albumCode}</span>
            </div>
            <h1 className="mt-5 max-w-4xl text-4xl font-black uppercase leading-[0.92] tracking-[-0.035em] text-text-primary md:text-6xl">
              {album.name}
            </h1>
            {album.description && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-text-secondary md:text-base">{album.description}</p>}
          </div>

          <div className="flex shrink-0 gap-2">
            <div className="border border-hairline bg-canvas/55 px-5 py-4 backdrop-blur-sm">
              <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary">Photos</span>
              <strong className="mt-2 block text-3xl font-black leading-none text-accent">{String(photos.length).padStart(2, '0')}</strong>
            </div>
            <div className="border border-hairline bg-canvas/55 px-5 py-4 backdrop-blur-sm">
              <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary">Index</span>
              <strong className="mt-2 block text-3xl font-black leading-none text-text-primary">{albumCode}</strong>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-hairline pb-4">
        <div>
          <span className="text-[9px] font-black uppercase tracking-[0.38em] text-accent">Image Index</span>
          <h2 className="mt-2 text-2xl font-black uppercase tracking-[-0.02em] text-text-primary md:text-3xl">相片档案</h2>
        </div>
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">{String(photos.length).padStart(3, '0')} Frames Stored</span>
      </div>

      {photos.length === 0 ? (
        <section className="relative overflow-hidden border border-hairline bg-primary/60 p-6 md:p-10 [clip-path:polygon(0_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%)]">
          <Empty description="该相集暂无相片" />
        </section>
      ) : (
        <Image.PreviewGroup>
          <div className="grid auto-rows-[150px] grid-cols-2 gap-3 sm:auto-rows-[180px] lg:auto-rows-[220px] lg:grid-cols-4">
            {photos.map((photo, index) => (
              <PhotoArchiveCard key={photo.id} photo={photo} index={index} albumName={album.name} className={getPhotoLayout(index)} />
            ))}
          </div>
        </Image.PreviewGroup>
      )}
    </div>
  )
}