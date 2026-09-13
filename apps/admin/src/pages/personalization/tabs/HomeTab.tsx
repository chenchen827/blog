import { useCallback, useEffect, useRef, useState } from "react";
import { Alert, App, Button, Form, Input, Select, Spin } from "antd";
import { GhostFibers, GradientWaves, Starfield } from "@repo/shared";

import { listAlbums } from "../../../apis/albums";
import type { Album } from "../../../apis/albums";
import { listArticles } from "../../../apis/articles";
import type { Article } from "../../../apis/types";
import { updatePersonalization } from "../../../apis/personalization";
import type { HomeBackgroundTemplate, Personalization } from "../../../apis/personalization";
import { uploadImageToAliyun } from "../../../apis/upload";
import { getCurrentUser } from "../../../apis/users";
import type { AdminUser } from "../../../apis/users";

interface HomeTabProps {
  personalization: Personalization;
  onSaved: (next: Personalization) => void;
}

interface HomeFormValues {
  introduction?: string;
  portraitUrl?: string;
  contactEmail?: string;
  lifeAlbumId?: number | null;
  recommendedArticleIds?: number[];
  homeBackgroundTemplate: HomeBackgroundTemplate;
}

const BACKGROUND_OPTIONS: Array<{ label: string; value: HomeBackgroundTemplate }> = [
  { label: "Ghost Fibers", value: "GhostFibers" },
  { label: "Starry", value: "Starry" },
  { label: "Gradient Waves", value: "GradientWaves" },
];

function BackgroundStage({ template }: { template: HomeBackgroundTemplate }) {
  if (template === "Starry") return <Starfield contained />;
  if (template === "GradientWaves") {
    return <GradientWaves horizonColor="#5F8F00" waveColor="#E8FF00" crestColor="#FF9D00" brightness={1.45} fogDepth={22} />;
  }
  return <GhostFibers lineColor="#d9ff00" glowColor="#5f6b00" brightness={1.4} />;
}

export default function HomeTab({ personalization, onSaved }: HomeTabProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<HomeFormValues>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const background = Form.useWatch("homeBackgroundTemplate", form) ?? personalization.homeBackgroundTemplate;
  const portraitUrl = Form.useWatch("portraitUrl", form) ?? personalization.portraitUrl ?? "";
  const nickname = personalization.user?.nickname || currentUser?.nickname || "未设置昵称";

  useEffect(() => {
    form.setFieldsValue({
      introduction: personalization.introduction ?? "",
      portraitUrl: personalization.portraitUrl ?? "",
      contactEmail: personalization.contactEmail ?? "",
      lifeAlbumId: personalization.lifeAlbumId ?? undefined,
      recommendedArticleIds: personalization.recommendedArticleIds ?? [],
      homeBackgroundTemplate: personalization.homeBackgroundTemplate,
    });
  }, [form, personalization]);

  const loadOptions = useCallback(async () => {
    setOptionsLoading(true);
    setOptionsError("");
    try {
      const [userRes, albumRes, articleRes] = await Promise.all([
        getCurrentUser(),
        listAlbums(),
        listArticles({ pageSize: 100, currentPage: 1, deleted: false }),
      ]);
      setCurrentUser(userRes.data.user);
      setAlbums(albumRes.data.albums ?? []);
      setArticles(articleRes.data.articles ?? []);
    } catch (err) {
      setOptionsError(err instanceof Error ? err.message : "加载配置选项失败");
    } finally {
      setOptionsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  const handlePortraitFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setUploading(true);
    try {
      const url = await uploadImageToAliyun(file);
      form.setFieldValue("portraitUrl", url);
      message.success("人像照片已上传");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "人像照片上传失败");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (values: HomeFormValues) => {
    setSaving(true);
    try {
      const res = await updatePersonalization({
        introduction: values.introduction?.trim() || "",
        portraitUrl: values.portraitUrl?.trim() || null,
        contactEmail: values.contactEmail?.trim() || null,
        lifeAlbumId: values.lifeAlbumId ?? null,
        recommendedArticleIds: values.recommendedArticleIds ?? [],
        homeBackgroundTemplate: values.homeBackgroundTemplate,
      });
      onSaved(res.data.personalization ?? personalization);
      message.success("首页配置已保存");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存首页配置失败");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="relative min-h-[640px] overflow-hidden border border-hairline bg-canvas">
      <div className="absolute inset-0 z-0">
        <BackgroundStage template={background} />
      </div>
      <div aria-hidden="true" className="absolute inset-0 z-0 bg-canvas/55" />

      <div className="relative z-10 grid gap-6 p-4 md:p-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <aside className="space-y-4 border border-hairline bg-canvas/75 p-5 backdrop-blur-sm">
          <div className="flex aspect-square items-center justify-center overflow-hidden border border-hairline bg-surface-soft">
            {portraitUrl ? (
              <img src={portraitUrl} alt={nickname} className="h-full w-full object-cover" />
            ) : (
              <span className="text-xs font-black uppercase tracking-[0.3em] text-text-secondary">No Portrait</span>
            )}
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-text-secondary">Current User</p>
            <p className="mt-2 text-xl font-black uppercase leading-none text-text-primary">{nickname}</p>
          </div>
        </aside>

        <div className="border border-hairline bg-canvas/75 p-5 backdrop-blur-sm">
          {optionsError && <Alert className="mb-5" type="error" showIcon message={optionsError} closable onClose={() => setOptionsError("")} />}

          <Form<HomeFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave}>
            <div className="grid gap-x-6 md:grid-cols-2">
              <Form.Item name="introduction" label="自我介绍" className="md:col-span-2">
                <Input.TextArea rows={4} maxLength={3000} showCount placeholder="记录生活，也记录每一次出发。" />
              </Form.Item>

              <Form.Item name="portraitUrl" label="人像照片" className="md:col-span-2">
                <Input
                  placeholder="https://example.com/portrait.jpg"
                  addonAfter={
                    <Button type="primary" loading={uploading} onClick={() => fileInputRef.current?.click()}>
                      上传图片
                    </Button>
                  }
                />
              </Form.Item>

              <Form.Item name="contactEmail" label="联系邮箱" rules={[{ type: "email", message: "请输入合法的邮箱地址" }]}>
                <Input placeholder="hello@example.com" />
              </Form.Item>

              <Form.Item name="lifeAlbumId" label="生活照片集">
                <Select
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="从已有相集中选择"
                  loading={optionsLoading}
                  options={albums.map((album) => ({ label: album.name, value: album.id }))}
                />
              </Form.Item>

              <Form.Item name="recommendedArticleIds" label="推荐文章（最多 5 篇）" className="md:col-span-2">
                <Select
                  mode="multiple"
                  allowClear
                  showSearch
                  optionFilterProp="label"
                  placeholder="从文章列表中选择"
                  loading={optionsLoading}
                  maxCount={5}
                  options={articles.map((article) => ({ label: article.title, value: article.id }))}
                />
              </Form.Item>

              <Form.Item name="homeBackgroundTemplate" label="首页背景" className="md:col-span-2">
                <Select options={BACKGROUND_OPTIONS} />
              </Form.Item>
            </div>

            <div className="mt-2 flex justify-end">
              <Button type="primary" size="large" className="rounded-none!" htmlType="submit" loading={saving}>
                保存首页配置
              </Button>
            </div>
          </Form>
        </div>
      </div>

      {optionsLoading && (
        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-canvas/20">
          <Spin />
        </div>
      )}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePortraitFile} />
    </section>
  );
}
