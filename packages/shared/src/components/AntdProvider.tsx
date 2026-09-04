import type { ReactNode } from "react";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";

export interface AntdProviderProps {
  children: ReactNode;
}

/**
 * 全局 antd 配置：
 * - 中文语言包
 * - 深色主题，主色 / 表面色 / 边框色 / 圆角对齐根目录 design.md（黑色杂志化 + 荧光黄）
 */
export function AntdProvider({ children }: AntdProviderProps) {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#d9ff00",
          colorInfo: "#d9ff00",
          colorLink: "#d9ff00",
          colorError: "#ff3b30",
          colorWarning: "#ff8a00",
          colorBgBase: "#050505",
          colorTextBase: "#f5f5f5",
          colorBgContainer: "#111111",
          colorBgElevated: "#0a0a0a",
          colorBorder: "#292929",
          colorBorderSecondary: "#292929",
          borderRadius: 8,
          controlHeight: 44,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
        },
        components: {
          Button: {
            borderRadius: 0,
            primaryColor: "#050505",
            fontWeight: 900,
            contentFontSize: 18,
            defaultBg: "#181818",
            defaultColor: "#f5f5f5",
            defaultBorderColor: "#222222",
            defaultHoverBg: "#111111",
            defaultHoverColor: "#f5f5f5",
            defaultHoverBorderColor: "#d9ff00",
          },
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}
