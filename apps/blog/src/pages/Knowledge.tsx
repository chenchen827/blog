import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { FeishuDocumentListData, FeishuListItem, FeishuPagination } from "../apis/feishu";
import { getDocumentMarkdown, getDocuments, getFolders } from "../apis/feishu";
import KnowledgeMarkdown from "../components/KnowledgeMarkdown";

const PAGE_SIZE = 100;
const MAX_EMPTY_PAGE_HOPS = 10;

interface Breadcrumb {
  name: string;
  token?: string;
}

/** 根目录不传 folderToken，由后端 FEI_SHU_ROOT_FOLDER_TOKEN 决定。 */
const ROOT_BREADCRUMB: Breadcrumb = { name: "全部知识", token: undefined };

const EMPTY_PAGINATION: FeishuPagination = {
  pageSize: PAGE_SIZE,
  pageToken: null,
  hasMore: false,
};

const DATE_FORMATTER = new Intl.DateTimeFormat("zh-CN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "请求失败，请稍后重试";
}

function mergeItems(current: FeishuListItem[], incoming: FeishuListItem[]): FeishuListItem[] {
  const items = new Map(current.map((item) => [item.token, item]));
  incoming.forEach((item) => items.set(item.token, item));
  return [...items.values()];
}

function formatTimestamp(value?: string): string {
  if (!value) return "—";

  const numeric = /^\d+$/.test(value) ? Number(value) : Number.NaN;
  const timestamp = Number.isFinite(numeric) ? (value.length > 10 ? numeric : numeric * 1000) : Date.parse(value);
  if (!Number.isFinite(timestamp)) return "—";

  return DATE_FORMATTER.format(new Date(timestamp));
}

/**
 * /feishu/documents 可能返回空文档页但仍带 hasMore。
 * 这里持续沿游标向后取，直到拿到文档、没有更多数据或达到安全上限。
 */
async function fetchDocumentBatch(folderToken: string | undefined, pageToken: string | null): Promise<FeishuDocumentListData> {
  let currentPageToken = pageToken;
  let pagination = EMPTY_PAGINATION;
  const documents: FeishuListItem[] = [];

  for (let hop = 0; hop < MAX_EMPTY_PAGE_HOPS; hop += 1) {
    const response = await getDocuments({
      folderToken,
      pageSize: PAGE_SIZE,
      pageToken: currentPageToken ?? undefined,
    });

    documents.push(...response.data.documents);
    pagination = response.data.pagination;
    currentPageToken = pagination.pageToken || null;

    if (documents.length > 0 || !pagination.hasMore || !currentPageToken) break;
  }

  return {
    documents: mergeItems([], documents),
    pagination,
  };
}

export default function Knowledge() {
  const [breadcrumbs, setBreadcrumbs] = useState<Breadcrumb[]>([ROOT_BREADCRUMB]);
  const [folders, setFolders] = useState<FeishuListItem[]>([]);
  const [documents, setDocuments] = useState<FeishuListItem[]>([]);
  const [folderPagination, setFolderPagination] = useState<FeishuPagination>(EMPTY_PAGINATION);
  const [documentPagination, setDocumentPagination] = useState<FeishuPagination>(EMPTY_PAGINATION);
  const [loading, setLoading] = useState(true);
  const [loadingMoreFolders, setLoadingMoreFolders] = useState(false);
  const [loadingMoreDocuments, setLoadingMoreDocuments] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [showBackToTop, setShowBackToTop] = useState(false);

  const [selectedDocumentToken, setSelectedDocumentToken] = useState<string | null>(null);
  const [documentContent, setDocumentContent] = useState("");
  const [documentContentLoading, setDocumentContentLoading] = useState(false);
  const [documentContentError, setDocumentContentError] = useState<string | null>(null);

  const loadSequenceRef = useRef(0);
  const contentSequenceRef = useRef(0);

  const currentFolder = breadcrumbs[breadcrumbs.length - 1] ?? ROOT_BREADCRUMB;
  const currentFolderToken = currentFolder.token;
  const selectedDocument = documents.find((item) => item.token === selectedDocumentToken) ?? null;

  const visibleFolders = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    if (!normalizedKeyword) return folders;
    return folders.filter((folder) => folder.name.toLocaleLowerCase().includes(normalizedKeyword));
  }, [folders, keyword]);

  const visibleDocuments = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLocaleLowerCase();
    if (!normalizedKeyword) return documents;
    return documents.filter((document) => document.name.toLocaleLowerCase().includes(normalizedKeyword));
  }, [documents, keyword]);

  useEffect(() => {
    const updateBackToTopVisibility = () => {
      setShowBackToTop(window.scrollY > window.innerHeight / 2);
    };

    updateBackToTopVisibility();
    window.addEventListener("scroll", updateBackToTopVisibility, { passive: true });
    window.addEventListener("resize", updateBackToTopVisibility);

    return () => {
      window.removeEventListener("scroll", updateBackToTopVisibility);
      window.removeEventListener("resize", updateBackToTopVisibility);
    };
  }, []);

  const loadDocument = useCallback(async (document: FeishuListItem) => {
    const requestId = ++contentSequenceRef.current;

    setSelectedDocumentToken(document.token);
    setDocumentContent("");
    setDocumentContentError(null);
    setDocumentContentLoading(true);

    try {
      const response = await getDocumentMarkdown(document.token);
      if (requestId !== contentSequenceRef.current) return;
      setDocumentContent(response.data.content ?? "");
    } catch (loadError) {
      if (requestId !== contentSequenceRef.current) return;
      setDocumentContentError(getErrorMessage(loadError));
    } finally {
      if (requestId === contentSequenceRef.current) setDocumentContentLoading(false);
    }
  }, []);

  useEffect(() => {
    const requestId = ++loadSequenceRef.current;
    contentSequenceRef.current += 1;

    setLoading(true);
    setError(null);
    setFolders([]);
    setDocuments([]);
    setFolderPagination(EMPTY_PAGINATION);
    setDocumentPagination(EMPTY_PAGINATION);
    setLoadingMoreFolders(false);
    setLoadingMoreDocuments(false);
    setSelectedDocumentToken(null);
    setDocumentContent("");
    setDocumentContentError(null);
    setDocumentContentLoading(false);

    const loadCurrentFolder = async () => {
      try {
        const [folderResponse, documentResponse] = await Promise.all([
          getFolders({ folderToken: currentFolderToken, pageSize: PAGE_SIZE }),
          fetchDocumentBatch(currentFolderToken, null),
        ]);

        if (requestId !== loadSequenceRef.current) return;

        setFolders(folderResponse.data.folders);
        setFolderPagination(folderResponse.data.pagination);
        setDocuments(documentResponse.documents);
        setDocumentPagination(documentResponse.pagination);

        const firstDocument = documentResponse.documents[0];
        if (firstDocument) void loadDocument(firstDocument);
      } catch (loadError) {
        if (requestId !== loadSequenceRef.current) return;
        setError(getErrorMessage(loadError));
      } finally {
        if (requestId === loadSequenceRef.current) setLoading(false);
      }
    };

    void loadCurrentFolder();

    return () => {
      if (loadSequenceRef.current === requestId) loadSequenceRef.current += 1;
    };
  }, [currentFolderToken, loadDocument, refreshKey]);

  const loadMoreFolders = async () => {
    if (loadingMoreFolders || !folderPagination.hasMore || !folderPagination.pageToken) return;

    const requestId = loadSequenceRef.current;
    setLoadingMoreFolders(true);
    try {
      const response = await getFolders({
        folderToken: currentFolderToken,
        pageSize: PAGE_SIZE,
        pageToken: folderPagination.pageToken,
      });
      if (requestId !== loadSequenceRef.current) return;

      setFolders((current) => mergeItems(current, response.data.folders));
      setFolderPagination(response.data.pagination);
    } catch (loadError) {
      if (requestId === loadSequenceRef.current) setError(getErrorMessage(loadError));
    } finally {
      if (requestId === loadSequenceRef.current) setLoadingMoreFolders(false);
    }
  };

  const loadMoreDocuments = async () => {
    if (loadingMoreDocuments || !documentPagination.hasMore || !documentPagination.pageToken) return;

    const requestId = loadSequenceRef.current;
    setLoadingMoreDocuments(true);
    try {
      const response = await fetchDocumentBatch(currentFolderToken, documentPagination.pageToken);
      if (requestId !== loadSequenceRef.current) return;

      setDocuments((current) => mergeItems(current, response.documents));
      setDocumentPagination(response.pagination);
    } catch (loadError) {
      if (requestId === loadSequenceRef.current) setError(getErrorMessage(loadError));
    } finally {
      if (requestId === loadSequenceRef.current) setLoadingMoreDocuments(false);
    }
  };

  const openFolder = (folder: FeishuListItem) => {
    setKeyword("");
    setBreadcrumbs((current) => [...current, { name: folder.name, token: folder.token }]);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  };

  const goToBreadcrumb = (index: number) => {
    if (index === breadcrumbs.length - 1) return;
    setKeyword("");
    setBreadcrumbs((current) => current.slice(0, index + 1));
  };

  const directorySummary = loading ? "SYNCING" : `${visibleFolders.length.toString().padStart(2, "0")} DIR / ${visibleDocuments.length.toString().padStart(2, "0")} DOCX`;

  return (
    <div className="knowledge-page-shell">
      <div className="knowledge-newspaper">
        <header className="news-masthead">
        <div className="news-masthead-meta">
          <span>FEISHU CLOUD ARCHIVE</span>
          <span>VOL. 01 · DAILY EDITION</span>
          <span>CURSOR ONLINE</span>
        </div>
        <div className="news-masthead-title-row">
          <span aria-hidden="true" className="news-masthead-seal">知</span>
          <div className="news-masthead-title">
            <p>THE DAILY KNOWLEDGE</p>
            <h1>知识库</h1>
          </div>
          <div className="news-masthead-edition">
            <span>EST. 2026</span>
            <span>NO. {documents.length.toString().padStart(3, "0")}</span>
          </div>
        </div>
        <p className="news-deck">日常开发学习的一些知识积累。基于个人理解，不保证正确性。若有疑问或错误，欢迎通过邮箱联系我。</p>
      </header>

      <section aria-label="知识库状态" className="news-dateline">
        <div className="news-dateline-item">
          <span>Archive Path</span>
          <strong title={breadcrumbs.map((item) => item.name).join(" / ")}>{breadcrumbs.map((item) => item.name).join(" / ")}</strong>
        </div>
        <div className="news-dateline-item">
          <span>Directory</span>
          <strong>{folders.length.toString().padStart(2, "0")} Folders</strong>
        </div>
        <div className="news-dateline-item">
          <span>Documents</span>
          <strong>{documents.length.toString().padStart(2, "0")} Docx</strong>
        </div>
        <div className="news-dateline-item">
          <span>Signal</span>
          <strong>{directorySummary}</strong>
        </div>
      </section>

      {error && (
        <div role="alert" className="news-alert">
          <div>
            <p>Archive Error</p>
            <strong>{error}</strong>
          </div>
          <button type="button" onClick={() => setRefreshKey((current) => current + 1)}>
            Retry Sync
          </button>
        </div>
      )}

      <div className="news-archive-grid">
        <aside className="news-sidebar">
          <section className="news-sidebar-block">
            <div className="news-section-title">
              <span>Directory</span>
              <span>目录</span>
            </div>
            <nav aria-label="知识库目录路径" className="news-breadcrumbs">
              {breadcrumbs.map((item, index) => (
                <span key={`${item.token ?? "root"}-${index}`} className="news-breadcrumb-item">
                  {index > 0 && <span aria-hidden="true" className="news-breadcrumb-separator">◆</span>}
                  <button
                    type="button"
                    onClick={() => goToBreadcrumb(index)}
                    className={index === breadcrumbs.length - 1 ? "news-breadcrumb is-active" : "news-breadcrumb"}
                  >
                    {item.name}
                  </button>
                </span>
              ))}
            </nav>
          </section>

          <section className="news-sidebar-block">
            <label htmlFor="knowledge-filter" className="news-section-title news-filter-label">
              <span>Search Archive</span>
              <span>检索</span>
            </label>
            <div className="news-search">
              <input
                id="knowledge-filter"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="筛选目录或文档名…"
              />
              {keyword && (
                <button type="button" onClick={() => setKeyword("")}>
                  Clear
                </button>
              )}
            </div>
          </section>

          <div className="news-list-columns">
            <section className="news-list-section">
              <div className="news-list-heading">
                <h2>Folders</h2>
                <span>{visibleFolders.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="news-list">
                {loading ? (
                  <p className="news-list-state">Syncing folders…</p>
                ) : visibleFolders.length === 0 ? (
                  <p className="news-list-state">{keyword ? "No matching folders." : "No subfolders."}</p>
                ) : (
                  visibleFolders.map((folder) => (
                    <button key={folder.token} type="button" onClick={() => openFolder(folder)} className="news-folder-item">
                      <span className="news-item-mark">DIR</span>
                      <span className="news-item-copy">
                        <strong>{folder.name}</strong>
                        <small>Open folder / {formatTimestamp(folder.modifiedTime)}</small>
                      </span>
                      <span aria-hidden="true" className="news-item-arrow">→</span>
                    </button>
                  ))
                )}
              </div>
              {!loading && folderPagination.hasMore && folderPagination.pageToken && (
                <button type="button" onClick={() => void loadMoreFolders()} disabled={loadingMoreFolders} className="news-load-more">
                  {loadingMoreFolders ? "Loading…" : "Load folders"}
                </button>
              )}
            </section>

            <section className="news-list-section">
              <div className="news-list-heading">
                <h2>Documents</h2>
                <span>{visibleDocuments.length.toString().padStart(2, "0")}</span>
              </div>
              <div className="news-list">
                {loading ? (
                  <p className="news-list-state">Syncing documents…</p>
                ) : visibleDocuments.length === 0 ? (
                  <p className="news-list-state">{keyword ? "No matching documents." : "No docx documents in this layer."}</p>
                ) : (
                  visibleDocuments.map((document) => {
                    const active = document.token === selectedDocumentToken;
                    return (
                      <button
                        key={document.token}
                        type="button"
                        onClick={() => void loadDocument(document)}
                        className={active ? "news-document-item is-active" : "news-document-item"}
                      >
                        <span className="news-item-mark">DOCX</span>
                        <span className="news-item-copy">
                          <strong>{document.name}</strong>
                          <small>Modified / {formatTimestamp(document.modifiedTime)}</small>
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
              {!loading && documentPagination.hasMore && documentPagination.pageToken && (
                <button type="button" onClick={() => void loadMoreDocuments()} disabled={loadingMoreDocuments} className="news-load-more">
                  {loadingMoreDocuments ? "Loading…" : "Load documents"}
                </button>
              )}
            </section>
          </div>
        </aside>

        <article className="news-reader">
          {loading ? (
            <div className="news-loading">
              <span>Printing issue…</span>
            </div>
          ) : !selectedDocument ? (
            <div className="news-empty">
              <span aria-hidden="true" className="news-empty-mark">∅</span>
              <p>No Document</p>
              <h2>{keyword ? "当前层无匹配文档" : "当前目录没有文档"}</h2>
              <span>{keyword ? "清除筛选条件，或进入其他子目录继续检索。" : "此目录仅包含文件夹，或尚未上传可供读取的 docx 文档。"}</span>
            </div>
          ) : (
            <>
              <header className="news-reader-header">
                <p className="news-reader-kicker">Selected Document / 阅读版</p>
                <div className="news-reader-heading-row">
                  <h2>{selectedDocument.name}</h2>
                  <div className="news-reader-actions">
                    <button type="button" onClick={() => void loadDocument(selectedDocument)} disabled={documentContentLoading} className="news-action">
                      Refresh
                    </button>
                    {selectedDocument.url && (
                      <a href={selectedDocument.url} target="_blank" rel="noreferrer" className="news-action is-primary">
                        Feishu Source
                      </a>
                    )}
                  </div>
                </div>
                <div className="news-reader-meta">
                  <span>Modified / {formatTimestamp(selectedDocument.modifiedTime)}</span>
                  <span>Token / {selectedDocument.token.slice(0, 12)}</span>
                </div>
              </header>

              <div className="news-reader-body">
                {documentContentLoading ? (
                  <div className="news-loading">
                    <span>Typesetting document…</span>
                  </div>
                ) : documentContentError ? (
                  <div role="alert" className="news-inline-error">
                    <p>Read Error</p>
                    <strong>{documentContentError}</strong>
                    <button type="button" onClick={() => void loadDocument(selectedDocument)}>Retry Read</button>
                  </div>
                ) : documentContent.trim() ? (
                  <KnowledgeMarkdown content={documentContent} />
                ) : (
                  <div className="news-empty">
                    <span aria-hidden="true" className="news-empty-mark">∅</span>
                    <p>Empty Document</p>
                    <h2>文档内容为空</h2>
                    <span>飞书接口已返回该文档，但当前没有可展示的 Markdown 内容。</span>
                  </div>
                )}
              </div>
            </>
          )}
        </article>
      </div>
      </div>
      {showBackToTop && (
        <button type="button" className="news-back-to-top" onClick={scrollToTop} aria-label="回到顶部">
          <span aria-hidden="true" className="news-back-to-top-arrow">↑</span>
          <span className="news-back-to-top-copy">
            <strong>顶部</strong>
            <small>Top</small>
          </span>
        </button>
      )}
    </div>
  );
}