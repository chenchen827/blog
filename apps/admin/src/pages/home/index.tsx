import { useEffect, useMemo, useState } from 'react'
import type { EChartsCoreOption } from 'echarts/core'
import { Alert, Empty, Spin } from 'antd'

import EChart from '../../components/EChart'
import { getMonthlyPosts, getSexStats } from '../../apis/charts'
import type { MonthlyPost, SexStat } from '../../apis/charts'

export default function HomePage() {
  const [posts, setPosts] = useState<MonthlyPost[]>([])
  const [sexStats, setSexStats] = useState<SexStat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    setLoading(true)
    setError('')
    Promise.all([getMonthlyPosts(), getSexStats()])
      .then(([postRes, sexRes]) => {
        if (!active) return
        setPosts(postRes.data.posts ?? [])
        setSexStats(sexRes.data.data ?? [])
      })
      .catch((err) => {
        const msg = err instanceof Error ? err.message : '加载数据失败'
        if (active) {
          setError(msg)
        }
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const lineOption = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: 'transparent',
      color: ['#d9ff00'],
      tooltip: {
        trigger: 'axis',
        backgroundColor: '#0a0a0a',
        borderColor: '#292929',
        textStyle: { color: '#f5f5f5' },
      },
      grid: { left: 48, right: 24, top: 32, bottom: 40 },
      xAxis: {
        type: 'category',
        data: posts.map((item) => item.month),
        axisLine: { lineStyle: { color: '#292929' } },
        axisLabel: { color: '#8a8a8a' },
      },
      yAxis: {
        type: 'value',
        minInterval: 1,
        splitLine: { lineStyle: { color: '#292929' } },
        axisLabel: { color: '#8a8a8a' },
      },
      series: [
        {
          name: '发布文章',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          data: posts.map((item) => item.count),
          lineStyle: { width: 3, color: '#d9ff00' },
          itemStyle: { color: '#d9ff00' },
          areaStyle: { color: '#d9ff00', opacity: 0.15 },
        },
      ],
    }),
    [posts],
  )

  const pieOption = useMemo<EChartsCoreOption>(
    () => ({
      backgroundColor: 'transparent',
      color: ['#d9ff00', '#ff3b30', '#8a8a8a'],
      tooltip: {
        trigger: 'item',
        backgroundColor: '#0a0a0a',
        borderColor: '#292929',
        textStyle: { color: '#f5f5f5' },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#f5f5f5' },
        inactiveColor: '#8a8a8a',
      },
      series: [
        {
          name: '用户性别',
          type: 'pie',
          radius: ['46%', '68%'],
          center: ['50%', '45%'],
          avoidLabelOverlap: true,
          itemStyle: { borderColor: '#0a0a0a', borderWidth: 2 },
          label: { color: '#f5f5f5' },
          data: sexStats,
        },
      ],
    }),
    [sexStats],
  )

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[24px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">数据看板</h1>
        <p className="mt-2 text-sm text-text-secondary">查看文章发布趋势与用户画像概览。</p>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={() => setError('')} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-none border border-hairline bg-primary p-5 lg:col-span-2">
          <h2 className="text-base font-black uppercase tracking-wider text-text-primary">文章发布曲线</h2>
          <p className="mt-1 text-xs text-text-secondary">按月份统计发布的文章数量</p>
          <div className="mt-4">
            {loading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Spin />
              </div>
            ) : posts.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无文章发布数据" />
              </div>
            ) : (
              <EChart option={lineOption} height={320} />
            )}
          </div>
        </div>

        <div className="rounded-none border border-hairline bg-primary p-5">
          <h2 className="text-base font-black uppercase tracking-wider text-text-primary">用户性别分布</h2>
          <p className="mt-1 text-xs text-text-secondary">男 / 女 / 未选择的用户占比</p>
          <div className="mt-4">
            {loading ? (
              <div className="flex h-[320px] items-center justify-center">
                <Spin />
              </div>
            ) : sexStats.length === 0 ? (
              <div className="flex h-[320px] items-center justify-center">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无用户数据" />
              </div>
            ) : (
              <EChart option={pieOption} height={320} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
