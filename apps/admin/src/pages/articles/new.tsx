import { useEffect, useState } from "react";
import { App, Button, Form, Input, Spin } from "antd";
import { useNavigate, useSearchParams } from "react-router";
import ArticleEditor from "./editor/ArticleEditor";
import { createArticle, getArticle, updateArticle } from "../../apis/articles";

interface ArticleFormValues {
  title: string;
  content: string;
}

/**
 * 写文章 / 编辑文章共用页面：
 * - 无 ?id 时为新建
 * - 有 ?id 时拉取详情，并作为表单初始值回显
 */
export default function ArticleNewPage() {
  const { message } = App.useApp();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(Boolean(id));
  const [submitting, setSubmitting] = useState(false);
  const [initialValues, setInitialValues] = useState<ArticleFormValues>({ title: "", content: "" });

  // 编辑态：先取详情，再以初始值方式挂载表单，确保富文本也能正确回显
  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);
    getArticle(id)
      .then((res) => {
        if (!active) return;
        setInitialValues({ title: res.data.article.title, content: res.data.article.content });
      })
      .catch((err) => {
        if (!active) return;
        message.error(err instanceof Error ? err.message : "加载文章失败");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, message]);

  const onFinish = async (values: ArticleFormValues) => {
    setSubmitting(true);
    try {
      if (id) {
        await updateArticle(id, values);
        message.success("文章已更新");
      } else {
        await createArticle(values);
        message.success("文章已创建");
      }
      navigate("/articles/list");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">{id ? "编辑文章" : "写文章"}</h1>
        <p className="mt-2 text-base text-text-secondary">{id ? "修改标题与正文内容。" : "创建一篇新文章。"}</p>
      </div>

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <Spin />
        </div>
      ) : (
        <Form<ArticleFormValues> key={id ?? "new"} layout="vertical" onFinish={onFinish} initialValues={initialValues}>
          <Form.Item name="title" label="标题" rules={[{ required: true, whitespace: true, message: "请输入标题" }]}>
            <Input placeholder="请输入标题" maxLength={120} showCount />
          </Form.Item>
          <Form.Item name="content" label="正文" rules={[{ required: true, message: "请输入正文" }]}>
            <ArticleEditor />
          </Form.Item>
          <div className="flex items-center gap-3">
            <Button type="primary" htmlType="submit" loading={submitting}>
              {id ? "保存" : "发布"}
            </Button>
            <Button onClick={() => navigate("/articles/list")}>取消</Button>
          </div>
        </Form>
      )}
    </section>
  );
}
