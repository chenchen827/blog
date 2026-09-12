import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { Image } from "antd";
import { DomeGallery, DriftWall, EmptyState, Masonry, PhotoWall } from "@repo/shared";

import type { Album, Photo } from "../types";
import { getAlbum, listPhotos } from "../apis/album";
import Loader from "../components/Loader";
import { useAuth } from "../auth/AuthContext";
import { usePersonalization } from "../hooks/usePersonalization";

function normalizePhotos(data: unknown): Photo[] {
  if (Array.isArray(data)) return data as Photo[];
  const maybe = data as { photos?: Photo[] };
  return maybe.photos ?? [];
}

export default function AlbumDetail() {
  const { id, accessCode } = useParams<{ id?: string; accessCode?: string }>();
  const { user, loading: authLoading } = useAuth();
  const { personalization } = usePersonalization();

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailPhoto, setDetailPhoto] = useState<Photo | null>(null);

  useEffect(() => {
    if (!id || (!user && !accessCode)) return;
    let active = true;
    setLoading(true);
    Promise.all([getAlbum(id), listPhotos(id)])
      .then(([albumRes, photoRes]) => {
        if (!active) return;
        setAlbum(albumRes.data.album);
        setPhotos(normalizePhotos(photoRes.data));
      })
      .catch(() => {
        if (active) {
          setAlbum(null);
          setPhotos([]);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [accessCode, id, user]);

  if (authLoading) return <Loader />;

  const albumBasePath = accessCode ? `/personalizations/${accessCode}` : "/albums";

  if (!user && !accessCode) {
    return (
      <div className="space-y-6">
        <Link to={albumBasePath} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
          ← 返回相册集
        </Link>
        <p className="text-base text-text-secondary">
          请先登录后查看相集详情。<Link to="/login" className="text-accent hover:underline">去登录</Link>
        </p>
      </div>
    );
  }

  if (loading) return <Loader />;

  if (!album) {
    return (
      <div className="space-y-6">
        <Link to={albumBasePath} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
          ← 返回相册集
        </Link>
        <p className="text-base text-text-secondary">未找到该相集。</p>
      </div>
    );
  }

  const albumCode = String(album.id).padStart(2, "0");
  const albumTemplate = personalization?.albumTemplate ?? "Default";
  const imagePhotos = photos.filter((photo): photo is Photo & { imageUrl: string } => Boolean(photo.imageUrl));

  const masonryItems = imagePhotos.map((photo, index) => ({
    id: String(photo.id),
    img: photo.imageUrl,
    url: photo.imageUrl,
    width: 900,
    height: index % 3 === 0 ? 1200 : index % 3 === 1 ? 900 : 1050,
  }));
  const driftItems = imagePhotos.map((photo) => ({
    id: String(photo.id),
    image: photo.imageUrl,
    title: photo.description || `Frame ${photo.id}`,
    description: photo.description,
  }));
  const domeImages = imagePhotos.map((photo) => ({
    src: photo.imageUrl,
    alt: photo.description || `Frame ${photo.id}`,
  }));

  const toDetailPhoto = (item: { id?: string | number; img?: string; image?: string; url?: string; title?: string; description?: string | null }): Photo => {
    const id = Number(item.id ?? 0);
    const existing = imagePhotos.find((photo) => photo.id === id);
    if (existing) return existing;
    return {
      id,
      imageUrl: item.img ?? item.image ?? item.url,
      description: item.description ?? item.title ?? null,
    };
  };

  function renderPhotoTemplate() {
    if (albumTemplate !== "Default" && imagePhotos.length === 0) {
      return <EmptyState code="PHOTO" title="暂无相片" description="该相集暂无可用相片。" className="h-full min-h-0!" />;
    }

    if (albumTemplate === "Masonry") {
      return (
        <Masonry
          items={masonryItems}
          animateFrom="bottom"
          onItemClick={(item: { id?: string | number; img?: string; url?: string; description?: string | null }) => setDetailPhoto(toDetailPhoto(item))}
        />
      );
    }

    if (albumTemplate === "DriftWall") {
      return (
        <DriftWall
          items={driftItems}
          columns={5}
          overlayColor="transparent"
          onItemClick={(item: { id?: string | number; image?: string; title?: string; description?: string | null }) => setDetailPhoto(toDetailPhoto(item))}
        />
      );
    }

    if (albumTemplate === "DomeGallery") {
      return <DomeGallery images={domeImages} overlayBlurColor="transparent" grayscale={false} />;
    }

    return <PhotoWall photos={photos} albumName={album?.name ?? ""} />;
  }

  if (albumTemplate !== "Default") {
    const masonryLayout = albumTemplate === "Masonry";
    const driftWallLayout = albumTemplate === "DriftWall";
    const glassLayout = masonryLayout || driftWallLayout;
    const panelClass = masonryLayout
      ? "relative h-full w-full overflow-hidden rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur-xl md:p-6"
      : driftWallLayout
        ? "relative h-full w-full overflow-hidden bg-white/[0.06] backdrop-blur-xl"
        : "h-full w-full";
    return (
      <div className={`fixed inset-0 z-20 overflow-hidden ${glassLayout ? (masonryLayout ? "p-4 md:p-6" : "") : "bg-transparent"}`}>
        <div className={panelClass}>
          <Link
            to={albumBasePath}
            className="absolute left-4 top-14 z-30 inline-flex min-h-11 items-center gap-2 border border-white/20 bg-black/20 px-4 text-[10px] font-black uppercase tracking-[0.24em] text-text-primary backdrop-blur-sm transition-colors hover:border-accent hover:text-accent md:left-7 md:top-16"
          >
            ← 返回相册集
          </Link>
          {renderPhotoTemplate()}
        </div>

        {detailPhoto ? (
          <Image
            src={detailPhoto.imageUrl}
            alt={detailPhoto.description || "相片"}
            style={{ display: "none" }}
            preview={{
              open: true,
              onOpenChange: (open) => {
                if (!open) setDetailPhoto(null);
              },
            }}
          />
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      <div className="flex items-center justify-between gap-4">
        <Link to={albumBasePath} className="group inline-flex min-h-11 items-center gap-2 text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary transition-colors hover:text-accent">
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
            backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "34px 34px",
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
              <strong className="mt-2 block text-3xl font-black leading-none text-accent">{String(photos.length).padStart(2, "0")}</strong>
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
        <span className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">{String(photos.length).padStart(3, "0")} Frames Stored</span>
      </div>

      <div>
        {renderPhotoTemplate()}
      </div>
    </div>
  );
}
