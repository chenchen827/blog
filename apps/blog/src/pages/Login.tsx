import { useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { App, Button, Form, Input } from 'antd'

import { useAuth } from '../auth/AuthContext'

interface LoginValues {
  login: string
  password: string
}

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [loading, setLoading] = useState(false)

  const onFinish = async (values: LoginValues) => {
    setLoading(true)
    try {
      await login(values.login, values.password)
      message.success('登录成功')
      navigate('/')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Sign In</span>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight tracking-[-0.01em] text-text-primary">用户登录</h1>
      </div>

      <div className="rounded-none border border-hairline bg-primary/70 p-6">
        <Form<LoginValues> layout="vertical" requiredMark={false} onFinish={onFinish}>
          <Form.Item
            label={<span className="text-sm font-bold text-text-primary">账号</span>}
            name="login"
            rules={[{ required: true, whitespace: true, message: '请输入邮箱或用户名' }]}
          >
            <Input placeholder="邮箱 / 用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item
            label={<span className="text-sm font-bold text-text-primary">密码</span>}
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password placeholder="密码" autoComplete="current-password" />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>
        </Form>
      </div>

      <p className="text-center text-sm text-text-secondary">
        还没有账号？<Link to="/register" className="text-accent hover:underline">立即注册</Link>
      </p>
    </div>
  )
}
