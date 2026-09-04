import { useCallback, useEffect, useRef, useState } from "react";
import type { Key } from "react";
import { App } from "antd";
import type { TableProps } from "antd";
import { listArticles } from "../../apis/articles";
import type { Article } from "../../apis/types";

interface UseArticleListOptions {
  /** true 查询回收站，false 查询正常列表 */
  deleted: boolean;
}

export interface ArticlePaginationState {
  current: number;
  pageSize: number;
  total: number;
}

/**
 * 文章列表通用状态与逻辑：
 * - 标题搜索
 * - 服务端分页
 * - 行选择
 * - loading / error 状态
 * 列表页与回收站共用，避免重复实现。
 */
export function useArticleList({ deleted }: UseArticleListOptions) {
  const { message } = App.useApp();

  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [pagination, setPagination] = useState<ArticlePaginationState>({ current: 1, pageSize: 10, total: 0 });
  const [selectedRowKeys, setSelectedRowKeys] = useState<Key[]>([]);

  // 用 ref 保存最新搜索词，避免表格回调中的闭包读到旧值
  const keywordRef = useRef(keyword);
  keywordRef.current = keyword;

  const load = useCallback(
    async (title: string, current: number, pageSize: number) => {
      setLoading(true);
      setError("");
      try {
        const res = await listArticles({ title, currentPage: current, pageSize, deleted });
        setArticles(res.data.articles);
        setPagination({
          current: res.data.pagination.currentPage,
          pageSize: res.data.pagination.pageSize,
          total: res.data.pagination.total,
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "加载文章失败";
        setError(msg);
        message.error(msg);
      } finally {
        setLoading(false);
      }
    },
    [deleted, message],
  );

  // 首次进入页面时加载第一页
  useEffect(() => {
    void load("", 1, 10);
  }, [load]);

  /** 标题搜索：重置回第一页 */
  const search = (value: string) => {
    setKeyword(value);
    void load(value, 1, pagination.pageSize);
  };

  /** 表格分页变化 */
  const onTableChange: TableProps<Article>["onChange"] = (nextPagination) => {
    const current = nextPagination.current ?? 1;
    const pageSize = nextPagination.pageSize ?? pagination.pageSize;
    void load(keywordRef.current, current, pageSize);
  };

  /** 清空已选行 */
  const resetSelection = () => setSelectedRowKeys([]);

  /** 清除错误提示 */
  const clearError = () => setError("");

  return {
    articles,
    loading,
    error,
    keyword,
    pagination,
    selectedRowKeys,
    setSelectedRowKeys,
    load,
    search,
    onTableChange,
    resetSelection,
    clearError,
  };
}
