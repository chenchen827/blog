import { useRef, useState } from "react";
import { Alert, App, Button, Form, Image, Input, Modal, Spin } from "antd";
import { useNavigate } from "react-router";

import { createAlbum, deleteAlbum, updateAlbum } from "../../apis/albums";
import type { Album } from "../../apis/albums";
import { uploadImageToAliyun } from "../../apis/upload";
import { EmptyState } from "@repo/shared";
import AlbumListView from "./AlbumListView";
import AlbumShelfView from "./AlbumShelfView";
import { useAlbums } from "./useAlbums";

interface AlbumFormValues {
  name: string;
  description?: string;
  coverUrl?: string;
}

export default function AlbumListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [form] = Form.useForm<AlbumFormValues>();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const { albums, loading, error, load, clearError } = useAlbums();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Album | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [view, setView] = useState<"shelf" | "list">("shelf");

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ name: "", description: "", coverUrl: "" });
    setModalOpen(true);
  };

  const openEdit = (album: Album) => {
    setEditing(album);
    form.resetFields();
    form.setFieldsValue({
      name: album.name,
      description: album.description ?? "",
      coverUrl: album.coverUrl ?? "",
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    form.resetFields();
  };

  const openPhotos = (album: Album) => {
    navigate(`/photos/list?albumId=${album.id}`);
  };

  const handleSave = async (values: AlbumFormValues) => {
    setSaving(true);
    try {
      const payload = {
        name: values.name.trim(),
        description: values.description?.trim() || "",
        coverUrl: values.coverUrl?.trim() || "",
      };
      if (editing) {
        await updateAlbum(editing.id, payload);
        message.success("相集已更新");
      } else {
        await createAlbum(payload);
        message.success("相集已创建");
      }
      setModalOpen(false);
      form.resetFields();
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAlbum(id);
      message.success("相集已删除");
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const handleCoverFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToAliyun(file);
      form.setFieldValue("coverUrl", url);
      message.success("封面已上传");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "封面上传失败");
    } finally {
      setUploading(false);
    }
  };

  const coverUrl = Form.useWatch("coverUrl", form);

  if (loading && albums.length === 0) {
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
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">相集管理</h1>
          <p className="mt-2 text-sm text-text-secondary">管理相集及其封面，进入相片管理后可维护相片。</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex border border-hairline bg-primary p-0.5">
            <button
              type="button"
              onClick={() => setView("shelf")}
              className={
                view === "shelf"
                  ? "h-9 border border-transparent bg-accent px-3 text-xs font-black uppercase tracking-wider text-ink"
                  : "h-9 border border-transparent px-3 text-xs font-black uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
              }
            >
              书架
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              className={
                view === "list"
                  ? "h-9 border border-transparent bg-accent px-3 text-xs font-black uppercase tracking-wider text-ink"
                  : "h-9 border border-transparent px-3 text-xs font-black uppercase tracking-wider text-text-secondary transition-colors hover:text-text-primary"
              }
            >
              列表
            </button>
          </div>
          <Button type="primary" onClick={openCreate}>
            新增相集
          </Button>
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={clearError} />}

      {!loading && albums.length === 0 ? (
        <EmptyState
          code="ALBUM"
          title="暂无相集"
          description="创建一个相集，把零散的图片归档成完整的故事线。"
          action={
            <Button type="primary" onClick={openCreate}>
              新增相集
            </Button>
          }
        />
      ) : view === "shelf" ? (
        <div className="space-y-4">
          {/* <p className="flex items-center gap-2 text-xs text-text-secondary">
            <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-accent" />
            悬停展开成书，点击书页翻页，点击封面合上；翻开后的背面可进入相片 / 编辑 / 删除。
          </p> */}
          <AlbumShelfView albums={albums} onOpenPhotos={openPhotos} onEdit={openEdit} onDelete={handleDelete} />
        </div>
      ) : (
        <AlbumListView albums={albums} onOpenPhotos={openPhotos} onEdit={openEdit} onDelete={handleDelete} />
      )}

      <Modal
        title={editing ? "编辑相集" : "新增相集"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<AlbumFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="name" label="相集名称" rules={[{ required: true, whitespace: true, message: "请输入相集名称" }]}>
            <Input placeholder="请输入相集名称" maxLength={45} showCount />
          </Form.Item>
          <Form.Item name="coverUrl" label="封面地址">
            <Input
              placeholder="封面图片 URL，可手动输入或点击右侧上传"
              addonAfter={
                <Button type="primary" loading={uploading} onClick={() => coverInputRef.current?.click()}>
                  上传封面
                </Button>
              }
            />
          </Form.Item>
          {coverUrl ? (
            <div className="mb-4">
              <Image src={coverUrl} alt="封面预览" width={160} style={{ borderRadius: 0 }} />
            </div>
          ) : null}
          <Form.Item name="description" label="相集描述">
            <Input.TextArea placeholder="请输入相集描述" autoSize={{ minRows: 2, maxRows: 4 }} />
          </Form.Item>
        </Form>
      </Modal>

      <input ref={coverInputRef} type="file" accept="image/*" className="hidden" onChange={handleCoverFile} />
    </section>
  );
}
