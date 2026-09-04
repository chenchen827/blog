import type { Key } from 'react'
import { Alert, App, Button, Empty, Grid, Input, Popconfirm, Space, Table } from 'antd'
import type { TableProps } from 'antd'
import { forceDeleteArticle, restoreArticles } from '../../apis/articles'
import { stripHtml } from '../../utils/tool'
import type { Article } from '../../apis/types'
import { useArticleList } from './useArticleList'

export default function ArticleTrashPage() {
  const { message } = App.useApp()
  const screens = Grid.useBreakpoint()
  const isCompact = !screens.md

  const {
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
  } = useArticleList({ deleted: true })

  /** 批量恢复 */
  const handleRestore = async (ids: Key[]) => {
    try {
      await restoreArticles(ids.map(String))
      message.success('已恢复')
      resetSelection()
      void load(keyword, 1, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '恢复失败')
    }
  }

  /** 单条彻底删除 */
  const handleForceDelete = async (id: number) => {
    try {
      await forceDeleteArticle(id)
      message.success('已彻底删除')
      setSelectedRowKeys((keys) => keys.filter((key) => key !== id))
      void load(keyword, pagination.current, pagination.pageSize)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '彻底删除失败')
    }
  }

  // 移动端折叠时间与摘要列，避免压缩桌面表格
  const columns: TableProps<Article>['columns'] = [
    { key: 'id', title: 'ID', dataIndex: 'id', width: 80 },
    { key: 'title', title: '标题', dataIndex: 'title', ellipsis: true },
  ]

  if (!isCompact) {
    columns.push(
      { key: 'content', title: '内容摘要', dataIndex: 'content', ellipsis: true, render: (value: string) => stripHtml(value) || '—' },
      { key: 'deletedAt', title: '删除时间', dataIndex: 'deletedAt', width: 180 },
      { key: 'createdAt', title: '创建时间', dataIndex: 'createdAt', width: 180 },
    )
  }

  columns.push({
    key: 'actions',
    title: '操作',
    width: 200,
    render: (_, record) => (
      <Space size="small">
        <Button type="link" size="small" onClick={() => handleRestore([record.id])}>
          恢复
        </Button>
        <Popconfirm title="彻底删除后不可恢复，确定继续？" onConfirm={() => handleForceDelete(record.id)}>
          <Button type="link" size="small" danger>
            彻底删除
          </Button>
        </Popconfirm>
      </Space>
    ),
  })

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-[42px] font-extrabold uppercase leading-tight tracking-[-0.01em] text-text-primary">回收站</h1>
        <p className="mt-2 text-base text-text-secondary">恢复或彻底删除已放入回收站的文章。</p>
      </div>

      {error && <Alert type="error" showIcon message={error} closable onClose={clearError} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <Input.Search allowClear placeholder="按标题搜索" onSearch={search} style={{ width: isCompact ? '100%' : 320 }} />
        <Button type="primary" disabled={selectedRowKeys.length === 0} onClick={() => handleRestore(selectedRowKeys)}>
          恢复选中
        </Button>
      </div>

      <Table<Article>
        rowKey="id"
        loading={loading}
        columns={columns}
        dataSource={articles}
        rowSelection={{ selectedRowKeys, onChange: setSelectedRowKeys }}
        locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="回收站为空" /> }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
        onChange={onTableChange}
        scroll={isCompact ? undefined : { x: 960 }}
      />
    </section>
  )
}