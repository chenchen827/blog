import { Button, Popconfirm } from "antd";

import { Book } from "@repo/shared";
import type { BookPage } from "@repo/shared";
import type { Album } from "../../apis/albums";

/** 每一摞“相册书”最多容纳的相集数（外加 1 页书架封面） */
const ALBUMS_PER_STACK = 6;

/** 把相集按固定数量分组，每组渲染成一摞可翻页的书 */
function chunkAlbums<T>(items: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

function padNo(value: number): string {
  return String(value).padStart(2, "0");
}

/** 单本相集封面：封面图或占位图 */
function AlbumPageFront({ album, no }: { album: Album; no: string }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden">
      {album.coverUrl ? (
        <img src={album.coverUrl} alt={album.name} className="absolute inset-0 h-full w-full object-cover" />
      ) : (
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#1b1b1b] via-[#101010] to-[#0a0a0a]" />
      )}
      {/* 底部压暗，保证文字可读 */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/80 to-transparent" />
      <span className="relative self-end p-3 text-[9px] font-black uppercase tracking-[0.4em] text-accent">Album · {no}</span>
      <span className="relative max-w-full truncate p-3 pt-0 text-sm font-black uppercase tracking-wide text-text-primary">{album.name}</span>
    </div>
  );
}

/** 相集翻开后的背面：相集信息 + 管理操作 */
function AlbumPageBack({
  album,
  no,
  onOpenPhotos,
  onEdit,
  onDelete,
}: {
  album: Album;
  no: string;
  onOpenPhotos: (album: Album) => void;
  onEdit: (album: Album) => void;
  onDelete: (id: number) => void;
}) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden bg-gradient-to-b from-[#151515] to-[#0c0c0c] p-4">
      <div className="flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Issue · {no}</span>
        <span aria-hidden="true" className="text-accent">
          //
        </span>
      </div>

      <div className="relative">
        <h3 className="text-base font-black uppercase leading-tight text-text-primary">{album.name}</h3>
        <p className="mt-2 line-clamp-3 text-xs leading-relaxed text-text-secondary">{album.description || "—"}</p>
        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">
          <span className="text-accent">{album.photosCount ?? 0}</span> Photos
        </p>
      </div>

      <div className="relative flex flex-col gap-2">
        <Button type="primary" size="small" block onClick={() => onOpenPhotos(album)}>
          进入相片
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button size="small" block onClick={() => onEdit(album)}>
            编辑
          </Button>
          <Popconfirm title="确定删除该相集？" onConfirm={() => onDelete(album.id)}>
            <Button size="small" danger block>
              删除
            </Button>
          </Popconfirm>
        </div>
      </div>
    </div>
  );
}

/** 书架封面（整摞相册书的正面，不绑定具体相集） */
function StackCover({ stackIndex, count }: { stackIndex: number; count: number }) {
  return (
    <div className="relative flex h-full w-full flex-col justify-between overflow-hidden p-5">
      <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-br from-[#222222] via-[#111111] to-[#070707]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
          backgroundSize: "26px 26px",
        }}
      />
      <div className="relative flex items-start justify-between text-[9px] font-black uppercase tracking-[0.4em] text-text-secondary">
        <span>Album Archive</span>
        <span aria-hidden="true" className="text-accent">
          ∅
        </span>
      </div>
      <div className="relative">
        <span className="block text-[40px] font-black uppercase leading-none tracking-[-0.02em] text-text-primary">Stack</span>
        <span className="mt-1 block text-[40px] font-black uppercase leading-none tracking-[-0.02em] text-accent">{padNo(stackIndex + 1)}</span>
        <span aria-hidden="true" className="mt-4 block h-1 w-10 bg-accent" />
      </div>
      <div className="relative flex items-end justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{count} Albums</span>
        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-text-secondary">Hover to Flip</span>
      </div>
    </div>
  );
}

interface AlbumShelfViewProps {
  albums: Album[];
  onOpenPhotos: (album: Album) => void;
  onEdit: (album: Album) => void;
  onDelete: (id: number) => void;
}

/** 书架视图：把相集按组渲染成一摞摞可翻页的“相册书” */
export default function AlbumShelfView({ albums, onOpenPhotos, onEdit, onDelete }: AlbumShelfViewProps) {
  const stacks = chunkAlbums(albums, ALBUMS_PER_STACK);

  return (
    <div className="space-y-12 overflow-auto">
      {stacks.map((stack, stackIndex) => {
        const pages: BookPage[] = [
          ...stack.map((album, index) => {
            const no = padNo(stackIndex * ALBUMS_PER_STACK + index + 1);
            return {
              id: `${stackIndex}-${album.id}`,
              label: `相集 ${no}：${album.name}`,
              front: <AlbumPageFront album={album} no={no} />,
              back: <AlbumPageBack album={album} no={no} onOpenPhotos={onOpenPhotos} onEdit={onEdit} onDelete={onDelete} />,
            };
          }),
          {
            id: `stack-${stackIndex}-cover`,
            label: `书架封面（第 ${stackIndex + 1} 摞）`,
            front: <StackCover stackIndex={stackIndex} count={stack.length} />,
          },
        ];

        return (
          <section key={stackIndex} aria-label={`相册书架 ${padNo(stackIndex + 1)}`}>
            <div className="mb-4 flex items-center gap-3">
              <span className="text-[10px] font-black uppercase tracking-[0.45em] text-text-secondary">Archive Stack {padNo(stackIndex + 1)}</span>
              <span aria-hidden="true" className="h-1.5 w-1.5 bg-accent" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary">{stack.length} Albums</span>
              <div aria-hidden="true" className="h-px flex-1 bg-hairline" />
            </div>
            <div className="overflow-x-auto px-4 py-2">
              <div className="mx-auto w-max">
                <Book pages={pages} width={210} height={296} />
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
