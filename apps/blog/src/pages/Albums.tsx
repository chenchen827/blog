import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@repo/shared'

import type { Album } from '../types'
import { listAlbums } from '../apis/album'
import AlbumCard from '../components/AlbumCard'
import SectionHeader from '../components/SectionHeader'
import Loader from '../components/Loader'
import { useAuth } from '../auth/AuthContext'

export default function Albums() {
  const { user, loading: authLoading } = useAuth()
  const [albums, setAlbums] = useState<Album[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    let active = true
    setLoading(true)
    listAlbums()
      .then((res) => {
        if (active) setAlbums(res.data.albums ?? [])
      })
      .catch(() => {
        if (active) setAlbums([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [user])

  if (authLoading) return <Loader />

  if (!user) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="登录后可浏览与整理你的相集。" />
        <EmptyState
          code="AUTH"
          title="请先登录"
          description="相册集仅对登录用户开放。"
          action={
            <Link to="/login" className="inline-flex items-center justify-center rounded-none bg-accent px-8 py-3 text-sm font-black uppercase tracking-wide text-ink transition-[filter] hover:brightness-90">
              去登录
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />

      {loading ? (
        <Loader />
      ) : albums.length === 0 ? (
        <EmptyState code="ALBUM" title="暂无相集" description="还没有创建任何相集。" />
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <AlbumCard key={album.id} album={album} />
          ))}
        </div>
      )}
    </div>
  )
}
