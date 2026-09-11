import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { App, Form, Input, Select } from "antd";

import { AuthPanel, AuthPanelHeader, AuthShell } from "./AuthShell";
import type { AuthShellLayout } from "./AuthShell";
import { AvatarCropUpload } from "./AvatarCropUpload";

export interface RegisterFormValues {
  email: string;
  captchaText: string;
  username: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  sex: number;
  avatar?: string;
}

export interface RegisterSubmitValues {
  email: string;
  captchaText: string;
  username: string;
  nickname: string;
  password: string;
  sex: number;
  captchaKey: string;
  avatarFile: File | null;
}

export type RegisterErrorContext = "sendCode" | "submit";

export interface RegisterProps {
  /** 请求邮箱验证码,并返回服务端下发的 captchaKey。 */
  onSendCode: (email: string) => Promise<string>;
  /** 提交规范化后的注册数据；由调用方保留 API、上传与路由逻辑。 */
  onSubmit: (values: RegisterSubmitValues) => void | Promise<void>;
  onError?: (error: unknown, context: RegisterErrorContext) => void;
  onCodeSent?: (email: string) => void;
  requireAvatar?: boolean;
  title?: ReactNode;
  eyebrow?: ReactNode;
  description?: ReactNode;
  index?: ReactNode;
  submitLabel?: ReactNode;
  submittingLabel?: ReactNode;
  footer?: ReactNode;
  footerNote?: ReactNode;
  layout?: AuthShellLayout;
}

/** 公共注册模块：统一注册视觉、邮箱验证码倒计时与头像裁剪交互。 */
export function Register({
  onSendCode,
  onSubmit,
  onError,
  onCodeSent,
  requireAvatar = true,
  title = "User Register",
  eyebrow = "System Archive",
  description = "填写邮箱并完成验证码校验后,即可创建账号。",
  index = "02",
  submitLabel = "完成注册",
  submittingLabel = "注册中…",
  footer,
  footerNote,
  layout = "standalone",
}: RegisterProps) {
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();
  const captchaKeyRef = useRef("");
  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => {
    if (countdown <= 0) return;

    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  async function handleSendCode() {
    const email = form.getFieldValue("email")?.trim();
    if (!email) {
      message.warning("请先填写邮箱。");
      return;
    }

    try {
      await form.validateFields(["email"]);
    } catch {
      return;
    }

    setSendingCode(true);
    try {
      const captchaKey = await onSendCode(email);
      captchaKeyRef.current = captchaKey;
      setCodeSent(true);
      setCountdown(90);
      onCodeSent?.(email);
    } catch (error) {
      onError?.(error, "sendCode");
    } finally {
      setSendingCode(false);
    }
  }

  async function handleFinish(values: RegisterFormValues) {
    if (!codeSent) {
      message.warning("请先发送邮箱验证码。");
      return;
    }

    if (requireAvatar && !avatarFile) {
      message.warning("请先上传并裁剪头像。");
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit({
        email: values.email.trim(),
        username: values.username.trim(),
        nickname: values.nickname.trim(),
        password: values.password,
        sex: Number(values.sex),
        captchaKey: captchaKeyRef.current,
        captchaText: values.captchaText.trim(),
        avatarFile,
      });
    } catch (error) {
      onError?.(error, "submit");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell layout={layout} maxWidth="register" footerNote={footerNote}>
      <AuthPanel>
        <AuthPanelHeader eyebrow={eyebrow} title={title} description={description} index={index} />

        <Form<RegisterFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} disabled={submitting} className="mt-4!">
          {requireAvatar ? (
            <Form.Item name="avatar" label="用户头像">
              <AvatarCropUpload
                onCrop={(file, previewUrl) => {
                  setAvatarFile(file);
                  form.setFieldValue("avatar", previewUrl);
                }}
              />
            </Form.Item>
          ) : null}

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: "请输入邮箱" },
              { type: "email", message: "邮箱格式不正确" },
            ]}
          >
            <Input
              size="large"
              placeholder="请输入邮箱"
              autoComplete="email"
              allowClear
              onChange={() => {
                if (!codeSent) return;
                setCodeSent(false);
                setCountdown(0);
                captchaKeyRef.current = "";
                form.setFieldValue("captchaText", "");
              }}
            />
          </Form.Item>

          <Form.Item name="captchaText" label="邮箱验证码" rules={[{ required: true, message: "请输入邮箱验证码" }]}>
            <Input
              size="large"
              placeholder="请输入验证码"
              autoComplete="one-time-code"
              allowClear
              addonAfter={
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendingCode || countdown > 0 || submitting}
                  className="h-12 cursor-pointer bg-accent px-4 text-sm font-black uppercase tracking-wider text-ink! transition-[filter] hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {countdown > 0 ? `${countdown}s` : "发送验证码"}
                </button>
              }
            />
          </Form.Item>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="username"
              label="用户名"
              rules={[
                { required: true, message: "请输入用户名" },
                { min: 2, max: 45, message: "用户名长度为 2 ~ 45 位" },
              ]}
            >
              <Input size="large" placeholder="请输入用户名" autoComplete="username" allowClear />
            </Form.Item>

            <Form.Item
              name="nickname"
              label="昵称"
              rules={[
                { required: true, message: "请输入昵称" },
                { min: 2, max: 45, message: "昵称长度为 2 ~ 45 位" },
              ]}
            >
              <Input size="large" placeholder="请输入昵称" allowClear />
            </Form.Item>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, max: 45, message: "密码长度为 6 ~ 45 位" },
              ]}
            >
              <Input.Password size="large" placeholder="请输入密码" autoComplete="new-password" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="确认密码"
              dependencies={["password"]}
              rules={[
                { required: true, message: "请再次输入密码" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("两次输入的密码不一致"));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="请再次输入密码" autoComplete="new-password" />
            </Form.Item>
          </div>

          <Form.Item name="sex" label="性别" initialValue={2}>
            <Select
              size="large"
              options={[
                { label: "保密", value: 2 },
                { label: "男", value: 0 },
                { label: "女", value: 1 },
              ]}
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

        {footer ? <div className="mt-6 text-center text-sm leading-relaxed text-text-secondary">{footer}</div> : null}
      </AuthPanel>
    </AuthShell>
  );
}
