import { useCallback, useEffect, useState } from "react";
import { App, Image, Modal, Select, Spin } from "antd";
import { DomeGallery, DriftWall, EmptyState, Masonry, PhotoWall } from "@repo/shared";

import { listAlbums } from "../../../apis/albums";
import type { Album } from "../../../apis/albums";
import { listPhotos } from "../../../apis/photos";
import type { Photo, PhotoListData } from "../../../apis/photos";
import { updatePersonalization } from "../../../apis/personalization";
import type { AlbumTemplate, Personalization } from "../../../apis/personalization";

interface PhotoWallTemplateTabProps {
  personalization: Personalization;
  onSaved: (next: Personalization) => void;
}

interface PreviewPhoto {
  id: number;
  imageUrl?: string;
  description?: string | null;
}

const TEMPLATE_OPTIONS: Array<{ label: string; value: AlbumTemplate }> = [
  { label: "Default", value: "Default" },
  { label: "Masonry", value: "Masonry" },
  { label: "Drift Wall", value: "DriftWall" },
  { label: "Dome Gallery", value: "DomeGallery" },
];

function normalizePhotos(data: PhotoListData | Photo[]): Photo[] {
  if (Array.isArray(data)) return data;
  return data.photos ?? [];
}

export default function PhotoWallTemplateTab({ personalization, onSaved }: PhotoWallTemplateTabProps) {
  const { message } = App.useApp();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [albumsLoading, setAlbumsLoading] = useState(true);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosLoading, setPhotosLoading] = useState(false);
  const [activeAlbumId, setActiveAlbumId] = useState<number | undefined>();
  const [saving, setSaving] = useState(false);
  const [detailPhoto, setDetailPhoto] = useState<PreviewPhoto | null>(null);

  const template = personalization.albumTemplate;
  const activeAlbum = albums.find((album) => album.id === activeAlbumId);

  const loadAlbums = useCallback(async () => {
    setAlbumsLoading(true);
    try {
      const res = await listAlbums();
      const nextAlbums = res.data.albums ?? [];
      setAlbums(nextAlbums);
      setActiveAlbumId((current) => current ?? personalization.lifeAlbumId ?? nextAlbums[0]?.id);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载相集失败");
    } finally {
      setAlbumsLoading(false);
    }
  }, [message, personalization.lifeAlbumId]);

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    if (!activeAlbumId) {
      setPhotos([]);
      return;
    }

    let active = true;
    setPhotosLoading(true);
    listPhotos(activeAlbumId)
      .then((res) => {
        if (active) setPhotos(normalizePhotos(res.data));
      })
      .catch((err) => {
        if (active) message.error(err instanceof Error ? err.message : "加载相片失败");
      })
      .finally(() => {
        if (active) setPhotosLoading(false);
      });

    return () => {
      active = false;
    };
  }, [activeAlbumId, message]);

  const handleTemplateChange = async (value: AlbumTemplate) => {
    setSaving(true);
    try {
      const res = await updatePersonalization({ albumTemplate: value });
      onSaved(res.data.personalization ?? personalization);
      message.success("照片墙模板已更新");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "更新照片墙模板失败");
    } finally {
      setSaving(false);
    }
  };

  const previewPhotos: PreviewPhoto[] = photos.filter((photo): photo is Photo & { imageUrl: string } => Boolean(photo.imageUrl));
  const masonryItems = previewPhotos.map((photo, index) => ({
    id: String(photo.id),
    img: photo.imageUrl,
    url: photo.imageUrl,
    description: photo.description,
    width: 900,
    height: index % 3 === 0 ? 1200 : index % 3 === 1 ? 900 : 1050,
  }));
  const driftItems = previewPhotos.map((photo) => ({
    id: String(photo.id),
    image: photo.imageUrl,
    title: photo.description || `Frame ${photo.id}`,
    description: photo.description,
  }));
  const domeImages = previewPhotos.map((photo) => ({
    src: photo.imageUrl,
    alt: photo.description || `Frame ${photo.id}`,
  }));

  const toDetailPhoto = (item: { id?: string | number; image?: string; img?: string; url?: string; description?: string | null; title?: string }): PreviewPhoto => {
    const id = Number(item.id ?? 0);
    const existing = previewPhotos.find((photo) => photo.id === id);
    if (existing) return existing;
    return {
      id,
      imageUrl: item.image ?? item.img ?? item.url ?? "",
      description: item.description ?? item.title ?? null,
    };
  };

  function renderPreview() {
    if (albumsLoading) {
      return (
        <div className="flex h-[560px] items-center justify-center">
          <Spin />
        </div>
      );
    }

    if (albums.length === 0) {
      return <EmptyState code="PHOTO" title="暂无相集" description="请先在相集管理中创建相集并上传相片，再回来预览模板效果。" className="min-h-[560px]" />;
    }

    if (template !== "Default" && previewPhotos.length === 0) {
      return <EmptyState code="PHOTO" title="暂无相片" description="请先为该相集上传相片，再预览该模板。" className="min-h-[560px]" />;
    }

    if (template === "Masonry") {
      return <Masonry items={masonryItems} onItemClick={(item: { id?: string | number }) => setDetailPhoto(toDetailPhoto(item))} />;
    }
    if (template === "DriftWall") {
      return <DriftWall items={driftItems} columns={5} overlayColor="#050505" onItemClick={(item: { id?: string | number }) => setDetailPhoto(toDetailPhoto(item))} />;
    }
    if (template === "DomeGallery") return <DomeGallery images={domeImages} overlayBlurColor="#050505" grayscale={false} />;
    return <PhotoWall photos={photos} albumName={activeAlbum?.name} />;
  }

  return (
    <section className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4 border border-hairline bg-primary/60 p-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-accent">Photo Wall Template</p>
          <h2 className="mt-2 text-lg font-black uppercase tracking-wide text-text-primary">照片墙模板预览</h2>
          <p className="mt-1 text-sm text-text-secondary">切换模板后即时在下方展示对应效果。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="预览相集"
            value={activeAlbumId}
            loading={albumsLoading}
            disabled={albums.length === 0}
            onChange={setActiveAlbumId}
            options={albums.map((album) => ({ label: album.name, value: album.id }))}
            style={{ width: 220 }}
          />
          <Select value={template} loading={saving} options={TEMPLATE_OPTIONS} onChange={handleTemplateChange} style={{ width: 220 }} />
        </div>
      </div>

      <div className="relative h-[560px] overflow-hidden border border-hairline bg-canvas">
        {renderPreview()}
        {photosLoading && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-canvas/20">
            <Spin />
          </div>
        )}
      </div>

      <Modal open={!!detailPhoto} onCancel={() => setDetailPhoto(null)} footer={null} width={760} destroyOnHidden>
        {detailPhoto ? (
          <div className="mt-4">
            <div className="flex max-h-[64vh] items-center justify-center overflow-hidden bg-canvas">
              <Image src={detailPhoto.imageUrl} alt={detailPhoto.description || "相片"} className="max-h-[64vh] w-auto object-contain" />
            </div>
            <div className="mt-5 grid gap-4 border-t border-hairline pt-4 sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">Photo ID</p>
                <p className="mt-2 text-base font-bold text-text-primary">{detailPhoto.id || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">Description</p>
                <p className="mt-2 text-base leading-relaxed text-text-primary">{detailPhoto.description || "未填写描述"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </section>
  );
}
