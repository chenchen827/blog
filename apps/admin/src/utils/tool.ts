/** 将富文本 HTML 转换为纯文本摘要（去除标签并压缩空白） */
export function stripHtml(html: string): string {
  if (!html) return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  return (doc.body.textContent ?? '').replace(/\s+/g, ' ').trim()
}