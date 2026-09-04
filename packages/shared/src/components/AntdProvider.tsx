import type { ReactNode } from 'react'
import { App as AntdApp, ConfigProvider, theme } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export interface AntdProviderProps {
  children: ReactNode
}

/**
 * 全局 antd 配置：
 * - 中文语言包
 * - 深色主题，主色 / 表面色 / 边框色 / 圆角对齐根目录 design.md
 */
export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#00e5ff',
          colorInfo: '#00e5ff',
          colorBgBase: '#0d0d0d',
          colorTextBase: '#f5f5f5',
          colorBgContainer: '#242424',
          colorBgElevated: '#1a1a1a',
          colorBorder: '#333333',
          colorBorderSecondary: '#2a2a2a',
          colorLink: '#00e5ff',
          borderRadius: 12,
          controlHeight: 44,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 50,
            primaryColor: '#1a1a1a',
            fontWeight: 600,
            contentFontSize: 18,
            defaultBg: '#242424',
            defaultColor: '#f5f5f5',
            defaultBorderColor: '#333333',
            defaultHoverBg: '#2e2e2e',
            defaultHoverColor: '#f5f5f5',
            defaultHoverBorderColor: '#00e5ff',
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  )
}
