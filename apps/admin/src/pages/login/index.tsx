import { Link, Navigate, useNavigate } from "react-router";
import { App } from "antd";
import { Login } from "@repo/shared";

import { loginAdmin } from "../../apis/auth";
import type { LoginPayload } from "../../apis/auth";
import { clearRole, getToken, saveToken } from "../../utils/auth";

interface LoginFormValues extends LoginPayload {}

export default function LoginPage() {
  const navigate = useNavigate();
  const { message } = App.useApp();

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleFinish(values: LoginFormValues) {
    const res = await loginAdmin(values);
    saveToken(res.data.token);
    clearRole();
    message.success(res.message || "登录成功");
    navigate("/", { replace: true });
  }

  return (
    <Login
      title={
        <>
          Admin
          <br />
          Login
        </>
      }
      eyebrow="System Archive"
      description="使用管理员邮箱或用户名登录后台。"
      submitLabel="登录后台"
      footerNote="Blog Admin · Auth Terminal"
      onFinish={handleFinish}
      onError={(error) => message.error(error instanceof Error ? error.message : "登录失败,请重试")}
      footer={
        <>
          还没有账号？
          <Link to="/register" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">
            注册
          </Link>
        </>
      }
    />
  );
}
