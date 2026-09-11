import { EmptyState } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Grid, Image, Popconfirm, Space, Table, Typography } from "antd";
import type { TableProps } from "antd";
import { deleteAttachment, listAttachments } from "../../apis/attachments";
import { formatFileSize } from "../../utils/tool";
import type { Attachment } from "../../apis/types";

export default function AttachmentListPage() {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;

  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const load = useCallback(
    async (current: number, pageSize: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await listAttachments({ currentPage: current, pageSize });
        setAttachments(res.data.attachments);
        setPagination({
          current: res.data.pagination.currentPage,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载附件列表失败";
        setError(msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  useEffect(() => {
    void load(1, 10);
  }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await deleteAttachment(id);
      message.success("附件已删除");
      void load(pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除附件失败");
    }
  };

  const columns: TableProps<Attachment>["columns"] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    {
      key: "preview",
      title: "预览",
      width: 80,
      render: (_, record) =>
        record.mimetype?.startsWith("image/") ? (
          <Image src={record.url} alt={record.originalname} width={48} height={48} style={{ objectFit: "cover", borderRadius: 0 }} />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-soft text-xs font-bold text-text-secondary">FILE</div>
        ),
    },
    { key: "originalname", title: "原文件名", dataIndex: "originalname", ellipsis: true },
  ];

  if (!isCompact) {
    columns.push(
      { key: "mimetype", title: "类型", dataIndex: "mimetype", width: 120 },
      { key: "size", title: "大小", dataIndex: "size", width: 100, render: (value: string | number) => formatFileSize(value) },
      {
        key: "url",
        title: "文件链接",
        width: 120,
        render: (_, record) => (
          <Typography.Link href={record.url} target="_blank" rel="noreferrer">
            打开
          </Typography.Link>
        ),
      },
      { key: "createdAt", title: "上传时间", dataIndex: "createdAt", width: 180 },
    );
  }

  columns.push({
    key: "actions",
    title: "操作",
    width: 140,
    render: (_, record) => (
      <Space size="small">
        <Popconfirm title="删除后不可恢复,确定删除该附件？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  });

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">附件管理</h1>
        <p className="mt-2 text-base text-text-secondary">查看并删除已上传到阿里云 OSS 的附件。</p>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <Table<Attachment>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={attachments}
        locale={{ emptyText: <EmptyState title="暂无附件" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(nextPagination) => {
          void load(nextPagination.current ?? 1, nextPagination.pageSize ?? pagination.pageSize);
        }}
        scroll={isCompact ? undefined : { x: 960 }}
      />
    </section>
  );
}
