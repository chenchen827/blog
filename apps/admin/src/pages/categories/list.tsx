import { EmptyState } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Form, Grid, Input, InputNumber, Modal, Popconfirm, Space, Table } from "antd";
import type { TableProps } from "antd";

import { createCategory, deleteCategory, listCategories, updateCategory } from "../../apis/categories";
import type { Category } from "../../apis/categories";

interface CategoryFormValues {
  name: string;
  rank: number;
}

export default function CategoryListPage() {
  const { message } = App.useApp();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;
  const [form] = Form.useForm<CategoryFormValues>();

  const [list, setList] = useState<Category[]>([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCategories();
      setList(res.data.categories ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载分类失败";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [message]);

  useEffect(() => {
    void load();
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ name: "", rank: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: Category) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({ name: record.name, rank: Number(record.rank) });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: CategoryFormValues) => {
    setSaving(true);
    try {
      const payload = { name: values.name.trim(), rank: Number(values.rank) };
      if (editing) {
        await updateCategory(editing.id, payload);
        message.success("分类已更新");
      } else {
        await createCategory(payload);
        message.success("分类已创建");
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
      await deleteCategory(id);
      message.success("分类已删除");
      void load();
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const filteredList = list.filter((item) => item.name.toLowerCase().includes(keyword.trim().toLowerCase()));

  const columns: TableProps<Category>["columns"] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "name", title: "分类名称", dataIndex: "name", ellipsis: true },
    { key: "rank", title: "排序", dataIndex: "rank", width: 100 },
  ];

  if (!isCompact) {
    columns.push({ key: "createdAt", title: "创建时间", dataIndex: "createdAt", width: 160, render: (value?: string) => value || "—" });
  }

  columns.push({
    key: "actions",
    title: "操作",
    width: 140,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => openEdit(record)}>
          编辑
        </Button>
        <Popconfirm title="删除前需先清空该分类下的课程,确定删除？" onConfirm={() => handleDelete(record.id)}>
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
          <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">分类列表</h1>
          <p className="mt-2 text-sm text-text-secondary">管理系统分类；分类下有课程时不可删除。</p>
        </div>
        <Button type="primary" onClick={openCreate}>
          新增分类
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <Input.Search allowClear placeholder="按分类名称筛选" onSearch={setKeyword} style={{ width: isCompact ? "100%" : 320 }} />

      <Table<Category>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={filteredList}
        locale={{ emptyText: <EmptyState title="暂无分类" /> }}
        pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `共 ${total} 条` }}
        scroll={isCompact ? undefined : { x: 760 }}
      />

      <Modal
        title={editing ? "编辑分类" : "新增分类"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<CategoryFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item name="name" label="分类名称" rules={[{ required: true, whitespace: true, message: "请输入分类名称" }]}>
            <Input placeholder="请输入分类名称" maxLength={45} showCount />
          </Form.Item>
          <Form.Item name="rank" label="排序" rules={[{ required: true, message: "请输入排序值" }]}>
            <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="正整数,越小越靠前" />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
