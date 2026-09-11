import { EmptyState } from "@repo/shared";
import { Alert, App, Button, Grid, Input, Popconfirm, Space, Table } from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router";
import { deleteArticles } from "../../apis/articles";
import { stripHtml } from "../../utils/tool";
import type { Article } from "../../apis/types";
import { useArticleList } from "./useArticleList";

export default function ArticleListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;

  const { articles, loading, error, keyword, pagination, selectedRowKeys, setSelectedRowKeys, load, search, onTableChange, resetSelection, clearError } = useArticleList({
    deleted: false,
  });

  /** 批量删除到回收站 */
  const handleBatchDelete = async () => {
    try {
      await deleteArticles(selectedRowKeys.map(String));
      message.success("已删除到回收站");
      resetSelection();
      void load(keyword, 1, pagination.pageSize);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  /** 单条删除到回收站 */
  const handleDelete = async (id: number) => {
    try {
      await deleteArticles([String(id)]);
      message.success("已删除到回收站");
      setSelectedRowKeys((keys) => keys.filter((key) => key !== id));
      void load(keyword, pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  // 基础列始终保留；内容摘要与时间列在移动端折叠,避免桌面表格被压缩到触屏
  const columns: TableProps<Article>["columns"] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "title", title: "标题", dataIndex: "title", ellipsis: true },
  ];

  if (!isCompact) {
    columns.push(
      { key: "content", title: "内容摘要", dataIndex: "content", ellipsis: true, render: (value: string) => stripHtml(value) || "—" },
      { key: "createdAt", title: "创建时间", dataIndex: "createdAt", width: 180 },
      { key: "updatedAt", title: "更新时间", dataIndex: "updatedAt", width: 180 },
    );
  }

  columns.push({
    key: "actions",
    title: "操作",
    width: 180,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => navigate(`/articles/new?id=${record.id}`)}>
          编辑
        </Button>
        <Popconfirm title="确定删除到回收站？" onConfirm={() => handleDelete(record.id)}>
          <Button type="link" size="small" danger>
            删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  });

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">文章列表</h1>
          <p className="mt-2 text-sm text-text-secondary">管理已发布与草稿文章。</p>
        </div>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={clearError} />}

      <div className="flex flex-wrap mt-1 items-center justify-between gap-4">
        <Input.Search allowClear placeholder="按标题搜索" onSearch={search} style={{ width: isCompact ? "100%" : 320 }} />
        <Button disabled={selectedRowKeys.length === 0} onClick={handleBatchDelete}>
          删除到回收站
        </Button>
      </div>

      <Table<Article>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={articles}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: <EmptyState title="暂无文章" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={onTableChange}
        scroll={isCompact ? undefined : { x: 960 }}
      />
    </section>
  );
}
