import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, App, Button, Form, Input, Modal, Popconfirm, Select, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router";

import { listAlbums } from "../../apis/albums";
import type { Album } from "../../apis/albums";
import { createPhoto, deletePhoto, listPhotos, updatePhoto } from "../../apis/photos";
import type { Photo } from "../../apis/photos";
import { uploadImageToAliyun } from "../../apis/upload";
import { EmptyState } from "@repo/shared";
import "./photos.css";

interface PhotoFormValues {
  imageUrl: string;
  description?: string;
}

interface PreviewInfo {
  width?: number;
  height?: number;
  format?: string;
}

function detectFormat(url?: string): string {
  if (!url) return "未知";
  const clean = url.split("?")[0];
  const ext = clean.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    jpg: "JPEG",
    jpeg: "JPEG",
    png: "PNG",
    webp: "WEBP",
    gif: "GIF",
    bmp: "BMP",
    avif: "AVIF",
  };
  return map[ext] ?? (ext ? ext.toUpperCase() : "未知");
}

export default function PhotoListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [form] = Form.useForm<PhotoFormValues>();
  const imageInputRef = useRef<HTMLInputElement>(null);

  const albumIdParam = searchParams.get("albumId");
  const [albumId, setAlbumId] = useState<string | undefined>(albumIdParam ?? undefined);
  const [albumOptions, setAlbumOptions] = useState<Album[]>([]);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Photo | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [previewInfo, setPreviewInfo] = useState<PreviewInfo | null>(null);

  const loadAlbums = useCallback(async () => {
    try {
      const res = await listAlbums();
      setAlbumOptions(res.data.albums ?? []);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载相集失败");
    }
  }, [message]);

  const loadPhotos = useCallback(
    async (id: string | undefined) => {
      if (!id) {
        setPhotos([]);
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await listPhotos(id);
        const data = res.data;
        setPhotos(Array.isArray(data) ? data : (data.photos ?? []));
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载相片失败";
        setError(msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  useEffect(() => {
    void loadPhotos(albumId);
  }, [albumId, loadPhotos]);

  const handleAlbumChange = (value: string) => {
    setAlbumId(value);
    navigate(`/photos/list?albumId=${value}`, { replace: true });
  };

  const openAdd = () => {
    if (!albumId) {
      message.warning("请先选择相集");
      return;
    }
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ imageUrl: "", description: "" });
    setModalOpen(true);
  };

  const openPreview = (photo: Photo) => {
    setPreviewPhoto(photo);
    setPreviewInfo(null);
    const image = new Image();
    image.onload = () => {
      setPreviewInfo({
        width: image.naturalWidth,
        height: image.naturalHeight,
        format: detectFormat(photo.imageUrl),
      });
    };
    image.onerror = () => {
      setPreviewInfo({ format: detectFormat(photo.imageUrl) });
    };
    image.src = photo.imageUrl ?? "";
  };

  const openEdit = (photo: Photo) => {
    setEditing(photo);
    form.resetFields();
    form.setFieldsValue({
      imageUrl: photo.imageUrl ?? "",
      description: photo.description ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: PhotoFormValues) => {
    if (!albumId) return;
    setSaving(true);
    try {
      const payload = {
        imageUrl: values.imageUrl.trim(),
        description: values.description?.trim() || "",
      };
      if (editing) {
        await updatePhoto(editing.id, payload);
        message.success("相片已更新");
      } else {
        await createPhoto({ albumId, ...payload });
        message.success("相片已添加");
      }
      setModalOpen(false);
      form.resetFields();
      void loadPhotos(albumId);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!albumId) return;
    try {
      await deletePhoto(id);
      message.success("相片已删除");
      void loadPhotos(albumId);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleImageFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToAliyun(file);
      form.setFieldValue("imageUrl", url);
      message.success("图片已上传");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "图片上传失败");
    } finally {
      setUploading(false);
    }
  };

  if (loading && photos.length === 0) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin />
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <Button type="link" className="px-0!" onClick={() => navigate("/albums/list")}>
              ← 返回相集
            </Button>
            <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">相片管理</h1>
          </div>
          <p className="mt-2 text-sm text-text-secondary">选择相集后以瀑布流查看相片,双击相片可查看原图,悬停可编辑。</p>
        </div>
        <Button type="primary" disabled={!albumId} onClick={openAdd}>
          新增相片
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <div className="flex flex-wrap items-center gap-4">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="请选择相集"
          value={albumId}
          onChange={handleAlbumChange}
          options={albumOptions.map((album) => ({ label: album.name, value: String(album.id) }))}
          style={{ width: 300 }}
        />
        <span className="text-sm text-text-secondary">{albumId ? `当前相集 ID：${albumId}` : "请先选择相集以加载相片"}</span>
      </div>

      {!albumId ? (
        <EmptyState code="PHOTO" title="请选择相集" description="先从相集管理选择一个相集,相片会以瀑布流陈列在这里。" />
      ) : photos.length === 0 ? (
        <EmptyState
          code="PHOTO"
          title="该相集暂无相片"
          description="上传第一张相片,为这个相集注入视觉信号。"
          action={
            <Button type="primary" onClick={openAdd}>
              新增相片
            </Button>
          }
        />
      ) : (
        <div className="photo-wall columns-1 sm:columns-2 xl:columns-3 2xl:columns-4">
          {photos.map((photo, index) => (
            <div key={photo.id} className="photo-item">
              <div className="photo-polaroid">
                <span className="photo-tape" aria-hidden="true" />
                <button type="button" className="relative block w-full overflow-hidden" onDoubleClick={() => openPreview(photo)} title="双击查看原图">
                  <div className="photo-frame">
                    <img src={photo.imageUrl} alt={photo.description || "相片"} loading="lazy" />
                    {photo.description ? <span className="photo-hover-desc">{photo.description}</span> : null}
                  </div>
                </button>
                <div className="photo-delete">
                  <Popconfirm title="确定删除该相片？" onConfirm={() => handleDelete(photo.id)}>
                    <Button size="small">删除</Button>
                  </Popconfirm>
                </div>
                <div className="photo-edit">
                  <Button type="primary" size="small" onClick={() => openEdit(photo)}>
                    编辑
                  </Button>
                </div>
                <div className="photo-caption">
                  <span className="photo-no">No.{String(index + 1).padStart(3, "0")}</span>
                  <span className="photo-desc">{photo.description || "未命名相片"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        title={editing ? "编辑相片" : "新增相片"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<PhotoFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="imageUrl" label="相片地址" rules={[{ required: true, whitespace: true, message: "请输入相片地址" }]}>
            <Input
              placeholder="图片 URL,可手动输入或点击右侧上传"
              addonAfter={
                <Button type="primary" loading={uploading} onClick={() => imageInputRef.current?.click()}>
                  上传图片
                </Button>
              }
            />
          </Form.Item>
          <Form.Item name="description" label="相片描述">
            <Input.TextArea placeholder="请输入相片描述" autoSize={{ minRows: 2, maxRows: 4 }} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      <Modal title="原图预览" open={!!previewPhoto} onCancel={() => setPreviewPhoto(null)} footer={null} width={860} destroyOnHidden>
        {previewPhoto ? (
          <div className="mt-4">
            <div className="flex max-h-[64vh] items-center justify-center bg-canvas">
              <img src={previewPhoto.imageUrl} alt={previewPhoto.description || "原图"} className="max-h-[64vh] w-auto object-contain" />
            </div>
            <div className="mt-4 grid gap-3 border-t border-hairline pt-4 sm:grid-cols-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">尺寸</p>
                <p className="mt-1 text-base font-bold text-text-primary">
                  {previewInfo?.width && previewInfo?.height ? `${previewInfo.width} × ${previewInfo.height} px` : "加载中…"}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">格式</p>
                <p className="mt-1 text-base font-bold text-accent">{previewInfo?.format ?? "加载中…"}</p>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">描述</p>
                <p className="mt-1 text-base text-text-primary">{previewPhoto.description || "—"}</p>
              </div>
            </div>
          </div>
        ) : null}
      </Modal>

      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageFile} />
    </section>
  );
}
