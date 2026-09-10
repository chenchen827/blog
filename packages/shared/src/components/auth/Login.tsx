import { useState } from "react";
import type { ReactNode } from "react";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import { Form, Input } from "antd";

import { AuthPanel, AuthPanelHeader, AuthShell } from "./AuthShell";
import type { AuthShellLayout } from "./AuthShell";

export interface LoginFormValues {
  login: string;
  password: string;
}

export interface LoginProps {
  /** 提交登录表单；由调用方保留认证、Token 与路由逻辑。 */
  onFinish: (values: LoginFormValues) => void | Promise<void>;
  /** 登录异常回调，便于调用方展示应用自己的错误提示。 */
  onError?: (error: unknown) => void;
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  index?: ReactNode;
  accountLabel?: ReactNode;
  accountPlaceholder?: string;
  passwordLabel?: ReactNode;
  passwordPlaceholder?: string;
  submitLabel?: ReactNode;
  submittingLabel?: ReactNode;
  footer?: ReactNode;
  footerNote?: ReactNode;
  layout?: AuthShellLayout;
}

/** 公共登录模块：提供统一认证视觉、表单校验与提交状态。 */
export function Login({
  onFinish,
  onError,
  title = "User Login",
  eyebrow = "Account Access",
  description,
  index = "01",
  accountLabel = "邮箱 / 用户名",
  accountPlaceholder = "请输入邮箱或用户名",
  passwordLabel = "密码",
  passwordPlaceholder = "请输入密码",
  submitLabel = "登录",
  submittingLabel = "登录中…",
  footer,
  footerNote,
  layout = "standalone",
}: LoginProps) {
  const [submitting, setSubmitting] = useState(false);

  async function handleFinish(values: LoginFormValues) {
    setSubmitting(true);
    try {
      await onFinish({ login: values.login.trim(), password: values.password });
    } catch (error) {
      onError?.(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell layout={layout} maxWidth="login" footerNote={footerNote}>
      <AuthPanel>
        <AuthPanelHeader eyebrow={eyebrow} title={title} description={description} index={index} />

        <Form<LoginFormValues> layout="vertical" requiredMark={false} onFinish={handleFinish} className="mt-7">
          <Form.Item name="login" label={accountLabel} rules={[{ required: true, whitespace: true, message: "请输入邮箱或用户名" }]}>
            <Input
              size="large"
              prefix={<UserOutlined className="text-text-secondary" />}
              placeholder={accountPlaceholder}
              autoComplete="username"
              allowClear
            />
          </Form.Item>

          <Form.Item
            name="password"
            label={passwordLabel}
            rules={[
              { required: true, message: "请输入密码" },
              { min: 6, message: "密码至少为 6 位" },
            ]}
          >
            <Input.Password
              size="large"
              prefix={<LockOutlined className="text-text-secondary" />}
              placeholder={passwordPlaceholder}
              autoComplete="current-password"
            />
          </Form.Item>

          <button
            type="submit"
            disabled={submitting}
            aria-busy={submitting}
            className="relative mt-2 flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-none bg-accent px-6 text-base font-black uppercase tracking-[0.22em] text-ink! transition-[filter,transform] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{submitting ? submittingLabel : submitLabel}</span>
            <span aria-hidden="true" className="text-lg leading-none">
              →
            </span>
          </button>
        </Form>

        {footer ? <div className="pt-4 text-center text-sm leading-relaxed text-text-secondary">{footer}</div> : null}
      </AuthPanel>
    </AuthShell>
  );
}
