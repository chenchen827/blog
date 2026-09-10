import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { App, Button, Form, Input, Select } from 'antd'

import { useAuth } from '../auth/AuthContext'
import { sendEmailCode } from '../apis/captcha'

interface RegisterValues {
  email: string
  username: string
  nickname: string
  password: string
  sex: number
  captchaText: string
}

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [form] = Form.useForm<RegisterValues>()
  const captchaKeyRef = useRef<string>('')
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const handleSendCode = async () => {
    const email = form.getFieldValue('email')
    if (!email) {
      message.warning('请先填写邮箱地址')
      return
    }
    setSending(true)
    try {
      const res = await sendEmailCode(email)
      captchaKeyRef.current = res.data.captchaKey
      message.success('验证码已发送到邮箱，请查收')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '发送失败')
    } finally {
      setSending(false)
    }
  }

  const onFinish = async (values: RegisterValues) => {
    setLoading(true)
    try {
      await register({
        email: values.email,
        username: values.username,
        nickname: values.nickname,
        password: values.password,
        sex: values.sex,
        captchaKey: captchaKeyRef.current,
        captchaText: values.captchaText,
      })
      message.success('注册成功，已自动登录')
      navigate('/')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-6">
      <div>
        <span className="text-[10px] font-black uppercase tracking-[0.5em] text-accent">Sign Up</span>
        <h1 className="mt-2 text-3xl font-black uppercase leading-tight tracking-[-0.01em] text-text-primary">用户注册</h1>
      </div>

      <div className="rounded-none border border-hairline bg-primary/70 p-6">
        <Form<RegisterValues> form={form} layout="vertical" requiredMark={false} onFinish={onFinish} initialValues={{ sex: 2 }}>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">邮箱</span>} name="email" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
            <Input placeholder="example@qq.com" autoComplete="email" />
          </Form.Item>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">邮箱验证码</span>} required>
            <div className="flex gap-2">
              <Form.Item name="captchaText" noStyle rules={[{ required: true, message: '请输入邮箱验证码' }]}>
                <Input placeholder="邮箱验证码" />
              </Form.Item>
              <Button onClick={handleSendCode} loading={sending} className="shrink-0">
                获取验证码
              </Button>
            </div>
          </Form.Item>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">用户名</span>} name="username" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}>
            <Input placeholder="用户名" autoComplete="username" />
          </Form.Item>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">昵称</span>} name="nickname" rules={[{ required: true, whitespace: true, message: '请输入昵称' }]}>
            <Input placeholder="昵称" />
          </Form.Item>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">密码</span>} name="password" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
            <Input.Password placeholder="密码" autoComplete="new-password" />
          </Form.Item>
          <Form.Item label={<span className="text-sm font-bold text-text-primary">性别</span>} name="sex">
            <Select
              options={[
                { label: '保密', value: 2 },
                { label: '男', value: 0 },
                { label: '女', value: 1 },
              ]}
            />
          </Form.Item>
          <Form.Item className="mb-0">
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>
      </div>

      <p className="text-center text-sm text-text-secondary">
        已有账号？<Link to="/login" className="text-accent hover:underline">去登录</Link>
      </p>
    </div>
  )
}
