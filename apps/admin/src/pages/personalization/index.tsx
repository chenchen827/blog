import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Spin, Tabs } from "antd";
import { EmptyState } from "@repo/shared";

import { createPersonalization, getPersonalization } from "../../apis/personalization";
import type { Personalization } from "../../apis/personalization";
import AlbumTemplateTab from "./tabs/AlbumTemplateTab";
import HomeTab from "./tabs/HomeTab";
import PhotoWallTemplateTab from "./tabs/PhotoWallTemplateTab";
import "./personalization.css";

const TAB_ITEMS = [
  { key: "home", label: "首页", children: <HomeTab /> },
  { key: "album-template", label: "相集模板", children: <AlbumTemplateTab /> },
  { key: "photo-wall-template", label: "相片墙模板", children: <PhotoWallTemplateTab /> },
];

function PageHeader() {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Personalization</p>
      <h1 className="mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">个性化配置</h1>
      <p className="mt-2 text-sm text-text-secondary">配置个人首页、相集模板与相片墙模板。</p>
    </div>
  );
}

export default function PersonalizationPage() {
  const { message } = App.useApp();
  const [personalization, setPersonalization] = useState<Personalization | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [createError, setCreateError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      const res = await getPersonalization();
      setPersonalization(res.data?.personalization ?? null);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : "加载个性化配置失败");
      setPersonalization(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleCreate = async () => {
    setCreating(true);
    setCreateError("");
    try {
      const res = await createPersonalization();
      setPersonalization(res.data?.personalization ?? null);
      message.success("个性化配置已创建");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "创建个性化配置失败";
      setCreateError(msg);
      message.error(msg);
    } finally {
      setCreating(false);
    }
  };

  return (
    <section className="space-y-6">
      <PageHeader />

      {loading ? (
        <div className="flex min-h-80 items-center justify-center">
          <Spin />
        </div>
      ) : loadError ? (
        <Alert
          type="error"
          showIcon
          message="个性化配置加载失败"
          description={loadError}
          action={<Button onClick={() => void load()}>重新加载</Button>}
        />
      ) : (
        <>
          {createError && <Alert type="error" showIcon message={createError} closable onClose={() => setCreateError("")} />}
          {personalization ? (
            <Tabs defaultActiveKey="home" items={TAB_ITEMS} className="personalization-tabs" />
          ) : (
            <EmptyState
              code="PERSONAL"
              title="尚未创建个性化配置"
              description="创建后即可配置首页、相集模板与相片墙模板。三个配置页面将在后续迭代中完善。"
              className="min-h-[420px]"
              action={
                <Button type="primary" size="large" className="rounded-none!" loading={creating} onClick={() => void handleCreate()}>
                  创建个性化配置
                </Button>
              }
            />
          )}
        </>
      )}
    </section>
  );
}
