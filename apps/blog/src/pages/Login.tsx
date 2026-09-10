import { Link, useNavigate } from 'react-router'
import { App } from 'antd'
import { Login } from '@repo/shared'

import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()

  const handleFinish = async (values: { login: string; password: string }) => {
    await login(values.login, values.password)
    message.success('登录成功')
    navigate('/')
  }

  return (
    <Login
      layout="embedded"
      title={
        <>
          User
          <br />
          Login
        </>
      }
      eyebrow="Account Access"
      description="使用博客账号登录，继续访问你的个人空间。"
      submitLabel="登录"
      footerNote="Blog · Auth Terminal"
      onFinish={handleFinish}
      onError={(error) => message.error(error instanceof Error ? error.message : '登录失败')}
      footer={
        <>
          还没有账号？
          <Link to="/register" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">
            立即注册
          </Link>
        </>
      }
    />
  )
}
