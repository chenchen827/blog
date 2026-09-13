import type { ReactNode } from "react";
import { App as AntdApp, ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";

export interface AntdProviderProps {
  children: ReactNode;
  glassModal?: boolean;
}

/**
 * 全局 antd 配置：
 * - 中文语言包
 * - 深色主题,主色 / 表面色 / 边框色 / 圆角对齐根目录 design.md（黑色杂志化 + 荧光黄）
 * - 将 design.md 的 Token 通过 ConfigProvider 映射到 antd 组件,避免各页面各自写散落的样式覆盖
 */
export function AntdProvider({ children, glassModal = false }: AntdProviderProps) {
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
          colorTextSecondary: "#8a8a8a",
          colorPrimaryHover: "#e8ff00",
          controlOutline: "rgba(217, 255, 0, 0.35)",
          borderRadius: 8,
          controlHeight: 44,
          fontFamily: "Inter, system-ui, -apple-system, sans-serif",
          ...(glassModal ? { colorBgMask: "rgba(2, 2, 2, 0.58)" } : {}),
        },
        components: {
          Button: {
            borderRadius: 6,
            primaryColor: "#050505",
            fontWeight: 800,
            contentFontSize: 18,
            defaultBg: "#121212",
            defaultColor: "#f5f5f5",
            defaultBorderColor: "#767678",
            defaultHoverBg: "#ffffff",
            defaultHoverColor: "#121212",
            defaultHoverBorderColor: "#121212",
            lineWidth: 3,
          },
          Input: {
            colorBgContainer: "#181818",
            colorText: "#f5f5f5",
            colorTextPlaceholder: "#8a8a8a",
            hoverBorderColor: "#d9ff00",
            activeBorderColor: "#d9ff00",
            borderRadius: 6,
          },
          Table: {
            colorBgContainer: "#323232",
            headerBg: "#1a1a1a",
            rowSelectedBg: "#181818",
            rowSelectedHoverBg: "#181818",
            borderColor: "#292929",
            cellPaddingBlock: 14,
            cellPaddingInline: 16,
          },
          Pagination: {
            colorBgContainer: "#111111",
            colorText: "#f5f5f5",
            colorPrimary: "#050505",
            colorPrimaryHover: "#050505",
            itemBg: "#111111",
            itemActiveBg: "#d9ff00",
          },
          Checkbox: {
            colorPrimary: "#d9ff00",
            colorPrimaryHover: "#e8ff00",
            colorBorder: "#767678",
            colorBgContainer: "#0000005c",
          },
          ...(glassModal
            ? {
                Modal: {
                  contentBg: "rgba(10, 10, 10, 0.42)",
                  headerBg: "transparent",
                  footerBg: "transparent",
                  titleColor: "#f5f5f5",
                },
              }
            : {}),
        },
      }}
    >
      <AntdApp>{children}</AntdApp>
    </ConfigProvider>
  );
}