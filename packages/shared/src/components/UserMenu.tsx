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

function roleText(role?: number | string | null): string {
  const value = Number(role);
  if (value === 100) return "管理员";
  if (value === 10) return "会员";
  return "普通用户";
}

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

      <div className={cn("absolute right-0 top-full z-50 pt-2 transition-all duration-200", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
        <div
          className={cn(
            "w-64 border border-hairline bg-primary/95 shadow-[0_24px_60px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-200 [clip-path:polygon(0_0,100%_0,100%_calc(100%-16px),calc(100%-16px)_100%,0_100%)]",
            open ? "translate-y-0 opacity-100" : "-translate-y-2 opacity-0",
          )}
        >
          <div className="flex items-center gap-3 border-b border-hairline p-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-none border border-accent/40 bg-surface-soft text-lg font-black text-accent">
              {user?.avatar ? <img src={user.avatar} alt={user?.name ?? "用户头像"} className="h-full w-full object-cover" /> : initial}
            </span>
            <div className="min-w-0">
              <p className="truncate text-base font-black text-text-primary">{user?.name ?? "未登录"}</p>
              <p className="mt-1 truncate text-xs text-text-secondary">{user?.email ?? "—"}</p>
              {user && <span className="mt-1 inline-block bg-accent/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-accent">{roleText(user.role)}</span>}
            </div>
          </div>

          <div className="border-b border-hairline px-4 py-3">
            <div className="flex gap-3 text-sm">
              <span className="w-16 shrink-0 text-text-secondary">公司</span>
              <span className="min-w-0 flex-1 text-text-primary">{user?.company || "—"}</span>
            </div>
            <div className="mt-3 flex gap-3 text-sm">
              <span className="w-16 shrink-0 text-text-secondary">介绍</span>
              <span className="min-w-0 flex-1 whitespace-pre-wrap break-words text-text-primary">{user?.introduce || "—"}</span>
            </div>
          </div>

          <div className="space-y-2 p-2">
            {editDisabled ? null : (
              <button
                type="button"
                onClick={openEdit}
                className="flex w-full items-center justify-center rounded-none bg-surface-soft px-4 py-2.5 text-sm font-black uppercase tracking-wider text-text-primary transition-colors hover:bg-surface hover:text-accent"
              >
                编辑个人信息
              </button>
            )}

            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center justify-center rounded-none bg-surface-soft px-4 py-2.5 text-sm font-black uppercase tracking-wider text-text-primary transition-colors hover:bg-surface hover:text-accent"
              >
                退出登录
              </button>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="flex w-full items-center justify-center rounded-none bg-accent px-4 py-2.5 text-sm font-black uppercase tracking-wider text-ink transition-[filter] hover:brightness-90"
              >
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
