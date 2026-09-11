import { useEffect, useState } from "react";
import { Form, Input, Modal, Select } from "antd";

import { cn } from "../utils";

export interface UserProfileValues {
  nickname: string;
  sex: number;
  company?: string;
  introduce?: string;
}

export interface UserMenuUser {
  id?: number;
  name?: string;
  username?: string;
  email?: string;
  avatar?: string | null;
  role?: number | string | null;
  sex?: number;
  company?: string | null;
  introduce?: string | null;
}

export interface UserMenuProps {
  /** 当前用户信息；传入则表示已登录 */
  user?: UserMenuUser;
  /** 退出登录回调 */
  onLogout?: () => void;
  /** 未登录时点击登录的跳转地址 */
  loginUrl?: string;
  /** 未登录时点击登录的回调 */
  onLogin?: () => void;
  /** 提交个人信息（不包含密码） */
  onUpdateProfile?: (values: UserProfileValues) => Promise<void> | void;
  /** 提交个人信息的 loading 状态 */
  updatingProfile?: boolean;
  className?: string;
}

const ACTION_BUTTON_CLASS =
  "group flex min-h-11 w-full items-center justify-between rounded-[5px] border px-4 text-sm font-black uppercase tracking-wider transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-primary";

const OUTLINE_ACTION_BUTTON_CLASS =
  "flex min-h-11 w-full items-center justify-center rounded-[5px] border-[3px] border-text-secondary bg-primary px-4 text-sm font-black uppercase tracking-wider text-text-primary transition-all duration-150 hover:border-ink hover:bg-text-primary hover:text-ink! focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-primary focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:translate-y-px";

/** 顶部导航栏用户头像下拉菜单（公共组件） */
export function UserMenu({ user, onLogout, loginUrl, onLogin, onUpdateProfile, updatingProfile, className }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [form] = Form.useForm<UserProfileValues>();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const initial = (user?.name ?? user?.email?.[0] ?? "?").charAt(0).toUpperCase();

  const handleLogin = () => {
    setOpen(false);
    if (onLogin) {
      onLogin();
      return;
    }
    if (loginUrl) window.location.assign(loginUrl);
  };

  const handleLogout = () => {
    setOpen(false);
    onLogout?.();
  };

  const openEdit = () => {
    form.setFieldsValue({
      nickname: user?.name ?? "",
      sex: Number(user?.sex ?? 2),
      company: user?.company ?? "",
      introduce: user?.introduce ?? "",
    });
    setEditOpen(true);
  };

  const handleEditSubmit = async (values: UserProfileValues) => {
    try {
      await onUpdateProfile?.(values);
      setEditOpen(false);
      form.resetFields();
    } catch {
      // 错误提示由上层处理,保持弹窗打开
    }
  };

  const editDisabled = !user || !onUpdateProfile;

  return (
    <div className={cn("relative inline-flex", className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex h-11 shrink-0 items-center justify-center gap-2 rounded-none border border-transparent px-2 text-text-primary transition-colors hover:border-hairline hover:bg-surface-soft hover:text-accent"
      >
        <span className="relative flex h-8 w-8 items-center justify-center overflow-hidden rounded-none border border-accent/40 bg-surface-soft text-sm font-black text-accent">
          {user?.avatar ? <img src={user.avatar} alt={user?.name ?? "用户头像"} className="h-full w-full object-cover" /> : initial}
        </span>
        <span className="hidden max-w-28 truncate text-sm font-bold md:inline">{user?.name ?? "未登录"}</span>
        <span aria-hidden="true" className={cn("text-xs transition-transform duration-200", open && "rotate-180")}>
          ▾
        </span>
      </button>

      <div className={cn("absolute right-0 top-full z-50 pt-3 transition-all duration-200", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div
          className={cn(
            "relative w-72 border border-hairline bg-primary/95 shadow-[0_24px_60px_rgba(0,0,0,0.78)] backdrop-blur-md transition-all duration-200 [clip-path:polygon(12px_0,100%_0,100%_calc(100%-18px),calc(100%-18px)_100%,0_100%,0_12px)]",
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          )}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
              backgroundSize: "34px 34px",
            }}
          />

          <div className="relative flex items-start gap-3 border-b border-hairline p-4">
            <span className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-none border border-accent/50 bg-surface-soft text-lg font-black text-accent">
              {user?.avatar ? <img src={user.avatar} alt={user?.name ?? "用户头像"} className="h-full w-full object-cover" /> : initial}
              <span className="absolute inset-x-0 bottom-0 h-1 bg-accent" />
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black uppercase tracking-[0.32em] text-accent">Account</span>
                {user && <span className="h-1.5 w-1.5 bg-accent" />}
              </div>
              <p className="mt-2 truncate text-lg font-black leading-none text-text-primary">{user?.name ?? "未登录"}</p>
              <p className="mt-2 truncate text-xs text-text-secondary">{user?.email ?? "—"}</p>
            </div>
          </div>

          {user && (
            <div className="relative border-b border-hairline px-4 py-4">
              <div className="flex items-start gap-4">
                <span className="mt-0.5 shrink-0 text-[9px] font-black uppercase tracking-[0.28em] text-accent">BIO</span>
                <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-primary">{user.introduce || "暂无个人介绍。"}</span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-2 p-3">
            {editDisabled ? null : (
              <button type="button" onClick={openEdit} className={cn(ACTION_BUTTON_CLASS, "border-accent bg-accent text-ink! hover:bg-accent-yellow hover:text-ink!")}>
                <span>编辑个人信息</span>
                <span aria-hidden="true" className="text-base transition-transform group-hover:translate-x-1">
                  →
                </span>
              </button>
            )}

            {user ? (
              <button type="button" onClick={handleLogout} className={OUTLINE_ACTION_BUTTON_CLASS}>
                退出登录
              </button>
            ) : (
              <button type="button" onClick={handleLogin} className={OUTLINE_ACTION_BUTTON_CLASS}>
                登录
              </button>
            )}
          </div>
        </div>
      </div>

      <Modal
        title="编辑个人信息"
        open={editOpen}
        onCancel={() => setEditOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={updatingProfile}
        okText="保存"
        cancelText="取消"
        destroyOnHidden
      >
        <Form<UserProfileValues> form={form} layout="vertical" requiredMark={false} onFinish={handleEditSubmit} className="mt-4">
          <Form.Item label="邮箱">
            <Input value={user?.email ?? ""} disabled />
          </Form.Item>
          <Form.Item label="用户名">
            <Input value={user?.username ?? ""} disabled />
          </Form.Item>
          <Form.Item name="nickname" label="昵称" rules={[{ required: true, whitespace: true, message: "请输入昵称" }]}>
            <Input placeholder="请输入昵称" maxLength={45} showCount />
          </Form.Item>
          <Form.Item name="sex" label="性别" initialValue={2}>
            <Select
              options={[
                { label: "保密", value: 2 },
                { label: "男", value: 0 },
                { label: "女", value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item name="company" label="公司">
            <Input placeholder="请输入公司" />
          </Form.Item>
          <Form.Item name="introduce" label="个人介绍">
            <Input.TextArea placeholder="请输入个人介绍" autoSize={{ minRows: 3, maxRows: 6 }} maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default UserMenu;
