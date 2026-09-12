import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Spin } from "antd";
import { EmptyState } from "@repo/shared";

import { createPersonalization, getPersonalization } from "../../apis/personalization";
import type { Personalization } from "../../apis/personalization";
import AlbumTemplateTab from "./tabs/AlbumTemplateTab";
import HomeTab from "./tabs/HomeTab";
import PhotoWallTemplateTab from "./tabs/PhotoWallTemplateTab";

const TAB_ITEMS = [
  { key: "home", label: "首页" },
  { key: "album-template", label: "相集模板" },
  { key: "photo-wall-template", label: "相片墙模板" },
] as const;

type TabKey = (typeof TAB_ITEMS)[number]["key"];

interface PageHeaderProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

function PageHeader({ activeTab, onTabChange }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="shrink-0">
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-accent">Personalization</p>
        <h1 className="mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">个性化配置</h1>
        <p className="mt-2 text-sm text-text-secondary">配置个人首页、相集模板与相片墙模板。</p>
      </div>

      <nav aria-label="个性化配置栏目" className="flex flex-wrap items-center gap-6 lg:justify-end">
        {TAB_ITEMS.map((item) => {
          const active = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`min-h-11 border-b-2 px-1 text-sm font-black tracking-[0.12em] transition-colors ${
                active ? "border-accent text-accent" : "border-transparent text-text-secondary hover:text-text-primary"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
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
  const [activeTab, setActiveTab] = useState<TabKey>("home");

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

  const handleSaved = useCallback((next: Personalization) => {
    setPersonalization(next);
  }, []);

  return (
    <section className="space-y-6">
      <PageHeader activeTab={activeTab} onTabChange={setActiveTab} />

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
            <>
              {activeTab === "home" && <HomeTab personalization={personalization} onSaved={handleSaved} />}
              {activeTab === "album-template" && <AlbumTemplateTab personalization={personalization} onSaved={handleSaved} />}
              {activeTab === "photo-wall-template" && <PhotoWallTemplateTab personalization={personalization} onSaved={handleSaved} />}
            </>
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
