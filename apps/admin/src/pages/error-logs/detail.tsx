import { useEffect, useState } from 'react'
import { Alert, App, Button, Popconfirm, Spin, Tag, Typography } from 'antd'
import { useNavigate, useSearchParams } from 'react-router'

import { deleteLog, getLog } from '../../apis/logs'
import type { ErrorLog } from '../../apis/logs'

function levelColor(level?: string): string {
  const value = (level ?? '').toLowerCase()
  if (value === 'error' || value === 'fatal') return 'red'
  if (value === 'warn' || value === 'warning') return 'orange'
  if (value === 'info') return 'cyan'
  return 'default'
}

export default function ErrorLogDetailPage() {
  const { message } = App.useApp()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const id = searchParams.get('id')

  const [log, setLog] = useState<ErrorLog | null>(null)
  const [loading, setLoading] = useState(Boolean(id))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    let active = true
    setLoading(true)
    setError('')
    getLog(id)
      .then((res) => {
        if (active) setLog(res.data.log)
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '加载日志失败'
        if (active) {
          setError(msg)
          message.error(msg)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [id, message])

  const handleDelete = async () => {
    if (!id) return
    try {
      await deleteLog(id)
      message.success('日志已删除')
      navigate('/error-logs/list')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除日志失败')
    }
  }

  if (!id) {
    return (
      <section className="space-y-6">
        <Alert type="warning" showIcon message="缺少日志 ID，请从日志列表进入。" />
        <Button onClick={() => navigate('/error-logs/list')}>返回列表</Button>
      </section>
    )
  }

  if (loading) {
    return (
      <div className="flex min-h-80 items-center justify-center">
        <Spin />
      </div>
    )
  }

  return (
    <section className="max-w-4xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button type="link" className="!px-0" onClick={() => navigate('/error-logs/list')}>
            ← 返回列表
          </Button>
          <h1 className="mt-2 text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">日志详情</h1>
        </div>
        <Popconfirm title="确定删除该日志？" onConfirm={handleDelete}>
          <Button danger>删除日志</Button>
        </Popconfirm>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      {log ? (
        <>
          <div className="rounded-none border border-hairline bg-primary p-6">
            <div className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">ID</p>
                <p className="mt-2 text-base text-text-primary">{log.id}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">级别</p>
                <p className="mt-2"><Tag color={levelColor(log.level)}>{log.level || '未知'}</Tag></p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">来源服务</p>
                <p className="mt-2 text-base text-text-primary">{log.meta?.service || '—'}</p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">时间</p>
                <p className="mt-2 text-base text-text-primary">{log.timestamp || '—'}</p>
              </div>
            </div>
          </div>

          <div className="rounded-none border border-hairline bg-primary p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">错误信息</p>
            <Typography.Paragraph className="!mt-3 !mb-0 text-base text-text-primary">
              {log.message || '—'}
            </Typography.Paragraph>
          </div>

          <div className="rounded-none border border-hairline bg-primary p-6">
            <p className="text-xs font-bold uppercase tracking-wider text-text-secondary">堆栈信息</p>
            <pre className="mt-3 overflow-auto rounded-none border border-hairline bg-canvas p-4 text-sm leading-relaxed text-text-primary">
              {log.meta?.stack || '暂无堆栈信息'}
            </pre>
          </div>
        </>
      ) : (
        <Alert type="info" showIcon message="未找到该日志，可能已被删除。" />
      )}
    </section>
  )
}
