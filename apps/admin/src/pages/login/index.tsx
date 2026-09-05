import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { App, Form, Input } from "antd";
import { LockOutlined, UserOutlined } from "@ant-design/icons";

import { loginAdmin } from "../../apis/auth";
import type { LoginPayload } from "../../apis/auth";
import { clearRole, getToken, saveToken } from "../../utils/auth";

const LOGIN_BG = "https://chenchen-827.oss-cn-chengdu.aliyuncs.com/uploads/3084e7e34121342b435ca62ea576a9d9.jpg";

interface LoginFormValues extends LoginPayload {}

export default function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();
  const [submitting, setSubmitting] = useState(false);

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleFinish(values: LoginFormValues) {
    setSubmitting(true);
    try {
      const res = await loginAdmin({
        login: values.login.trim(),
        password: values.password,
      });
      saveToken(res.data.token);
      clearRole();
      message.success(res.message || "登录成功");
      navigate("/", { replace: true });
    } catch (error) {
      message.error(error instanceof Error ? error.message : "登录失败，请重试");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-canvas px-4 py-10 text-text-primary sm:px-6">
      <div aria-hidden="true" className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url("${LOGIN_BG}")` }} />
      <div aria-hidden="true" className="absolute inset-0 bg-canvas/[0.82]" />
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-40"
        style={{
          background: "radial-gradient(circle at 50% 40%, rgba(217,255,0,0.16), transparent 52%)",
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

      <section className="relative w-full max-w-115">
        <div className="relative border border-hairline bg-primary/[0.92] p-7 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-sm [clip-path:polygon(0_0,100%_0,100%_calc(100%-26px),calc(100%-26px)_100%,0_100%)] sm:p-9">
          <div className="flex items-start justify-between gap-6 border-b border-hairline pb-7">
            <div className="min-w-0">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-accent">System Archive</p>
              <h1 className="mt-3 text-[42px] font-black uppercase leading-none tracking-[-0.03em] text-text-primary">
                Admin
                <br />
                Login
              </h1>
              <p className="mt-4 text-base leading-relaxed text-text-secondary">使用管理员邮箱或用户名登录后台。</p>
            </div>
            <span aria-hidden="true" className="select-none text-[64px] font-black leading-none text-white/10">
              01
            </span>
          </div>

          <Form<LoginFormValues> layout="vertical" requiredMark={false} onFinish={handleFinish} className="mt-7">
            <Form.Item name="login" label="邮箱 / 用户名" rules={[{ required: true, message: "请输入邮箱或用户名" }]}>
              <Input size="large" prefix={<UserOutlined className="text-text-secondary" />} placeholder="请输入邮箱或用户名" autoComplete="username" allowClear />
            </Form.Item>

            <Form.Item
              name="password"
              label="密码"
              rules={[
                { required: true, message: "请输入密码" },
                { min: 6, message: "密码至少为 6 位" },
              ]}
            >
              <Input.Password size="large" prefix={<LockOutlined className="text-text-secondary" />} placeholder="请输入密码" autoComplete="current-password" />
            </Form.Item>

            <button
              type="submit"
              disabled={submitting}
              className="relative mt-2 flex h-12 w-full items-center justify-center gap-3 rounded-none bg-accent px-6 font-bold text-black! uppercase tracking-[0.22em] transition-[filter,transform] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span>{submitting ? "登录中…" : "登录后台"}</span>
              <span aria-hidden="true" className="text-lg leading-none">
                →
              </span>
            </button>
          </Form>

          <p className="pt-4 text-center text-sm leading-relaxed text-text-secondary">
            还没有账号？
            <Link to="/register" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">注册</Link>
          </p>
        </div>

        <p className="pt-6 text-center text-xs font-black uppercase tracking-[0.28em] text-text-secondary">Blog Admin · Auth Terminal</p>
      </section>
    </main>
  );
}
