import { Link, Navigate, useNavigate } from "react-router";
import { App } from "antd";
import { Register } from "@repo/shared";
import type { RegisterSubmitValues } from "@repo/shared";

import { sendEmailCode, signInUser, signUp, updateUserProfile } from "../../apis/register";
import { uploadImageToAliyun } from "../../apis/upload";
import { getToken } from "../../utils/auth";

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

  if (getToken()) {
    return <Navigate to="/" replace />;
  }

  async function handleSendCode(email: string) {
    const res = await sendEmailCode(email);
    return res.data.captchaKey;
  }

  async function handleRegister(values: RegisterSubmitValues) {
    await signUp({
      email: values.email,
      username: values.username,
      nickname: values.nickname,
      password: values.password,
      sex: values.sex,
      captchaKey: values.captchaKey,
      captchaText: values.captchaText,
    });

    try {
      if (!values.avatarFile) {
        throw new Error("请先上传并裁剪头像。");
      }

      const loginRes = await signInUser(values.email, values.password);
      const avatarUrl = await uploadImageToAliyun(values.avatarFile, loginRes.data.token);
      await updateUserProfile(loginRes.data.token, { avatar: avatarUrl, sex: values.sex });
      message.success("注册成功，请登录。");
    } catch {
      message.warning("账号已创建，但头像上传失败，请登录后重新设置头像。");
    }

    navigate("/login?registered=1", { replace: true });
  }

  return (
    <Register
      title="User Register"
      eyebrow="System Archive"
      description="填写邮箱并完成验证码校验后，即可创建账号。"
      submitLabel="完成注册"
      footerNote="Blog Admin · User Registration"
      onSendCode={handleSendCode}
      onCodeSent={() => message.success("验证码已发送，请查收邮箱。")}
      onSubmit={handleRegister}
      onError={(error) => message.error(toErrorMessage(error))}
      footer={
        <>
          已有账号？
          <Link to="/login" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">
            返回登录
          </Link>
        </>
      }
    />
  );
}
