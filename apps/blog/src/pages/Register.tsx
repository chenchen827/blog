import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { App, Form, Input, Select } from 'antd'
import { AuthPanel, AuthPanelHeader } from '@repo/shared'

import { useAuth } from '../auth/AuthContext'
import { sendEmailCode } from '../apis/captcha'
import AuthBackdrop from '../components/AuthBackdrop'

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
    <AuthBackdrop code="02" label="Register">
      <div className="w-full max-w-xl space-y-6">
        <AuthPanel>
          <AuthPanelHeader eyebrow="User Enrollment" title="User Register" description="创建博客账号，用于收藏内容并访问专属空间。" index="02" />

          <Form<RegisterValues> form={form} layout="vertical" requiredMark={false} onFinish={onFinish} initialValues={{ sex: 2 }} className="pt-6">
            <Form.Item label="邮箱" name="email" rules={[{ required: true, type: 'email', message: '请输入正确的邮箱' }]}>
              <Input size="large" placeholder="example@qq.com" autoComplete="email" />
            </Form.Item>

            <Form.Item label="邮箱验证码" required>
              <div className="flex gap-2">
                <Form.Item name="captchaText" noStyle rules={[{ required: true, message: '请输入邮箱验证码' }]}>
                  <Input size="large" placeholder="邮箱验证码" autoComplete="one-time-code" />
                </Form.Item>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sending}
                  className="shrink-0 bg-accent px-4 text-sm font-black uppercase tracking-wider text-ink! transition-[filter] hover:brightness-90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {sending ? '发送中…' : '获取验证码'}
                </button>
              </div>
            </Form.Item>

            <Form.Item label="用户名" name="username" rules={[{ required: true, whitespace: true, message: '请输入用户名' }]}>
              <Input size="large" placeholder="用户名" autoComplete="username" />
            </Form.Item>

            <Form.Item label="昵称" name="nickname" rules={[{ required: true, whitespace: true, message: '请输入昵称' }]}>
              <Input size="large" placeholder="昵称" />
            </Form.Item>

            <Form.Item label="密码" name="password" rules={[{ required: true, min: 6, message: '密码至少 6 位' }]}>
              <Input.Password size="large" placeholder="密码" autoComplete="new-password" />
            </Form.Item>

            <Form.Item label="性别" name="sex">
              <Select
                size="large"
                options={[
                  { label: '保密', value: 2 },
                  { label: '男', value: 0 },
                  { label: '女', value: 1 },
                ]}
              />
            </Form.Item>

            <Form.Item className="mb-0">
              <button
                type="submit"
                disabled={loading}
                aria-busy={loading}
                className="flex min-h-11 w-full cursor-pointer items-center justify-center gap-3 rounded-none bg-accent px-6 text-base font-black uppercase tracking-[0.22em] text-ink! transition-[filter,transform] hover:brightness-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span>{loading ? '注册中…' : '完成注册'}</span>
                <span aria-hidden="true" className="text-lg leading-none">
                  →
                </span>
              </button>
            </Form.Item>
          </Form>
        </AuthPanel>

        <p className="text-center text-sm text-text-secondary">
          已有账号？
          <Link to="/login" className="ml-1 font-bold text-accent transition-colors hover:text-accent-yellow">
            去登录
          </Link>
        </p>
      </div>
    </AuthBackdrop>
  )
}
