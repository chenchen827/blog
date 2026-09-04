import { useEffect, useRef, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { App, Form, Input, Select } from "antd";

import AvatarCropUpload from "../../components/AvatarCropUpload";
import { sendEmailCode, signInUser, signUp, updateUserProfile } from "../../apis/register";
import { uploadImageToAliyun } from "../../apis/upload";
import { getToken } from "../../utils/auth";

const REGISTER_BG = "https://chenchen-827.oss-cn-chengdu.aliyuncs.com/uploads/3084e7e34121342b435ca62ea576a9d9.jpg";

interface RegisterFormValues {
  email: string;
  captchaText: string;
  username: string;
  nickname: string;
  password: string;
  confirmPassword: string;
  sex: number;
  avatar?: string;
}

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    if (error.message === "Failed to fetch") {
      return "无法连接服务器，请确认服务已启动。";
    }
    return error.message;
  }
  return "操作失败，请重试。";
}

export default function RegisterPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [form] = Form.useForm<RegisterFormValues>();

  const [sendingCode, setSendingCode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const captchaKeyRef = useRef("");

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
  }, [countdown > 0]);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSendCode() {
    const email = form.getFieldValue("email");
    if (!email?.trim()) {
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
      const res = await sendEmailCode(email.trim());
      console.log("sendEmailCode response:", res.data.captchaKey);
      captchaKeyRef.current = res.data.captchaKey;
      setCodeSent(true);
      setCountdown(90);
      message.success("验证码已发送，请查收邮箱。");
    } catch (error) {
      message.error(toErrorMessage(error));
    } finally {
      setSendingCode(false);
    }
  }

  async function handleFinish(values: RegisterFormValues) {
    if (!codeSent) {
      message.warning("请先发送邮箱验证码。");
      return;
    }

    if (!avatarFile) {
      message.warning("请先上传并裁剪头像。");
      return;
    }

    setSubmitting(true);
    try {
      await signUp({
        email: values.email.trim(),
        username: values.username.trim(),
        nickname: values.nickname.trim(),
        password: values.password,
        sex: Number(values.sex),
        captchaKey: captchaKeyRef.current,
        captchaText: values.captchaText.trim(),
      });
    } catch (error) {
      message.error(toErrorMessage(error));
      setSubmitting(false);
      return;
    }

    try {
      const loginRes = await signInUser(values.email.trim(), values.password);
      const userToken = loginRes.data.token;

      const avatarUrl = await uploadImageToAliyun(avatarFile, userToken);
      await updateUserProfile(userToken, { avatar: avatarUrl, sex: Number(values.sex) });
      form.setFieldValue("avatar", avatarUrl);

      message.success("注册成功，请登录。");
    } catch (error) {
      message.warning("账号已创建，但头像上传失败，请登录后重新设置头像。");
    } finally {
      setSubmitting(false);
    }

    navigate("/login?registered=1", { replace: true });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10 text-text-primary sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${REGISTER_BG}")` }} />
      <div aria-hidden="true" className="absolute inset-0 bg-canvas/84" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 38%, rgba(217,255,0,0.16), transparent 54%)",
        }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <section className="relative w-full max-w-155">
        <div className="relative border border-hairline bg-primary/92 p-7 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-sm [clip-path:polygon(0_0,100%_0,100%_calc(100%-22px),calc(100%-22px)_100%,0_100%)] sm:p-9">
          <div className="flex items-start justify-between gap-6 border-b border-hairline pb-1">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">System Archive</p>
              <h1 className="mt-3 text-[36px] font-black uppercase leading-none tracking-[-0.03em] text-text-primary sm:text-[42px]">User Register</h1>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">填写邮箱并完成验证码校验后，即可创建账号。</p>
            </div>
            <span aria-hidden="true" className="select-none text-[64px] font-black leading-none text-white/10">
              02
            </span>
          </div>

          <Form<RegisterFormValues> form={form} layout="vertical" requiredMark={false} onFinish={handleFinish} disabled={submitting} className="mt-4!">
            <Form.Item name="avatar" label="用户头像">
              <AvatarCropUpload onCrop={(file) => setAvatarFile(file)} />
            </Form.Item>

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
                  if (codeSent) {
                    setCodeSent(false);
                    captchaKeyRef.current = "";
                    form.setFieldValue("captchaText", "");
                  }
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
                    className="h-12 bg-accent px-4 text-sm font-black uppercase tracking-wider cursor-pointer text-ink transition-[filter] hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
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
              className="relative mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-none bg-accent px-6 text-base text-black font-bold uppercase tracking-[0.22em] cursor-pointer transition-[filter,transform] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{submitting ? "注册中…" : "完成注册"}</span>
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </button>
          </Form>

          <p className="mt-6 text-center text-sm leading-relaxed text-text-secondary">
            已有账号？
            <Link to="/login" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">
              返回登录
            </Link>
          </p>
        </div>

        <p className="mt-6 text-center text-xs font-black uppercase tracking-[0.28em] text-text-secondary">Blog Admin · User Registration</p>
      </section>
    </main>
  );
}
