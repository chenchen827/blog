import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { AlbumWall, DepthCarousel, EmptyState, InfiniteMenu } from "@repo/shared";

import type { Album } from "../types";
import { listAlbums } from "../apis/album";
import SectionHeader from "../components/SectionHeader";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";
import { usePersonalization } from "../hooks/usePersonalization";

export default function Albums() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { accessCode } = useParams<{ accessCode?: string }>();
  const { personalization, loading: personalizationLoading } = usePersonalization();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user && !accessCode) return;
    let active = true;
    setLoading(true);
    listAlbums()
      .then((res) => {
        if (active) setAlbums(res.data.albums ?? []);
      })
      .catch(() => {
        if (active) setAlbums([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessCode, user]);

  if (authLoading) return <Loader />;

  if (!user && !accessCode) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="登录后可浏览与整理你的相集。" />
        <EmptyState
          code="AUTH"
          title="请先登录"
          description="相册集仅对登录用户开放。"
          action={
            <Link
              to="/login"
              className="inline-flex items-center justify-center rounded-none bg-accent px-8 py-3 text-sm font-black uppercase tracking-wide text-ink transition-[filter] hover:brightness-90"
            >
              去登录
            </Link>
          }
        />
      </div>
    );
  }

  if (loading || personalizationLoading) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
        <Loader />
      </div>
    );
  }

  if (albums.length === 0) {
    return (
      <div className="space-y-8">
        <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
        <EmptyState code="ALBUM" title="暂无相集" description="还没有创建任何相集。" />
      </div>
    );
  }

  const collectionTemplate = personalization?.collectionTemplate ?? "Record";
  const collectionBasePath = accessCode ? `/personalizations/${accessCode}` : "/albums";
  const coverAlbums = albums.filter((album) => Boolean(album.coverUrl));

  if (collectionTemplate === "DepthCarousel") {
    const items = coverAlbums.map((album) => ({
      id: album.id,
      image: album.coverUrl!,
      alt: album.name,
      title: album.name,
      description: album.description || "No description archived.",
    }));
    if (items.length === 0) {
      return (
        <div className="space-y-8">
          <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
          <EmptyState code="COVER" title="相集缺少封面" description="请先为相集设置封面，再浏览该模板。" />
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-20 overflow-hidden bg-transparent">
        <DepthCarousel
          items={items}
          cardWidth={500}
          cardHeight={700}
          loop
          autoplay
          onItemClick={(_index: number, item: { id?: number }) => {
            if (item?.id) navigate(`${collectionBasePath}/${item.id}`);
          }}
        />
      </div>
    );
  }

  if (collectionTemplate === "InfiniteMenu") {
    const items = coverAlbums.map((album) => ({
      id: album.id,
      image: album.coverUrl!,
      title: album.name,
      description: album.description || "Album archive",
    }));
    if (items.length === 0) {
      return (
        <div className="space-y-8">
          <SectionHeader code="ALBUM" title="个人相册集" desc="浏览与整理你的相集。" />
          <EmptyState code="COVER" title="相集缺少封面" description="请先为相集设置封面，再浏览该模板。" />
        </div>
      );
    }
    return (
      <div className="fixed inset-0 z-20 overflow-hidden bg-transparent">
        <InfiniteMenu
          items={items}
          scale={1}
          itemScale={0.3}
          backgroundColor="transparent"
          onItemClick={(item: { id?: number }) => {
            if (item?.id) navigate(`${collectionBasePath}/${item.id}`);
          }}
        />
      </div>
    );
  }

  return <AlbumWall albums={albums} basePath={collectionBasePath} />;
}
