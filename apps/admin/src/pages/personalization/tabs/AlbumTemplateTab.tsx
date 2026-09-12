import { useCallback, useEffect, useState } from "react";
import { App, Select, Spin } from "antd";
import { AlbumWall, DepthCarousel, EmptyState, InfiniteMenu } from "@repo/shared";

import { listAlbums } from "../../../apis/albums";
import type { Album } from "../../../apis/albums";
import { updatePersonalization } from "../../../apis/personalization";
import type { CollectionTemplate, Personalization } from "../../../apis/personalization";

interface AlbumTemplateTabProps {
  personalization: Personalization;
  onSaved: (next: Personalization) => void;
}

const TEMPLATE_OPTIONS: Array<{ label: string; value: CollectionTemplate }> = [
  { label: "Record", value: "Record" },
  { label: "Depth Carousel", value: "DepthCarousel" },
  { label: "Infinite Menu", value: "InfiniteMenu" },
];

const BLOG_BASE_URL = (import.meta.env.VITE_BLOG_BASE_URL ?? "http://localhost:5173").replace(/\/$/, "");

export default function AlbumTemplateTab({ personalization, onSaved }: AlbumTemplateTabProps) {
  const { message } = App.useApp();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const template = personalization.collectionTemplate;

  const loadAlbums = useCallback(async () => {
    setLoading(true);
    try {
      const res = await listAlbums();
      setAlbums(res.data.albums ?? []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载相集失败");
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  const handleTemplateChange = async (value: CollectionTemplate) => {
    setSaving(true);
    try {
      const res = await updatePersonalization({ collectionTemplate: value });
      onSaved(res.data.personalization ?? personalization);
      message.success("相集模板已更新");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "更新相集模板失败");
    } finally {
      setSaving(false);
    }
  };

  const previewAlbums = albums.filter((album) => Boolean(album.coverUrl));
  const carouselItems = previewAlbums.map((album) => ({
    id: album.id,
    image: album.coverUrl!,
    alt: album.name,
    title: album.name,
    description: album.description || "No description archived.",
  }));

  const infiniteMenuItems = previewAlbums.map((album) => ({
    id: album.id,
    image: album.coverUrl!,
    link: `${BLOG_BASE_URL}/albums/${album.id}`,
    title: album.name,
    description: album.description || "Album archive",
  }));

  const openAlbumPage = (albumId: number) => {
    window.open(`${BLOG_BASE_URL}/albums/${albumId}`, "_blank", "noopener,noreferrer");
  };

  function renderPreview() {
    if (loading) {
      return (
        <div className="flex h-[560px] items-center justify-center">
          <Spin />
        </div>
      );
    }

    if (albums.length === 0) {
      return <EmptyState code="ALBUM" title="暂无相集" description="请先在相集管理中创建相集，再回来预览模板效果。" className="min-h-[560px]" />;
    }

    if (template === "DepthCarousel") {
      if (carouselItems.length === 0) {
        return <EmptyState code="COVER" title="相集缺少封面" description="请先为相集设置封面，再预览该模板。" className="min-h-[560px]" />;
      }
      return (
        <DepthCarousel
          items={carouselItems}
          cardWidth={500}
          cardHeight={700}
          autoplay
          loop
          className="h-full"
          onItemClick={(_index: number, item: { id?: number }) => {
            if (item?.id) openAlbumPage(item.id);
          }}
        />
      );
    }

    if (template === "InfiniteMenu") {
      if (infiniteMenuItems.length === 0) {
        return <EmptyState code="COVER" title="相集缺少封面" description="请先为相集设置封面，再预览该模板。" className="min-h-[560px]" />;
      }
      return (
        <InfiniteMenu
          items={infiniteMenuItems}
          scale={2}
          itemScale={0.3}
          onItemClick={(item: { id?: number }) => {
            if (item?.id) openAlbumPage(item.id);
          }}
        />
      );
    }

    return <AlbumWall albums={albums} embedded />;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border border-hairline bg-primary/60 p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Collection Template</p>
          <h2 className="mt-2 text-lg font-black uppercase tracking-wide text-text-primary">相集模板预览</h2>
          <p className="mt-1 text-sm text-text-secondary">切换模板后即时在下方展示对应效果。</p>
        </div>
        <Select
          value={template}
          loading={saving}
          options={TEMPLATE_OPTIONS}
          onChange={handleTemplateChange}
          style={{ width: 240 }}
        />
      </div>

      <div className="relative h-[560px] overflow-hidden border border-hairline bg-canvas">{renderPreview()}</div>
    </section>
  );
}
