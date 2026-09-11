import { useCallback, useEffect, useState } from "react";
import { Alert, App, Button, Form, Input, Space, Spin } from "antd";

import { flushAllCaches, getSetting, reindexSearchEngine, updateSetting } from "../../apis/settings";

interface SettingFormValues {
  name: string;
  icp: string;
  copyright: string;
}

const EMPTY_SETTING: SettingFormValues = { name: "", icp: "", copyright: "" };

export default function SettingsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm<SettingFormValues>();

  const [setting, setSetting] = useState<SettingFormValues>(EMPTY_SETTING);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [flushing, setFlushing] = useState(false);
  const [reindexing, setReindexing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getSetting();
      const next = {
        name: res.data.setting.name ?? "",
        icp: res.data.setting.icp ?? "",
        copyright: res.data.setting.copyright ?? "",
      };
      setSetting(next);
      form.setFieldsValue(next);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载系统设置失败";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [form, message]);

  useEffect(() => {
    void load();
  }, [load]);

  const startEdit = () => {
    form.setFieldsValue(setting);
    setEditing(true);
  };

  const cancelEdit = () => {
    form.setFieldsValue(setting);
    setEditing(false);
  };

  const handleSave = async (values: SettingFormValues) => {
    const next = {
      name: values.name.trim(),
      icp: values.icp.trim(),
      copyright: values.copyright.trim(),
    };

    setSaving(true);
    try {
      await updateSetting(next);
      setSetting(next);
      setEditing(false);
      message.success("系统设置已保存");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "保存失败");
    } finally {
      setSaving(false);
    }
  };

  const handleFlush = async () => {
    setFlushing(true);
    try {
      await flushAllCaches();
      message.success("缓存已清除");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "清除缓存失败");
    } finally {
      setFlushing(false);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      await reindexSearchEngine();
      message.success("搜索引擎索引已重建");
    } catch (err) {
      message.error(err instanceof Error ? err.message : "重建索引失败");
    } finally {
      setReindexing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin />
      </div>
    );
  }

  const infoRows = [
    { label: "站点名称", value: setting.name },
    { label: "ICP 备案号", value: setting.icp },
    { label: "版权信息", value: setting.copyright },
  ];

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">系统设置</h1>
        <p className="mt-2 text-sm text-text-secondary">维护系统基础信息与运行维护操作。</p>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError("")} />}

      <div className="max-w-2xl space-y-6">
        <div className="rounded-none border border-hairline bg-primary p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-black uppercase tracking-wider text-text-primary">基础信息</h2>
              <p className="mt-1 text-sm text-text-secondary">{editing ? "当前为编辑模式,保存后生效。" : "基础信息默认只读,点击“编辑”后可修改。"}</p>
            </div>
            {!editing && (
              <Button type="primary" onClick={startEdit}>
                编辑
              </Button>
            )}
          </div>

          {!editing ? (
            <div className="mt-5 divide-y divide-hairline border-y border-hairline">
              {infoRows.map((row) => (
                <div key={row.label} className="flex gap-6 px-1 py-4">
                  <span className="w-24 shrink-0 text-sm leading-6 text-text-secondary">{row.label}</span>
                  <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-base leading-6 text-text-primary">{row.value || "—"}</span>
                </div>
              ))}
            </div>
          ) : (
            <Form<SettingFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleSave} className="mt-5">
              <Form.Item name="name" label="站点名称" rules={[{ required: true, whitespace: true, message: "请输入站点名称" }]}>
                <Input placeholder="请输入站点名称" maxLength={100} showCount />
              </Form.Item>
              <Form.Item name="icp" label="ICP 备案号">
                <Input placeholder="例如：蜀ICP备2024103894号-1" />
              </Form.Item>
              <Form.Item name="copyright" label="版权信息">
                <Input.TextArea placeholder="例如：© 2026 Company. All Rights Reserved." autoSize={{ minRows: 2, maxRows: 4 }} />
              </Form.Item>
              <Space>
                <Button type="primary" htmlType="submit" loading={saving}>
                  保存设置
                </Button>
                <Button onClick={cancelEdit} disabled={saving}>
                  取消
                </Button>
              </Space>
            </Form>
          )}
        </div>

        <div className="rounded-none border border-hairline bg-primary p-6">
          <h2 className="text-base font-black uppercase tracking-wider text-text-primary">维护操作</h2>
          <p className="mt-2 text-sm text-text-secondary">以下操作可能影响线上数据,请确认后再执行。</p>
          <Space wrap className="mt-4">
            <Button loading={flushing} onClick={handleFlush}>
              清除缓存
            </Button>
            <Button loading={reindexing} onClick={handleReindex}>
              重建搜索引擎索引
            </Button>
          </Space>
        </div>
      </div>
    </section>
  );
}
