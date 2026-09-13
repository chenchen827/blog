import type { MouseEvent } from "react";

export const ARTICLE_WINDOW_NAME = "blog-article-reader";

/** 使用固定窗口名打开文章，后续点击会刷新并聚焦同一窗口。 */
export function openArticleInWindow(event: MouseEvent<HTMLAnchorElement>) {
  if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

  event.preventDefault();
  const url = event.currentTarget.href;
  const articleWindow = window.open(url, ARTICLE_WINDOW_NAME);

  if (articleWindow) {
    articleWindow.opener = null;
    articleWindow.focus();
  } else {
    window.location.assign(url);
  }
}