import { EmptyState } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Popconfirm, Space, Table, Tag } from "antd";
import type { TableProps } from "antd";
import { useNavigate } from "react-router";

import { clearLogs, deleteLog, listLogs } from "../../apis/logs";
import type { ErrorLog } from "../../apis/logs";

function levelColor(level?: string): string {
  const value = (level ?? "").toLowerCase();
  if (value === "error" || value === "fatal") return "red";
  if (value === "warn" || value === "warning") return "orange";
  if (value === "info") return "cyan";
  return "default";
}

export default function ErrorLogListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();

  const [logs, setLogs] = useState<ErrorLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listLogs();
      const data = res.data;
      setLogs(Array.isArray(data) ? data : (data.logs ?? []));
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载日志失败";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleDelete = async (id: number) => {
    try {
      await deleteLog(id);
      message.success("日志已删除");
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除日志失败");
    }
  };

  const handleClear = async () => {
    setDeleting(true);
    try {
      await clearLogs();
      message.success("日志已全部清空");
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "清空日志失败");
    } finally {
      setDeleting(false);
    }
  };

  const columns: TableProps<ErrorLog>["columns"] = [
    { key: "id", title: "ID", dataIndex: "id", width: 90 },
    {
      key: "level",
      title: "级别",
      dataIndex: "level",
      width: 120,
      render: (value?: string) => <Tag color={levelColor(value)}>{value || "未知"}</Tag>,
    },
    { key: "message", title: "错误信息", dataIndex: "message", ellipsis: true, render: (value?: string) => value || "—" },
  ];

  columns.push(
    { key: "service", title: "来源服务", dataIndex: ["meta", "service"], width: 150, render: (value?: string) => value || "—" },
    { key: "timestamp", title: "时间", dataIndex: "timestamp", width: 180, render: (value?: string) => value || "—" },
  );

  columns.push({
    key: "actions",
    title: "操作",
    width: 150,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => navigate(`/error-logs/detail?id=${record.id}`)}>
          查看
        </Button>
        <Popconfirm title="确定删除该日志？" onConfirm={() => handleDelete(record.id)}>
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
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">错误日志</h1>
          <p className="mt-2 text-sm text-text-secondary">查看系统运行产生的错误日志,支持详情、删除与清空。</p>
        </div>
        <Popconfirm title="将清空全部日志,此操作不可恢复,确定继续？" onConfirm={handleClear} okButtonProps={{ danger: true }}>
          <Button danger loading={deleting}>
            清空全部日志
          </Button>
        </Popconfirm>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <Table<ErrorLog>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={logs}
        locale={{ emptyText: <EmptyState title="暂无日志" /> }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={{ x: 900 }}
      />
    </section>
  );
}
