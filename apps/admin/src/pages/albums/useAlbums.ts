import { useCallback, useEffect, useState } from "react";
import { App } from "antd";

import { listAlbums } from "../../apis/albums";
import type { Album } from "../../apis/albums";

/**
 * 相集列表数据获取逻辑（公共 hook）：
 * - 调用“查询全部相集”接口 /admin/albums
 * - 封装 loading / error 状态
 * - 供相集列表页 / 相片选择器等多处复用,避免重复实现
 */
export function useAlbums() {
  const { message } = App.useApp();

  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAlbums();
      setAlbums(res.data.albums ?? []);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "加载相集失败";
      setError(msg);
      message.error(msg);
    } finally {
      setLoading(false);
    }
  }, [message]);

  // 首次进入页面时加载
  useEffect(() => {
    void load();
  }, [load]);

  /** 清除错误提示 */
  const clearError = () => setError("");

  return {
    albums,
    loading,
    error,
    load,
    clearError,
  };
}
