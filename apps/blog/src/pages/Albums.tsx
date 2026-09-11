import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { EmptyState } from '@repo/shared'

import type { Album } from '../types'
import { listAlbums } from '../apis/album'
import AlbumWall from '../components/AlbumWall'
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

  if (loading) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
        <Loader />
      </div>
    )
  }

  if (albums.length === 0) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
        <EmptyState code="ALBUM" title="暂无相集" description="还没有创建任何相集。" />
      </div>
    )
  }

  return <AlbumWall albums={albums} />
}
