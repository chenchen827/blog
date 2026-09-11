import { EmptyState } from "@repo/shared";
import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Form, Grid, Input, InputNumber, Modal, Popconfirm, Select, Space, Table } from "antd";
import type { TableProps } from "antd";
import { useNavigate, useSearchParams } from "react-router";

import { createChapter, deleteChapter, listChapters, updateChapter } from "../../apis/chapters";
import type { Chapter } from "../../apis/chapters";
import { getCourse, listCourses } from "../../apis/courses";
import type { Course } from "../../apis/courses";

interface ChapterFormValues {
  title: string;
  content?: string;
  video?: string;
  rank: number;
}

export default function ChapterListPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;
  const [form] = Form.useForm<ChapterFormValues>();

  const courseIdParam = searchParams.get("courseId");
  const [courseId, setCourseId] = useState<string | undefined>(courseIdParam ?? undefined);
  const [courseName, setCourseName] = useState("");
  const [courseOptions, setCourseOptions] = useState<Course[]>([]);

  const [list, setList] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Chapter | null>(null);
  const [saving, setSaving] = useState(false);

  const loadChapters = useCallback(
    async (id: string | undefined, title: string, current: number, pageSize: number) => {
      if (!id) {
        setList([]);
        setPagination({ current: 1, pageSize: 10, total: 0 });
        return;
      }
      setLoading(true);
      setError("");
      try {
        const res = await listChapters({ courseId: id, title: title || undefined, currentPage: current, pageSize });
        setList(res.data.chapters);
        setPagination({
          current: res.data.pagination.currentPage,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载章节失败";
        setError(msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [message],
  );

  const loadCourses = useCallback(async () => {
    try {
      const res = await listCourses({ currentPage: 1, pageSize: 100 });
      setCourseOptions(res.data.courses);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "加载课程列表失败");
    }
  }, [message]);

  useEffect(() => {
    void loadCourses();
  }, [loadCourses]);

  useEffect(() => {
    if (courseId) {
      setCourseName("");
      getCourse(courseId)
        .then((res) => setCourseName(res.data.course.name))
        .catch(() => setCourseName(""));
    } else {
      setCourseName("");
    }
    void loadChapters(courseId, "", 1, 10);
  }, [courseId, loadChapters]);

  const handleCourseChange = (value: string) => {
    setCourseId(value);
    navigate(`/chapters/list?courseId=${value}`, { replace: true });
  };

  const openCreate = () => {
    if (!courseId) {
      message.warning("请先选择课程");
      return;
    }
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ title: "", content: "", video: "", rank: 1 });
    setModalOpen(true);
  };

  const openEdit = (record: Chapter) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      title: record.title,
      content: record.content ?? "",
      video: record.video ?? "",
      rank: Number(record.rank),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setModalOpen(false);
    form.resetFields();
  };

  const handleSave = async (values: ChapterFormValues) => {
    if (!courseId) return;
    setSaving(true);
    try {
      const payload = {
        courseId,
        title: values.title.trim(),
        content: values.content?.trim() || "",
        video: values.video?.trim() || undefined,
        rank: Number(values.rank),
      };

      if (editing) {
        await updateChapter(editing.id, payload);
        message.success("章节已更新");
      } else {
        await createChapter(payload);
        message.success("章节已创建");
      }

      setModalOpen(false);
      form.resetFields();
      void loadChapters(courseId, keyword, pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!courseId) return;
    try {
      await deleteChapter(id);
      message.success("章节已删除");
      void loadChapters(courseId, keyword, pagination.current, pagination.pageSize);
    } catch (err) {
      message.error(err instanceof Error ? err.message : "删除失败");
    }
  };

  const columns: TableProps<Chapter>["columns"] = [
    { key: "id", title: "ID", dataIndex: "id", width: 80 },
    { key: "rank", title: "排序", dataIndex: "rank", width: 90 },
    { key: "title", title: "章节标题", dataIndex: "title", ellipsis: true },
  ];

  if (!isCompact) {
    columns.push(
      { key: "video", title: "视频", dataIndex: "video", ellipsis: true, render: (value?: string) => (value ? "有" : "—") },
      { key: "createdAt", title: "创建时间", dataIndex: "createdAt", width: 140 },
    );
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
        <Popconfirm title="确定删除该章节？" onConfirm={() => handleDelete(record.id)}>
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
          <div className="flex flex-wrap items-center gap-3">
            <Button type="link" className="!px-0" onClick={() => navigate("/courses/list")}>
              ← 返回课程
            </Button>
            <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">{courseName ? `章节管理：${courseName}` : "章节管理"}</h1>
          </div>
          <p className="mt-2 text-sm text-text-secondary">章节关联课程 ID：{courseId ?? "请先选择课程"}。</p>
        </div>
        <Button type="primary" onClick={openCreate} disabled={!courseId}>
          新增章节
        </Button>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <div className="flex flex-wrap items-center gap-4">
        <Select
          showSearch
          optionFilterProp="label"
          placeholder="请选择课程"
          value={courseId}
          onChange={handleCourseChange}
          options={courseOptions.map((course) => ({ label: course.name, value: String(course.id) }))}
          style={{ width: isCompact ? "100%" : 280 }}
        />
        <Input.Search
          allowClear
          placeholder="按章节标题搜索"
          onSearch={(value) => {
            setKeyword(value);
            void loadChapters(courseId, value, 1, pagination.pageSize);
          }}
          style={{ width: isCompact ? "100%" : 320 }}
        />
      </div>

      <Table<Chapter>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={list}
        locale={{ emptyText: <EmptyState title={courseId ? "暂无章节" : "请先选择课程"} /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={(next) => {
          void loadChapters(courseId, keyword, next.current ?? 1, next.pageSize ?? pagination.pageSize);
        }}
        scroll={isCompact ? undefined : { x: 900 }}
      />

      <Modal
        title={editing ? "编辑章节" : "新增章节"}
        open={modalOpen}
        onCancel={closeModal}
        onOk={() => form.submit()}
        confirmLoading={saving}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<ChapterFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-4">
          <Form.Item label="关联课程">
            <Input value={courseId ? `${courseName || "课程"}（ID ${courseId}）` : ""} disabled />
          </Form.Item>

          <Form.Item name="title" label="章节标题" rules={[{ required: true, whitespace: true, message: "请输入章节标题" }]}>
            <Input placeholder="请输入章节标题" maxLength={45} showCount />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item name="rank" label="排序" rules={[{ required: true, message: "请输入排序值" }]}>
              <InputNumber min={1} precision={0} style={{ width: "100%" }} placeholder="正整数,越小越靠前" />
            </Form.Item>
            <Form.Item name="video" label="视频 URL">
              <Input placeholder="可选,请输入视频地址" />
            </Form.Item>
          </div>

          <Form.Item name="content" label="章节正文">
            <Input.TextArea placeholder="请输入章节正文" autoSize={{ minRows: 5, maxRows: 12 }} />
          </Form.Item>
        </Form>
      </Modal>
    </section>
  );
}
